import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { resetDb, query } from '../src/db';

describe('POST /claims/submit', () => {
  beforeEach(() => resetDb());

  it('approves a claim within the policy limit', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/submit').send({
      claimId: 'clm-1',
      policyId: 'pol-1',
      amount: 500,
      ssn: '123-45-6789',
      patientName: 'Jane Doe',
      condition: 'flu',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('denies a claim over the policy limit', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/submit').send({
      claimId: 'clm-1',
      policyId: 'pol-1',
      amount: 5000,
      ssn: '123-45-6789',
      patientName: 'Jane Doe',
      condition: 'flu',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('denied');
  });

  it('returns 404 for an unknown policy', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/submit').send({
      claimId: 'clm-1',
      policyId: 'nope',
      amount: 500,
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 when required fields are missing', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/submit').send({ claimId: 'clm-1' });
    expect(res.status).toBe(400);
  });
});

describe('POST /claims/:claimId/withdraw', () => {
  beforeEach(() => resetDb());

  it('withdraws a submitted claim and returns { id, status }', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/clm-1/withdraw').send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'clm-1', status: 'withdrawn' });

    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('withdrawn');
  });

  it('returns 404 for an unknown claim', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/nope/withdraw').send();
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 for an already-approved claim and leaves status unchanged', async () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['approved', 'clm-1']);
    const app = createApp();
    const res = await request(app).post('/claims/clm-1/withdraw').send();
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');

    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('approved');
  });

  it('returns 409 for an already-denied claim', async () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['denied', 'clm-1']);
    const app = createApp();
    const res = await request(app).post('/claims/clm-1/withdraw').send();
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 for an already-withdrawn claim (double withdraw)', async () => {
    query('UPDATE claims SET status = ? WHERE id = ?', ['withdrawn', 'clm-1']);
    const app = createApp();
    const res = await request(app).post('/claims/clm-1/withdraw').send();
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('logs an audit line on success and does not mutate status on a 409', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const app = createApp();
    const okRes = await request(app).post('/claims/clm-1/withdraw').send();
    expect(okRes.status).toBe(200);
    expect(logSpy).toHaveBeenCalledWith('Claim withdrawn:', expect.stringContaining('clm-1'));

    logSpy.mockClear();

    const conflictRes = await request(app).post('/claims/clm-1/withdraw').send();
    expect(conflictRes.status).toBe(409);
    expect(logSpy).not.toHaveBeenCalled();

    const rows = query('SELECT * FROM claims WHERE id = ?', ['clm-1']);
    expect(rows[0].status).toBe('withdrawn');

    logSpy.mockRestore();
  });
});
