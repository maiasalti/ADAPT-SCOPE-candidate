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
    const claim = getClaimById('clm-1');
    expect(claim?.status).toBe('submitted');
  });

  it('returns undefined for an unknown claim', () => {
    expect(getClaimById('nope')).toBeUndefined();
  });

  it('withdraws a claim', () => {
    withdrawClaim('clm-1');
    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('withdrawn');
  });
});
