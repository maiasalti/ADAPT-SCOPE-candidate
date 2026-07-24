import { query } from '../db';
import { redact } from '../middleware/redact';

export type WithdrawClaimResult =
  | { ok: true; claim: { id: string; status: string } }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'invalid_status'; status: string };

export function withdrawClaim(claimId: string): WithdrawClaimResult {
  const rows = query('SELECT * FROM claims WHERE id = ?', [claimId]);
  const claim = rows[0];

  if (!claim) {
    return { ok: false, reason: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { ok: false, reason: 'invalid_status', status: claim.status };
  }

  query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);

  console.log('Claim withdrawn:', JSON.stringify(redact({ claimId, status: 'withdrawn' })));

  return { ok: true, claim: { id: claimId, status: 'withdrawn' } };
}
