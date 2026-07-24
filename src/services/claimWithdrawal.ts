import { getClaimById, setClaimStatus } from './policyDb';

export type WithdrawClaimResult =
  | { ok: true; claim: { id: string; status: string } }
  | { ok: false; httpStatus: 404 | 409; error: string };

export function withdrawClaim(claimId: string): WithdrawClaimResult {
  const claim = getClaimById(claimId);

  if (!claim) {
    return { ok: false, httpStatus: 404, error: `Claim not found: ${claimId}` };
  }

  if (claim.status !== 'submitted') {
    return {
      ok: false,
      httpStatus: 409,
      error: `Claim ${claimId} cannot be withdrawn from status '${claim.status}'`,
    };
  }

  setClaimStatus(claimId, 'withdrawn');
  console.log(`Claim withdrawn (audit): claimId=${claimId}`);

  return { ok: true, claim: { id: claimId, status: 'withdrawn' } };
}
