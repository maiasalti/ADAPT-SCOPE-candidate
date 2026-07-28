import { getClaimById, updateClaimStatus } from './policyDb';

export type WithdrawResult =
  | { outcome: 'not_found' }
  | { outcome: 'conflict'; currentStatus: string }
  | { outcome: 'withdrawn'; claim: { id: string; status: string } };

export function withdrawClaim(claimId: string): WithdrawResult {
  const claim = getClaimById(claimId);
  if (!claim) {
    return { outcome: 'not_found' };
  }

  if (claim.status !== 'submitted') {
    return { outcome: 'conflict', currentStatus: claim.status };
  }

  const updated = updateClaimStatus(claimId, 'withdrawn');
  return { outcome: 'withdrawn', claim: { id: updated.id, status: updated.status } };
}
