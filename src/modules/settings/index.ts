import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import PermissionRoutes from "./permissions/routes";
import RoleRoutes from "./roles/routes";
import UserRoutes from "./users/routes";
import SelectOptionsRoutes from "./select-options/routes";

const SettingsRoutes = new OpenAPIHono({ defaultHook });

SettingsRoutes.route("/select-options", SelectOptionsRoutes);
SettingsRoutes.route("/permissions", PermissionRoutes);
SettingsRoutes.route("/roles", RoleRoutes);
SettingsRoutes.route("/users", UserRoutes);

export default SettingsRoutes;
