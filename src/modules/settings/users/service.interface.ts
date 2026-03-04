import type {
	DatatableType,
	PaginationResponse,
	UserDetail,
	UserList,
} from "@types";
import type { z } from "@hono/zod-openapi";
import { UserCreateSchema, UserUpdateSchema } from "./schema";

export interface IUserService {
	findAll(queryParam: DatatableType): Promise<PaginationResponse<UserList>>;

	create(data: z.infer<typeof UserCreateSchema>): Promise<void>;

	findOne(id: string): Promise<UserDetail>;

	update(data: z.infer<typeof UserUpdateSchema>, id: string): Promise<void>;

	delete(id: string): Promise<void>;
}
