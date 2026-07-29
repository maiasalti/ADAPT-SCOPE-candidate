import { query } from '../db';
import { getClaimById } from './policyDb';
import { redact } from '../middleware/redact';

export type WithdrawClaimResult =
  | { ok: true; claim: { id: string; status: string } }
  | { ok: false; status: 404 | 409; error: string };

export function withdrawClaim(claimId: string): WithdrawClaimResult {
  const claim = getClaimById(claimId);

  if (!claim) {
    return { ok: false, status: 404, error: 'Claim not found' };
  }

  if (claim.status !== 'submitted') {
    return {
      ok: false,
      status: 409,
      error: `Claim cannot be withdrawn from status: ${claim.status}`,
    };
  }

  const previousStatus = claim.status;

  query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);

  console.log(
    'Claim withdrawn:',
    JSON.stringify(redact({ claimId, previousStatus }))
  );

  return { ok: true, claim: { id: claimId, status: 'withdrawn' } };
}
