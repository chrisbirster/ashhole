# Data security

The destination GitHub repository is currently public. Treat Git history as public forever.

## Safe for source control

- existing ASHHOLE logo
- approved scenery/group/archive images already publicly published
- public historical attendance
- public Cup/MIG results
- public origin/history copy

## Never commit

- Turso URL/token
- admin bearer token
- credentials

## Boundary

There are only two visibility states for year-specific Classic records:

- `public` — available through the normal public Classic/archive API
- `admin` — unpublished draft data, available only through `/api/admin/*`

Room assignments are normal Classic data. When a Classic year is public, its room assignments are public too. There is no member endpoint, member token, or member visibility tier.

The `/api/admin/*` endpoints fail with 503 when `ASHHOLE_ADMIN_TOKEN` is not configured and 401 for an invalid token. Public endpoints never return an event whose visibility is `admin`.

The legacy importer can remain conservative about automatically importing old room data; current room assignments should be entered through `/admin` when desired.
