import { enterLocale, parseAcceptLanguage } from "@i18n";
import type { Env } from "@types";
import type { MiddlewareHandler } from "hono";

export const localeMiddleware: MiddlewareHandler<Env> = async (c, next) => {
	const locale = parseAcceptLanguage(c.req.header("accept-language"));
	enterLocale(locale);

	await next();

	c.header("Content-Language", locale);
};
