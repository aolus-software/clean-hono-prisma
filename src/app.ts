import { Hono } from "hono";
import bootstrap from "@modules";
import { bootstrap as bootstrapServices } from "./bootstrap";
import { Env } from "@types";
import {
	requestIdMiddleware,
	loggerMiddleware,
	performanceMiddleware,
	diMiddleware,
	corsMiddleware,
	securityHeadersMiddleware,
	rateLimiterMiddleware,
	bodyLimitMiddleware,
} from "@hono-libs/middlewares/index";
import { registerException } from "@hono-libs/errors/error.handler";

const app = new Hono<Env>();

bootstrapServices();

app.use("*", requestIdMiddleware);
app.use("*", loggerMiddleware);
app.use("*", performanceMiddleware);
app.use("*", diMiddleware);
app.use("*", bodyLimitMiddleware);
app.use("*", corsMiddleware);
app.use(securityHeadersMiddleware);
app.use(rateLimiterMiddleware);

registerException(app);

app.route("/", bootstrap);

export default app;
