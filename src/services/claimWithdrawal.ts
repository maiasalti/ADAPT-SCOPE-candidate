import { query } from '../db';
import { redact } from '../middleware/redact';

export interface WithdrawClaimResult {
  status: 200 | 404 | 409;
  body: { id: string; status: string } | { error: string };
}

export function withdrawClaim(claimId: string): WithdrawClaimResult {
  const rows = query('SELECT * FROM claims WHERE id = ?', [claimId]);
  const claim = rows[0];

  if (!claim) {
    return { status: 404, body: { error: `Claim not found: ${claimId}` } };
  }

  if (claim.status !== 'submitted') {
    return {
      status: 409,
      body: { error: `Claim ${claimId} cannot be withdrawn from status: ${claim.status}` },
    };
  }

  const previousStatus = claim.status;
  query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);

  console.log(
    'Claim withdrawn:',
    JSON.stringify(
      redact({
        claimId: claim.id,
        policyId: claim.policyId,
        amount: claim.amount,
        previousStatus,
        newStatus: 'withdrawn',
      })
    )
  );

  return { status: 200, body: { id: claim.id, status: 'withdrawn' } };
}
