import { query } from '../db';

export function getPolicyById(policyId: string) {
  const rows = query(`SELECT * FROM policies WHERE id = '${policyId}'`);
  return rows[0];
}

export function updateClaimStatus(claimId: string, status: string) {
  const rows = query(`UPDATE claims SET status = '${status}' WHERE id = '${claimId}'`);
  return rows[0];
}

export function getClaimById(claimId: string) {
  const rows = query('SELECT * FROM claims WHERE id = ?', [claimId]);
  return rows[0];
}

export type WithdrawClaimResult =
  | { outcome: 'not_found' }
  | { outcome: 'conflict'; status: string }
  | { outcome: 'withdrawn'; claim: { id: string; status: string } };

/**
 * Withdraws a claim that is still `submitted`. Rejects claims that don't
 * exist or have already been processed (approved/denied) or withdrawn.
 */
export function withdrawClaim(claimId: string): WithdrawClaimResult {
  const claim = getClaimById(claimId);
  if (!claim) {
    return { outcome: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { outcome: 'conflict', status: claim.status };
  }

  const [updated] = query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);
  return { outcome: 'withdrawn', claim: { id: updated.id, status: updated.status } };
}
