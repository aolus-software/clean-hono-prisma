import {
	DatatableType,
	PaginationResponse,
	UserList,
	UserDetail,
	UserCreate,
} from "@types";
import { UserRepository } from "@database";
import { z } from "@hono/zod-openapi";
import { UserCreateSchema, UserUpdateSchema } from "./schema";
import { IUserService } from "./service.interface";
import { NotFoundError } from "@errors";
import { t } from "@i18n";
import { Hash } from "@utils";

export class UserService implements IUserService {
	async findAll(
		queryParam: DatatableType,
	): Promise<PaginationResponse<UserList>> {
		const result = await UserRepository().findAll({
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

	async create(data: z.infer<typeof UserCreateSchema>): Promise<void> {
		const hashedPassword = await Hash.generateHash(data.password);
		await UserRepository().create({
			...data,
			password: hashedPassword,
		} as UserCreate);
	}

	async findOne(id: string): Promise<UserDetail> {
		const user = await UserRepository().findById(id);
		if (!user) throw new NotFoundError(t("user.notFound"));
		return user;
	}

	async update(
		data: z.infer<typeof UserUpdateSchema>,
		id: string,
	): Promise<void> {
		await UserRepository().update(id, { ...data, role_ids: data.role_ids });
	}

	async delete(id: string): Promise<void> {
		await UserRepository().softDelete(id);
	}
}
