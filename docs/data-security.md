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
- member/admin bearer tokens
- new private room assignments
- private current-trip notes
- contact information or credentials

## Boundary

`visibility` is enforced server-side. The browser never receives member/admin records through public endpoints. Protected endpoints fail with 503 when their secret is not configured and 401 for an invalid token.

The legacy importer intentionally skips historical room assignment data even though older pages exposed it.

For a production member portal, replace the bootstrap bearer-token mechanism with a real identity/session provider. The Hono authorization boundary is already isolated so that swap does not require redesigning public pages or the database.
