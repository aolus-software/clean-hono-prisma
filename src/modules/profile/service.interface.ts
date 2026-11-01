import type { UserInformation } from "@types";

export interface IProfileService {
	updateProfile(
		userId: string,
		data: { name: string; email: string },
	): Promise<UserInformation>;

	changePassword(
		userId: string,
		data: { currentPassword: string; newPassword: string },
	): Promise<void>;
}
