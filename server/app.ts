import { serveStatic } from '@hono/node-server/serve-static';
import { and, asc, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { archiveCards } from '../src/data/public.js';
import { requireAdmin, requireMember } from './auth.js';
import { db } from './db/client.js';
import { attendance, awards, events, pairings, photos, players, roomAssignments, rounds } from './db/schema.js';

export const app = new Hono();

app.use('/api/*', async (c, next) => { await next(); c.header('X-Content-Type-Options', 'nosniff'); c.header('Referrer-Policy', 'same-origin'); });
app.get('/api/health', (c) => c.json({ ok: true }));

app.get('/api/classic', async (c) => {
  const [event] = await db.select().from(events).where(eq(events.visibility, 'public')).orderBy(desc(events.year)).limit(1);
  if (!event) return c.json({ error: 'No public event.' }, 404);
  const eventRounds = await db.select().from(rounds).where(and(eq(rounds.eventId, event.id), eq(rounds.visibility, 'public'))).orderBy(asc(rounds.ordinal));
  const [award] = await db.select().from(awards).where(and(eq(awards.year, event.year), eq(awards.visibility, 'public'))).limit(1);
  return c.json({ ...event, cupWinner: award?.cupWinner ?? null, migWinner: award?.migWinner ?? null, rounds: eventRounds });
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
  if (!event) {
    const card = archiveCards.find((x) => x.year === year);
    if (!card && !award && !yearPhotos.length) return c.json({ error: 'Archive year not found.' }, 404);
    return c.json({ id: year, year, title: card?.title || `${year} ASHHOLE Archive`, subtitle: card?.blurb || null, status: 'Archive', heroImage: card?.image || null, cupWinner: award?.cupWinner ?? null, migWinner: award?.migWinner ?? null, rounds: [], pairings: [], photos: yearPhotos });
  }
  const eventRounds = await db.select().from(rounds).where(and(eq(rounds.eventId, event.id), eq(rounds.visibility, 'public'))).orderBy(asc(rounds.ordinal));
  const eventPairs = await db.select({ playerOne: pairings.playerOne, playerTwo: pairings.playerTwo }).from(pairings).where(and(eq(pairings.eventId, event.id), eq(pairings.visibility, 'public')));
  return c.json({ ...event, cupWinner: award?.cupWinner ?? null, migWinner: award?.migWinner ?? null, rounds: eventRounds, pairings: eventPairs, photos: yearPhotos });
});

app.use('/api/member/*', requireMember);
app.get('/api/member/events/:year', async (c) => {
  const year = Number(c.req.param('year'));
  const [event] = await db.select().from(events).where(eq(events.year, year)).limit(1);
  if (!event) return c.json({ error: 'Event not found.' }, 404);
  const rooms = await db.select().from(roomAssignments).where(eq(roomAssignments.eventId, event.id));
  return c.json({ event, rooms });
});

const eventInput = z.object({ title: z.string().min(3).max(120), status: z.string().min(2).max(40), subtitle: z.string().max(240).nullable().optional(), heroImage: z.string().max(240).nullable().optional(), visibility: z.enum(['public', 'member', 'admin']).optional() });
app.use('/api/admin/*', requireAdmin);
app.put('/api/admin/events/:year', async (c) => {
  const year = Number(c.req.param('year'));
  if (!Number.isInteger(year) || year < 1990 || year > 2200) return c.json({ error: 'Invalid year.' }, 400);
  const parsed = eventInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const input = parsed.data;
  await db.insert(events).values({ year, title: input.title, status: input.status, subtitle: input.subtitle, heroImage: input.heroImage, visibility: input.visibility || 'member' }).onConflictDoUpdate({ target: events.year, set: { title: input.title, status: input.status, subtitle: input.subtitle, heroImage: input.heroImage, visibility: input.visibility || 'member' } });
  return c.json({ ok: true });
});

app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));
