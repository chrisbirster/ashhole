# Architecture

## Shape

```text
Solid 2 + Router 2 + StyleX
          |
          v
      /api (Hono)
          |
          v
       Drizzle
          |
          v
SQLite locally / Turso in production
```

The UI is a Vite SPA. Hono owns all server/data boundaries and serves the built app in production.

## Pages

- `/` — The Classic
- `/cup` — Cup and Gil Lugo Memorial MIG lineage
- `/field` — players and attendance tiers
- `/archive` — historical timeline
- `/archive/:year` — reusable yearly event page
- `/story` — origin story
- `/memorial` — memorials
- `/admin` — protected yearly event editor

## Data

Public Classic/history data is served normally, including room assignments. Unpublished years use `admin` visibility and are only available through `/api/admin/*`. There is no member endpoint or member authentication tier.

The schema supports event rounds, attendance, awards, Cup pairings, field/handicaps, room assignments and photos. The old one-React-page-per-year architecture is intentionally gone: a year is a database record rendered through shared routes.
