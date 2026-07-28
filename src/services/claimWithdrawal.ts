import { query } from '../db';

export type ClaimWithdrawalResult =
  | { outcome: 'not_found' }
  | { outcome: 'invalid_status'; status: string }
  | { outcome: 'withdrawn'; claim: { id: string; status: string } };

export function withdrawClaim(claimId: string): ClaimWithdrawalResult {
  const rows = query('SELECT * FROM claims WHERE id = ?', [claimId]);
  const claim = rows[0];

  if (!claim) {
    return { outcome: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { outcome: 'invalid_status', status: claim.status };
  }

  query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);
  return { outcome: 'withdrawn', claim: { id: claim.id, status: 'withdrawn' } };
}
