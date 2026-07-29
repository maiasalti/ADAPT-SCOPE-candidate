import { query } from '../db';
import { redact } from '../middleware/redact';

export type WithdrawResult =
  | { outcome: 'not_found' }
  | { outcome: 'conflict'; status: string }
  | { outcome: 'withdrawn'; claim: { id: string; status: string } };

export function withdrawClaim(claimId: string): WithdrawResult {
  const rows = query('SELECT * FROM claims WHERE id = ?', [claimId]);
  const claim = rows[0];

  if (!claim) {
    return { outcome: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { outcome: 'conflict', status: claim.status };
  }

  query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);

  console.log('Claim withdrawn:', JSON.stringify(redact({ claimId })));

  return { outcome: 'withdrawn', claim: { id: claimId, status: 'withdrawn' } };
}
