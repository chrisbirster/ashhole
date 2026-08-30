import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const sourceDir = 'assets-source/logo';
const target = 'public/assets/logo/ashholelogo.jpg';
const expectedSha = '9e143529f85458070d71b7353e579d87c9daa7ad';

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return createHash('sha1').update(header).update(bytes).digest('hex');
}

const files = (await readdir(sourceDir))
  .filter((name) => name.endsWith('.b64'))
  .sort((a, b) => a.localeCompare(b, 'en'));

if (!files.length) throw new Error(`No logo source chunks found in ${sourceDir}`);

const chunks = await Promise.all(files.map((name) => readFile(join(sourceDir, name), 'utf8')));
const base64 = chunks.join('').replace(/\s+/g, '');
const bytes = Buffer.from(base64, 'base64');
const actualSha = gitBlobSha(bytes);

if (actualSha !== expectedSha) {
  throw new Error(`Legacy logo verification failed: expected ${expectedSha}, got ${actualSha}`);
}

await mkdir(dirname(target), { recursive: true });
await writeFile(target, bytes);
console.log(`reconstructed ${target} from ${files.length} verified source chunks (${actualSha})`);
