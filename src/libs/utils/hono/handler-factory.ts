import { Context } from "hono";
import type { Env } from "@types";

/**
 * Handler factory for creating type-safe Hono route handlers
 *
 * @example
 * ```ts
 * const myHandler = createHandler(async (c) => {
 *   const user = c.get("currentUser"); // Fully typed!
 *   return c.json({ user });
 * });
 * ```
 */
export const createHandler = <T>(
	// eslint-disable-next-line no-unused-vars
	handler: (c: Context<Env>) => Promise<T> | T,
) => handler;

/**
 * Handler factory with explicit return type
 * Useful when TypeScript has trouble inferring the return type
 *
 * @example
 * ```ts
 * const myHandler = createTypedHandler<Response>(async (c) => {
 *   return c.json({ message: "Hello" });
 * });
 * ```
 */
export const createTypedHandler = <TReturn>(
	// eslint-disable-next-line no-unused-vars
	handler: (c: Context<Env>) => Promise<TReturn> | TReturn,
	// eslint-disable-next-line no-unused-vars
): ((c: Context<Env>) => Promise<TReturn> | TReturn) => handler;
