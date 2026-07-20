const PII_FIELDS = ['ssn', 'patientName', 'holderName'];

export function redact<T extends Record<string, any>>(payload: T): Record<string, any> {
  const clone: Record<string, any> = { ...payload };
  for (const field of PII_FIELDS) {
    if (field in clone) clone[field] = '[REDACTED]';
  }
  return clone;
}
