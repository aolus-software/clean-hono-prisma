import { Hook } from "@hono/zod-openapi";
import { t } from "@i18n";
import { ResponseToolkit } from "@utils/hono/response";

import { formatZodError } from "./formatter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultHook: Hook<any, any, any, any> = (result, c) => {
	if (!result.success) {
		return ResponseToolkit.fieldErrors(
			c,
			t("errors.validationFailed"),
			422,
			formatZodError(result.error),
		);
	}
	return;
};
