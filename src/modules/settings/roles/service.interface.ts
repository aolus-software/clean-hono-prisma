import type {
	DatatableType,
	PaginationResponse,
	RoleDetail,
	RoleList,
} from "@types";

import type { RoleInput } from "./schema";

export interface IRoleService {
	findAll(query: DatatableType): Promise<PaginationResponse<RoleList>>;

	create(data: RoleInput): Promise<void>;

	findOne(id: string): Promise<RoleDetail>;

	update(id: string, data: RoleInput): Promise<void>;

	delete(id: string): Promise<void>;
}
