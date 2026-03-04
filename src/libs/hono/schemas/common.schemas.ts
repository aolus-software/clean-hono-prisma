import { StrongPassword } from "@default";
import { z } from "zod";

/**
 * Common reusable Zod schemas for consistent validation across the application
 * All schemas include OpenAPI metadata for better API documentation
 */

// ============================================================
// Basic Field Schemas
// ============================================================

/**
 * Email address validation schema
 * @example "user@example.com"
 * @validation Must be valid email format, max 255 characters
 */
export const EmailSchema = z
	.string()
	.email("Must be a valid email address")
	.max(255, "Email must not exceed 255 characters")
	.openapi({
		description: "Valid email address",
		example: "user@example.com",
	});

/**
 * Basic password validation schema (for login)
 * @example "mypassword123"
 * @validation Min 8 chars, max 128 chars
 */
export const PasswordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(128, "Password must not exceed 128 characters")
	.openapi({
		description: "User password for authentication",
		example: "MySecurePass123!",
	});

export const PasswordLoginSchema = z.string().openapi({
	description: "User password for login",
	example: "MySecurePass123!",
});

/**
 * Strong password validation schema (for registration/password changes)
 * @example "MySecure123!"
 * @validation Must contain uppercase, lowercase, number, special character, min 8 chars
 */
export const StrongPasswordSchema = z
	.string()
	.regex(StrongPassword, {
		message:
			"Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
	})
	.openapi({
		description:
			"Strong password with uppercase, lowercase, number, and special character",
		example: "MySecure123!",
	});

/**
 * UUID validation schema
 * @example "550e8400-e29b-41d4-a716-446655440000"
 * @validation Must be valid UUID v4 format
 */
export const UUIDSchema = z.string().uuid("Must be a valid UUID").openapi({
	description: "Universally unique identifier (UUID v4)",
	example: "550e8400-e29b-41d4-a716-446655440000",
});

/**
 * Name validation schema
 * @example "John Doe"
 * @validation Min 1 char, max 255 chars
 */
export const NameSchema = z
	.string()
	.min(1, "Name is required")
	.max(255, "Name must not exceed 255 characters")
	.openapi({
		description: "User or entity name",
		example: "John Doe",
	});

/**
 * Optional remarks/notes field
 * @example "Additional notes here"
 * @validation Optional, max 500 chars
 */
export const OptionalRemarksSchema = z
	.string()
	.max(500, "Remarks must not exceed 500 characters")
	.optional()
	.openapi({
		description: "Optional remarks or additional notes",
		example: "Additional information about this record",
	});

/**
 * Token validation schema (for JWT, verification tokens, etc.)
 * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * @validation Min 10 chars for security
 */
export const TokenSchema = z.string().min(10, "Invalid token format").openapi({
	description: "Authentication or verification token",
	example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0",
});

// ============================================================
// Pagination & Sorting Schemas
// ============================================================

/**
 * Pagination query parameters
 * @example { page: 1, limit: 10 }
 * @validation page: positive integer, limit: 1-100
 */
export const PaginationQuerySchema = z.object({
	page: z.coerce
		.number()
		.int("Page must be an integer")
		.positive("Page must be positive")
		.default(1)
		.openapi({
			description: "Page number for pagination",
			example: 1,
		}),
	limit: z.coerce
		.number()
		.int("Limit must be an integer")
		.positive("Limit must be positive")
		.max(100, "Maximum limit is 100")
		.default(10)
		.openapi({
			description: "Number of items per page (max 100)",
			example: 10,
		}),
});

/**
 * Sorting query parameters
 * @example { sortBy: "createdAt", sortOrder: "desc" }
 * @validation sortOrder: "asc" or "desc"
 */
export const SortQuerySchema = z.object({
	sortBy: z.string().optional().openapi({
		description: "Field name to sort by",
		example: "createdAt",
	}),
	sortOrder: z.enum(["asc", "desc"]).default("asc").openapi({
		description: "Sort order: ascending or descending",
		example: "desc",
	}),
});

/**
 * Combined pagination and sorting schema
 * @example { page: 1, limit: 10, sortBy: "name", sortOrder: "asc" }
 */
export const PaginatedQuerySchema =
	PaginationQuerySchema.merge(SortQuerySchema);

// ============================================================
// Common Param Schemas
// ============================================================

/**
 * UUID path parameter schema
 * @example { id: "550e8400-e29b-41d4-a716-446655440000" }
 * @validation Must be valid UUID format
 */
export const UUIDParamSchema = z.object({
	id: UUIDSchema,
});

/**
 * Slug path parameter schema
 * @example { slug: "my-article-slug" }
 * @validation Min 1 char, max 255 chars
 */
export const SlugParamSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(255, "Slug must not exceed 255 characters")
		.openapi({
			description: "URL-friendly identifier",
			example: "my-article-slug",
		}),
});

// ============================================================
// Date/Time Schemas
// ============================================================

/**
 * Date validation schema
 * @example "2024-01-15"
 * @validation Must be valid date format
 */
export const DateSchema = z.coerce.date().openapi({
	description: "ISO 8601 date",
	example: "2024-01-15T10:30:00Z",
});

/**
 * Date range filter schema
 * @example { startDate: "2024-01-01", endDate: "2024-12-31" }
 * @validation Both dates optional, must be valid date format
 */
export const DateRangeSchema = z.object({
	startDate: DateSchema.optional().openapi({
		description: "Start date for filtering (inclusive)",
		example: "2024-01-01T00:00:00Z",
	}),
	endDate: DateSchema.optional().openapi({
		description: "End date for filtering (inclusive)",
		example: "2024-12-31T23:59:59Z",
	}),
});

// ============================================================
// Status Schemas
// ============================================================

/**
 * User status enum schema
 * @example "active"
 * @validation Must be one of: active, inactive, suspended, blocked
 */
export const UserStatusSchema = z
	.enum(["active", "inactive", "suspended", "blocked"])
	.openapi({
		description: "Current status of the user account",
		example: "active",
	});

/**
 * Boolean query parameter schema
 * @example "true" or "false"
 * @validation Converts string "true"/"false" to boolean
 */
export const BooleanQuerySchema = z
	.enum(["true", "false"])
	.transform((val) => val === "true")
	.openapi({
		description: "Boolean value as string query parameter",
		example: "true",
	});

// ============================================================
// Search & Filter Schemas
// ============================================================

/**
 * Search query parameter schema
 * @example { q: "search term" } or { search: "search term" }
 * @validation Min 1 char when provided
 */
export const SearchQuerySchema = z.object({
	q: z.string().min(1, "Search query cannot be empty").optional().openapi({
		description: "Search query string",
		example: "John Doe",
	}),
	search: z.string().min(1, "Search query cannot be empty").optional().openapi({
		description: "Alternative search query parameter",
		example: "John Doe",
	}),
});

/**
 * Combined filter with pagination and search
 * @example { page: 1, limit: 10, q: "search", sortBy: "name", sortOrder: "asc" }
 */
export const FilterQuerySchema = PaginatedQuerySchema.merge(SearchQuerySchema);

// ============================================================
// File Upload Schemas
// ============================================================

/**
 * File upload metadata schema
 * @example { filename: "document.pdf", mimetype: "application/pdf", size: 1048576 }
 * @validation size must be positive number (bytes)
 */
export const FileUploadSchema = z.object({
	filename: z.string().min(1, "Filename is required").openapi({
		description: "Original filename of the uploaded file",
		example: "document.pdf",
	}),
	mimetype: z.string().min(1, "MIME type is required").openapi({
		description: "MIME type of the uploaded file",
		example: "application/pdf",
	}),
	size: z.number().positive("File size must be positive").openapi({
		description: "File size in bytes",
		example: 1048576,
	}),
});

// ============================================================
// Token Schemas
// ============================================================

/**
 * Refresh token schema
 * @example { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * @validation Token must not be empty
 */
export const RefreshTokenSchema = z.object({
	refreshToken: TokenSchema.openapi({
		description: "JWT refresh token for obtaining new access token",
		example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0",
	}),
});

// ============================================================
// Utility Schemas
// ============================================================

/**
 * Password confirmation schema for registration/password changes
 * @example { password: "MySecure123!", password_confirmation: "MySecure123!" }
 * @validation Passwords must match
 */
export const PasswordConfirmationSchema = z
	.object({
		password: StrongPasswordSchema,
		password_confirmation: z.string().openapi({
			description: "Password confirmation - must match password field",
			example: "MySecure123!",
		}),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

/**
 * Bulk operation schema for handling multiple IDs
 * @example { ids: ["uuid1", "uuid2", "uuid3"] }
 * @validation Min 1, max 100 UUIDs
 */
export const BulkIdSchema = z.object({
	ids: z
		.array(UUIDSchema)
		.min(1, "At least one ID is required")
		.max(100, "Maximum 100 IDs allowed")
		.openapi({
			description: "Array of UUIDs for bulk operations",
			example: [
				"550e8400-e29b-41d4-a716-446655440000",
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
			],
		}),
});

/**
 * Soft delete query parameter
 * @example { force: "true" }
 * @validation Optional boolean for force delete
 */
export const SoftDeleteQuerySchema = z.object({
	force: BooleanQuerySchema.optional().openapi({
		description: "Force permanent deletion (bypass soft delete)",
		example: "false",
	}),
});
