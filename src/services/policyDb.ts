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

export function withdrawClaim(claimId: string) {
  const rows = query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', claimId]);
  return rows[0];
}
