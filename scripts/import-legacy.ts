import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { db } from '../server/db/client.js';
import { migrate } from '../server/db/bootstrap.js';
import { attendance, awards, eventPlayers, events, pairings, photos, players, roomAssignments, rounds } from '../server/db/schema.js';

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

function arrayBlock(source: string, name: string) {
  return source.match(new RegExp(`let\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`))?.[1] ?? null;
}

function parseTeeTime(raw: string, ordinal: number) {
  let value = raw.trim();
  const explicitDay = value.match(/^(Friday|Saturday|Sunday)\s+/i);
  const dayLabel = explicitDay
    ? explicitDay[1]![0]!.toUpperCase() + explicitDay[1]!.slice(1).toLowerCase()
    : ordinal === 1 ? 'Friday' : ordinal === 4 ? 'Sunday' : 'Saturday';
  if (explicitDay) value = value.slice(explicitDay[0].length);

  const parts = value.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  const teeTime = parts.shift() ?? value;
  const courseIndex = parts.findIndex((part) => /\bto\b|creek|miller|olde/i.test(part));
  const course = courseIndex >= 0 ? parts[courseIndex]! : (parts[0] ?? 'Shenvalee');
  const formatParts = parts.filter((_, index) => index !== courseIndex);
  const format = formatParts.length ? formatParts.join(' - ') : null;
  const holes = /9\s*hole/i.test(raw) ? 9 : 18;
  return { dayLabel, title: format || 'Tee Time', course, teeTime, holes, format };
}

// Players + attendance -------------------------------------------------------
const playerSource = await text('src/pages/players.tsx');
const playerPattern = /"([^"]+)"\s*:\s*\{\s*id:\s*\d+,\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*years:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
const yearPattern = /\{\s*year:\s*(\d+),\s*active:\s*(true|false)\s*\}/g;
let playerMatch: RegExpExecArray | null;
let importedPlayers = 0;
while ((playerMatch = playerPattern.exec(playerSource))) {
  const name = playerMatch[2]!;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const yearsSource = playerMatch[4] ?? '';
  const years = [...yearsSource.matchAll(yearPattern)].filter((m) => m[2] === 'true').map((m) => Number(m[1]));
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
  const migWinner = awardMatch[1] || null;
  const cupValue = awardMatch[2] ?? '';
  const year = Number(awardMatch[3]);
  const cupWinner = cupValue === 'N/A' ? null : cupValue;
  await db.insert(awards).values({ year, migWinner, cupWinner, visibility: 'public' }).onConflictDoUpdate({ target: awards.year, set: { migWinner, cupWinner, visibility: 'public' } });
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
while ((featuredMatch = featuredPattern.exec(resultsIndex))) registerPhoto(featuredMatch[2]!, Number(featuredMatch[1]), true);

// Early 1990-91 gallery.
const earlySource = await text('src/pages/1990-91-pics.tsx');
for (const match of earlySource.matchAll(/<img[\s\S]*?src="([^"]+)"/g)) {
  const src = match[1]!;
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

// Year pages: import every photo plus the old tee-time/handicap/pairing/room
// arrays into normalized DB rows. The arrays remain migration input only.
let importedEventYears = 0;
for (let year = 1990; year <= new Date().getFullYear(); year += 1) {
  const relative = `src/pages/latest-results/${year}.tsx`;
  const source = await text(relative).catch(() => null);
  if (!source) continue;

  for (const match of source.matchAll(/<img[^>]+src="([^"]+)"/g)) registerPhoto(match[1]!, year);

  const teeSource = arrayBlock(source, 'teeTimes');
  const handicapSource = arrayBlock(source, 'handicaps');
  const pairingSource = arrayBlock(source, 'pairings');
  const roomSource = arrayBlock(source, 'rooms');
  if (!teeSource && !handicapSource && !pairingSource && !roomSource) continue;

  await db.insert(events).values({ year, title: `${year} ASHHOLE Classic`, subtitle: null, status: 'Archived', heroImage: null, visibility: 'public' }).onConflictDoUpdate({ target: events.year, set: { visibility: 'public' } });
  const [event] = await db.select().from(events).where(eq(events.year, year)).limit(1);
  if (!event) continue;

  if (teeSource) {
    const values = [...teeSource.matchAll(/time:\s*"([^"]+)"/g)].map((match, index) => ({ eventId: event.id, ordinal: index + 1, ...parseTeeTime(match[1]!, index + 1), visibility: 'public' as const }));
    await db.delete(rounds).where(eq(rounds.eventId, event.id));
    if (values.length) await db.insert(rounds).values(values);
  }

  if (handicapSource) {
    const values = [...handicapSource.matchAll(/name:\s*"([^"]*)"\s*,\s*handicap:\s*(?:"([^"]*)"|(-?\d+(?:\.\d+)?))/g)]
      .map((match, index) => ({ eventId: event.id, ordinal: index + 1, name: (match[1] ?? '').trim(), handicap: (match[2] ?? match[3] ?? '').trim() || null, visibility: 'public' as const }))
      .filter((row) => row.name.length > 0);
    await db.delete(eventPlayers).where(eq(eventPlayers.eventId, event.id));
    if (values.length) await db.insert(eventPlayers).values(values.map((row, index) => ({ ...row, ordinal: index + 1 })));
  }

  if (pairingSource) {
    const values = [...pairingSource.matchAll(/name1:\s*"([^"]*)"\s*,\s*name2:\s*"([^"]*)"/g)]
      .map((match) => ({ eventId: event.id, playerOne: (match[1] ?? '').trim(), playerTwo: (match[2] ?? '').trim() || null, visibility: 'public' as const }))
      .filter((row) => row.playerOne.length > 0);
    await db.delete(pairings).where(eq(pairings.eventId, event.id));
    if (values.length) await db.insert(pairings).values(values);
  }

  if (roomSource) {
    const values = [...roomSource.matchAll(/name1:\s*(?:"([^"]*)"|(\d+))\s*,\s*name2:\s*"([^"]*)"/g)]
      .map((match) => ({ eventId: event.id, room: (match[1] ?? match[2] ?? '').trim(), occupants: (match[3] ?? '').trim(), visibility: 'public' as const }))
      .filter((row) => row.room.length > 0 && row.room.toLowerCase() !== 'room #' && row.occupants.toLowerCase() !== 'names');
    await db.delete(roomAssignments).where(eq(roomAssignments.eventId, event.id));
    if (values.length) await db.insert(roomAssignments).values(values);
  }

  importedEventYears += 1;
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
  if (yearMatch?.[1]) registerPhoto(`/${relative}`, Number(yearMatch[1]));
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

console.log(`Imported ${importedPlayers} players, ${importedAwards} award rows, ${importedEventYears} yearly result pages, and ${importedPhotos} legacy photo records from ${legacyRoot}.`);
console.log('The public site remains database-driven; legacy TSX arrays are read only as one-time migration sources.');
