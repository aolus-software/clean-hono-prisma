# Rule: Services — business logic

Services hold the _what_ and _why_ of a feature. Repositories hold the _how_ of data access. Route
handlers are the glue.

## Location and shape

- `src/modules/<feature>/service.ts` (the settings sub-modules name it `services.ts`), with its
  interface in `service.interface.ts`.
- A service is a **class implementing `I<Name>Service`**, registered in `src/bootstrap.ts`, injected by
  `diMiddleware`, and read in handlers with `c.get("<name>Service")` (`di.md`). Keep services
  stateless: no instance fields beyond what the constructor needs, since one instance serves every
  request.

```ts
export class RoleService implements IRoleService {
	async findOne(id: string): Promise<RoleDetail> {
		const role = await RoleRepository().findDetail(id);
		if (!role) throw new NotFoundError(t("role.notFound"));
		return role;
	}
}
```

## Rules

1. **No Hono types inside services.** No `Context`, no `c.json()`. Services take DTOs and return DTOs.
2. **Services orchestrate repositories.** Call the factory each time; pass `tx` inside a transaction.
3. **Validation is layered.** Shape and format in Zod (`schema.ts`); existence, uniqueness, and state
   in the service, throwing from `@errors` (`services-crud.md`).
4. **Throw, don't return error objects.**
5. **Transactions:** a write touching more than one table runs in
   `db.$transaction(async (tx) => { ... })` and passes `tx` to every repository call.
6. **Queue after commit.** Enqueue mail after the transaction resolves, never inside it.
7. **Cache invalidation is the service's job.** `AuthMiddleware` caches `UserInformation` at
   `UserInformationCacheKey(id)`. After a write that changes what that object contains or whether the
   user may authenticate, delete the affected keys:
   - user update → that user; when the new status is not `ACTIVE`, call `revokeSessions(id)` instead,
   - delete, admin password reset, password reset, own password change → `revokeSessions(id)`, which
     also deletes the stored refresh-token id (`RefreshTokenCacheKey`),
   - profile update → that user (re-cache the fresh value),
   - role update or delete → every user holding the role,
   - permission update or delete → every user holding a role that grants it.
8. **Log with structured fields**, object first: `logger.error({ error, userId }, "...")`. Never log
   passwords or tokens.
9. **Silent on enumeration-leaky paths.** `forgotPassword` and `resendVerification` return without
   error for an unknown, inactive, or already-verified address.
10. **A service does one feature.**
