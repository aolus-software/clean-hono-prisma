import { forgetSelectOptions, forgetUserInformation } from "@cache";
import {
	db,
	PermissionRepository,
	Prisma,
	RoleRepository,
	UserRepository,
} from "@database";
import { NotFoundError, UnprocessableEntityError } from "@errors";
import { t } from "@i18n";
import type {
	DatatableType,
	PaginationResponse,
	RoleDetail,
	RoleList,
} from "@types";

import type { RoleInput } from "./schema";
import type { IRoleService } from "./service.interface";

export class RoleService implements IRoleService {
	async findAll(query: DatatableType): Promise<PaginationResponse<RoleList>> {
		return RoleRepository().findAll(query);
	}

	async create(data: RoleInput): Promise<void> {
		await this.assertNameFree(data.name);
		await this.assertPermissionsExist(data.permissionIds);

		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await RoleRepository(tx).create(data);
		});
		await forgetSelectOptions();
	}

	async findOne(id: string): Promise<RoleDetail> {
		const role = await RoleRepository().getDetail(id);
		if (!role) throw new NotFoundError(t("role.notFound"));
		return role;
	}

	async update(id: string, data: RoleInput): Promise<void> {
		await this.findExisting(id);
		await this.assertNameFree(data.name, id);
		await this.assertPermissionsExist(data.permissionIds);

		await db.$transaction(async (tx: Prisma.TransactionClient) => {
			await RoleRepository(tx).update(id, data);
		});
		await forgetUserInformation(await UserRepository().findIdsByRoleIds([id]));
		await forgetSelectOptions();
	}

	async delete(id: string): Promise<void> {
		await this.findExisting(id);
		const holders = await UserRepository().findIdsByRoleIds([id]);
		await RoleRepository().delete(id);
		await forgetUserInformation(holders);
		await forgetSelectOptions();
	}

	private async findExisting(id: string): Promise<RoleList> {
		const role = await RoleRepository().findById(id);
		if (!role) throw new NotFoundError(t("role.notFound"));
		return role;
	}

	private async assertNameFree(
		name: string,
		excludeId?: string,
	): Promise<void> {
		if (await RoleRepository().findByName(name, excludeId)) {
			throw new UnprocessableEntityError(t("role.nameExists"), [
				{ field: "name", message: t("role.nameExists") },
			]);
		}
	}

	private async assertPermissionsExist(permissionIds: string[]): Promise<void> {
		const unique = Array.from(new Set(permissionIds));
		if ((await PermissionRepository().countByIds(unique)) !== unique.length) {
			throw new UnprocessableEntityError(t("role.invalidPermissions"), [
				{ field: "permissionIds", message: t("role.invalidPermissions") },
			]);
		}
	}
}
