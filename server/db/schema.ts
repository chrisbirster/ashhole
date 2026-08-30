import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  status: text('status').notNull().default('Planning'),
  heroImage: text('hero_image'),
  visibility: text('visibility').notNull().default('public'),
}, (t) => ({ yearUnique: uniqueIndex('events_year_unique').on(t.year) }));

export const rounds = sqliteTable('rounds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  ordinal: integer('ordinal').notNull(),
  dayLabel: text('day_label').notNull(),
  title: text('title').notNull(),
  course: text('course').notNull(),
  teeTime: text('tee_time').notNull(),
  holes: integer('holes'),
  format: text('format'),
  visibility: text('visibility').notNull().default('public'),
});

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  firstYear: integer('first_year'),
  visibility: text('visibility').notNull().default('public'),
}, (t) => ({ slugUnique: uniqueIndex('players_slug_unique').on(t.slug) }));

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
});

export const awards = sqliteTable('awards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  migWinner: text('mig_winner'),
  cupWinner: text('cup_winner'),
  visibility: text('visibility').notNull().default('public'),
}, (t) => ({ yearUnique: uniqueIndex('awards_year_unique').on(t.year) }));

export const pairings = sqliteTable('pairings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  playerOne: text('player_one').notNull(),
  playerTwo: text('player_two'),
  visibility: text('visibility').notNull().default('public'),
});

export const eventPlayers = sqliteTable('event_players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  ordinal: integer('ordinal').notNull(),
  name: text('name').notNull(),
  handicap: text('handicap'),
  visibility: text('visibility').notNull().default('public'),
});

export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  visibility: text('visibility').notNull().default('public'),
});

export const roomAssignments = sqliteTable('room_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  room: text('room').notNull(),
  occupants: text('occupants').notNull(),
  visibility: text('visibility').notNull().default('member'),
});

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
