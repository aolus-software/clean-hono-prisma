import { IAuthService } from "@modules/auth/service.interface";
import { IProfileService } from "@modules/profile/service.interface";
import { IUserService } from "@modules/settings/users/service.interface";
import { IRoleService } from "@modules/settings/roles/service.interface";
import { IPermissionService } from "@modules/settings/permissions/service.interface";
import { ISelectOptionsService } from "@modules/settings/select-options/service.interface";

import { UserInformation } from "@types";
import { Hono } from "hono";

/**
 * Define variables that can be stored in the Hono context
 * These will be available via c.get() and c.set()
 */
export type Variables = {
	currentUser: UserInformation;
	requestId: string;
	authService: IAuthService;
	userService: IUserService;
	roleService: IRoleService;
	permissionService: IPermissionService;
	profileService: IProfileService;
	settingSelectOption: ISelectOptionsService;
};

/**
 * Environment type for Hono app
 * This defines the shape of the context environment
 */
export type Env = {
	Variables: Variables;
};

/**
 * Type-safe Hono app type
 * Use this instead of plain Hono when creating app instances
 */
export type AppType = Hono<Env>;
