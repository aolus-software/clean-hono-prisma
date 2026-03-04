import { MiddlewareHandler } from "hono";
import { ForbiddenError } from "@errors";
import { UserInformation } from "@types";

/**
 * Role-based guard middleware
 * Checks if the authenticated user has at least one of the specified roles
 *
 * @param allowedRoles - Array of role names that are allowed to access the route
 * @returns MiddlewareHandler that validates user roles
 *
 * @example
 * ```typescript
 * // Single role
 * app.use(roleGuard(['admin']))
 *
 * // Multiple roles (user needs at least one)
 * app.use(roleGuard(['admin', 'superuser']))
 * ```
 */
export const roleGuard = (allowedRoles: string[]): MiddlewareHandler => {
	return async (c, next) => {
		const currentUser = c.get("currentUser") as UserInformation | undefined;

		if (!currentUser) {
			throw new ForbiddenError(
				"User information not found. Please ensure authMiddleware is applied before roleGuard.",
			);
		}

		if (currentUser.roles.includes("superuser")) {
			return next();
		}

		// Check if user has at least one of the allowed roles
		const hasRole = currentUser.roles.some((userRole) =>
			allowedRoles.includes(userRole),
		);

		if (!hasRole) {
			throw new ForbiddenError(
				`Access denied. Required roles: ${allowedRoles.join(", ")}`,
			);
		}

		return next();
	};
};
