import { getClaimById, updateClaimStatus } from './policyDb';
import { redact } from '../middleware/redact';

export type WithdrawResult =
  | { ok: true; claim: { id: string; status: string } }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'invalid_status'; currentStatus: string };

export function withdrawClaim(claimId: string): WithdrawResult {
  const claim = getClaimById(claimId);
  if (!claim) {
    return { ok: false, reason: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { ok: false, reason: 'invalid_status', currentStatus: claim.status };
  }

  // Non-atomic: read above and write below are two separate operations on
  // the in-memory store. query() only supports a single-column WHERE, so a
  // conditional `UPDATE ... WHERE id = ? AND status = ?` isn't expressible
  // here. Against a real async DB this guard would need a conditional
  // update or a transaction to avoid a race between the status check and
  // the write.
  const previousStatus = claim.status;
  updateClaimStatus(claimId, 'withdrawn');

  console.log(
    'Claim withdrawn:',
    JSON.stringify(
      redact({
        claimId,
        previousStatus,
        newStatus: 'withdrawn',
        timestamp: new Date().toISOString(),
      })
    )
  );

  return { ok: true, claim: { id: claimId, status: 'withdrawn' } };
}
