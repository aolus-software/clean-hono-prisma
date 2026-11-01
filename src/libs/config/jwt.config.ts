import { env } from "./env";

export const JWT_CONFIG = {
	accessSecret: env.JWT_SECRET,
	refreshSecret: env.JWT_REFRESH_SECRET,
	accessExpiresInSeconds: 60 * 60 * 24,
	refreshExpiresInSeconds: 60 * 60 * 24 * 7,
};
