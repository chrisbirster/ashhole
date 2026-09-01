import { eq } from 'drizzle-orm';
import { awards as publicAwards } from '../../src/data/public.js';
import { db } from './client.js';
import { attendance, awards, events, pairings, photos, players, rounds } from './schema.js';

const seedPlayers = [
  { slug: 'john-benedict', name: 'John Benedict', firstYear: 1990, years: Array.from({ length: 36 }, (_, i) => 1990 + i) },
  { slug: 'tony-kren', name: 'Tony Kren', firstYear: 1990, years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2021,2022,2023,2024,2025] },
  { slug: 'gregg-wells', name: 'Gregg Wells', firstYear: 1991, years: Array.from({ length: 35 }, (_, i) => 1991 + i) },
  { slug: 'sal-nicastro', name: 'Sal Nicastro', firstYear: 1992, years: [1992,1994,1996,1997,1998,1999,2002,2003,2004,2005,2006,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025] },
  { slug: 'dave-cochran', name: 'Dave Cochran', firstYear: 1995, years: [1995,1996,1999,2000,2001,2002,2003,2004,2005,2006,2007,2009,2010,2011,2012,2013,2014,2015,2016,2018,2019,2022,2023,2024,2025] },
  { slug: 'chris-birster', name: 'Chris Birster', firstYear: null, years: [2020,2021,2022,2023,2024,2025] },
  { slug: 'joey-nicastro', name: 'Joey Nicastro', firstYear: null, years: [2020,2021,2022,2023,2024,2025] },
  { slug: 'brian-bruneau', name: 'Brian Bruneau', firstYear: null, years: [2023,2024,2025] },
  { slug: 'jeff-cochran', name: 'Jeff Cochran', firstYear: null, years: [2023,2024,2025] },
  { slug: 'cory-wells', name: 'Cory Wells', firstYear: null, years: [2023,2024,2025] },
];

const gallery2024 = [
  'IMG_2561.JPG', 'IMG_2562.JPG', 'IMG_2563.JPG', 'IMG_2564.JPG',
  'IMG_2565.JPG', 'IMG_2566.JPG', 'IMG_2567.JPG', 'IMG_2568.JPG',
  'IMG_2569.JPG', 'IMG_2570.JPG', 'IMG_2571.JPG', 'IMG_2572.JPG',
  'IMG_2573.JPG', 'IMG_2574.JPG', 'IMG_2578.JPG', 'IMG_2580.JPG',
];

export async function seedPublicData() {
  for (const award of publicAwards) {
    await db.insert(awards).values({ year: award.year, migWinner: award.migWinner, cupWinner: award.cupWinner, visibility: 'public' }).onConflictDoUpdate({ target: awards.year, set: { migWinner: award.migWinner, cupWinner: award.cupWinner } });
  }

  const heroImage = '/old/2024/IMG_2578.JPG';
  await db.insert(events).values({ year: 2024, title: '2024 ASHHOLE Classic', subtitle: 'Latest complete public archive', status: 'Archived', heroImage, visibility: 'public' }).onConflictDoUpdate({ target: events.year, set: { title: '2024 ASHHOLE Classic', heroImage } });
  const [event] = await db.select().from(events).where(eq(events.year, 2024)).limit(1);
  if (!event) throw new Error('Unable to seed 2024 event');

  const existingRounds = await db.select().from(rounds).where(eq(rounds.eventId, event.id));
  if (!existingRounds.length) await db.insert(rounds).values([
    { eventId: event.id, ordinal: 1, dayLabel: 'Friday', title: 'Opening Round', course: 'Creek → Miller', teeTime: '11:42 AM', holes: 18, visibility: 'public' },
    { eventId: event.id, ordinal: 2, dayLabel: 'Saturday AM', title: 'Round Two', course: 'Creek → Olde', teeTime: '7:48 AM', holes: 18, visibility: 'public' },
    { eventId: event.id, ordinal: 3, dayLabel: 'Saturday PM', title: 'The Wildcard', course: 'Olde → Miller', teeTime: '2:42 PM', holes: 9, format: 'Scramble · Red tees', visibility: 'public' },
    { eventId: event.id, ordinal: 4, dayLabel: 'Sunday', title: 'Skins', course: 'Creek → Miller', teeTime: '8:33 AM', holes: 18, format: 'Skins', visibility: 'public' },
  ]);

  const existingPairs = await db.select().from(pairings).where(eq(pairings.eventId, event.id));
  if (!existingPairs.length) await db.insert(pairings).values([
    ['Sal Nicastro Jr', 'Tony Kren'], ['Chris Birster', 'John Benedict'], ['Brian Bruneau', null], ['Cory Wells', 'Joey Nicastro'], ['Dave Cohran', 'Jeff Cochran'], ['Gregg Wells', 'Danny Cochran'], ['Sal Nicastro', 'Brian Cochran'],
  ].map(([playerOne, playerTwo]) => ({ eventId: event.id, playerOne: playerOne!, playerTwo, visibility: 'public' })));

  for (const filename of gallery2024) {
    const src = `/old/2024/${filename}`;
    const existing = await db.select().from(photos).where(eq(photos.src, src)).limit(1);
    if (!existing.length) await db.insert(photos).values({ eventId: event.id, year: 2024, src, alt: `2024 ASHHOLE Classic — ${filename}`, featured: filename === 'IMG_2578.JPG', visibility: 'public' });
  }

  for (const p of seedPlayers) {
    await db.insert(players).values({ slug: p.slug, name: p.name, firstYear: p.firstYear, visibility: 'public' }).onConflictDoUpdate({ target: players.slug, set: { name: p.name, firstYear: p.firstYear } });
    const [saved] = await db.select().from(players).where(eq(players.slug, p.slug)).limit(1);
    if (!saved) continue;
    const current = await db.select().from(attendance).where(eq(attendance.playerId, saved.id));
    const known = new Set(current.map((row) => row.year));
    const missing = p.years.filter((year) => !known.has(year));
    if (missing.length) await db.insert(attendance).values(missing.map((year) => ({ playerId: saved.id, year })));
  }
}
