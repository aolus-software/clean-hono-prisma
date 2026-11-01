import { ZodError } from "zod";
import { translateZodIssue } from "@i18n";
import type { FieldError } from "@types";

export const formatZodError = (error: ZodError): FieldError[] =>
	error.issues.map((issue) => ({
		field: issue.path.length > 0 ? issue.path.join(".") : "general",
		message: translateZodIssue(issue),
	}));
