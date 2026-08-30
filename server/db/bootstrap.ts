import { libsql } from './client.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER NOT NULL UNIQUE, title TEXT NOT NULL, subtitle TEXT, status TEXT NOT NULL DEFAULT 'Planning', hero_image TEXT, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS rounds (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE, ordinal INTEGER NOT NULL, day_label TEXT NOT NULL, title TEXT NOT NULL, course TEXT NOT NULL, tee_time TEXT NOT NULL, holes INTEGER, format TEXT, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, first_year INTEGER, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE, year INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS awards (id INTEGER PRIMARY KEY AUTOINCREMENT, year INTEGER NOT NULL UNIQUE, mig_winner TEXT, cup_winner TEXT, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS pairings (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE, player_one TEXT NOT NULL, player_two TEXT, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS event_players (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE, ordinal INTEGER NOT NULL, name TEXT NOT NULL, handicap TEXT, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, year INTEGER NOT NULL, src TEXT NOT NULL, alt TEXT NOT NULL, featured INTEGER NOT NULL DEFAULT 0, visibility TEXT NOT NULL DEFAULT 'public')`,
  `CREATE TABLE IF NOT EXISTS room_assignments (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE, room TEXT NOT NULL, occupants TEXT NOT NULL, visibility TEXT NOT NULL DEFAULT 'member')`,
  `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS attendance_player_idx ON attendance(player_id)`,
  `CREATE INDEX IF NOT EXISTS rounds_event_idx ON rounds(event_id)`,
  `CREATE INDEX IF NOT EXISTS event_players_event_idx ON event_players(event_id)`,
  `CREATE INDEX IF NOT EXISTS photos_year_idx ON photos(year)`,
];

export async function migrate() {
  for (const sql of statements) await libsql.execute(sql);
}
