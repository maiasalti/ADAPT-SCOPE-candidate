import { describe, it, expect } from 'vitest';
import { summarizeClaimWithBedrock } from '../src/services/summarization';

describe('summarizeClaimWithBedrock', () => {
  it('returns a summary and the raw payload', () => {
    const result = summarizeClaimWithBedrock({
      claimId: 'clm-1',
      ssn: '123-45-6789',
      patientName: 'Jane Doe',
      condition: 'flu',
    });
    expect(result.summary).toContain('clm-1');
    expect(result.rawPayload.ssn).toBe('123-45-6789');
  });
});
