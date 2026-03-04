import { ZodError } from "zod";

export const formatZodError = (error: ZodError): Record<string, string[]> => {
	const errors: Record<string, string[]> = {};

	for (const issue of error.issues) {
		const path = issue.path.join(".");
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path].push(issue.message);
	}

	return errors;
};
