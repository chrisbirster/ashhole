# ASHHOLE

The SolidJS home of the **Annual Shenvalee Hackers Holiday Of Leisurely Exercise**.

This project intentionally preserves the visual identity and page structure of the historical `ashhole90` website while replacing its hard-coded React/Next.js data with a database-backed SolidJS application.

## What stays from `ashhole90`

The public site uses the old site's visual language and routes:

- fixed dark-blue ASHHOLE navigation
- Kanit typography
- original logo
- Shenvalee image at the top of the home page
- centered `Welcome to the YYYY Classic` hero with a logo on both sides
- Schedule tabs
- Handicaps table
- Ashhole Cup Pairings table
- Room Assignments table
- `Latest Results`, `1990-91 Pics`, `Players`, `History`, `Memories`, and `Tributes`
- photo-heavy year/result and tribute pages
- original blue footer and disclaimer

The old site is the visual and historical source of truth. This is not intended to be a visual redesign.

## What changes under the hood

The old Next.js pages embedded annual data directly in `.tsx` arrays. The new site keeps that data out of the Solid components:

- Solid `2.0.0-rc.4`
- Solid Router 2
- Vite 8
- TypeScript
- StyleX for the admin/application styling
- Hono API
- Drizzle ORM
- SQLite/libSQL locally (production storage can be replaced without changing the public UI)
- `/admin` for annual maintenance

Routes such as `/latest-results/:year` are generic and database-driven. There is no new `2025.tsx`, `2026.tsx`, and so on.

## Complete legacy archive

The complete contents of `ashhole90/public` have been migrated into this repository with their original paths intact. This includes the historical photo/GIF archive, `/images`, favicon, audio, and every other legacy public asset. The one-time transfer bundle was verified with SHA-256 before extraction.

Examples remain unchanged:

```text
ashhole90/public/old/2024/IMG_2578.JPG
→ ashhole/public/old/2024/IMG_2578.JPG

ashhole90/public/images/shenvalee-bg.jpg
→ ashhole/public/images/shenvalee-bg.jpg
```

This means historical `/old/...`, `/images/...`, and other `public/` URLs continue to work exactly as before.

For repeatable local recovery, `npm run assets:legacy -- /path/to/ashhole90` recursively copies the **entire** legacy `public/` tree, preserves every relative path, verifies each copied file byte-for-byte with SHA-256, and writes an integrity manifest.

`npm run import:legacy` treats the old TSX files as **one-time migration sources**. It imports players/attendance, awards, historical year tables, and photo metadata into the database. The new Solid pages then read that normalized data through the Hono API rather than retaining the old hard-coded arrays.

The original ASHHOLE logo is additionally reconstructed by `assets:sync` and verified byte-for-byte against the historical Git blob SHA.

> **Repository visibility:** `chrisbirster/ashhole` is public, so the migrated legacy `public/` archive is public as well.

## Public routes

The original URLs are restored:

```text
/
/latest-results
/latest-results/:year
/1990-91-pics
/players
/our-history
/memories
/tributes
/tributes/gil-lugo
/tributes/joe-ofalt
```

The newer aliases (`/archive`, `/field`, `/story`, etc.) remain for compatibility, but they are not part of the primary navigation.

## Annual Classic admin

Configure `ASHHOLE_ADMIN_TOKEN` on the server, then open `/admin`. `/admin` is the only protected application surface.

A normal annual workflow is:

1. Load **2025** and enter the completed schedule/results, Cup winner, Gil Lugo Memorial MIG winner, field/handicaps, pairings and room assignments.
2. Load **2026** and use **Copy previous year setup** if useful. It copies rounds, field and rooms but deliberately clears Cup pairings and award winners.
3. Update the 2026 schedule, tee times, field, handicaps, Cup teams and rooms.
4. Use **Save 2026** while it is still a draft.
5. Use **Save & make front page** when 2026 should power the public home page.

The old visual home page immediately reflects the selected year's database records; no source-code edit is required.

Public Classic data includes the schedule, field/handicaps, Cup pairings, room assignments and published awards. There is no member endpoint or member token.

See `docs/admin.md` for the annual entry checklist.

## Current development backend

Vite runs the Solid UI and proxies `/api` to the Hono server. Local development defaults to `file:ashhole.db`.

The previously discussed Cloudflare Worker + D1 + R2 migration is a separate deployment phase; the visual parity work does not depend on it.
