import { access, copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const legacyRoot = path.resolve(process.env.ASHHOLE90_PATH || process.argv[2] || '../ashhole90');
const sourcePublic = path.join(legacyRoot, 'public');
const targetPublic = path.resolve('public');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.tif', '.tiff', '.svg', '.ico']);

await access(path.join(sourcePublic, 'images', 'ashholelogo.jpg')).catch(() => {
  throw new Error(`ASHHOLE90 source not found at ${legacyRoot}. Pass its path: npm run assets:legacy -- /path/to/ashhole90`);
});

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) files.push(absolute);
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
console.log(`Copied ${copied} legacy image files (${megabytes} MB) from ${sourcePublic}.`);
console.log(`Paths are preserved exactly under ${targetPublic}; for example public/old/2024/IMG_2578.JPG remains /old/2024/IMG_2578.JPG.`);
console.log('Run npm run import:legacy with the same source path to index legacy players and photo metadata in the database.');
