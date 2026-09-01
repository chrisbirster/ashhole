import { access, copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const legacyRoot = path.resolve(process.env.ASHHOLE90_PATH || process.argv[2] || '../ashhole90');
const sourcePublic = path.join(legacyRoot, 'public');
const targetPublic = path.resolve('public');

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

const files = await walk(sourcePublic);
let copied = 0;
let bytes = 0;

for (const source of files) {
  const relative = path.relative(sourcePublic, source);
  const target = path.join(targetPublic, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  bytes += (await stat(source)).size;
  copied += 1;
}

const megabytes = (bytes / 1024 / 1024).toFixed(1);
console.log(`Copied the complete legacy public archive: ${copied} files (${megabytes} MB) from ${sourcePublic}.`);
console.log(`Every path is preserved exactly under ${targetPublic}; for example public/old/2024/IMG_2578.JPG remains /old/2024/IMG_2578.JPG.`);
console.log('This includes historical photos/GIFs, brand images, favicon, audio, and any other files that lived under ashhole90/public.');
console.log('Run npm run import:legacy with the same source path to index legacy players, annual data, and photo metadata in the database.');
