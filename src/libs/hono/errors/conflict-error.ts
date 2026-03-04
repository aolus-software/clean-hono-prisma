import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class ConflictError extends AppError {
	statusCode = HTTP_STATUS.CONFLICT;
	errorCode = ERROR_CODES.CONFLICT;

	constructor(message = "Resource already exists", details?: unknown) {
		super(message, details);
	}
}
