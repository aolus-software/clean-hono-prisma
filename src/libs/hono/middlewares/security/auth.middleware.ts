import { UnauthorizedError } from "@errors";
import { Cache, UserInformationCacheKey } from "@cache";
import { JWTToolkit } from "@utils";
import { Context } from "hono";
import { UserInformation, Env } from "@types";
import { UserRepository } from "@database";
import { t } from "@i18n";

export const AuthMiddleware = async (
	c: Context<Env>,
	next: () => Promise<void>,
) => {
	const authHeader = c.req.header("authorization") || "";
	const token = authHeader.startsWith("Bearer ")
		? authHeader.slice(7)
		: authHeader;

	if (!token) {
		throw new UnauthorizedError(t("auth.noTokenProvided"));
	}

	const payload = await new JWTToolkit().verify<{
		userId: string;
	}>(token);
	if (!payload?.userId) {
		throw new UnauthorizedError(t("auth.invalidTokenPayload"));
	}

	const cachekey = UserInformationCacheKey(payload.userId);
	let user: UserInformation | null = await Cache.get<UserInformation>(cachekey);
	if (!user) {
		const userRecord = await UserRepository().findUserInformation(
			payload.userId,
		);
		if (!userRecord) {
			throw new UnauthorizedError(t("auth.userNotFound"));
		}

		user = userRecord;
		await Cache.set(cachekey, user);
	}

	c.set("currentUser", user);
	return next();
};
