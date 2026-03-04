import {
	DatatableType,
	PaginationResponse,
	RoleList,
	RoleDetail,
} from "@types";
import { RoleRepository } from "@database";
import { z } from "@hono/zod-openapi";
import { RoleCreateSchema, RoleUpdateSchema } from "./schema";
import { IRoleService } from "./service.interface";
import { NotFoundError } from "@errors";

export class RoleService implements IRoleService {
	async findAll(
		queryParam: DatatableType,
	): Promise<PaginationResponse<RoleList>> {
		const result = await RoleRepository().findAll({
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

	async create(data: z.infer<typeof RoleCreateSchema>): Promise<void> {
		await RoleRepository().create({
			name: data.name,
			permission_ids: data.permission_ids,
		});
	}

	async findOne(id: string): Promise<RoleDetail> {
		const role = await RoleRepository().findById(id);
		if (!role) throw new NotFoundError("Role not found");
		return role;
	}

	async update(
		data: z.infer<typeof RoleUpdateSchema>,
		id: string,
	): Promise<void> {
		await RoleRepository().update(id, {
			name: data.name,
			permission_ids: data.permission_ids,
		});
	}

	async delete(id: string): Promise<void> {
		await RoleRepository().delete(id);
	}
}
