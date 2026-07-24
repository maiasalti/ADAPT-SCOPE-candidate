import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { resetDb } from '../src/db';

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

  it('withdraws a submitted claim', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/clm-1/withdraw');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'clm-1', status: 'withdrawn' });
  });

  it('returns 404 for an unknown claim', async () => {
    const app = createApp();
    const res = await request(app).post('/claims/nope/withdraw');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when the claim is not in submitted status', async () => {
    const app = createApp();
    await request(app).post('/claims/submit').send({
      claimId: 'clm-1',
      policyId: 'pol-1',
      amount: 500,
    });

    const res = await request(app).post('/claims/clm-1/withdraw');
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when withdrawing an already-withdrawn claim', async () => {
    const app = createApp();
    await request(app).post('/claims/clm-1/withdraw');

    const res = await request(app).post('/claims/clm-1/withdraw');
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});
