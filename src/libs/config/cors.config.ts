import type { CorsConfig as ICorsConfig } from "@types";

import { env } from "./env";

const origins = env.ALLOWED_HOST.split(",")
	.map((origin) => origin.trim())
	.filter((origin) => origin.length > 0);

export const corsConfig: ICorsConfig = {
	origin: origins.length > 0 ? origins : "*",
	methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
	maxAge: 86400,
	credentials: false,
};
