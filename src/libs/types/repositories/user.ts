import { z } from "@hono/zod-openapi";
import type { UserStatus } from "@prisma-generated";

export type UserStatusEnum = UserStatus;

export interface UserInformation {
	id: string;
	name: string;
	email: string;
	roles: string[];
	permissions: string[];
}

export const ZodUserInformation = z
	.object({
		id: z.string().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
		name: z.string().openapi({ example: "Jane Doe" }),
		email: z.string().openapi({ example: "jane@example.com" }),
		roles: z.array(z.string()).openapi({ example: ["admin"] }),
		permissions: z
			.array(z.string())
			.openapi({ example: ["user list", "user create"] }),
	})
	.openapi("UserInformation");

export type UserList = {
	id: string;
	name: string;
	email: string;
	status: UserStatusEnum;
	remark: string | null;
	roles: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type UserDetail = {
	id: string;
	name: string;
	email: string;
	status: UserStatusEnum;
	remark: string | null;
	roles: {
		id: string;
		name: string;
	}[];
	createdAt: Date;
	updatedAt: Date;
};

export type UserCreate = {
	name: string;
	email: string;
	password: string;
	status: UserStatusEnum;
	remark: string | null;
	roleIds: string[];
};

export type UserUpdate = Omit<UserCreate, "password">;

export type UserForAuth = {
	id: string;
	name: string;
	email: string;
	password: string;
	status: UserStatusEnum;
	emailVerifiedAt: Date | null;
};
