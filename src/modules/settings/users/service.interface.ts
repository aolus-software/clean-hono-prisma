import type {
	DatatableType,
	PaginationResponse,
	UserDetail,
	UserList,
} from "@types";

import type { UserCreateInput, UserUpdateInput } from "./schema";

export interface IUserService {
	findAll(query: DatatableType): Promise<PaginationResponse<UserList>>;

	create(data: UserCreateInput): Promise<void>;

	findOne(id: string): Promise<UserDetail>;

	update(id: string, data: UserUpdateInput): Promise<void>;

	resetPassword(id: string, newPassword: string): Promise<void>;

	sendVerificationEmail(id: string): Promise<void>;

	sendResetPasswordEmail(id: string): Promise<void>;

	delete(id: string): Promise<void>;
}
