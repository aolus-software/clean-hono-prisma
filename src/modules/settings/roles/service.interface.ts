import {
	DatatableType,
	PaginationResponse,
	RoleDetail,
	RoleList,
} from "@types";
import { RoleCreateSchema, RoleUpdateSchema } from "./schema";
import type { z } from "@hono/zod-openapi";

export interface IRoleService {
	findAll(queryParam: DatatableType): Promise<PaginationResponse<RoleList>>;

	create(data: z.infer<typeof RoleCreateSchema>): Promise<void>;

	findOne(id: string): Promise<RoleDetail>;

	update(data: z.infer<typeof RoleUpdateSchema>, id: string): Promise<void>;

	delete(id: string): Promise<void>;
}
