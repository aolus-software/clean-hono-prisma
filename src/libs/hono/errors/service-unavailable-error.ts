import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class ServiceUnavailableError extends AppError {
	statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
	errorCode = ERROR_CODES.SERVICE_UNAVAILABLE;

	constructor(message = "Service unavailable", details?: unknown) {
		super(message, details);
	}
}
