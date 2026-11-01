import { forgetUserInformation, revokeSessions } from "@cache";
import {
	db,
	Prisma,
	RoleRepository,
	UserRepository,
	UserStatus,
} from "@database";
import { NotFoundError, UnprocessableEntityError } from "@errors";
import { t } from "@i18n";
import { AuthMailService } from "@mail/auth-mail.service";
import type {
	DatatableType,
	PaginationResponse,
	UserDetail,
	UserList,
} from "@types";
import { Hash } from "@utils";

import type { UserCreateInput, UserUpdateInput } from "./schema";
import type { IUserService } from "./service.interface";

export class UserService implements IUserService {
	async findAll(query: DatatableType): Promise<PaginationResponse<UserList>> {
		return UserRepository().findAll(query);
	}

	async create(data: UserCreateInput): Promise<void> {
		await this.assertEmailFree(data.email);
		await this.assertRolesExist(data.roleIds);

		const password = await Hash.generateHash(data.password);
		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await UserRepository(tx).create({ ...data, password });
		});
	}

	async findOne(id: string): Promise<UserDetail> {
		const user = await UserRepository().getDetail(id);
		if (!user) throw new NotFoundError(t("user.notFound"));
		return user;
	}

	async update(id: string, data: UserUpdateInput): Promise<void> {
		await this.findLive(id);
		await this.assertEmailFree(data.email, id);
		await this.assertRolesExist(data.roleIds);

		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await UserRepository(tx).update(id, data);
		});
		if (data.status === UserStatus.ACTIVE) {
			await forgetUserInformation([id]);
		} else {
			await revokeSessions(id);
		}
	}

	async resetPassword(id: string, newPassword: string): Promise<void> {
		await this.findLive(id);
		await UserRepository().updatePassword(
			id,
			await Hash.generateHash(newPassword),
		);
		await revokeSessions(id);
	}

	async sendVerificationEmail(id: string): Promise<void> {
		await AuthMailService.sendVerificationEmail(await this.findLive(id));
	}

	async sendResetPasswordEmail(id: string): Promise<void> {
		await AuthMailService.sendResetPasswordEmail(await this.findLive(id));
	}

	async delete(id: string): Promise<void> {
		await this.findLive(id);
		await UserRepository().softDelete(id);
		await revokeSessions(id);
	}

	private async findLive(
		id: string,
	): Promise<{ id: string; name: string; email: string }> {
		const user = await UserRepository().findById(id);
		if (!user) throw new NotFoundError(t("user.notFound"));
		return user;
	}

	private async assertEmailFree(
		email: string,
		excludeId?: string,
	): Promise<void> {
		if (await UserRepository().findLiveByEmail(email, excludeId)) {
			throw new UnprocessableEntityError(t("user.emailExists"), [
				{ field: "email", message: t("user.emailExists") },
			]);
		}
	}

	private async assertRolesExist(roleIds: string[]): Promise<void> {
		const unique = Array.from(new Set(roleIds));
		if ((await RoleRepository().countByIds(unique)) !== unique.length) {
			throw new UnprocessableEntityError(t("user.invalidRoles"), [
				{ field: "roleIds", message: t("user.invalidRoles") },
			]);
		}
	}
}
