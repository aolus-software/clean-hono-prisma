import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class NotFoundError extends AppError {
	statusCode = HTTP_STATUS.NOT_FOUND;
	errorCode = ERROR_CODES.NOT_FOUND;

	/**
	 * Represents an error when a resource is not found.
	 * @param {string} message - The error message.
	 * @param {unknown} details - Additional error details
	 */
	constructor(message: string = "Resource not found", details?: unknown) {
		super(message, details);
	}
}
