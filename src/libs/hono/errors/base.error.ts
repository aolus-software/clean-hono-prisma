import type { FieldError } from "@types";

/**
 * Base class for every error the global handler maps to a response. `errors`
 * is only rendered for 400 and 422.
 */
export abstract class AppError extends Error {
	abstract statusCode: number;
	abstract errorCode: string;
	isOperational: boolean = true;

	constructor(
		message: string,
		// eslint-disable-next-line no-unused-vars
		public errors?: FieldError[],
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
