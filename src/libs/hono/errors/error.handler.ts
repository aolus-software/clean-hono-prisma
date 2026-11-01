import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { t } from "@i18n";
import { Env } from "@types";
import { logger } from "@utils/hono/logger";
import { ResponseToolkit } from "@utils/hono/response";

import { AppError } from "./base.error";
import { formatZodError } from "./formatter";

export const registerException = (app: Hono<Env>) => {
	app.notFound((c) => ResponseToolkit.error(c, t("errors.routeNotFound"), 404));

	app.onError((err, c) => {
		if (err instanceof AppError) {
			const status = err.statusCode as ContentfulStatusCode;
			if (status === 400 || status === 422) {
				return ResponseToolkit.fieldErrors(
					c,
					err.message,
					status,
					err.errors ?? [],
				);
			}
			if (status === 429) {
				return ResponseToolkit.rateLimited(c, err.message);
			}
			return ResponseToolkit.error(c, err.message, status);
		}

		if (err instanceof ZodError) {
			return ResponseToolkit.fieldErrors(
				c,
				t("errors.validationFailed"),
				422,
				formatZodError(err),
			);
		}

		if (err instanceof HTTPException) {
			if (err.status === 400) {
				return ResponseToolkit.fieldErrors(c, t("errors.parseFailed"), 400, [
					{ field: "body", message: t("errors.parseBody") },
				]);
			}
			if (err.status === 404) {
				return ResponseToolkit.error(c, t("errors.routeNotFound"), 404);
			}
			return ResponseToolkit.error(c, err.message, err.status);
		}

		logger.error(
			{
				err,
				method: c.req.method,
				url: c.req.url,
				requestId: c.get("requestId"),
			},
			"Unhandled error",
		);

		return ResponseToolkit.error(c, t("errors.internalServerError"), 500);
	});
};
