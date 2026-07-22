import { createApp } from './app';

const port = process.env.PORT ?? 3000;
createApp().listen(port, () => {
  console.log(`FinGuard listening on port ${port}`);
});
