import type { LoginData, TokenPair } from "./schema";

export interface IAuthService {
	login(email: string, password: string): Promise<LoginData>;

	refresh(refreshToken: string): Promise<TokenPair>;

	register(data: {
		name: string;
		email: string;
		password: string;
	}): Promise<void>;

	resendVerification(email: string): Promise<void>;

	verifyEmail(token: string): Promise<void>;

	forgotPassword(email: string): Promise<void>;

	resetPassword(token: string, newPassword: string): Promise<void>;
}
