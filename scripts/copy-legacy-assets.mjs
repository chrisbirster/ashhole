import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const legacyRoot = path.resolve(process.env.ASHHOLE90_PATH || process.argv[2] || '../ashhole90');
const sourcePublic = path.join(legacyRoot, 'public');
const targetPublic = path.resolve('public');
const manifestPath = path.resolve('legacy-archive-manifest.json');

await access(path.join(sourcePublic, 'images', 'ashholelogo.jpg')).catch(() => {
  throw new Error(`ASHHOLE90 source not found at ${legacyRoot}. Pass its path: npm run assets:legacy -- /path/to/ashhole90`);
});

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

const files = (await walk(sourcePublic)).sort((a, b) => a.localeCompare(b, 'en'));
const manifest = [];
let copied = 0;
let bytes = 0;

for (const source of files) {
  const relative = path.relative(sourcePublic, source).split(path.sep).join('/');
  const target = path.join(targetPublic, ...relative.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);

  const sourceBytes = await readFile(source);
  const targetBytes = await readFile(target);
  const sourceHash = sha256(sourceBytes);
  const targetHash = sha256(targetBytes);
  if (sourceHash !== targetHash) throw new Error(`Archive copy verification failed for ${relative}`);

  const size = (await stat(source)).size;
  manifest.push({ path: `public/${relative}`, size, sha256: sourceHash });
  bytes += size;
  copied += 1;
}

await writeFile(manifestPath, `${JSON.stringify({ source: 'chrisbirster/ashhole90:public', files: manifest }, null, 2)}\n`);

const megabytes = (bytes / 1024 / 1024).toFixed(1);
console.log(`Copied and verified the complete legacy public archive: ${copied} files (${megabytes} MB) from ${sourcePublic}.`);
console.log(`Every path is preserved exactly under ${targetPublic}; for example public/old/2024/IMG_2578.JPG remains /old/2024/IMG_2578.JPG.`);
console.log('This includes historical photos/GIFs, brand images, favicon, audio, and every other file that lived under ashhole90/public.');
console.log(`Wrote integrity manifest: ${manifestPath}`);
console.log('Run npm run import:legacy with the same source path to index legacy players, annual data, and photo metadata in the database.');
