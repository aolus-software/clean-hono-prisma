import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCALES_DIR = join(import.meta.dir, "..", "locales");
const OUTPUT_FILE = join(LOCALES_DIR, "keys.generated.ts");
const SOURCE_LOCALE = "en.json";

const readDictionary = (filename: string): Record<string, string> => {
	const raw = readFileSync(join(LOCALES_DIR, filename), "utf-8");
	return JSON.parse(raw) as Record<string, string>;
};

const source = readDictionary(SOURCE_LOCALE);
const sourceKeys = Object.keys(source).sort();

const otherLocales = readdirSync(LOCALES_DIR).filter(
	(f) => f.endsWith(".json") && f !== SOURCE_LOCALE,
);

let hasError = false;
for (const file of otherLocales) {
	const dict = readDictionary(file);
	const dictKeys = new Set(Object.keys(dict));
	const missing = sourceKeys.filter((k) => !dictKeys.has(k));
	const extra = [...dictKeys].filter((k) => !sourceKeys.includes(k));

	if (missing.length) {
		// eslint-disable-next-line no-console
		console.error(`[i18n] ${file} missing keys: ${missing.join(", ")}`);
		hasError = true;
	}
	if (extra.length) {
		// eslint-disable-next-line no-console
		console.warn(`[i18n] ${file} has extra keys: ${extra.join(", ")}`);
	}
}

if (hasError) {
	process.exit(1);
}

const union = sourceKeys.map((k) => `\t| "${k}"`).join("\n");
const content = `// AUTO-GENERATED — do not edit by hand.
// Regenerate with: bun run i18n:keys

export type TranslationKey =\n${union};\n`;

writeFileSync(OUTPUT_FILE, content, "utf-8");

// eslint-disable-next-line no-console
console.log(`[i18n] Generated ${sourceKeys.length} keys in keys.generated.ts`);
