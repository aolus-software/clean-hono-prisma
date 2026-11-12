import { forgetSelectOptions, forgetUserInformation } from "@cache";
import {
	PermissionRepository,
	RoleRepository,
	UserRepository,
} from "@database";
import { NotFoundError, UnprocessableEntityError } from "@errors";
import { t } from "@i18n";
import type { DatatableType, PaginationResponse, PermissionList } from "@types";

import type { PermissionCreateInput, PermissionUpdateInput } from "./schema";
import type { IPermissionService } from "./service.interface";

export class PermissionService implements IPermissionService {
	async findAll(
		query: DatatableType,
	): Promise<PaginationResponse<PermissionList>> {
		return PermissionRepository().findAll(query);
	}

	async create(data: PermissionCreateInput): Promise<void> {
		const names = Array.from(
			new Set(data.name.map((action) => `${data.group} ${action}`)),
		);

		const existing = await PermissionRepository().findExistingByNames(names);
		if (existing.length > 0) {
			throw new UnprocessableEntityError(t("permission.someExists"), [
				{
					field: "name",
					message: t("permission.someExistsList", {
						names: existing.map((permission) => permission.name).join(", "),
					}),
				},
			]);
		}

		await PermissionRepository().createMany(
			names.map((name) => ({ name, group: data.group })),
		);
		await forgetSelectOptions();
	}

	async findOne(id: string): Promise<PermissionList> {
		const permission = await PermissionRepository().findById(id);
		if (!permission) throw new NotFoundError(t("permission.notFound"));
		return permission;
	}

	async update(id: string, data: PermissionUpdateInput): Promise<void> {
		await this.findOne(id);
		if (await PermissionRepository().findByName(data.name, id)) {
			throw new UnprocessableEntityError(t("permission.nameExists"), [
				{ field: "name", message: t("permission.nameExists") },
			]);
		}

		await PermissionRepository().update(id, data);
		await forgetUserInformation(await this.holdersOf(id));
		await forgetSelectOptions();
	}

	async delete(id: string): Promise<void> {
		await this.findOne(id);
		const holders = await this.holdersOf(id);
		await PermissionRepository().delete(id);
		await forgetUserInformation(holders);
		await forgetSelectOptions();
	}

	private async holdersOf(permissionId: string): Promise<string[]> {
		const roleIds = await RoleRepository().findIdsByPermissionId(permissionId);
		return UserRepository().findIdsByRoleIds(roleIds);
	}
}
