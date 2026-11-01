import type { FieldError } from "@types";

import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class NotFoundError extends AppError {
	statusCode = HTTP_STATUS.NOT_FOUND;
	errorCode = ERROR_CODES.NOT_FOUND;

	constructor(message: string = "Resource not found", errors?: FieldError[]) {
		super(message, errors);
	}
}
