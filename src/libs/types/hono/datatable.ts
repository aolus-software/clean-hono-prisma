import { z } from "@hono/zod-openapi";
import { defaultSort, paginationLength } from "@default";

import { SortDirection } from "../common.types";

export type DatatableFilter = Record<string, boolean | string>;

export type DatatableType = {
	page: number;
	perPage: number;
	search?: string;
	sort: string;
	sortDirection: SortDirection;
	filter?: DatatableFilter;
};

/**
 * How a repository reads a comma in a filter value:
 * - `id`   comma-separated ids, matched with IN
 * - `date` one ISO date (that whole day) or `start,end`
 * A plain key treats the comma as a literal character.
 */
export type FilterFieldKind = "id" | "date";

export type FilterField =
	| string
	| { field: string; enum: readonly string[] }
	| { field: string; kind: FilterFieldKind };

export const filterFieldNames = (fields: readonly FilterField[]): string[] =>
	fields.map((f) => (typeof f === "string" ? f : f.field));

type DatatableQueryOptions = {
	sortFields: readonly [string, ...string[]];
	filterFields: readonly FilterField[];
	filterExample?: Readonly<Record<string, string>>;
};

const filterDescription = (field: FilterField): string => {
	if (typeof field === "string") {
		return `Sent as filter[${field}]=<value>. Case-insensitive contains match.`;
	}
	if ("enum" in field) {
		return `One of: ${field.enum.join(", ")}. Comma-separate for multiple.`;
	}
	return field.kind === "id"
		? "Comma-separate for multiple ids."
		: "A single ISO date matches that whole day; pass start,end for a range.";
};

/**
 * Builds a list route's query schema from the repository's own allow-lists, so
 * `/docs` documents exactly what the repository enforces. `filter[<key>]`
 * entries are documentation; the repository validates them off the raw query
 * (unknown key or bad value -> 400) via `DatatableToolkit.parseFilter`.
 */
export const datatableQuerySchema = ({
	sortFields,
	filterFields,
	filterExample = {},
}: DatatableQueryOptions) => {
	const filterShape: Record<string, z.ZodOptional<z.ZodString>> = {};
	for (const field of filterFields) {
		const name = typeof field === "string" ? field : field.field;
		const example =
			typeof field !== "string" && "enum" in field
				? field.enum[0]
				: (filterExample[name] ?? "value");
		filterShape[`filter[${name}]`] = z
			.string()
			.optional()
			.openapi({ description: filterDescription(field), example });
	}

	return z.object({
		page: z.coerce.number().int().min(1).default(1).openapi({
			description: "Page number, 1-based.",
			example: 1,
		}),
		perPage: z.coerce
			.number()
			.int()
			.min(1)
			.default(paginationLength)
			.openapi({
				description: `Rows per page (default: ${paginationLength}).`,
				example: paginationLength,
			}),
		search: z.string().optional().openapi({
			description:
				"Case-insensitive search over this resource's searchable columns.",
			example: "admin",
		}),
		sort: z
			.enum(sortFields as [string, ...string[]])
			.default(defaultSort)
			.openapi({
				description: `Field to sort by. Allowed: ${sortFields.join(", ")}. Anything else is rejected with 422.`,
				example: defaultSort,
			}),
		sortDirection: z.enum(["asc", "desc"]).default("desc").openapi({
			description: "Sort direction (default: desc).",
			example: "asc",
		}),
		...filterShape,
	});
};
