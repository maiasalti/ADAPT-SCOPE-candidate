# FinGuard — Engineering Guardrails

- Database access must go through `query(sql, params)` in `src/db.ts`
  using `?` placeholders. Never interpolate values into a SQL string.
- Never log PII/PHI (SSN, patient name, etc.) directly. Pass any payload
  that might contain it through `redact()` from
  `src/middleware/redact.ts` before logging.
- New business logic belongs in its own module under `src/services/`,
  not inline in a route handler.
- Secrets (API keys, passwords, tokens) must come from environment
  variables (`process.env.*`), never hardcoded in source.
- New endpoints must validate their input using `validate()` from
  `src/middleware/validate.ts`.
- Audit logs must always pass through `redact()` before logging, even
  when the payload only touches fields that seem non-sensitive (e.g.
  claim status) — this is easy to skip on small handlers, but the rule
  applies regardless of what the current schema happens to contain.
