import { serveStatic } from '@hono/node-server/serve-static';
import { and, asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { archiveCards } from '../src/data/public.js';
import { requireAdmin } from './auth.js';
import { db } from './db/client.js';
import { attendance, awards, eventPlayers, events, pairings, photos, players, roomAssignments, rounds, siteSettings } from './db/schema.js';

export const app = new Hono();

app.use('/api/*', async (c, next) => { await next(); c.header('X-Content-Type-Options', 'nosniff'); c.header('Referrer-Policy', 'same-origin'); });
app.get('/api/health', (c) => c.json({ ok: true }));

async function getCurrentPublicEvent() {
  const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'current_year')).limit(1);
  const currentYear = setting ? Number(setting.value) : null;
  if (Number.isInteger(currentYear)) {
    const [selected] = await db.select().from(events).where(and(eq(events.year, currentYear!), eq(events.visibility, 'public'))).limit(1);
    if (selected) return selected;
  }
  const [latest] = await db.select().from(events).where(eq(events.visibility, 'public')).orderBy(desc(events.year)).limit(1);
  return latest;
}

function fallbackHero(year: number, heroImage: string | null) {
  return heroImage || archiveCards.find((card) => card.year === year)?.image || '/assets/scenery/shenvalee-bg.jpg';
}

app.get('/api/classic', async (c) => {
  const event = await getCurrentPublicEvent();
  if (!event) return c.json({ error: 'No public event.' }, 404);
  const eventRounds = await db.select().from(rounds).where(and(eq(rounds.eventId, event.id), eq(rounds.visibility, 'public'))).orderBy(asc(rounds.ordinal));
  const eventPairs = await db.select({ playerOne: pairings.playerOne, playerTwo: pairings.playerTwo }).from(pairings).where(and(eq(pairings.eventId, event.id), eq(pairings.visibility, 'public'))).orderBy(asc(pairings.id));
  const field = await db.select({ name: eventPlayers.name, handicap: eventPlayers.handicap }).from(eventPlayers).where(and(eq(eventPlayers.eventId, event.id), eq(eventPlayers.visibility, 'public'))).orderBy(asc(eventPlayers.ordinal));
  const rooms = await db.select({ room: roomAssignments.room, occupants: roomAssignments.occupants }).from(roomAssignments).where(and(eq(roomAssignments.eventId, event.id), eq(roomAssignments.visibility, 'public'))).orderBy(asc(roomAssignments.id));
  const [award] = await db.select().from(awards).where(and(eq(awards.year, event.year), eq(awards.visibility, 'public'))).limit(1);
  return c.json({ ...event, heroImage: fallbackHero(event.year, event.heroImage), cupWinner: award?.cupWinner ?? null, migWinner: award?.migWinner ?? null, rounds: eventRounds, pairings: eventPairs, field, rooms });
});

app.get('/api/cup', async (c) => c.json(await db.select({ year: awards.year, migWinner: awards.migWinner, cupWinner: awards.cupWinner }).from(awards).where(eq(awards.visibility, 'public')).orderBy(desc(awards.year))));

app.get('/api/players', async (c) => {
  const list = await db.select().from(players).where(eq(players.visibility, 'public')).orderBy(asc(players.name));
  const result = await Promise.all(list.map(async (player) => {
    const visits = await db.select().from(attendance).where(eq(attendance.playerId, player.id)).orderBy(asc(attendance.year));
    const years = visits.map((v) => v.year);
    const appearances = years.length;
    const tier = appearances >= 36 && years[0] === 1990 ? 'RP+' : appearances >= 10 ? 'Platinum' : appearances >= 4 ? 'Gold' : appearances >= 2 ? 'Silver' : 'Bronze';
    return { ...player, appearances, tier, years };
  }));
  return c.json(result);
});

app.get('/api/archive', async (c) => c.json(archiveCards));

app.get('/api/archive/:year', async (c) => {
  const year = Number(c.req.param('year'));
  if (!Number.isInteger(year)) return c.json({ error: 'Invalid year.' }, 400);
  const [event] = await db.select().from(events).where(and(eq(events.year, year), eq(events.visibility, 'public'))).limit(1);
  const [award] = await db.select().from(awards).where(and(eq(awards.year, year), eq(awards.visibility, 'public'))).limit(1);
  const yearPhotos = await db.select({ src: photos.src, alt: photos.alt }).from(photos).where(and(eq(photos.year, year), eq(photos.visibility, 'public')));
  const card = archiveCards.find((x) => x.year === year);
  if (!event) {
    if (!card && !award && !yearPhotos.length) return c.json({ error: 'Archive year not found.' }, 404);
    return c.json({ id: year, year, title: card?.title || `${year} ASHHOLE Archive`, subtitle: card?.blurb || null, status: 'Archive', heroImage: card?.image || null, cupWinner: award?.cupWinner ?? null, migWinner: award?.migWinner ?? null, rounds: [], pairings: [], field: [], rooms: [], photos: yearPhotos });
  }
  const eventRounds = await db.select().from(rounds).where(and(eq(rounds.eventId, event.id), eq(rounds.visibility, 'public'))).orderBy(asc(rounds.ordinal));
  const eventPairs = await db.select({ playerOne: pairings.playerOne, playerTwo: pairings.playerTwo }).from(pairings).where(and(eq(pairings.eventId, event.id), eq(pairings.visibility, 'public'))).orderBy(asc(pairings.id));
  const field = await db.select({ name: eventPlayers.name, handicap: eventPlayers.handicap }).from(eventPlayers).where(and(eq(eventPlayers.eventId, event.id), eq(eventPlayers.visibility, 'public'))).orderBy(asc(eventPlayers.ordinal));
  const rooms = await db.select({ room: roomAssignments.room, occupants: roomAssignments.occupants }).from(roomAssignments).where(and(eq(roomAssignments.eventId, event.id), eq(roomAssignments.visibility, 'public'))).orderBy(asc(roomAssignments.id));
  return c.json({ ...event, heroImage: fallbackHero(event.year, event.heroImage), cupWinner: award?.cupWinner ?? null, migWinner: award?.migWinner ?? null, rounds: eventRounds, pairings: eventPairs, field, rooms, photos: yearPhotos });
});

const visibility = z.enum(['public', 'admin']);
const roundInput = z.object({
  dayLabel: z.string().min(1).max(40),
  title: z.string().min(1).max(80),
  course: z.string().min(1).max(80),
  teeTime: z.string().min(1).max(40),
  holes: z.number().int().min(1).max(72).nullable(),
  format: z.string().max(120).nullable(),
});
const pairingInput = z.object({ playerOne: z.string().min(1).max(80), playerTwo: z.string().max(80).nullable() });
const fieldInput = z.object({ name: z.string().min(1).max(80), handicap: z.string().max(20).nullable() });
const roomInput = z.object({ room: z.string().min(1).max(80), occupants: z.string().min(1).max(240) });
const eventInput = z.object({
  title: z.string().min(3).max(120),
  status: z.string().min(2).max(40),
  subtitle: z.string().max(240).nullable(),
  heroImage: z.string().max(240).nullable(),
  visibility,
  cupWinner: z.string().max(120).nullable(),
  migWinner: z.string().max(120).nullable(),
  rounds: z.array(roundInput).max(12),
  pairings: z.array(pairingInput).max(40),
  field: z.array(fieldInput).max(80),
  rooms: z.array(roomInput).max(40),
  makeCurrent: z.boolean().optional().default(false),
});

app.use('/api/admin/*', requireAdmin);

app.get('/api/admin/events/:year', async (c) => {
  const year = Number(c.req.param('year'));
  if (!Number.isInteger(year) || year < 1990 || year > 2200) return c.json({ error: 'Invalid year.' }, 400);
  const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'current_year')).limit(1);
  const [event] = await db.select().from(events).where(eq(events.year, year)).limit(1);
  if (!event) return c.json({
    year,
    title: `${year} ASHHOLE Classic`,
    subtitle: '',
    status: 'Planning',
    heroImage: null,
    visibility: 'admin',
    cupWinner: null,
    migWinner: null,
    rounds: [],
    pairings: [],
    field: [],
    rooms: [],
    isCurrent: setting?.value === String(year),
  });

  const eventRounds = await db.select().from(rounds).where(eq(rounds.eventId, event.id)).orderBy(asc(rounds.ordinal));
  const eventPairs = await db.select({ playerOne: pairings.playerOne, playerTwo: pairings.playerTwo }).from(pairings).where(eq(pairings.eventId, event.id)).orderBy(asc(pairings.id));
  const field = await db.select({ name: eventPlayers.name, handicap: eventPlayers.handicap }).from(eventPlayers).where(eq(eventPlayers.eventId, event.id)).orderBy(asc(eventPlayers.ordinal));
  const rooms = await db.select({ room: roomAssignments.room, occupants: roomAssignments.occupants }).from(roomAssignments).where(eq(roomAssignments.eventId, event.id)).orderBy(asc(roomAssignments.id));
  const [award] = await db.select().from(awards).where(eq(awards.year, year)).limit(1);
  return c.json({
    year,
    title: event.title,
    subtitle: event.subtitle,
    status: event.status,
    heroImage: event.heroImage,
    visibility: event.visibility === 'public' ? 'public' : 'admin',
    cupWinner: award?.cupWinner ?? null,
    migWinner: award?.migWinner ?? null,
    rounds: eventRounds.map(({ dayLabel, title, course, teeTime, holes, format }) => ({ dayLabel, title, course, teeTime, holes, format })),
    pairings: eventPairs,
    field,
    rooms,
    isCurrent: setting?.value === String(year),
  });
});

app.put('/api/admin/events/:year', async (c) => {
  const year = Number(c.req.param('year'));
  if (!Number.isInteger(year) || year < 1990 || year > 2200) return c.json({ error: 'Invalid year.' }, 400);
  const parsed = eventInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const input = parsed.data;
  const effectiveVisibility = input.makeCurrent ? 'public' : input.visibility;
  const childVisibility = effectiveVisibility === 'public' ? 'public' : 'admin';

  await db.insert(events).values({ year, title: input.title, status: input.status, subtitle: input.subtitle, heroImage: input.heroImage, visibility: effectiveVisibility }).onConflictDoUpdate({ target: events.year, set: { title: input.title, status: input.status, subtitle: input.subtitle, heroImage: input.heroImage, visibility: effectiveVisibility } });
  const [event] = await db.select().from(events).where(eq(events.year, year)).limit(1);
  if (!event) return c.json({ error: 'Unable to save event.' }, 500);

  await db.delete(rounds).where(eq(rounds.eventId, event.id));
  if (input.rounds.length) await db.insert(rounds).values(input.rounds.map((round, index) => ({ ...round, eventId: event.id, ordinal: index + 1, visibility: childVisibility })));

  await db.delete(pairings).where(eq(pairings.eventId, event.id));
  if (input.pairings.length) await db.insert(pairings).values(input.pairings.map((pair) => ({ ...pair, eventId: event.id, visibility: childVisibility })));

  await db.delete(eventPlayers).where(eq(eventPlayers.eventId, event.id));
  if (input.field.length) await db.insert(eventPlayers).values(input.field.map((player, index) => ({ ...player, eventId: event.id, ordinal: index + 1, visibility: childVisibility })));

  await db.delete(roomAssignments).where(eq(roomAssignments.eventId, event.id));
  if (input.rooms.length) await db.insert(roomAssignments).values(input.rooms.map((room) => ({ ...room, eventId: event.id, visibility: childVisibility })));

  await db.insert(awards).values({ year, migWinner: input.migWinner, cupWinner: input.cupWinner, visibility: childVisibility }).onConflictDoUpdate({ target: awards.year, set: { migWinner: input.migWinner, cupWinner: input.cupWinner, visibility: childVisibility } });

  if (input.makeCurrent) {
    await db.insert(siteSettings).values({ key: 'current_year', value: String(year) }).onConflictDoUpdate({ target: siteSettings.key, set: { value: String(year) } });
  }

  return c.json({ ok: true, year, isCurrent: input.makeCurrent });
});

app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));
