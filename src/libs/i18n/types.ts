export const SUPPORTED_LOCALES = ["en", "id"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export type TranslationVars = Record<string, string | number>;

export const isSupportedLocale = (tag: string): tag is Locale =>
	SUPPORTED_LOCALES.includes(tag as Locale);
