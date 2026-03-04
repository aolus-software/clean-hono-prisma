import { pinoLogger } from "hono-pino";
import { logger } from "@utils";

/**
 * Logger middleware using Pino
 * Provides structured logging for all requests
 */
export const loggerMiddleware = pinoLogger({
	pino: logger,
});
