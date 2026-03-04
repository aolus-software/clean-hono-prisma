import { db } from "@database/postgres/client";
import { Hash } from "@utils";

export const UserSeeder = async () => {
	await db.$transaction(async (tx) => {
		const [superuser, admin] = await Promise.all([
			tx.user.create({
				data: {
					name: "superuser",
					email: "superuser@example.com",
					email_verified_at: new Date(),
					password: await Hash.generateHash("password"),
				},
			}),
			tx.user.create({
				data: {
					name: "admin",
					email: "admin@example.com",
					email_verified_at: new Date(),
					password: await Hash.generateHash("password"),
				},
			}),
		]);

		const [superuserRole, adminRole] = await Promise.all([
			tx.role.findFirst({ where: { name: "superuser" } }),
			tx.role.findFirst({ where: { name: "admin" } }),
		]);

		await Promise.all([
			superuserRole &&
				tx.userRole.create({
					data: { user_id: superuser.id, role_id: superuserRole.id },
				}),
			adminRole &&
				tx.userRole.create({
					data: { user_id: admin.id, role_id: adminRole.id },
				}),
		]);
	});
};
