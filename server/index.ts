import { serve } from '@hono/node-server';
import { app } from './app.js';
import { migrate } from './db/bootstrap.js';
import { seedPublicData } from './db/seed.js';

const port = Number(process.env.PORT || 8787);
await migrate();
await seedPublicData();

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`ASHHOLE server listening on http://localhost:${info.port}`);
});
