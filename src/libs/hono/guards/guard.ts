import { MiddlewareHandler } from "hono";
import { roleGuard } from "./role.guard";
import { permissionGuard } from "./permission.guard";

/**
 * Combines role and permission guards for easier usage
 * Returns an array of middlewares that can be spread in route definitions
 *
 * @example
 * ```typescript
 * // Apply both role and permission guards
 * app.use(...requireGuards({ roles: ['admin'], permissions: ['user create'] }))
 *
 * // Only role guard
 * app.use(...requireGuards({ roles: ['admin', 'superuser'] }))
 *
 * // Only permission guard
 * app.use(...requireGuards({ permissions: ['user list'] }))
 * ```
 */
export const requireGuards = (options: {
	roles?: string[];
	permissions?: string[];
}): MiddlewareHandler[] => {
	const guards: MiddlewareHandler[] = [];

	if (options.roles && options.roles.length > 0) {
		guards.push(roleGuard(options.roles));
	}

	if (options.permissions && options.permissions.length > 0) {
		guards.push(permissionGuard(options.permissions));
	}

	return guards;
};

/**
 * Convenience guards for common permission patterns
 */
export const Guards = {
	/**
	 * Admin or Superuser only
	 */
	adminOnly: () => roleGuard(["admin", "superuser"]),

	/**
	 * Superuser only
	 */
	superuserOnly: () => roleGuard(["superuser"]),

	/**
	 * User management permissions
	 */
	userManagement: {
		list: () => permissionGuard(["user list"]),
		create: () => permissionGuard(["user create"]),
		detail: () => permissionGuard(["user detail"]),
		edit: () => permissionGuard(["user edit"]),
		delete: () => permissionGuard(["user delete"]),
		any: () =>
			permissionGuard([
				"user list",
				"user create",
				"user detail",
				"user edit",
				"user delete",
			]),
	},

	/**
	 * Permission management permissions
	 */
	permissionManagement: {
		list: () => permissionGuard(["permission list"]),
		create: () => permissionGuard(["permission create"]),
		detail: () => permissionGuard(["permission detail"]),
		edit: () => permissionGuard(["permission edit"]),
		delete: () => permissionGuard(["permission delete"]),
		any: () =>
			permissionGuard([
				"permission list",
				"permission create",
				"permission detail",
				"permission edit",
				"permission delete",
			]),
	},

	/**
	 * Role management permissions
	 */
	roleManagement: {
		list: () => permissionGuard(["role list"]),
		create: () => permissionGuard(["role create"]),
		detail: () => permissionGuard(["role detail"]),
		edit: () => permissionGuard(["role edit"]),
		delete: () => permissionGuard(["role delete"]),
		any: () =>
			permissionGuard([
				"role list",
				"role create",
				"role detail",
				"role edit",
				"role delete",
			]),
	},
};
