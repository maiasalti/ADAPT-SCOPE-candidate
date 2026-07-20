# Ticket: Claim Withdrawal

FinGuard needs to let a policyholder withdraw a claim they've already
submitted, as long as it hasn't been processed yet.

## Requirements

- Add `POST /claims/:claimId/withdraw`.
- If the claim exists and its status is `submitted`, set its status to
  `withdrawn` and respond `200` with the updated claim as `{ id, status }`.
- If the claim doesn't exist, respond `404` with `{ error: string }`.
- If the claim exists but isn't in `submitted` status (e.g. already
  `approved`, `denied`, or `withdrawn`), respond `409` with `{ error: string }`.
- Log that a withdrawal happened, for audit purposes.
- Follow the conventions in `CLAUDE.md`.

## Out of scope

- No changes to claim submission or approval logic.
- No auth/permission system — assume the caller is already authorized.
