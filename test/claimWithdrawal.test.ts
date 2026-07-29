import { describe, it, expect, beforeEach } from 'vitest';
import { withdrawClaim } from '../src/services/claimWithdrawal';
import { resetDb, query } from '../src/db';

describe('withdrawClaim', () => {
  beforeEach(() => resetDb());

  it('withdraws a submitted claim', () => {
    const result = withdrawClaim('clm-1');
    expect(result).toEqual({ outcome: 'withdrawn', claim: { id: 'clm-1', status: 'withdrawn' } });
    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('withdrawn');
  });

  it('reports not_found for an unknown claim', () => {
    const result = withdrawClaim('nope');
    expect(result).toEqual({ outcome: 'not_found' });
  });

  it('reports a conflict when the claim is not submitted', () => {
    withdrawClaim('clm-1');
    const result = withdrawClaim('clm-1');
    expect(result).toEqual({ outcome: 'conflict', status: 'withdrawn' });
  });
});
