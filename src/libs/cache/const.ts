export const UserInformationCacheKey = (userId: string) => `user:${userId}`;

export const RefreshTokenCacheKey = (userId: string) =>
	`refresh_token:${userId}`;

export const PermissionSelectOptionsCacheKey = (): string =>
	"select_options:permissions";

export const RoleSelectOptionsCacheKey = (): string => "select_options:roles";
