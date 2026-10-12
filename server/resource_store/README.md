# Resource store — full framework clones (not loaded by the server)

These are complete, pinned upstream clones (see `docs/FRAMEWORK_PINS.md`):

| Dir | What |
|---|---|
| `esx-legacy/` | Full ESX Legacy bundle (all [core], [addons], SQL) |
| `qb-core/` | QBCore framework |
| `oxmysql/` | ox_mysql (the compat layer implements its MySQL API natively, but the resource is shipped for `@oxmysql` imports) |

The server loads from `server/fivem_resources/` only — that folder contains the
TESTED ESX boot set (es_extended, esx_lib, skinchanger, oxmysql). To add or swap
resources, copy them from here into `fivem_resources/[category]/<name>` and restart.

Note: do not run qb-core and es_extended in the same server at once — both are
full frameworks that own the player lifecycle. Swap them instead.
