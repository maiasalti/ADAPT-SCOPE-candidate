import { query } from '../db';

export interface Claim {
  id: string;
  policyId: string;
  amount: number;
  status: string;
}

export type WithdrawResult =
  | { outcome: 'success'; claim: Claim }
  | { outcome: 'not_found' }
  | { outcome: 'invalid_status'; currentStatus: string };

export function getClaimById(claimId: string): Claim | undefined {
  const rows = query('SELECT * FROM claims WHERE id = ?', [claimId]);
  return rows[0] as Claim | undefined;
}

/**
 * Withdraws a claim if it is still in `submitted` status.
 */
export function withdrawClaim(claimId: string): WithdrawResult {
  const claim = getClaimById(claimId);
  if (!claim) {
    return { outcome: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { outcome: 'invalid_status', currentStatus: claim.status };
  }

  query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);

  return { outcome: 'success', claim: { ...claim, status: 'withdrawn' } };
}
