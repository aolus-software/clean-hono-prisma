import type { FieldError } from "@types";

import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class ForbiddenError extends AppError {
	statusCode = HTTP_STATUS.FORBIDDEN;
	errorCode = ERROR_CODES.FORBIDDEN;

	constructor(message = "Forbidden", errors?: FieldError[]) {
		super(message, errors);
	}
}
