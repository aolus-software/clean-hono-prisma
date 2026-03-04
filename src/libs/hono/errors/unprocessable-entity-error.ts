import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class UnprocessableEntityError extends AppError {
	statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
	errorCode = ERROR_CODES.VALIDATION_ERROR;

	/**
	 * Represents a validation or unprocessable entity error.
	 * @param {string} message - The error message.
	 * @param {unknown} details - Validation error details
	 */
	constructor(message: string, details?: unknown) {
		super(message, details);
	}
}
