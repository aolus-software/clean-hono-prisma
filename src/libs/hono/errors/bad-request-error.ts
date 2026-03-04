import { AppError } from "./base.error";
import { ERROR_CODES, HTTP_STATUS } from "./error-codes.constant";

export class BadRequestError extends AppError {
	statusCode = HTTP_STATUS.BAD_REQUEST;
	errorCode = ERROR_CODES.BAD_REQUEST;

	constructor(message = "Bad request", details?: unknown) {
		super(message, details);
	}
}
