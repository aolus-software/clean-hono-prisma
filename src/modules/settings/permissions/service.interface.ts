import type { DatatableType, PaginationResponse, PermissionList } from "@types";

import type { PermissionCreateInput, PermissionUpdateInput } from "./schema";

export interface IPermissionService {
	findAll(query: DatatableType): Promise<PaginationResponse<PermissionList>>;

	create(data: PermissionCreateInput): Promise<void>;

	findOne(id: string): Promise<PermissionList>;

	update(id: string, data: PermissionUpdateInput): Promise<void>;

	delete(id: string): Promise<void>;
}
