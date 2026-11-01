import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import { commonResponse } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env } from "@types";
import { ResponseToolkit } from "@utils";

import {
	EmailOnlySchema,
	LoginDataSchema,
	LoginSchema,
	RefreshSchema,
	RegisterSchema,
	ResetPasswordSchema,
	TokenPairSchema,
	VerifyEmailSchema,
} from "./schema";

const AuthRoutes = new OpenAPIHono<Env>({ defaultHook });

const jsonBody = <T extends z.ZodTypeAny>(schema: T) => ({
	body: { content: { "application/json": { schema } }, required: true },
});

const LoginRoute = createRoute({
	method: "post",
	path: "/login",
	tags: ["Auth"],
	summary: "Log in",
	description:
		"Exchange email and password for an access token (1 day) and a refresh token (7 days). Unknown email, wrong password, unverified email and inactive account all answer 400 on `email`.",
	security: [],
	request: jsonBody(LoginSchema),
	responses: commonResponse(LoginDataSchema, "Logged in", {
		include: [200, 400, 422, 429, 500],
	}),
});

AuthRoutes.openapi(LoginRoute, async (c) => {
	const { email, password } = c.req.valid("json");
	const data = await c.get("authService").login(email, password);
	return ResponseToolkit.success(c, data, t("auth.loginSuccess"), 200);
});

const RefreshRoute = createRoute({
	method: "post",
	path: "/refresh",
	tags: ["Auth"],
	summary: "Refresh tokens",
	description:
		"Exchange a valid refresh token for a new access and refresh token pair. The presented refresh token is spent: sending it again is 401. An access token, an expired or revoked token, or a token for an inactive or deleted user is 401.",
	security: [],
	request: jsonBody(RefreshSchema),
	responses: commonResponse(TokenPairSchema, "Tokens refreshed", {
		include: [200, 401, 422, 429, 500],
	}),
});

AuthRoutes.openapi(RefreshRoute, async (c) => {
	const { refreshToken } = c.req.valid("json");
	const data = await c.get("authService").refresh(refreshToken);
	return ResponseToolkit.success(c, data, t("auth.tokenRefreshed"), 200);
});

const RegisterRoute = createRoute({
	method: "post",
	path: "/register",
	tags: ["Auth"],
	summary: "Register",
	description:
		"Create an unverified account and email a verification link. An email already used by a live account is 422.",
	security: [],
	request: jsonBody(RegisterSchema),
	responses: commonResponse(z.null(), "Registered", {
		include: [201, 422, 429, 500],
	}),
});

AuthRoutes.openapi(RegisterRoute, async (c) => {
	await c.get("authService").register(c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("auth.registerSuccess"), 201);
});

const ResendVerificationRoute = createRoute({
	method: "post",
	path: "/resend-verification",
	tags: ["Auth"],
	summary: "Resend verification email",
	description:
		"Always 200. A link is mailed only when the address belongs to an unverified live account.",
	security: [],
	request: jsonBody(EmailOnlySchema),
	responses: commonResponse(z.null(), "Accepted", {
		include: [200, 422, 429, 500],
	}),
});

AuthRoutes.openapi(ResendVerificationRoute, async (c) => {
	await c.get("authService").resendVerification(c.req.valid("json").email);
	return ResponseToolkit.success(c, null, t("auth.verificationEmailSent"), 200);
});

const VerifyEmailRoute = createRoute({
	method: "post",
	path: "/verify-email",
	tags: ["Auth"],
	summary: "Verify email",
	description:
		"Consume a verification token. An unknown, expired or used token is 400 on `token`.",
	security: [],
	request: jsonBody(VerifyEmailSchema),
	responses: commonResponse(z.null(), "Email verified", {
		include: [200, 400, 422, 429, 500],
	}),
});

AuthRoutes.openapi(VerifyEmailRoute, async (c) => {
	await c.get("authService").verifyEmail(c.req.valid("json").token);
	return ResponseToolkit.success(c, null, t("auth.emailVerified"), 200);
});

const ForgotPasswordRoute = createRoute({
	method: "post",
	path: "/forgot-password",
	tags: ["Auth"],
	summary: "Request a password reset",
	description:
		"Always 200. A reset link (valid 1 hour) is mailed only when the address belongs to a live account.",
	security: [],
	request: jsonBody(EmailOnlySchema),
	responses: commonResponse(z.null(), "Accepted", {
		include: [200, 422, 429, 500],
	}),
});

AuthRoutes.openapi(ForgotPasswordRoute, async (c) => {
	await c.get("authService").forgotPassword(c.req.valid("json").email);
	return ResponseToolkit.success(
		c,
		null,
		t("auth.resetPasswordEmailSent"),
		200,
	);
});

const ResetPasswordRoute = createRoute({
	method: "post",
	path: "/reset-password",
	tags: ["Auth"],
	summary: "Reset password",
	description:
		"Consume a reset token and set `newPassword`. Revokes the user's refresh token. An unknown, expired or used token is 400 on `token`.",
	security: [],
	request: jsonBody(ResetPasswordSchema),
	responses: commonResponse(z.null(), "Password reset", {
		include: [200, 400, 422, 429, 500],
	}),
});

AuthRoutes.openapi(ResetPasswordRoute, async (c) => {
	const { token, newPassword } = c.req.valid("json");
	await c.get("authService").resetPassword(token, newPassword);
	return ResponseToolkit.success(c, null, t("auth.passwordReset"), 200);
});

export default AuthRoutes;
