import { AppConfig } from "@config";
import app from "./app";

console.log(`Starting server on port ${AppConfig.APP_PORT}`);

export default {
	port: AppConfig.APP_PORT,
	fetch: app.fetch,
};
