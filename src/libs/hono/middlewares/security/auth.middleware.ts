import { Context, Next } from "hono";
import {
	Cache,
	USER_INFORMATION_TTL_SECONDS,
	UserInformationCacheKey,
} from "@cache";
import { UserRepository } from "@database";
import { UnauthorizedError } from "@errors";
import { t } from "@i18n";
import { Env, UserInformation } from "@types";
import { JWTToolkit } from "@utils";

/**
 * Resolves the bearer access token to the current user. A refresh token, an
 * expired or malformed token, and an inactive or deleted user are all 401.
 */
export const AuthMiddleware = async (
	c: Context<Env>,
	next: Next,
): Promise<void> => {
	const header = c.req.header("authorization") ?? "";
	if (!header.startsWith("Bearer ") || header.length <= 7) {
		throw new UnauthorizedError(t("auth.noTokenProvided"));
	}

	const payload = await JWTToolkit.verify(header.slice(7), "access");
	if (!payload) {
		throw new UnauthorizedError(t("auth.invalidToken"));
	}

	const cacheKey = UserInformationCacheKey(payload.id);
	let user = await Cache.get<UserInformation>(cacheKey);
	if (!user) {
		user = await UserRepository().findUserInformation(payload.id);
		if (!user) {
			throw new UnauthorizedError(t("auth.userNotFound"));
		}
		await Cache.set(cacheKey, user, USER_INFORMATION_TTL_SECONDS);
	}

	c.set("currentUser", user);
	await next();
};
