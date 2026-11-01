import { z } from "@hono/zod-openapi";
import {
	EmailSchema,
	PasswordLoginSchema,
	StrongPasswordSchema,
} from "@hono-libs/schemas";
import { ZodUserInformation } from "@types";

const TokenInputSchema = z.string().min(1).openapi({
	description: "Token from the emailed link",
	example: "k3F9xQ2mZ7pL0aB4vN8cR1tY6uW5eH2j",
});

export const LoginSchema = z
	.object({
		email: EmailSchema,
		password: PasswordLoginSchema,
	})
	.openapi("LoginRequest");

export const RegisterSchema = z
	.object({
		email: EmailSchema,
		name: z.string().min(1).max(255).openapi({ example: "Jane Doe" }),
		password: StrongPasswordSchema,
	})
	.openapi("RegisterRequest");

export const EmailOnlySchema = z
	.object({ email: EmailSchema })
	.openapi("EmailRequest");

export const VerifyEmailSchema = z
	.object({ token: TokenInputSchema })
	.openapi("VerifyEmailRequest");

export const ResetPasswordSchema = z
	.object({
		token: TokenInputSchema,
		newPassword: StrongPasswordSchema,
	})
	.openapi("ResetPasswordRequest");

export const RefreshSchema = z
	.object({
		refreshToken: z.string().min(1).openapi({
			description: "Refresh token returned by /auth/login or /auth/refresh",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		}),
	})
	.openapi("RefreshRequest");

export const TokenPairSchema = z
	.object({
		accessToken: z.string().openapi({
			description: "Bearer token for authenticated requests, valid 1 day",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		}),
		refreshToken: z.string().openapi({
			description: "Exchange at POST /auth/refresh, valid 7 days",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		}),
	})
	.openapi("TokenPair");

export const LoginDataSchema = z
	.object({
		user: ZodUserInformation,
		accessToken: TokenPairSchema.shape.accessToken,
		refreshToken: TokenPairSchema.shape.refreshToken,
	})
	.openapi("LoginData");

export type LoginData = z.infer<typeof LoginDataSchema>;
export type TokenPair = z.infer<typeof TokenPairSchema>;
