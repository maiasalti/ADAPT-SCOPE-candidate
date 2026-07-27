import { describe, it, expect, vi } from 'vitest';
import { redact } from '../src/middleware/redact';
import { validate } from '../src/middleware/validate';

describe('redact', () => {
  it('replaces known PII fields', () => {
    const result = redact({ ssn: '123-45-6789', condition: 'flu' });
    expect(result.ssn).toBe('[REDACTED]');
    expect(result.condition).toBe('flu');
  });

  it('leaves payloads without PII fields untouched', () => {
    const result = redact({ claimId: 'clm-1' });
    expect(result).toEqual({ claimId: 'clm-1' });
  });
});

describe('validate', () => {
  function mockRes() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  }

  it('calls next when required fields are present', () => {
    const middleware = validate([{ field: 'claimId', required: true }]);
    const req: any = { body: { claimId: 'clm-1' } };
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds 400 when a required field is missing', () => {
    const middleware = validate([{ field: 'claimId', required: true }]);
    const req: any = { body: {} };
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 400 when a field fails its pattern', () => {
    const middleware = validate([{ field: 'claimId', required: true, pattern: /^clm-\d+$/ }]);
    const req: any = { body: { claimId: 'bad-id' } };
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('validates route params when source is "params"', () => {
    const middleware = validate([{ field: 'claimId', required: true, source: 'params' }]);
    const req: any = { body: {}, params: { claimId: 'clm-1' } };
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds 400 when a required route param is missing', () => {
    const middleware = validate([{ field: 'claimId', required: true, source: 'params' }]);
    const req: any = { body: {}, params: {} };
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
