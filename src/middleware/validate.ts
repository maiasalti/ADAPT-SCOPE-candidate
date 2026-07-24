import type { Request, Response, NextFunction } from 'express';

export interface FieldRule {
  field: string;
  required: boolean;
  pattern?: RegExp;
  source?: 'body' | 'params';
}

export function validate(rules: FieldRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const rule of rules) {
      const value = (rule.source === 'params' ? req.params : req.body)[rule.field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        res.status(400).json({ error: `Missing required field: ${rule.field}` });
        return;
      }
      if (value !== undefined && rule.pattern && !rule.pattern.test(String(value))) {
        res.status(400).json({ error: `Invalid format for field: ${rule.field}` });
        return;
      }
    }
    next();
  };
}
