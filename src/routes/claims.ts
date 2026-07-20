import { Router } from 'express';
import { getPolicyById, updateClaimStatus } from '../services/policyDb';
import { summarizeClaimWithBedrock } from '../services/summarization';
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
