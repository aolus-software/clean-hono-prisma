import { Context } from "hono";
import { BadRequestError } from "@errors/bad-request-error";
import { t } from "@i18n";
import {
	DatatableFilter,
	DatatableType,
	FilterField,
	filterFieldNames,
	SortDirection,
} from "@types";

import { DateToolkit } from "../date";

type ValidatedDatatableQuery = {
	page: number;
	perPage: number;
	search?: string;
	sort: string;
	sortDirection: SortDirection;
};

const invalidFilter = (field: string, message: string): BadRequestError =>
	new BadRequestError(t("datatable.invalidFilter"), [
		{ field: `filter[${field}]`, message },
	]);

export class DatatableToolkit {
	/**
	 * Merges the validated query with every `filter[<key>]` read off the raw
	 * query string. The schema documents known keys only and would strip an
	 * unknown one, so the raw read is what lets the repository reject it.
	 */
	static parseFilter(
		ctx: Context,
		query: ValidatedDatatableQuery,
	): DatatableType {
		const filter: DatatableFilter = {};
		for (const [key, value] of Object.entries(ctx.req.query())) {
			if (!key.startsWith("filter[") || !key.endsWith("]")) continue;
			const name = key.slice(7, -1);
			if (!name) continue;
			if (value === "true") filter[name] = true;
			else if (value === "false") filter[name] = false;
			else filter[name] = value;
		}

		return {
			page: query.page,
			perPage: query.perPage,
			search: query.search?.trim() || undefined,
			sort: query.sort,
			sortDirection: query.sortDirection,
			filter: Object.keys(filter).length > 0 ? filter : undefined,
		};
	}

	static assertSort(sort: string, fields: readonly string[]): void {
		if (!fields.includes(sort)) {
			throw new BadRequestError(t("datatable.invalidSort"), [
				{
					field: "sort",
					message: t("datatable.sortMustBe", { fields: fields.join(", ") }),
				},
			]);
		}
	}

	static assertFilterKeys(
		filter: DatatableFilter | undefined,
		fields: readonly FilterField[],
	): void {
		if (!filter) return;
		const allowed = filterFieldNames(fields);
		for (const key of Object.keys(filter)) {
			if (!allowed.includes(key)) {
				throw invalidFilter(
					key,
					t("datatable.unknownFilterKey", { keys: allowed.join(", ") }),
				);
			}
		}
	}

	static assertFilterEnums(
		filter: DatatableFilter | undefined,
		fields: readonly FilterField[],
	): void {
		if (!filter) return;
		for (const field of fields) {
			if (typeof field === "string" || !("enum" in field)) continue;
			const raw = filter[field.field];
			if (raw === undefined) continue;
			const invalid = DatatableToolkit.filterValues(raw).filter(
				(value) => !field.enum.includes(value),
			);
			if (invalid.length > 0) {
				throw invalidFilter(
					field.field,
					t("datatable.invalidFilterValue", {
						values: field.enum.join(", "),
						received: invalid.join(", "),
					}),
				);
			}
		}
	}

	static filterValues(value: boolean | string): string[] {
		return value
			.toString()
			.split(",")
			.map((part) => part.trim())
			.filter((part) => part.length > 0);
	}

	static filterIds(value: boolean | string, field: string): string[] {
		const ids = DatatableToolkit.filterValues(value);
		const uuid =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		const invalid = ids.filter((id) => !uuid.test(id));
		if (ids.length === 0 || invalid.length > 0) {
			throw invalidFilter(
				field,
				t("datatable.invalidFilterId", { received: invalid.join(", ") }),
			);
		}
		return ids;
	}

	/**
	 * `2024-03-05` matches that whole day; `2024-01-01,2024-12-31` spans
	 * start of the first day to end of the last, in APP_TIMEZONE.
	 */
	static filterDateRange(
		value: boolean | string,
		field: string,
	): { from: Date; to: Date } {
		const parts = DatatableToolkit.filterValues(value);
		if (parts.length === 0 || parts.length > 2) {
			throw invalidFilter(field, t("datatable.invalidDateRange"));
		}

		const parsed = parts.map((part) => {
			const date = DateToolkit.parse(part);
			if (!date.isValid()) {
				throw invalidFilter(field, t("datatable.invalidDate", { value: part }));
			}
			return date;
		});

		const from = DateToolkit.startOfDay(parsed[0]).toDate();
		const to = DateToolkit.endOfDay(parsed[parsed.length - 1]).toDate();
		if (from > to) {
			throw invalidFilter(field, t("datatable.invalidDateRange"));
		}
		return { from, to };
	}
}
