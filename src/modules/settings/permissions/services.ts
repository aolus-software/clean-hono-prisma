import { DatatableType, PaginationResponse, PermissionList } from "@types";
import { PermissionRepository } from "@database";
import { z } from "@hono/zod-openapi";
import { PermissionCreateSchema, PermissionUpdateSchema } from "./schema";
import { NotFoundError } from "@errors";
import { IPermissionService } from "./service.interface";

export class PermissionService implements IPermissionService {
	async findAll(
		queryParam: DatatableType,
	): Promise<PaginationResponse<PermissionList>> {
		const result = await PermissionRepository().findAll({
			page: queryParam.page,
			limit: queryParam.limit,
			sort_by: queryParam.sort,
			sort_order: queryParam.sortDirection,
			search: queryParam.search ?? undefined,
		});
		return {
			data: result.data,
			meta: {
				page: queryParam.page,
				limit: queryParam.limit,
				totalCount: result.total,
			},
		};
	}

	async create(data: z.infer<typeof PermissionCreateSchema>): Promise<void> {
		const { name: names, group } = data;
		for (const name of names) {
			await PermissionRepository().create({ name, group });
		}
	}

	async findOne(id: string): Promise<PermissionList> {
		const repo = PermissionRepository();
		const perm = await repo.permission.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				group: true,
				created_at: true,
				updated_at: true,
			},
		});
		if (!perm) throw new NotFoundError("Permission not found");
		return perm;
	}

	async update(
		data: z.infer<typeof PermissionUpdateSchema>,
		id: string,
	): Promise<void> {
		await PermissionRepository().update(id, data);
	}

	async delete(id: string): Promise<void> {
		await PermissionRepository().delete(id);
	}
}
