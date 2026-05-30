import { Hook } from "@hono/zod-openapi";
import { formatZodError } from "./formatter";
import { t } from "@i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultHook: Hook<any, any, any, any> = (result, c) => {
	if (!result.success) {
		return c.json(
			{
				status: false,
				message: t("errors.validationFailed"),
				errors: formatZodError(result.error),
				data: null,
			},
			422,
		);
	}
	return;
};
