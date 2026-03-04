/**
 * Helper function to generate OpenAPI description with access control requirements
 *
 * @param baseDescription - The base description of the endpoint
 * @param options - Access control options
 * @returns Formatted description with access requirements
 *
 * @example
 * ```typescript
 * description: withGuardDescription("Fetch list of users", {
 *   roles: ['admin', 'superuser']
 * })
 * // Returns: "Fetch list of users\n\n**Access Requirements:**\n- Roles: admin, superuser"
 *
 * description: withGuardDescription("Create a new user", {
 *   permissions: ['user create']
 * })
 * // Returns: "Create a new user\n\n**Access Requirements:**\n- Permissions: user create"
 * ```
 */
export const withGuardDescription = (
	baseDescription: string,
	options?: {
		roles?: string[];
		permissions?: string[];
	},
): string => {
	if (!options || (!options.roles?.length && !options.permissions?.length)) {
		return baseDescription;
	}

	const requirements: string[] = [];

	if (options.roles && options.roles.length > 0) {
		requirements.push(`- **Roles:** ${options.roles.join(", ")}`);
	}

	if (options.permissions && options.permissions.length > 0) {
		requirements.push(`- **Permissions:** ${options.permissions.join(", ")}`);
	}

	return `${baseDescription}\n\n**Access Requirements:**\n${requirements.join("\n")}`;
};

/**
 * Pre-built descriptions for common guard scenarios
 */
export const GuardDescriptions = {
	/**
	 * Admin or Superuser only access
	 */
	adminOnly: (baseDescription: string) =>
		withGuardDescription(baseDescription, { roles: ["admin", "superuser"] }),

	/**
	 * Superuser only access
	 */
	superuserOnly: (baseDescription: string) =>
		withGuardDescription(baseDescription, { roles: ["superuser"] }),

	/**
	 * User management access descriptions
	 */
	userManagement: {
		list: (baseDescription: string = "Fetch list of users") =>
			withGuardDescription(baseDescription, { permissions: ["user list"] }),
		create: (baseDescription: string = "Create a new user") =>
			withGuardDescription(baseDescription, { permissions: ["user create"] }),
		detail: (baseDescription: string = "Fetch user details") =>
			withGuardDescription(baseDescription, { permissions: ["user detail"] }),
		edit: (baseDescription: string = "Update user information") =>
			withGuardDescription(baseDescription, { permissions: ["user edit"] }),
		delete: (baseDescription: string = "Delete a user") =>
			withGuardDescription(baseDescription, { permissions: ["user delete"] }),
	},

	/**
	 * Permission management access descriptions
	 */
	permissionManagement: {
		list: (baseDescription: string = "Fetch list of permissions") =>
			withGuardDescription(baseDescription, {
				permissions: ["permission list"],
			}),
		create: (baseDescription: string = "Create a new permission") =>
			withGuardDescription(baseDescription, {
				permissions: ["permission create"],
			}),
		detail: (baseDescription: string = "Fetch permission details") =>
			withGuardDescription(baseDescription, {
				permissions: ["permission detail"],
			}),
		edit: (baseDescription: string = "Update permission information") =>
			withGuardDescription(baseDescription, {
				permissions: ["permission edit"],
			}),
		delete: (baseDescription: string = "Delete a permission") =>
			withGuardDescription(baseDescription, {
				permissions: ["permission delete"],
			}),
	},

	/**
	 * Role management access descriptions
	 */
	roleManagement: {
		list: (baseDescription: string = "Fetch list of roles") =>
			withGuardDescription(baseDescription, { permissions: ["role list"] }),
		create: (baseDescription: string = "Create a new role") =>
			withGuardDescription(baseDescription, { permissions: ["role create"] }),
		detail: (baseDescription: string = "Fetch role details") =>
			withGuardDescription(baseDescription, { permissions: ["role detail"] }),
		edit: (baseDescription: string = "Update role information") =>
			withGuardDescription(baseDescription, { permissions: ["role edit"] }),
		delete: (baseDescription: string = "Delete a role") =>
			withGuardDescription(baseDescription, { permissions: ["role delete"] }),
	},
};
