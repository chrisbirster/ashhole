import { migrate } from '../server/db/bootstrap.js';
await migrate();
console.log('Database schema is ready.');
