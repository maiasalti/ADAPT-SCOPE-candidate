import { describe, it, expect, beforeEach } from 'vitest';
import { query, resetDb } from '../src/db';

describe('db.query', () => {
  beforeEach(() => resetDb());

  it('selects a row with a parameterized placeholder', () => {
    const rows = query('SELECT * FROM policies WHERE id = ?', ['pol-1']);
    expect(rows).toHaveLength(1);
    expect(rows[0].holderName).toBe('Jane Doe');
  });

  it('selects a row with a literal embedded value', () => {
    const rows = query(`SELECT * FROM policies WHERE id = 'pol-2'`);
    expect(rows).toHaveLength(1);
    expect(rows[0].holderName).toBe('John Smith');
  });

  it('updates a row with parameterized placeholders', () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', 'clm-1']);
    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('withdrawn');
  });

  it('returns no rows for an unknown id', () => {
    const rows = query('SELECT * FROM claims WHERE id = ?', ['nope']);
    expect(rows).toHaveLength(0);
  });

  it('resets to fixture state', () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', 'clm-1']);
    resetDb();
    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('submitted');
  });
});
