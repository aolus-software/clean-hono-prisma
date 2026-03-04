import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class ForbiddenError extends AppError {
	statusCode = HTTP_STATUS.FORBIDDEN;
	errorCode = ERROR_CODES.FORBIDDEN;

	/**
	 * Represents an error when a user is forbidden from accessing a resource.
	 * @param {string} message - The error message.
	 * @param {unknown} details - Additional error details
	 */
	constructor(message = "Forbidden", details?: unknown) {
		super(message, details);
	}
}
