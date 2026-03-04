import type { UserInformation } from "@types";

export interface IAuthService {
	login(
		email: string,
		password: string,
	): Promise<{
		user: UserInformation;
		token: string;
	}>;

	register(data: {
		name: string;
		email: string;
		password: string;
	}): Promise<void>;

	resendVerification(data: { email: string }): Promise<void>;

	verifyEmail(data: { token: string }): Promise<void>;

	forgotPassword(data: { email: string }): Promise<void>;

	resetPassword(data: { token: string; password: string }): Promise<void>;
}
