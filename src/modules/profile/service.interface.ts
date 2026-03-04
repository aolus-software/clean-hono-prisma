import { UserInformation } from "@types";
import type { z } from "@hono/zod-openapi";
import { UpdatePasswordSchema, UpdateProfileSchema } from "./schema";

export interface IProfileService {
	updateUserProfile(
		user: UserInformation,
		data: z.infer<typeof UpdateProfileSchema>,
	): Promise<UserInformation>;

	changeUserPassword(
		user: UserInformation,
		data: z.infer<typeof UpdatePasswordSchema>,
	): Promise<void>;
}
