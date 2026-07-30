import { Router } from 'express';
import { getPolicyById, updateClaimStatus } from '../services/policyDb';
import { summarizeClaimWithBedrock } from '../services/summarization';
import { withdrawClaim } from '../services/claimWithdrawal';
import { validate } from '../middleware/validate';
import { redact } from '../middleware/redact';

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

claimsRouter.post(
  '/:claimId/withdraw',
  validate([{ field: 'claimId', required: true, source: 'params' }]),
  (req, res) => {
    const { claimId } = req.params;

    const result = withdrawClaim(claimId);

    if (result.outcome === 'not_found') {
      res.status(404).json({ error: `Claim not found: ${claimId}` });
      return;
    }

    if (result.outcome === 'invalid_status') {
      res.status(409).json({
        error: `Claim ${claimId} cannot be withdrawn from status: ${result.currentStatus}`,
      });
      return;
    }

    console.log('Claim withdrawn', redact({ claimId }));

    res.status(200).json({ id: result.claim.id, status: result.claim.status });
  }
);
