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

The new site deliberately reuses the real ASHHOLE photography from the private `ashhole90` repository. Clone the old repository next to this one, then copy only the curated golf/archive assets:

```bash
cd ..
git clone https://github.com/chrisbirster/ashhole90.git
cd ashhole
npm install
npm run assets:legacy -- ../ashhole90
npm run db:migrate
npm run db:seed
npm run dev
```

If `ashhole90` already exists elsewhere, pass its path to `npm run assets:legacy -- /path/to/ashhole90` or set `ASHHOLE90_PATH`.

The asset migration copies the Shenvalee scenery, representative historical group photos, the complete 2024 gallery, and memorial photos. It intentionally does **not** copy the entire legacy `public/old` tree. The original logo is managed separately by `assets:sync` and is verified byte-for-byte against its historical Git blob SHA.

Vite runs the UI and proxies `/api` to the Hono server.

## Annual Classic admin

Configure `ASHHOLE_ADMIN_TOKEN` on the server, then open `/admin` and enter the same token. `/admin` is the only protected application surface.

A normal annual workflow is:

1. Load **2025** and enter the completed schedule/results, Cup winner, Gil Lugo Memorial MIG winner, field/handicaps, pairings and room assignments. Save it as the historical record.
2. Load **2026**. Use **Copy previous year setup** if useful; it copies rounds, field and rooms but deliberately clears Cup pairings and award winners.
3. Update the 2026 schedule, tee times, field, handicaps, Cup teams and rooms.
4. Use **Save 2026** while the year is still an admin draft.
5. Use **Save & make front page** when 2026 should become the public Classic. The homepage immediately starts reading that year from the database; no source-code edit is required.

Public Classic data includes the schedule, field/handicaps, Cup pairings, room assignments and published awards. There is no member endpoint or member token.

See `docs/admin.md` for the annual entry checklist.

## Production database

Local development defaults to `file:ashhole.db`. To use Turso/libSQL, set:

```bash
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Never commit either value.

## Protection model

Public Classic/history data is returned by the normal public API. Draft-year data is marked `admin` and is not returned by public event endpoints. The only authenticated API surface is `/api/admin/*`, protected by `ASHHOLE_ADMIN_TOKEN`.

See `docs/data-security.md`.
