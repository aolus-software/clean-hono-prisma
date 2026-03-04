import { Hook } from "@hono/zod-openapi";
import { formatZodError } from "./formatter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultHook: Hook<any, any, any, any> = (result, c) => {
	if (!result.success) {
		return c.json(
			{
				status: false,
				message: "Validation failed",
				errors: formatZodError(result.error),
				data: null,
			},
			422,
		);
	}
	return;
};
