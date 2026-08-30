# ASHHOLE

The next-generation home of the **Annual Shenvalee Hackers Holiday Of Leisurely Exercise**.

> Serious tradition. Questionable golf.

This is a clean TypeScript rebuild of the historical `ashhole90` website using Solid 2, Solid Router 2, Vite, StyleX, Hono, Drizzle and SQLite/libSQL.

## Stack

- Solid `2.0.0-rc.4`
- `@solidjs/router` `2.0.0-next.17`
- Vite 8 + `@solidjs/vite-plugin`
- StyleX 0.19
- Hono 4
- Drizzle ORM + SQLite/libSQL (Turso-ready)
- TypeScript

## Development

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Vite runs the UI and proxies `/api` to the Hono server.

## Annual Classic admin

Configure `ASHHOLE_ADMIN_TOKEN` on the server, then open `/admin` and enter the same token. The admin workspace edits one Classic year at a time.

A normal annual workflow is:

1. Load **2025** and enter the completed schedule/results, Cup winner, Gil Lugo Memorial MIG winner, field/handicaps, pairings and member-only rooms. Save it as the historical record.
2. Load **2026**. Use **Copy previous year setup** if useful; it copies rounds, field and rooms but deliberately clears Cup pairings and award winners.
3. Update the 2026 schedule, tee times, field, handicaps, Cup teams and rooms.
4. Use **Save 2026** while the year is still a draft/member record.
5. Use **Save & make front page** when 2026 should become the public Classic. The homepage immediately starts reading that year from the database; no source-code edit is required.

Public Classic data includes the schedule, field/handicaps and Cup pairings. Room assignments are kept behind the member endpoint and are not returned by the public homepage API.

## Production database

Local development defaults to `file:ashhole.db`. To use Turso/libSQL, set:

```bash
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Never commit either value.

## Protected data

The repository contains only public historical data. Current/member-only trip data belongs in the database and is never bundled into the browser. Protected endpoints are disabled unless `ASHHOLE_MEMBER_TOKEN` and/or `ASHHOLE_ADMIN_TOKEN` are configured.

See `docs/data-security.md`.
