import { AppConfig } from "@config";
import { sign, verify } from "hono/jwt";

export class JWTToolkit {
	private secret: string;
	private expiresIn: number;

	constructor() {
		this.secret = AppConfig.APP_JWT_SECRET || "default_secret";
		this.expiresIn = AppConfig.APP_JWT_EXPIRES_IN || 3600;
	}

	async sign(payload: object): Promise<string> {
		return sign(
			{
				exp: Math.floor(Date.now() / 1000) + this.expiresIn,
				...payload,
			},
			this.secret,
			"HS256",
		);
	}

	async verify<T = Record<string, unknown>>(token: string): Promise<T | null> {
		try {
			const payload = await verify(token, this.secret, "HS256");
			return payload as unknown as T;
		} catch (error) {
			throw new Error("Invalid token", { cause: error });
		}
	}
}
