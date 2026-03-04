import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
	EmailVerificationSchema,
	ForgotPasswordSchema,
	LoginSchema,
	RegisterSchema,
	ResendVerificationSchema,
	ResetPasswordSchema,
} from "./schema";

import { commonResponse } from "@hono-libs/schemas";
import { ResponseToolkit } from "@utils";
import { defaultHook } from "@errors";
// import { commonResponse } from "@toolkit/schemas";
// import { ZodUserInformation } from "@packages/*";
import { Env, ZodUserInformation } from "@types";

const AuthRoutes = new OpenAPIHono<Env>({ defaultHook });

// ============================================================
// POST /auth/login
// ============================================================

const loginDataSchema = z
	.object({
		user: ZodUserInformation,
		token: z.string().openapi({
			description: "JWT access token for authenticated requests",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		}),
	})
	.openapi("LoginResponse", {
		description: "Successful login response with user data and access token",
	});

const loginRoute = createRoute({
	method: "post",
	path: "/login",
	summary: "User login",
	description:
		"Authenticate user with email and password. Returns user information and JWT access token on success.",
	tags: ["Auth"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: LoginSchema,
					example: {
						email: "user@example.com",
						password: "MyPassword123!",
					},
				},
			},
			description: "User login credentials",
			required: true,
		},
	},
	responses: {
		...commonResponse(loginDataSchema, "Login successful", {
			exclude: [201, 403, 404],
			validationErrors: {
				email: ["Email not found", "Email format is invalid"],
				password: ["Incorrect password"],
			},
		}),
	},
});

AuthRoutes.openapi(loginRoute, async (c) => {
	const { email, password } = c.req.valid("json");
	const service = c.get("authService");
	const result = await service.login(email, password);
	return ResponseToolkit.success<z.infer<typeof loginDataSchema>, 200>(
		c,
		result,
		"Login successful",
		200,
	);
});

// ============================================================
// POST /auth/register
// ============================================================

const registerRoute = createRoute({
	method: "post",
	path: "/register",
	summary: "User registration",
	description:
		"Register a new user account. Email verification link will be sent to the provided email address. Password must meet security requirements: min 8 characters, uppercase, lowercase, number, and special character.",
	tags: ["Auth"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: RegisterSchema,
					example: {
						name: "John Doe",
						email: "john@example.com",
						password: "SecurePass123!",
					},
				},
			},
			description: "New user registration data",
			required: true,
		},
	},
	responses: {
		...commonResponse(z.null(), "Registration successful", {
			exclude: [200, 403, 404],
			validationErrors: {
				email: ["Email is already in use", "Email format is invalid"],
				password: [
					"Password must be at least 8 characters",
					"Password must contain uppercase, lowercase, number, and special character",
				],
				name: ["Name must be at least 3 characters"],
			},
		}),
	},
});

AuthRoutes.openapi(registerRoute, async (c) => {
	const { name, email, password } = c.req.valid("json");
	const service = c.get("authService");
	await service.register({
		name,
		email,
		password,
	});

	return ResponseToolkit.success<null, 201>(
		c,
		null,
		"Registration successful. Please check your email to verify your account.",
		201,
	);
});

// ============================================================
// POST /auth/resend-verification
// ============================================================

const resendVerificationRoute = createRoute({
	method: "post",
	path: "/resend-verification",
	summary: "Resend verification email",
	description:
		"Resend email verification link to the user's email address. Use this endpoint if the verification email was not received or has expired.",
	tags: ["Auth"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: ResendVerificationSchema,
					example: {
						email: "user@example.com",
					},
				},
			},
			description: "Email address to resend verification link",
			required: true,
		},
	},
	responses: {
		...commonResponse(z.null(), "Verification email sent", {
			exclude: [200, 403, 404],
			validationErrors: {
				email: [
					"Email is already verified",
					"Email format is invalid",
					"Email not found",
				],
			},
		}),
	},
});

AuthRoutes.openapi(resendVerificationRoute, async (c) => {
	const { email } = c.req.valid("json");
	const service = c.get("authService");
	await service.resendVerification({
		email,
	});

	return ResponseToolkit.success<null, 200>(
		c,
		null,
		"Verification email sent successfully. Please check your inbox.",
	);
});

// ============================================================
// POST /auth/verify-email
// ============================================================

const verifyEmailRoute = createRoute({
	method: "post",
	path: "/verify-email",
	summary: "Verify email address",
	description:
		"Verify user's email address using the token received via email. This token is sent during registration or when resending verification.",
	tags: ["Auth"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: EmailVerificationSchema,
					example: {
						token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.verification_token",
					},
				},
			},
			description: "Email verification token from verification link",
			required: true,
		},
	},
	responses: {
		...commonResponse(z.null(), "Email verified successfully", {
			exclude: [200, 403, 404],
			validationErrors: {
				token: [
					"Invalid verification token",
					"Verification token has expired",
					"Email already verified",
				],
			},
		}),
	},
});

AuthRoutes.openapi(verifyEmailRoute, async (c) => {
	const { token } = c.req.valid("json");
	const service = c.get("authService");
	await service.verifyEmail({ token });

	return ResponseToolkit.success<null, 200>(
		c,
		null,
		"Email verified successfully. You can now log in to your account.",
		200,
	);
});

// ============================================================
// POST /auth/forgot-password
// ============================================================

const forgotPasswordRoute = createRoute({
	method: "post",
	path: "/forgot-password",
	summary: "Request password reset",
	description:
		"Request a password reset link. If the email exists in the system, a password reset link will be sent to the provided email address. The link is valid for a limited time.",
	tags: ["Auth"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: ForgotPasswordSchema,
					example: {
						email: "user@example.com",
					},
				},
			},
			description: "Email address to send password reset link",
			required: true,
		},
	},
	responses: {
		...commonResponse(z.null(), "Password reset email sent (if email exists)", {
			exclude: [201, 403, 404],
			validationErrors: {
				email: ["Email format is invalid"],
			},
		}),
	},
});

AuthRoutes.openapi(forgotPasswordRoute, async (c) => {
	const { email } = c.req.valid("json");
	const service = c.get("authService");
	await service.forgotPassword({
		email,
	});

	return ResponseToolkit.success<null, 200>(
		c,
		null,
		"If the email exists, a password reset link has been sent. Please check your inbox.",
		200,
	);
});

// ============================================================
// POST /auth/reset-password
// ============================================================

const resetPasswordRoute = createRoute({
	method: "post",
	path: "/reset-password",
	summary: "Reset password",
	description:
		"Reset user password using the token received via password reset email. The new password must meet security requirements: min 8 characters, uppercase, lowercase, number, and special character.",
	tags: ["Auth"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: ResetPasswordSchema,
					example: {
						token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.reset_token",
						password: "NewSecure123!",
					},
				},
			},
			description: "Password reset token and new password",
			required: true,
		},
	},
	responses: {
		...commonResponse(z.null(), "Password reset successful", {
			exclude: [201, 403, 404],
			validationErrors: {
				token: [
					"Invalid reset token",
					"Reset token has expired",
					"Reset link already used",
				],
				password: [
					"Password must be at least 8 characters",
					"Password must contain uppercase, lowercase, number, and special character",
				],
			},
		}),
	},
});

AuthRoutes.openapi(resetPasswordRoute, async (c) => {
	const { token, password } = c.req.valid("json");
	const service = c.get("authService");
	await service.resetPassword({
		token,
		password,
	});

	return ResponseToolkit.success<null, 200>(
		c,
		null,
		"Password reset successful. You can now log in with your new password.",
		200,
	);
});

export default AuthRoutes;
