import { describe, it, expect, beforeEach } from 'vitest';
import { getPolicyById, updateClaimStatus } from '../src/services/policyDb';
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
});
