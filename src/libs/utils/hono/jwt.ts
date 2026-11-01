import { JWT_CONFIG } from "@config";
import { sign, verify } from "hono/jwt";

export type TokenType = "access" | "refresh";

export type TokenPayload = {
	id: string;
	type: TokenType;
	jti?: string;
};

export class JWTToolkit {
	static async sign(
		id: string,
		type: TokenType,
		jti?: string,
	): Promise<string> {
		const lifetime =
			type === "access"
				? JWT_CONFIG.accessExpiresInSeconds
				: JWT_CONFIG.refreshExpiresInSeconds;

		return sign(
			{
				id,
				type,
				...(jti ? { jti } : {}),
				exp: Math.floor(Date.now() / 1000) + lifetime,
			},
			JWTToolkit.secretFor(type),
			"HS256",
		);
	}

	static async verify(
		token: string,
		type: TokenType,
	): Promise<TokenPayload | null> {
		try {
			const payload = await verify(token, JWTToolkit.secretFor(type), "HS256");
			if (payload.type !== type || typeof payload.id !== "string") {
				return null;
			}
			return {
				id: payload.id,
				type,
				...(typeof payload.jti === "string" ? { jti: payload.jti } : {}),
			};
		} catch {
			return null;
		}
	}

	static async issuePair(
		id: string,
		jti: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const [accessToken, refreshToken] = await Promise.all([
			JWTToolkit.sign(id, "access"),
			JWTToolkit.sign(id, "refresh", jti),
		]);
		return { accessToken, refreshToken };
	}

	private static secretFor(type: TokenType): string {
		return type === "access"
			? JWT_CONFIG.accessSecret
			: JWT_CONFIG.refreshSecret;
	}
}
