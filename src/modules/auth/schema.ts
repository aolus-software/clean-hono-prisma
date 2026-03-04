import {
	EmailSchema,
	PasswordLoginSchema,
	StrongPasswordSchema,
	TokenSchema,
} from "@hono-libs";
import * as z from "zod";

/**
 * Login request schema
 * @description Schema for user authentication
 * @example { email: "user@example.com", password: "MyPassword123!" }
 */
export const LoginSchema = z
	.object({
		email: EmailSchema.openapi({
			description: "User's registered email address",
			example: "user@example.com",
		}),
		password: PasswordLoginSchema.openapi({
			description: "User's account password",
			example: "MyPassword123!",
		}),
	})
	.openapi("LoginRequest", {
		description: "User login credentials",
	});

/**
 * Registration request schema
 * @description Schema for new user registration
 * @example { name: "John Doe", email: "john@example.com", password: "SecurePass123!" }
 */
export const RegisterSchema = z
	.object({
		name: z
			.string()
			.min(3, "Name must be at least 3 characters")
			.max(255, "Name must not exceed 255 characters")
			.openapi({
				description: "Full name of the user",
				example: "John Doe",
			}),
		email: EmailSchema.openapi({
			description: "Email address for the new account",
			example: "john@example.com",
		}),
		password: StrongPasswordSchema.openapi({
			description:
				"Strong password (min 8 chars, with uppercase, lowercase, number, special char)",
			example: "SecurePass123!",
		}),
	})
	.openapi("RegisterRequest", {
		description: "New user registration data",
	});

/**
 * Resend verification email schema
 * @description Request to resend email verification link
 * @example { email: "user@example.com" }
 */
export const ResendVerificationSchema = z
	.object({
		email: EmailSchema.openapi({
			description: "Email address to resend verification link",
			example: "user@example.com",
		}),
	})
	.openapi("ResendVerificationRequest", {
		description: "Request to resend email verification",
	});

/**
 * Email verification schema
 * @description Verify email with token from verification link
 * @example { token: "abc123token456" }
 */
export const EmailVerificationSchema = z
	.object({
		token: TokenSchema.openapi({
			description: "Email verification token from the verification link",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.verification_token",
		}),
	})
	.openapi("EmailVerificationRequest", {
		description: "Email verification token",
	});

/**
 * Forgot password request schema
 * @description Request password reset link
 * @example { email: "user@example.com" }
 */
export const ForgotPasswordSchema = z
	.object({
		email: EmailSchema.openapi({
			description: "Email address to send password reset link",
			example: "user@example.com",
		}),
	})
	.openapi("ForgotPasswordRequest", {
		description: "Request password reset link",
	});

/**
 * Reset password schema
 * @description Reset password using token from reset link
 * @example { token: "reset_token_123", password: "NewSecure123!" }
 */
export const ResetPasswordSchema = z
	.object({
		token: TokenSchema.openapi({
			description: "Password reset token from the reset link",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.reset_token",
		}),
		password: StrongPasswordSchema.openapi({
			description: "New strong password for the account",
			example: "NewSecure123!",
		}),
	})
	.openapi("ResetPasswordRequest", {
		description: "Password reset with token and new password",
	});
