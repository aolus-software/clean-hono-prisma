/**
 * Appends a route's access requirements to its OpenAPI description so
 * `/docs` shows the guard next to the endpoint.
 */
export const withGuardDescription = (
	baseDescription: string,
	options: { roles?: string[]; permissions?: string[] } = {},
): string => {
	const requirements: string[] = [];
	if (options.roles?.length) {
		requirements.push(`- **Roles (all of):** ${options.roles.join(", ")}`);
	}
	if (options.permissions?.length) {
		requirements.push(
			`- **Permissions (all of):** ${options.permissions.join(", ")}`,
		);
	}
	if (requirements.length === 0) return baseDescription;
	return `${baseDescription}\n\n**Access requirements** (superuser bypasses):\n${requirements.join("\n")}`;
};
