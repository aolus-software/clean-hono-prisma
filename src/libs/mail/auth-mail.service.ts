import { sendEmailQueue } from "@bull";
import { AppConfig } from "@config";
import {
	db,
	EmailVerificationRepository,
	PasswordResetRepository,
	Prisma,
} from "@database";
import {
	resetPasswordTokenLifetime,
	verificationTokenLifetime,
} from "@default";
import { getCurrentLocale, t } from "@i18n";
import { logger, StrToolkit } from "@utils";

type MailRecipient = { id: string; name: string; email: string };

/**
 * Issues a single-use token and mails its link. Earlier unused tokens of the
 * same kind are revoked in the same transaction; the job is enqueued only
 * after the commit so a rollback never leaves a mail for a missing token.
 */
export const AuthMailService = {
	async sendVerificationEmail(user: MailRecipient): Promise<void> {
		const token = StrToolkit.random(100);

		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await EmailVerificationRepository(tx).markAllUsed(user.id);
			await EmailVerificationRepository(tx).create(
				user.id,
				token,
				verificationTokenLifetime(),
			);
		});

		await sendEmailQueue.add("send-email", {
			subject: t("mail.subject.verification"),
			to: user.email,
			template: "/auth/email-verification",
			lang: getCurrentLocale(),
			variables: {
				user_name: user.name,
				verification_url: `${AppConfig.CLIENT_URL}/auth/verify-email?token=${token}`,
			},
		});

		logger.info({ userId: user.id }, "Verification email queued");
	},

	async sendResetPasswordEmail(user: MailRecipient): Promise<void> {
		const token = StrToolkit.random(255);

		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await PasswordResetRepository(tx).markAllUsed(user.id);
			await PasswordResetRepository(tx).create(
				user.id,
				token,
				resetPasswordTokenLifetime(),
			);
		});

		await sendEmailQueue.add("send-email", {
			subject: t("mail.subject.resetPassword"),
			to: user.email,
			template: "/auth/forgot-password",
			lang: getCurrentLocale(),
			variables: {
				user_name: user.name,
				reset_password_url: `${AppConfig.CLIENT_URL}/auth/reset-password?token=${token}`,
			},
		});

		logger.info({ userId: user.id }, "Reset password email queued");
	},
};
