import { Router } from 'express';
import { getPolicyById, updateClaimStatus } from '../services/policyDb';
import { summarizeClaimWithBedrock } from '../services/summarization';
import { withdrawClaim } from '../services/claims';
import { validate } from '../middleware/validate';

export const claimsRouter = Router();

claimsRouter.post(
  '/submit',
  validate([
    { field: 'claimId', required: true },
    { field: 'policyId', required: true },
    { field: 'amount', required: true },
  ]),
  (req, res) => {
    const { claimId, policyId, amount, ssn, patientName, condition } = req.body;

    const policy = getPolicyById(policyId);
    if (!policy || !policy.active) {
      res.status(404).json({ error: 'Policy not found or inactive' });
      return;
    }

    const approved = amount <= policy.premium * 10;
    const status = approved ? 'approved' : 'denied';

    const summaryResult = summarizeClaimWithBedrock({ claimId, ssn, patientName, condition });

    try {
      updateClaimStatus(claimId, status);
    } catch {
      // existing behavior — not part of this task
    }

    res.json({
      claimId,
      status,
      summary: summaryResult.summary,
      policy,
    });
  }
);

claimsRouter.post('/:claimId/withdraw', (req, res) => {
  const { claimId } = req.params;

  // validate() only inspects req.body, so it doesn't apply to a route-param
  // input like this. No inline check is needed either: Express only invokes
  // this handler when the :claimId segment matched, which guarantees
  // req.params.claimId is a non-empty string.
  const result = withdrawClaim(claimId);

  if (!result.ok) {
    if (result.reason === 'not_found') {
      res.status(404).json({ error: `Claim ${claimId} not found` });
      return;
    }
    res.status(409).json({ error: `Claim ${claimId} is ${result.currentStatus}, cannot be withdrawn` });
    return;
  }

  res.status(200).json(result.claim);
});
