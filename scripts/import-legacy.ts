import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { db } from '../server/db/client.js';
import { migrate } from '../server/db/bootstrap.js';
import { attendance, awards, photos, players } from '../server/db/schema.js';

const legacyRoot = path.resolve(process.env.ASHHOLE90_PATH || process.argv[2] || '../ashhole90');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.tif', '.tiff']);

await migrate();

async function text(relative: string) {
  return readFile(path.join(legacyRoot, relative), 'utf8');
}

function webPath(raw: string) {
  const normalized = raw.replace(/^\.?\//, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

// Players + attendance -------------------------------------------------------
const playerSource = await text('src/pages/players.tsx');
const playerPattern = /"([^"]+)"\s*:\s*\{\s*id:\s*\d+,\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*years:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
const yearPattern = /\{\s*year:\s*(\d+),\s*active:\s*(true|false)\s*\}/g;
let playerMatch: RegExpExecArray | null;
let importedPlayers = 0;
while ((playerMatch = playerPattern.exec(playerSource))) {
  const name = playerMatch[2];
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const years = [...playerMatch[4].matchAll(yearPattern)].filter((m) => m[2] === 'true').map((m) => Number(m[1]));
  await db.insert(players).values({ slug, name, firstYear: years[0] || null, visibility: 'public' }).onConflictDoUpdate({ target: players.slug, set: { name, firstYear: years[0] || null } });
  const [player] = await db.select().from(players).where(eq(players.slug, slug)).limit(1);
  if (player) {
    await db.delete(attendance).where(eq(attendance.playerId, player.id));
    if (years.length) await db.insert(attendance).values(years.map((year) => ({ playerId: player.id, year })));
  }
  importedPlayers += 1;
}

// Awards ---------------------------------------------------------------------
const resultsIndex = await text('src/pages/latest-results/index.tsx');
const awardPattern = /\{\s*id:\s*\d+,\s*mig:\s*"([^"]*)",\s*ashhole:\s*"([^"]*)",\s*year:\s*"(\d{4})"\s*\}/g;
let awardMatch: RegExpExecArray | null;
let importedAwards = 0;
while ((awardMatch = awardPattern.exec(resultsIndex))) {
  const [, migWinner, cupValue, yearRaw] = awardMatch;
  const year = Number(yearRaw);
  const cupWinner = cupValue === 'N/A' ? null : cupValue;
  await db.insert(awards).values({ year, migWinner: migWinner || null, cupWinner, visibility: 'public' }).onConflictDoUpdate({ target: awards.year, set: { migWinner: migWinner || null, cupWinner, visibility: 'public' } });
  importedAwards += 1;
}

// Photos ---------------------------------------------------------------------
type PhotoRecord = { year: number; src: string; alt: string; featured: boolean };
const photoRecords = new Map<string, PhotoRecord>();

function registerPhoto(rawSrc: string, year: number, featured = false) {
  const src = webPath(rawSrc);
  if (!imageExtensions.has(path.extname(src).toLowerCase())) return;
  if (!Number.isInteger(year) || year < 1990 || year > 2200) return;
  const current = photoRecords.get(src);
  photoRecords.set(src, {
    year: current?.year ?? year,
    src,
    alt: `${year} ASHHOLE archive — ${path.basename(src)}`,
    featured: Boolean(current?.featured || featured),
  });
}

// Featured year cards from the old Latest Results page.
const featuredPattern = /name:\s*"(\d{4})"[\s\S]*?src:\s*"([^"]+)"[\s\S]*?location:\s*"\/latest-results\/\d{4}"/g;
let featuredMatch: RegExpExecArray | null;
while ((featuredMatch = featuredPattern.exec(resultsIndex))) registerPhoto(featuredMatch[2], Number(featuredMatch[1]), true);

// Early 1990-91 gallery.
const earlySource = await text('src/pages/1990-91-pics.tsx');
for (const match of earlySource.matchAll(/<img[\s\S]*?src="([^"]+)"/g)) {
  const src = match[1];
  registerPhoto(src, src.includes('1990') ? 1990 : 1991);
}

// Memories page: carry the year label forward to each following image.
const memoriesSource = await text('src/pages/memories.tsx');
const memoryToken = /<p[^>]*>(\d{4})<\/p>|<img\s+src="([^"]+)"/g;
let activeMemoryYear: number | null = null;
let memoryMatch: RegExpExecArray | null;
while ((memoryMatch = memoryToken.exec(memoriesSource))) {
  if (memoryMatch[1]) activeMemoryYear = Number(memoryMatch[1]);
  else if (memoryMatch[2] && activeMemoryYear) registerPhoto(memoryMatch[2], activeMemoryYear, true);
}

// Every image referenced by a historical results page belongs to that year.
for (let year = 1990; year <= new Date().getFullYear(); year += 1) {
  const relative = `src/pages/latest-results/${year}.tsx`;
  const source = await text(relative).catch(() => null);
  if (!source) continue;
  for (const match of source.matchAll(/<img[^>]+src="([^"]+)"/g)) registerPhoto(match[1], year);
}

// Finally scan every image under public/old. If its path or filename contains a
// year, index it even when no old TSX page happened to reference it.
async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) result.push(absolute);
  }
  return result;
}

const oldRoot = path.join(legacyRoot, 'public', 'old');
for (const absolute of await walk(oldRoot)) {
  const relative = path.relative(path.join(legacyRoot, 'public'), absolute).split(path.sep).join('/');
  const yearMatch = relative.match(/(?:^|\/)(19\d{2}|20\d{2})(?:\/|$)/) ?? relative.match(/(19\d{2}|20\d{2})/);
  if (yearMatch) registerPhoto(`/${relative}`, Number(yearMatch[1]));
}

let importedPhotos = 0;
for (const record of photoRecords.values()) {
  const [existing] = await db.select().from(photos).where(eq(photos.src, record.src)).limit(1);
  if (existing) {
    await db.update(photos).set({ year: record.year, alt: record.alt, featured: record.featured, visibility: 'public' }).where(eq(photos.id, existing.id));
  } else {
    await db.insert(photos).values({ eventId: null, ...record, visibility: 'public' });
  }
  importedPhotos += 1;
}

console.log(`Imported ${importedPlayers} players, ${importedAwards} award rows, and ${importedPhotos} legacy photo records from ${legacyRoot}.`);
console.log('The public site remains database-driven; legacy TSX files are read only as one-time migration sources.');
