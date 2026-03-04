import { IUserService } from "@modules/settings/users/service.interface";
import { ISelectOptionsService } from "@modules/settings/select-options/service.interface";
import { IProfileService } from "@modules/profile/service.interface";
import { IPermissionService } from "@modules/settings/permissions/service.interface";
import { IRoleService } from "@modules/settings/roles/service.interface";
import { IAuthService } from "@modules/auth/service.interface";
import { Env } from "@types";
import type { MiddlewareHandler } from "hono";
import { container } from "@hono-libs/core";

/**
 * Dependency Injection middleware
 * Injects all registered services into the Hono context
 */
export const diMiddleware: MiddlewareHandler<Env> = async (c, next) => {
	// Inject services from the container into the context
	c.set("authService", container.resolve<IAuthService>("authService"));
	c.set("userService", container.resolve<IUserService>("userService"));
	c.set("roleService", container.resolve<IRoleService>("roleService"));
	c.set(
		"settingSelectOption",
		container.resolve<ISelectOptionsService>("settingSelectOptionsService"),
	);
	c.set(
		"permissionService",
		container.resolve<IPermissionService>("permissionService"),
	);
	c.set("profileService", container.resolve<IProfileService>("profileService"));

	await next();
};
