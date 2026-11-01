import { Cache } from "./cache";
import { RefreshTokenCacheKey, UserInformationCacheKey } from "./const";

export const USER_INFORMATION_TTL_SECONDS = 3600;

/**
 * Drops cached identities so the next request re-reads status, roles and
 * permissions from the database.
 */
export const forgetUserInformation = async (
	userIds: string[],
): Promise<void> => {
	await Promise.all(
		userIds.map((userId) => Cache.delete(UserInformationCacheKey(userId))),
	);
};

/**
 * Drops the cached identity and the stored refresh-token id, so the user's
 * outstanding refresh token is rejected and they must log in again once the
 * current access token expires.
 */
export const revokeSessions = async (userId: string): Promise<void> => {
	await Promise.all([
		Cache.delete(UserInformationCacheKey(userId)),
		Cache.delete(RefreshTokenCacheKey(userId)),
	]);
};
