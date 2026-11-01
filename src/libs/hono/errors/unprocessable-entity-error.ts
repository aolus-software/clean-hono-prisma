import type { FieldError } from "@types";

import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class UnprocessableEntityError extends AppError {
	statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
	errorCode = ERROR_CODES.VALIDATION_ERROR;

	constructor(message: string, errors?: FieldError[]) {
		super(message, errors);
	}
}
