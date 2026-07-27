import { describe, it, expect, beforeEach } from 'vitest';
import { getPolicyById, updateClaimStatus, getClaimById, withdrawClaim } from '../src/services/policyDb';
import { resetDb, query } from '../src/db';

describe('policyDb', () => {
  beforeEach(() => resetDb());

  it('looks up a policy by id', () => {
    const policy = getPolicyById('pol-1');
    expect(policy?.holderName).toBe('Jane Doe');
  });

  it('returns undefined for an unknown policy', () => {
    expect(getPolicyById('nope')).toBeUndefined();
  });

  it('updates a claim status', () => {
    updateClaimStatus('clm-1', 'approved');
    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('approved');
  });

  it('looks up a claim by id', () => {
    expect(getClaimById('clm-1')?.status).toBe('submitted');
  });

  it('returns undefined for an unknown claim', () => {
    expect(getClaimById('nope')).toBeUndefined();
  });

  describe('withdrawClaim', () => {
    it('withdraws a submitted claim', () => {
      const result = withdrawClaim('clm-1');
      expect(result).toEqual({ outcome: 'withdrawn', claim: { id: 'clm-1', status: 'withdrawn' } });
    });

    it('reports not_found for an unknown claim', () => {
      expect(withdrawClaim('nope')).toEqual({ outcome: 'not_found' });
    });

    it('reports a conflict for a claim that is not submitted', () => {
      updateClaimStatus('clm-1', 'approved');
      expect(withdrawClaim('clm-1')).toEqual({ outcome: 'conflict', status: 'approved' });
    });
  });
});
