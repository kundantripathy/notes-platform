import { env, assertEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  assertEnv();
  await connectDB();
  createApp().listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
