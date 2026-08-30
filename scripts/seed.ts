import { migrate } from '../server/db/bootstrap.js';
import { seedPublicData } from '../server/db/seed.js';
await migrate();
await seedPublicData();
console.log('Public historical seed data is ready.');
