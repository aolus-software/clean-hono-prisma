import { MiddlewareHandler } from "hono";
import { ForbiddenError, UnauthorizedError } from "@errors";
import { t } from "@i18n";
import { Env } from "@types";

/**
 * Requires every listed role (AND). `superuser` bypasses. Must run after
 * `AuthMiddleware` in the same route's `middleware` array.
 */
export const roleGuard = (requiredRoles: string[]): MiddlewareHandler<Env> => {
	return async (c, next) => {
		const currentUser = c.get("currentUser");
		if (!currentUser) {
			throw new UnauthorizedError(t("errors.unauthorized"));
		}

		const allowed =
			currentUser.roles.includes("superuser") ||
			requiredRoles.every((role) => currentUser.roles.includes(role));
		if (!allowed) {
			throw new ForbiddenError(t("errors.forbidden"));
		}

		await next();
	};
};
