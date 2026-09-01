# Classic Admin Field Guide

The `/admin` workspace is the annual source of truth for a Classic year. It is the only protected application area.

## 2025 — finish the historical record

Load **2025**, then enter:

- Classic title, subtitle and final status
- each round, tee time, course, number of holes and format
- final field and handicaps
- ASHHOLE Cup pairings
- final ASHHOLE Cup winner(s)
- Gil Lugo Memorial MIG winner
- room assignments

Use **Save 2025**. There is no need to make 2025 the front page unless you intentionally want to show it as the live Classic.

## 2026 — manage the live Classic

Load **2026**. You can start from scratch or use **Copy previous year setup**.

Copying the previous year carries forward:

- rounds / schedule structure
- field and handicaps
- room assignments

It deliberately clears:

- Cup pairings
- Cup winner
- MIG winner

Update the copied information for the new trip, then use **Save 2026** while it is still being prepared as an admin draft.

When 2026 should become the public homepage, use **Save & make front page**. This sets the database's current Classic year and publishes that event. The homepage then reads its schedule, field/handicaps, Cup pairings and room assignments directly from 2026.

## Public vs admin draft

Public Classic API/front page:

- year, title, subtitle and status
- rounds and tee times
- field and handicaps
- Cup pairings
- room assignments
- published Cup/MIG results

Admin draft:

- an unpublished Classic year while you are still editing it

There is no member endpoint and no member authentication tier.

## Authentication

The server must have `ASHHOLE_ADMIN_TOKEN` configured. Enter the same value in `/admin`; the browser stores it locally on that device and sends it as a Bearer token to protected admin endpoints.

Do not commit the token to the repository.
