import { migrate } from '../server/db/bootstrap.js';
import { seedPublicData } from '../server/db/seed.js';
await migrate();
await seedPublicData();
console.log('Database is ready. Historical annual data is imported from ashhole90; no annual arrays are compiled into the app.');
