import { UpdatePasswordSchema, UpdateProfileSchema } from "./schema";
import { z } from "@hono/zod-openapi";
import { db, UserRepository } from "@database";
import { UnauthorizedError, UnprocessableEntityError } from "@errors";
import { Cache, UserInformationCacheKey } from "@cache";
import type { IProfileService } from "./service.interface";
import { UserInformation } from "@types";
import { Hash } from "@utils";
import { t } from "@i18n";

export class ProfileService implements IProfileService {
	async updateUserProfile(
		user: UserInformation,
		data: z.infer<typeof UpdateProfileSchema>,
	): Promise<UserInformation> {
		await db.user.update({
			where: { id: user.id, deleted_at: null },
			data: {
				name: data.name,
				email: data.email,
				remark: data.remarks ?? null,
			},
		});
		const updatedUser = await UserRepository().findUserInformation(user.id);
		if (!updatedUser) {
			throw new UnauthorizedError(t("profile.userNotFound"));
		}
		const cacheKey = UserInformationCacheKey(user.id);
		await Cache.set(cacheKey, updatedUser);
		return updatedUser;
	}

	async changeUserPassword(
		user: UserInformation,
		data: z.infer<typeof UpdatePasswordSchema>,
	): Promise<void> {
		const userData = await db.user.findFirst({
			where: { id: user.id, deleted_at: null },
			select: { password: true },
		});
		if (!userData) {
			throw new UnauthorizedError(t("profile.userNotFound"));
		}
		if (
			(await Hash.compareHash(data.current_password, userData.password)) ===
			false
		) {
			throw new UnprocessableEntityError(
				t("profile.currentPasswordIncorrect"),
				[{ current_password: [t("profile.currentPasswordIncorrect")] }],
			);
		}
		const newHashedPassword = await Hash.generateHash(data.new_password);
		await db.user.update({
			where: { id: user.id },
			data: { password: newHashedPassword },
		});
	}
}
