import { ForbiddenError } from "@errors";
import { UserInformation } from "@types";
import { MiddlewareHandler } from "hono";

/**
 * Permission-based guard middleware
 * Checks if the authenticated user has at least one of the specified permissions
 *
 * @param allowedPermissions - Array of permission names that are allowed to access the route
 * @returns MiddlewareHandler that validates user permissions
 *
 * @example
 * ```typescript
 * // Single permission
 * app.use(permissionGuard(['user list']))
 *
 * // Multiple permissions (user needs at least one)
 * app.use(permissionGuard(['user create', 'user edit']))
 * ```
 */
export const permissionGuard = (
	allowedPermissions: string[],
): MiddlewareHandler => {
	return async (c, next) => {
		const currentUser = c.get("currentUser") as UserInformation | undefined;

		if (!currentUser) {
			throw new ForbiddenError(
				"User information not found. Please ensure authMiddleware is applied before permissionGuard.",
			);
		}

		if (currentUser.roles.includes("superuser")) {
			return next();
		}

		// Collect all permissions from all roles
		const userPermissions: string[] = [];
		for (const rolePermission of currentUser.permissions) {
			userPermissions.push(...rolePermission.permissions);
		}

		// Check if user has at least one of the allowed permissions
		const hasPermission = userPermissions.some((userPermission) =>
			allowedPermissions.includes(userPermission),
		);

		if (!hasPermission) {
			throw new ForbiddenError(
				`Access denied. Required permissions: ${allowedPermissions.join(", ")}`,
			);
		}

		return next();
	};
};
