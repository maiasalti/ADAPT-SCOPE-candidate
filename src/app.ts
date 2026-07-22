import express from 'express';
import { claimsRouter } from './routes/claims';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/claims', claimsRouter);
  return app;
}
