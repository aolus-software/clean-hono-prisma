import type { FieldError } from "@types";

import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class UnauthorizedError extends AppError {
	statusCode = HTTP_STATUS.UNAUTHORIZED;
	errorCode = ERROR_CODES.UNAUTHORIZED;

	constructor(message = "Unauthorized", errors?: FieldError[]) {
		super(message, errors);
	}
}
