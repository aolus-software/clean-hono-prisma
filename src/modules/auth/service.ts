import { UserRepository, db, ForgotPasswordRepository } from "@database";
import { JWTToolkit, Hash, StrToolkit } from "@utils";
import { AppConfig } from "@config";
import type { IAuthService } from "./service.interface";
import { UserInformation } from "@types";
import { UnprocessableEntityError } from "@errors";
import { verificationTokenLifetime } from "@default";
import { sendEmailQueue } from "@bull";
import { t, getCurrentLocale } from "@i18n";
import type { Prisma } from "@prisma-generated";

export class AuthService implements IAuthService {
	async login(
		email: string,
		password: string,
	): Promise<{ user: UserInformation; token: string }> {
		const user = await UserRepository().findByEmail(email);
		if (!user) {
			throw new UnprocessableEntityError(t("auth.invalidCredentials"), [
				{ email: [t("auth.invalidCredentials")] },
			]);
		}
		if (!user.email_verified_at || user.email_verified_at === null) {
			throw new UnprocessableEntityError(t("auth.emailNotVerified"), [
				{ email: [t("auth.emailNotVerified")] },
			]);
		}
		if (user.status !== "active") {
			throw new UnprocessableEntityError(t("auth.accountInactive"), [
				{ email: [t("auth.accountInactive")] },
			]);
		}
		const isPasswordValid = await Hash.compareHash(password, user.password);
		if (!isPasswordValid) {
			throw new UnprocessableEntityError(t("auth.invalidCredentials"), [
				{ password: [t("auth.invalidCredentials")] },
			]);
		}
		const userInformation = await UserRepository().findUserInformation(user.id);
		const token = await new JWTToolkit().sign({ userId: user.id });
		return { user: userInformation!, token };
	}

	async register(data: {
		name: string;
		email: string;
		password: string;
	}): Promise<void> {
		const existing = await UserRepository().findByEmail(data.email);
		if (existing) {
			throw new UnprocessableEntityError(t("auth.userAlreadyExists"), [
				{ email: [t("auth.userAlreadyExists")] },
			]);
		}
		const hashedPassword = await Hash.generateHash(data.password);
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			const newUser = await tx.user.create({
				data: {
					name: data.name,
					email: data.email,
					password: hashedPassword,
					status: "active",
				},
			});
			const token = StrToolkit.random(255);
			await tx.emailVerification.create({
				data: {
					token,
					user_id: newUser.id,
					expired_at: verificationTokenLifetime,
				},
			});
			await sendEmailQueue.add("send-email", {
				subject: t("mail.subject.verification"),
				to: data.email,
				template: "/auth/email-verification",
				lang: getCurrentLocale(),
				variables: {
					user_id: newUser.id,
					user_name: newUser.name,
					user_email: newUser.email,
					verification_url: `${AppConfig.CLIENT_URL}/auth/verify-email?token=${token}`,
				},
			});
		});
	}

	async resendVerification(data: { email: string }): Promise<void> {
		const user = await UserRepository().findByEmail(data.email);
		if (!user) return;
		if (user.email_verified_at !== null) {
			throw new UnprocessableEntityError(t("auth.emailAlreadyVerified"), [
				{ email: [t("auth.emailAlreadyVerified")] },
			]);
		}
		const token = StrToolkit.random(255);
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await tx.emailVerification.create({
				data: {
					token,
					user_id: user.id,
					expired_at: verificationTokenLifetime,
				},
			});
			await sendEmailQueue.add("send-email", {
				subject: t("mail.subject.verification"),
				to: data.email,
				template: "/auth/email-verification",
				lang: getCurrentLocale(),
				variables: {
					user_id: user.id,
					user_name: user.name,
					user_email: user.email,
					verification_url: `${AppConfig.CLIENT_URL}/auth/verify-email?token=${token}`,
				},
			});
		});
	}

	async verifyEmail(data: { token: string }): Promise<void> {
		const verificationRecord = await db.emailVerification.findFirst({
			where: { token: data.token },
		});
		if (!verificationRecord) {
			throw new UnprocessableEntityError(t("auth.invalidVerificationToken"), [
				{
					token: [t("auth.invalidVerificationToken")],
				},
			]);
		}
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await tx.user.update({
				where: { id: verificationRecord.user_id },
				data: { email_verified_at: new Date() },
			});
			await tx.emailVerification.deleteMany({
				where: { user_id: verificationRecord.user_id },
			});
		});
	}

	async forgotPassword(data: { email: string }): Promise<void> {
		const user = await UserRepository().findByEmail(data.email);
		if (!user) return;
		const token = StrToolkit.random(255);
		await ForgotPasswordRepository().create(user.id, token);
		await sendEmailQueue.add("send-email", {
			subject: t("mail.subject.resetPassword"),
			to: data.email,
			template: "/auth/forgot-password",
			lang: getCurrentLocale(),
			variables: {
				user_id: user.id,
				user_name: user.name,
				user_email: user.email,
				reset_password_url: `${AppConfig.CLIENT_URL}/auth/reset-password?token=${token}`,
			},
		});
	}

	async resetPassword(data: {
		token: string;
		password: string;
	}): Promise<void> {
		const record = await db.passwordResetToken.findFirst({
			where: { token: data.token },
		});
		if (!record) {
			throw new UnprocessableEntityError(t("auth.invalidResetPasswordToken"), [
				{
					token: [t("auth.invalidResetPasswordToken")],
				},
			]);
		}
		const hashedPassword = await Hash.generateHash(data.password);
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await tx.user.update({
				where: { id: record.user_id },
				data: { password: hashedPassword },
			});
			await tx.passwordResetToken.deleteMany({
				where: { user_id: record.user_id },
			});
		});
	}
}
