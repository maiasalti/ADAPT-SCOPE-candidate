import { describe, it, expect, beforeEach } from 'vitest';
import { withdrawClaim } from '../src/services/claimWithdrawal';
import { resetDb, query } from '../src/db';

describe('withdrawClaim', () => {
  beforeEach(() => resetDb());

  it('returns 404 when the claim does not exist', () => {
    const result = withdrawClaim('nope');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(404);
      expect(result.error).toBeTypeOf('string');
    }
  });

  it('returns 409 when the claim is already approved', () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['approved', 'clm-1']);

    const result = withdrawClaim('clm-1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(409);
      expect(result.error).toBeTypeOf('string');
    }
  });

  it('returns 409 when the claim is already withdrawn', () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', 'clm-1']);

    const result = withdrawClaim('clm-1');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(409);
      expect(result.error).toBeTypeOf('string');
    }
  });

  it('withdraws a submitted claim and persists the new status', () => {
    const result = withdrawClaim('clm-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.claim).toEqual({ id: 'clm-1', status: 'withdrawn' });
    }

    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('withdrawn');
  });
});
