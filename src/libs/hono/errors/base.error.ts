/**
 * Base error class for all application errors
 * Provides consistent structure and type safety
 */
export abstract class AppError extends Error {
	abstract statusCode: number;
	abstract errorCode: string;
	isOperational: boolean = true;

	constructor(
		message: string,
		// eslint-disable-next-line no-unused-vars
		public details?: unknown,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
