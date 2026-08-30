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
