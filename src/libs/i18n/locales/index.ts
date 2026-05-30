import type { Locale } from "../types";
import type { TranslationKey } from "./keys.generated";
import enJson from "./en.json";
import idJson from "./id.json";

const en: Record<TranslationKey, string> = enJson;
const id: Record<TranslationKey, string> = idJson;

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
	en,
	id,
};

export type { TranslationKey } from "./keys.generated";
