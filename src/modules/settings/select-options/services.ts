import { PermissionRepository, RoleRepository } from "@database";
import { PermissionSelectOptions } from "@types";
import { ISelectOptionsService } from "./service.interface";

export class SelectOptionsService implements ISelectOptionsService {
	async getPermissionOptions(): Promise<PermissionSelectOptions[]> {
		return await PermissionRepository().getSelectOptions();
	}

	async getRoleOptions(): Promise<{ id: string; name: string }[]> {
		return await RoleRepository().getSelectOptions();
	}
}
