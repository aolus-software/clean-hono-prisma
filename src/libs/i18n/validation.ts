import type { ZodIssue } from "zod";
import { t } from "./i18n";
import type { TranslationKey } from "./locales";

const FORMAT_KEYS: Record<string, TranslationKey> = {
	email: "validation.expectedEmail",
	uuid: "validation.expectedUuid",
	datetime: "validation.expectedDateTime",
	"date-time": "validation.expectedDateTime",
	iso_datetime: "validation.expectedDateTime",
};

const EXPECTED_KEYS: Record<string, TranslationKey> = {
	string: "validation.expectedString",
	number: "validation.expectedNumber",
	boolean: "validation.expectedBoolean",
	array: "validation.expectedArray",
	object: "validation.expectedObject",
};

export const translateZodIssue = (issue: ZodIssue): string => {
	if (issue.code === "invalid_type") {
		const typedIssue = issue as ZodIssue & { expected?: string };
		if (typedIssue.expected && issue.message?.includes("undefined")) {
			return t("validation.required");
		}
		if (typedIssue.expected) {
			const key = EXPECTED_KEYS[typedIssue.expected];
			if (key) return t(key);
		}
	}

	if (issue.code === "invalid_format") {
		const typedIssue = issue as ZodIssue & { format?: string };
		if (typedIssue.format) {
			const key = FORMAT_KEYS[typedIssue.format];
			if (key) return t(key);
		}
	}

	if (issue.code === "too_small") return t("validation.tooShort");
	if (issue.code === "too_big") return t("validation.tooLong");

	return t("validation.invalid");
};
