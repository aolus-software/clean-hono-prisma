# Rule: Mail (`src/libs/mail/`)

Two ways out of the process, and the default is the queue.

- **Enqueue** — `sendEmailQueue.add("send-email", { ... })` from `@bull`. The request returns
  immediately; `src/bull/worker/send-email.worker.ts` picks the job up and calls
  `EmailService.sendEmail`. This is what every existing producer does.
- **Inline** — `EmailService.sendEmail(options)` (`src/libs/mail/mail.service.ts`) opens the SMTP
  connection on the spot and blocks. Use it **only** when the mail must have landed before the
  response goes out, and say why in a comment.

Both paths take the same `EmailOptions`, so a job payload and an inline call are the same object.

## Token mails — the pattern to copy

Verification and password-reset mails always do three things, in this order:

1. Inside a transaction: stamp `usedAt` on the user's earlier unused tokens of that kind (revoke on
   issue), then insert the new token with `expiresAt` from the lifetime function in `@default`.
2. **After the transaction commits**: enqueue the mail. A rolled-back transaction must not leave a job
   in Redis carrying a token that does not exist.
3. Log the outcome with `{ userId }` only.

Links are built from `AppConfig.CLIENT_URL`: `${CLIENT_URL}/auth/verify-email?token=...` and
`${CLIENT_URL}/auth/reset-password?token=...`.

## Templates

Plain HTML under `src/libs/mail/templates/<area>/<name>.html`. `template` in the options is the path
relative to that directory. The build copies the folder to `dist/templates` because the bundled
`dist/index.js` resolves templates next to itself — a new template folder needs nothing extra, but a
template stored anywhere else will not ship.

**This is not Handlebars.** `sendEmail` does a literal replace of `{{key}}` for each entry of
`options.variables` (`Record<string, string>`). No helpers, conditionals, or loops.

Localisation is by filename: `<name>.<locale>.html`, falling back to `<name>.html` (the English
template). When you add a template, add its `.id.html` in the same change with the same placeholder
set. Producers set `lang: getCurrentLocale()`; subjects come from the `mail.subject.*` keys.

## Don't

1. Don't call `EmailService.sendEmail` from a route handler or a service by default — enqueue.
2. Don't enqueue inside a `db.$transaction(...)` callback.
3. Don't prefix the subject yourself; `sendEmail` prepends `[<APP_ENV>]` outside production.
4. Don't log a token, a verification URL, or a reset URL.
5. Don't add a template without its `.id.html` sibling.
6. Don't read `process.env` in mail code; everything comes from `@config`.
