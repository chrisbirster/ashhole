import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const exactSourceDir = 'assets-source/logo-exact';
const legacyTailDir = 'assets-source/logo';
const targets = ['public/assets/logo/ashholelogo.jpg', 'public/images/ashholelogo.jpg'];
const expectedSha = '9e143529f85458070d71b7353e579d87c9daa7ad';
const tailFiles = ['016.b64', '017.b64', '018.b64', '019.b64', '020.b64'];

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return createHash('sha1').update(header).update(bytes).digest('hex');
}

const exactFiles = (await readdir(exactSourceDir))
  .filter((name) => name.endsWith('.b64'))
  .sort((a, b) => a.localeCompare(b, 'en'));

if (exactFiles.length !== 15) {
  throw new Error(`Expected 15 exact logo source chunks, found ${exactFiles.length}`);
}

const exactChunks = await Promise.all(exactFiles.map((name) => readFile(join(exactSourceDir, name), 'utf8')));
const tailChunks = await Promise.all(tailFiles.map((name) => readFile(join(legacyTailDir, name), 'utf8')));
const base64 = [...exactChunks, ...tailChunks].join('').replace(/\s+/g, '');
const bytes = Buffer.from(base64, 'base64');
const actualSha = gitBlobSha(bytes);

if (actualSha !== expectedSha) {
  throw new Error(`Legacy logo verification failed: expected ${expectedSha}, got ${actualSha}`);
}

for (const target of targets) {
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
}
console.log(`reconstructed exact legacy logo at ${targets.join(' and ')} (${actualSha})`);
