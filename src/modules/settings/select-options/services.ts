import {
	Cache,
	PermissionSelectOptionsCacheKey,
	RoleSelectOptionsCacheKey,
	SELECT_OPTIONS_TTL_SECONDS,
} from "@cache";
import { PermissionRepository, RoleRepository } from "@database";
import { PermissionSelectOptions } from "@types";
import { ISelectOptionsService } from "./service.interface";

export class SelectOptionsService implements ISelectOptionsService {
	async getPermissionOptions(): Promise<PermissionSelectOptions[]> {
		const key = PermissionSelectOptionsCacheKey();
		const cached = await Cache.get<PermissionSelectOptions[]>(key);
		if (cached) return cached;

		const options = await PermissionRepository().getSelectOptions();
		await Cache.set(key, options, SELECT_OPTIONS_TTL_SECONDS);
		return options;
	}

	async getRoleOptions(): Promise<{ id: string; name: string }[]> {
		const key = RoleSelectOptionsCacheKey();
		const cached = await Cache.get<{ id: string; name: string }[]>(key);
		if (cached) return cached;

		const options = await RoleRepository().getSelectOptions();
		await Cache.set(key, options, SELECT_OPTIONS_TTL_SECONDS);
		return options;
	}
}
