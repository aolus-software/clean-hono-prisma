import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import { roleGuard, withGuardDescription } from "@guards";
import { AuthMiddleware } from "@hono-libs/middlewares/security/auth.middleware";
import { commonResponse } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env } from "@types";
import { ResponseToolkit } from "@utils";

import {
	PermissionSelectOptionsSchema,
	RoleSelectOptionsSchema,
} from "./schema";

const SelectOptionsRoutes = new OpenAPIHono<Env>({ defaultHook });

const PermissionSelectOptionsRoute = createRoute({
	method: "get",
	path: "/permissions",
	tags: ["Settings/Select Options"],
	security: [{ Bearer: [] }],
	summary: "Permission options",
	description: withGuardDescription("Every permission, grouped.", {
		roles: ["superuser"],
	}),
	middleware: [AuthMiddleware, roleGuard(["superuser"])] as const,
	responses: commonResponse(PermissionSelectOptionsSchema, "Options", {
		include: [200, 401, 403, 429, 500],
	}),
});

SelectOptionsRoutes.openapi(PermissionSelectOptionsRoute, async (c) => {
	const options = await c.get("settingSelectOption").getPermissionOptions();
	return ResponseToolkit.success(c, options, t("common.retrieved"), 200);
});

const RoleSelectOptionsRoute = createRoute({
	method: "get",
	path: "/roles",
	tags: ["Settings/Select Options"],
	security: [{ Bearer: [] }],
	summary: "Role options",
	description: withGuardDescription(
		"Every role except superuser, ordered by name.",
		{ roles: ["superuser"] },
	),
	middleware: [AuthMiddleware, roleGuard(["superuser"])] as const,
	responses: commonResponse(RoleSelectOptionsSchema, "Options", {
		include: [200, 401, 403, 429, 500],
	}),
});

SelectOptionsRoutes.openapi(RoleSelectOptionsRoute, async (c) => {
	const options = await c.get("settingSelectOption").getRoleOptions();
	return ResponseToolkit.success(c, options, t("common.retrieved"), 200);
});

export default SelectOptionsRoutes;
