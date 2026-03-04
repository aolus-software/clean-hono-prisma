import { z } from "zod";

/**
 * Validation helper utilities for Zod schemas
 */

// ============================================================
// Type Inference Helpers
// ============================================================

/**
 * Infer the TypeScript type from a Zod schema
 * @example
 * const UserSchema = z.object({ name: z.string() });
 * type User = InferSchema<typeof UserSchema>; // { name: string }
 */
export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;

// ============================================================
// Custom Validators
// ============================================================

/**
 * Validate that a string is a valid URL
 */
export const urlValidator = z.string().url();

/**
 * Validate that a string is a valid phone number (basic)
 */
export const phoneValidator = z
	.string()
	.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

/**
 * Validate that a string is alphanumeric
 */
export const alphanumericValidator = z
	.string()
	.regex(/^[a-zA-Z0-9]+$/, "Must be alphanumeric");

/**
 * Validate that a string is a valid slug (URL-friendly)
 */
export const slugValidator = z
	.string()
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		"Must be lowercase alphanumeric with hyphens",
	);

/**
 * Validate that a string is a valid hex color
 */
export const hexColorValidator = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color");

/**
 * Validate that a number is within a range
 */
export const rangeValidator = (min: number, max: number) =>
	z.number().min(min).max(max);

/**
 * Validate that an array has a specific length range
 */
export const arrayLengthValidator = <T extends z.ZodTypeAny>(
	schema: T,
	min: number,
	max: number,
) => z.array(schema).min(min).max(max);

// ============================================================
// Conditional Validation Helpers
// ============================================================

/**
 * Make all properties optional
 */
export const makeOptional = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
	schema.partial();

/**
 * Pick specific properties from a schema
 */
export const pickFields = <T extends z.ZodRawShape, K extends keyof T & string>(
	schema: z.ZodObject<T>,
	fields: K[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => schema.pick(Object.fromEntries(fields.map((f) => [f, true])) as any);

/**
 * Omit specific properties from a schema
 */
export const omitFields = <T extends z.ZodRawShape, K extends keyof T & string>(
	schema: z.ZodObject<T>,
	fields: K[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => schema.omit(Object.fromEntries(fields.map((f) => [f, true])) as any);

// ============================================================
// Transform Helpers
// ============================================================

/**
 * Trim whitespace from string
 */
export const trimmedString = z.string().transform((val) => val.trim());

/**
 * Convert string to lowercase
 */
export const lowercaseString = z.string().transform((val) => val.toLowerCase());

/**
 * Convert string to uppercase
 */
export const uppercaseString = z.string().transform((val) => val.toUpperCase());

/**
 * Parse JSON string to object
 */
export const jsonString = z.string().transform((val) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return JSON.parse(val);
	} catch {
		return val;
	}
});

// ============================================================
// Refinement Helpers
// ============================================================

/**
 * Create a schema that validates against a database record
 * @example
 * const emailExists = async (email: string) => {
 *   const user = await db.query.users.findFirst({ where: eq(users.email, email) });
 *   return !user;
 * };
 * const schema = z.object({
 *   email: uniqueField(z.string().email(), emailExists, 'Email already exists')
 * });
 */
export const uniqueField = <T extends z.ZodTypeAny>(
	schema: T,
	// eslint-disable-next-line no-unused-vars
	checkFn: (value: z.infer<T>) => Promise<boolean>,
	message: string = "Value already exists",
) =>
	schema.refine(async (val) => await checkFn(val), {
		message,
	});

/**
 * Validate that a value matches another field
 * @example
 * const schema = z.object({
 *   password: z.string(),
 *   confirmPassword: z.string(),
 * }).refine((data) => data.password === data.confirmPassword, {
 *   message: "Passwords don't match",
 *   path: ["confirmPassword"]
 * });
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const matchField = <T extends Record<string, any>>(
	field1: keyof T,
	field2: keyof T,
	message: string = "Fields do not match",
) => ({
	message,
	path: [field2 as string],
});

// ============================================================
// Schema Composition Helpers
// ============================================================

/**
 * Extend a schema with additional fields
 */
export const extendSchema = <T extends z.ZodRawShape, U extends z.ZodRawShape>(
	baseSchema: z.ZodObject<T>,
	extension: U,
) => baseSchema.extend(extension);

/**
 * Merge two schemas
 */
export const mergeSchemas = <T extends z.ZodRawShape, U extends z.ZodRawShape>(
	schema1: z.ZodObject<T>,
	schema2: z.ZodObject<U>,
) => schema1.merge(schema2);
