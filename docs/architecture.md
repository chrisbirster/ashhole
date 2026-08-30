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
- `/admin` — minimal protected event editor

## Data

Public historical facts can be seeded from source control. Member/private data must only exist in the database. The schema supports event rounds, attendance, awards, Cup pairings, photos, and member-only room assignments.

The old one-React-page-per-year architecture is intentionally gone. A year is a database record rendered through a shared route.
