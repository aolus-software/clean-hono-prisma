import {
	Cache,
	revokeSessions,
	USER_INFORMATION_TTL_SECONDS,
	UserInformationCacheKey,
} from "@cache";
import { UserRepository } from "@database";
import { UnauthorizedError, UnprocessableEntityError } from "@errors";
import { t } from "@i18n";
import type { UserInformation } from "@types";
import { Hash } from "@utils";

import type { IProfileService } from "./service.interface";

export class ProfileService implements IProfileService {
	async updateProfile(
		userId: string,
		data: { name: string; email: string },
	): Promise<UserInformation> {
		const existing = await UserRepository().findLiveByEmail(data.email, userId);
		if (existing) {
			throw new UnprocessableEntityError(t("errors.validationFailed"), [
				{ field: "email", message: t("profile.emailExists") },
			]);
		}

		await UserRepository().update(userId, data);

		const information = await UserRepository().findUserInformation(userId);
		if (!information) {
			throw new UnauthorizedError(t("profile.userNotFound"));
		}
		await Cache.set(
			UserInformationCacheKey(userId),
			information,
			USER_INFORMATION_TTL_SECONDS,
		);
		return information;
	}

	async changePassword(
		userId: string,
		data: { currentPassword: string; newPassword: string },
	): Promise<void> {
		const hash = await UserRepository().findPasswordHash(userId);
		if (!hash) {
			throw new UnauthorizedError(t("profile.userNotFound"));
		}
		if (!(await Hash.compareHash(data.currentPassword, hash))) {
			throw new UnprocessableEntityError(t("errors.validationFailed"), [
				{
					field: "currentPassword",
					message: t("profile.currentPasswordIncorrect"),
				},
			]);
		}
		await UserRepository().updatePassword(
			userId,
			await Hash.generateHash(data.newPassword),
		);
		await revokeSessions(userId);
	}
}
