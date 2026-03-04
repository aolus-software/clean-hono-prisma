/**
 * Common type utilities and shared types across the application
 * Consolidates frequently used type patterns for consistency
 */

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes all properties of T required recursively
 */
export type DeepRequired<T> = {
	[P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Makes specified keys K of T readonly
 */
export type ReadonlyKeys<T, K extends keyof T> = Omit<T, K> &
	Readonly<Pick<T, K>>;

/**
 * Makes specified keys K of T required
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;

/**
 * Makes specified keys K of T optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
	Partial<Pick<T, K>>;

/**
 * Extracts non-nullable types
 */
export type NonNullableFields<T> = {
	[P in keyof T]: NonNullable<T[P]>;
};

/**
 * Type-safe keys of an object
 */
export type KeysOf<T> = (keyof T)[];

/**
 * Extract values from an object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Ensures at least one property from T is present
 */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

/**
 * Ensures exactly one property from T is present
 */
export type ExactlyOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]: Required<Pick<T, K>> &
			Partial<Record<Exclude<Keys, K>, never>>;
	}[Keys];

/**
 * Common timestamp fields
 */
export interface Timestamps {
	created_at: Date;
	updated_at: Date;
}

/**
 * Soft delete field
 */
export interface SoftDelete {
	deleted_at: Date | null;
}

/**
 * Common entity with timestamps
 */
export interface BaseEntity extends Timestamps {
	id: string;
}

/**
 * Common entity with soft delete
 */
export interface SoftDeletableEntity extends BaseEntity, SoftDelete {}

/**
 * Generic success response
 */
export interface SuccessResponse<T = unknown> {
	success: true;
	message: string;
	data: T;
	requestId?: string;
}

/**
 * Generic error response
 */
export interface ErrorResponse {
	success: false;
	message: string;
	code: string;
	errors: unknown;
	data: null;
	requestId?: string;
	trace?: string;
}

/**
 * API Response type (success or error)
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Paginated data structure
 */
export interface PaginatedData<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasMore: boolean;
	};
}

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort options
 */
export interface SortOptions {
	field: string;
	direction: SortDirection;
}

/**
 * Filter operator types
 */
export type FilterOperator =
	| "eq"
	| "ne"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "like"
	| "in"
	| "notIn"
	| "between"
	| "isNull"
	| "isNotNull";

/**
 * Generic filter structure
 */
export interface Filter {
	field: string;
	operator: FilterOperator;
	value: unknown;
}

/**
 * Query options for list operations
 */
export interface QueryOptions {
	page?: number;
	limit?: number;
	sort?: SortOptions;
	filters?: Filter[];
	search?: string;
}

/**
 * ID type (string UUID)
 */
export type ID = string;

/**
 * Email type
 */
export type Email = string;

/**
 * URL type
 */
export type URL = string;

/**
 * ISO Date string
 */
export type ISODateString = string;

/**
 * Environment types
 */
export type Environment = "development" | "staging" | "production";

/**
 * Log levels
 */
export type LogLevel = "info" | "warn" | "debug" | "error";

/**
 * Status types for entities
 */
export type Status = "active" | "inactive" | "pending" | "archived";

/**
 * Common HTTP methods
 */
export type HttpMethod =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "OPTIONS";

/**
 * Async function type
 */
export type AsyncFunction<T = void, Args extends unknown[] = []> = (
	..._args: Args
) => Promise<T>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type (null or undefined)
 */
export type Optional<T> = T | null | undefined;

/**
 * Constructor type
 */
export type Constructor<T = unknown> = new (..._args: unknown[]) => T;

/**
 * Abstract constructor type
 */
export type AbstractConstructor<T = unknown> = abstract new (
	..._args: unknown[]
) => T;

/**
 * Function type
 */
export type FunctionType<T = void, Args extends unknown[] = []> = (
	..._args: Args
) => T;

/**
 * Promisify a type
 */
export type Promisify<T> = T extends Promise<unknown> ? T : Promise<T>;

/**
 * Unwrap promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * JSON primitive types
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON value type
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * JSON object type
 */
export interface JsonObject {
	[key: string]: JsonValue;
}

/**
 * JSON array type
 */
export type JsonArray = JsonValue[];

/**
 * Type guard helper
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Validator function type
 */
export type Validator<T> = (_value: T) => boolean | string;

/**
 * Transformer function type
 */
export type Transformer<TIn, TOut = TIn> = (_value: TIn) => TOut;
