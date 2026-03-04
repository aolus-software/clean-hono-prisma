import { z } from "@hono/zod-openapi";
import { SortDirection } from "../common.types";

export type DatatableType = {
	page: number;
	limit: number;
	search: string | null;
	sort: string;
	sortDirection: SortDirection;

	// e.g ?filter[name]=John&filter[age]=30
	filter: Record<string, boolean | string | Date> | null;

	// NOTE: This is just an example, you can add more fields here
	// fields=name,age
	// exclude=name,age
	// include=name,age
};

export const ZodDatatableSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10),
	search: z.string().nullable().default(null),
	sort: z.string().default("id"),
	sortDirection: z.enum(["asc", "desc"]).default("desc"),
	filter: z
		.record(z.string(), z.union([z.string(), z.boolean(), z.date()]))
		.nullable()
		.default(null),
});
