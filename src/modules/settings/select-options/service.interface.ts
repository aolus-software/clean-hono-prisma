import { PermissionSelectOptions } from "@types";

export interface ISelectOptionsService {
	getPermissionOptions(): Promise<PermissionSelectOptions[]>;
	getRoleOptions(): Promise<{ id: string; name: string }[]>;
}
