import type { MiddlewareHandler } from "hono";
import { bodyLimit } from "hono/body-limit";
import { t } from "@i18n";
import { Env } from "@types";
import { ResponseToolkit } from "@utils";

/**
 * Rejects request bodies larger than 100 KB with a 413 envelope.
 */
export const bodyLimitMiddleware: MiddlewareHandler<Env> = bodyLimit({
	maxSize: 100 * 1024,
	onError: (c) => ResponseToolkit.error(c, t("errors.payloadTooLarge"), 413),
});
