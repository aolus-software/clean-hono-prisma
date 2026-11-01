export const UserInformationCacheKey = (userId: string) => `user:${userId}`;

export const RefreshTokenCacheKey = (userId: string) =>
	`refresh_token:${userId}`;
