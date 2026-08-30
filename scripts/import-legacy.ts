import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '../server/db/client.js';
import { migrate } from '../server/db/bootstrap.js';
import { attendance, players } from '../server/db/schema.js';
import { eq } from 'drizzle-orm';

const legacyRoot = process.env.ASHHOLE90_PATH || process.argv[2];
if (!legacyRoot) throw new Error('Usage: npm run import:legacy -- /path/to/ashhole90 (or set ASHHOLE90_PATH)');

await migrate();
const source = await readFile(path.join(legacyRoot, 'src/pages/players.tsx'), 'utf8');
const playerPattern = /"([^"]+)"\s*:\s*\{\s*id:\s*\d+,\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*years:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
const yearPattern = /\{\s*year:\s*(\d+),\s*active:\s*(true|false)\s*\}/g;
let match: RegExpExecArray | null;
let imported = 0;
while ((match = playerPattern.exec(source))) {
  const name = match[2];
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const years = [...match[4].matchAll(yearPattern)].filter((m) => m[2] === 'true').map((m) => Number(m[1]));
  await db.insert(players).values({ slug, name, firstYear: years[0] || null, visibility: 'public' }).onConflictDoUpdate({ target: players.slug, set: { name, firstYear: years[0] || null } });
  const [player] = await db.select().from(players).where(eq(players.slug, slug)).limit(1);
  if (player) {
    await db.delete(attendance).where(eq(attendance.playerId, player.id));
    if (years.length) await db.insert(attendance).values(years.map((year) => ({ playerId: player.id, year })));
  }
  imported++;
}

const assets = [
  ['public/images/ashholelogo.jpg', 'public/assets/logo/ashholelogo.jpg'],
  ['public/images/shenvalee-bg.jpg', 'public/assets/scenery/shenvalee-bg.jpg'],
  ['public/old/2024/IMG_2578.JPG', 'public/assets/archive/2024/group.jpg'],
  ['public/old/img216_1990.jpg', 'public/assets/archive/1990/original-eight.jpg'],
  ['public/old/Mainshenphoto1996.jpg', 'public/assets/archive/1996/group.jpg'],
  ['public/old/2003.JPG', 'public/assets/archive/2003/group.jpg'],
  ['public/old/IMG_2378.JPG', 'public/assets/archive/2019/group.jpg'],
  ['public/old/110-1089_IMG.JPG', 'public/assets/memorial/gil-lugo.jpg'],
  ['public/old/Mvc-023f.jpg', 'public/assets/memorial/joe-ofalt.jpg'],
];
for (const [from, to] of assets) {
  const destination = path.resolve(to);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(legacyRoot, from), destination);
}
console.log(`Imported ${imported} legacy player records and selected golf assets. Room assignments were intentionally skipped.`);
