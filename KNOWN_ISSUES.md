# Known Issues — Pre-existing, Out of Scope for Claim Withdrawal

While implementing `POST /claims/:claimId/withdraw` (see `TICKET.md`), three
pre-existing issues were found in the claim **submission/approval** path.
None of them affect the new withdrawal endpoint, and the ticket explicitly
scoped out "changes to claim submission or approval logic," so they were
left as-is. Flagging here for a follow-up ticket.

## 1. SQL-injection-style string interpolation in `getPolicyById`

**File:** `src/services/policyDb.ts`

```ts
export function getPolicyById(policyId: string) {
  const rows = query(`SELECT * FROM policies WHERE id = '${policyId}'`);
  return rows[0];
}
```

`policyId` is spliced directly into the query string instead of being
passed as a `?` placeholder param, which `CLAUDE.md` explicitly requires
("Never interpolate values into a SQL string"). `policyId` currently comes
from the `/claims/submit` request body, so this is reachable from
user-controlled input. The in-memory `query()` engine doesn't execute real
SQL today, but the pattern is unsafe and would become a real injection risk
if `db.ts` were ever swapped for a real database driver.

**Suggested fix:** `query('SELECT * FROM policies WHERE id = ?', [policyId])`
(same fix already applied to `updateClaimStatus`/`getClaimById` as part of
the withdrawal work, since those were on the withdrawal code path).

## 2. Unredacted PII/PHI logging in `summarizeClaimWithBedrock`

**File:** `src/services/summarization.ts`

```ts
export function summarizeClaimWithBedrock(request: ClaimSummaryRequest) {
  console.log('Bedrock request payload:', JSON.stringify(request));
  ...
```

This logs the full request — including `ssn` and `patientName` — straight
to stdout on every claim submission, without passing it through `redact()`
first, contrary to `CLAUDE.md` ("Never log PII/PHI... Pass any payload that
might contain it through `redact()`... before logging"). Depending on where
these logs are shipped (e.g. a log aggregator), this could be a real
PII/PHI exposure.

**Suggested fix:**
`console.log('Bedrock request payload:', JSON.stringify(redact(request)));`

## 3. Silently swallowed error when persisting claim status on submit

**File:** `src/routes/claims.ts`, in the `/submit` handler

```ts
try {
  updateClaimStatus(claimId, status);
} catch {
  // existing behavior — not part of this task
}
```

If `updateClaimStatus` throws for any reason, the handler still responds
`200` with the computed `approved`/`denied` status even though that status
was never actually persisted — so the API's response can silently disagree
with what's stored. There's no logging or surfacing of the failure at all.

**Suggested fix:** at minimum, log the error (redacted) for visibility;
depending on desired behavior, consider surfacing a 5xx to the caller when
the persistence step fails, so responses don't claim success incorrectly.
