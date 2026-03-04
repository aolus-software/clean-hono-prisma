import { AppConfig } from "@config";
import app from "./app";

// eslint-disable-next-line no-console
console.log(`Starting server on port ${AppConfig.APP_PORT}`);

export default {
	port: AppConfig.APP_PORT,
	fetch: app.fetch,
};
