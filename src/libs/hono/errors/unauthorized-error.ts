import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class UnauthorizedError extends AppError {
	statusCode = HTTP_STATUS.UNAUTHORIZED;
	errorCode = ERROR_CODES.UNAUTHORIZED;

	/**
	 * Represents an error when a user is not authenticated or has invalid credentials.
	 * @param {string} message - The error message.
	 * @param {unknown} details - Additional error details
	 */
	constructor(message = "Unauthorized", details?: unknown) {
		super(message, details);
	}
}
