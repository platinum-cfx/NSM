# NSM Repository Audit

> Audited 2026-10-11, commit `a82d23e` (v2.1). All findings below were verified by
> reading source — nothing is speculative. Each security finding cites file:line.
> Companion docs: `ARCHITECTURE.md` (map), `RUNTIME_DECISION.md` (runtime verdict).

## 1. Claim verification (the three claims from the audit request)

### Claim A — “server wrapper has a client-token-hash response path that synthesizes a permissive result”
**CONFIRMED — and the listener is on `0.0.0.0`, not localhost.**
`sources/server/server.cpp:386-410`: the wrapper's proxy on port 7799 installs a
catch-all POST handler. If the body contains the string `clientTokenHashes`, it counts
the hashes and responds with a JSON array of `true` values — one per hash — **without
consulting any real verification service**. Consequences:
- Client token / hardware verification for connections is effectively disabled; every
  submitted hash is declared valid.
- Because the proxy binds `0.0.0.0:7799`, any host that can reach the server's port
  7799 also gets this behavior (and can call `GET /updateOnline` to set the server's
  Discord-RPC display state, no auth).
- This is a deliberate mechanism of the NSM fork (it is how non-alt:V-registered GTAMP
  clients are accepted by a real alt:V server binary), but it means: alt:V-side bans and
  token checks provide **zero** protection on an NSM server. Server-level access control
  must come from elsewhere (server password, firewall).

### Claim B — “website contains a server-deletion authorization bypass”
**CONFIRMED — two independent bypasses, both worse than described.**
`website/server.js` (delete-server routes, ~lines 408-437):
1. `POST /api/servers/:id/delete` and `POST /servers/:id/delete`:
   ```js
   } else if (req.headers['x-admin-key'] === 'CravenzOwnerKey'
            || req.body.adminKey === 'CravenzOwnerKey'
            || req.body.username === 'Cravenz') { authorized = true; }
   ```
   - A **hardcoded shared secret** (`CravenzOwnerKey`) is committed to a public repo.
   - Posting `{"username":"Cravenz"}` — no password, no key — authorizes deletion of
     **any** server record.
2. `DELETE /api/servers/:id` and `DELETE /servers/:id`:
   ```js
   } else if (req.headers['x-admin-key'] === 'CravenzOwnerKey'
            || req.headers['authorization']) { authorized = true; }
   ```
   - **Any `Authorization` header with any value** (e.g. `Authorization: x`) authorizes
     deletion of any server record.

### Claim C — “masterlist announcement-key default and expiry timeout disagree with its documentation”
**CONFIRMED — both parameters.**
`masterlist/README.md` documents `OPEN_ANNOUNCE` default `0` (key required) and
`TIMEOUT_MS` default `90000` (90 s). `masterlist/server.js`:
- Line 32: `const OPEN_ANNOUNCE = process.env.OPEN_ANNOUNCE !== '0';` → **defaults to
  open announce** (no key needed) unless explicitly set to `0`.
- Line 33: `const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '25000', 10);` →
  default **25 s**, while the inline comment says “drop after 90 s silence” (matching
  the README, not the code).
Net effect: out of the box the masterlist accepts anonymous announces and prunes
servers 3.6× faster than documented (heartbeats every 30 s vs a 25 s timeout means a
listed server can flap out between announces).

## 2. Additional security findings (discovered during this audit, verified)

| # | Severity | Location | Finding |
|---|----------|----------|---------|
| S1 | High | `masterlist/server.js` (DELETE routes, ~line 482) | `DELETE /servers/:id` (and `POST …/delete`) require **no authentication whatsoever** — anyone can remove any server from the public list. Contrast: announce itself checks keys (when open-announce is off). |
| S2 | High | `website/server.js:408-437` | Claim B above (backdoor delete). |
| S3 | High | `website/server.js:18-27` | CORS middleware reflects the request `Origin` header **with `Access-Control-Allow-Credentials: true`** — any origin can make credentialed (session-cookie) requests to every route, enabling full cross-site account actions. |
| S4 | High | `website/server.js` (`/admin/badges/grant`, requireStaff) | Staff can grant **any** badge id including `b_owner`/`b_founder`; `isUserOwner()` treats those badges as owner. A staff member can self-grant owner → full takeover of the site. |
| S5 | Medium | `sources/server/server.cpp:371-433` | Token-verification proxy binds `0.0.0.0:7799` (Claim A) and `GET /updateOnline` is unauthenticated — remote state spoofing. |
| S6 | Medium | `masterlist/server.js` (upvote route) | `POST /servers/:id/upvote` has no auth, no rate limit, no dedup → trivially scriptable boost inflation (boosting is the ranking signal). |
| S7 | Medium | `masterlist/server.js` (`/api/player/heartbeat`, `/api/server/playing`) | Presence is keyed by client-supplied `clientId`/`server` with no auth → fabricated player counts; counts feed the public list and website. |
| S8 | Medium | `website/server.js` (`/api/servers/report`) | Unauthenticated endpoint creates/edits server records (name/desc/players/ownerId) in the website store — poisoned server list on the site. |
| S9 | Medium | `website/server.js` (`/api/auth/avatar`) | With no session, looking up the target **by username** lets anyone set any user's avatar (`user.avatar = avatar` — also no type/size check on what is stored/rendered). |
| S10 | Low | `website/server.js:31` | Session secret defaults to `'gtamp-dev-secret-change-me'` — forgeable sessions if env var unset. |
| S11 | Low | `masterlist/server.js` (`clientIp`) | Trusts `X-Forwarded-For` unconditionally → rate-limit and “announce from own IP” logic bypassable behind a spoofable header. |
| S12 | Low | `masterlist/server.js` (announce, verified flag) | `host` in `127.0.0.1`/`localhost`/`::1`/`192.168.*`/`10.*` is auto-`verified = true` → anyone can list a “verified” fake server with a loopback host. |
| S13 | Info | `sources/server/server.cpp` (RunPE) | Wrapper uses process hollowing (`runpe.h`) to launch the embedded alt:V server — antivirus false positives are expected and should be documented for users, not “fixed”. |
| S14 | Info | `server/server.toml` | `debug = true` is shipped enabled (CEF debugger / debug functions allowed in production config). |

## 3. Implementation status matrix (what exists and works vs. what doesn't)

Legend: **Tested** = executed and verified in this workspace with a repeatable command;
**Shipped** = committed to the repo at `a82d23e`; **Partial** = exists but with known gaps;
**Missing** = not in the codebase.

| Area | Component | Status | Evidence / notes |
|------|-----------|--------|------------------|
| Server core | alt:V server 16.4.39 run by wrapper | Shipped | `sources/server/server.cpp` RunPE path; binaries committed |
| Server core | js-module v1 + libnode placement | Shipped + fix script | `fix-jsmodule.ps1` (SDK mismatch repair, v2.1) |
| FiveM compat | JS-side shim (Citizen/events/exports Proxy) | Shipped | `server/fivem-shim.js` (350 lines) |
| FiveM compat | Lua runtime (wasmoon) + fork-syntax transform | Tested + Shipped | 46/46 unit suite; `tools/load-real.mjs`; lua-transform.js (v2 backward-bracket-matching walker) |
| FiveM compat | qb-core load | **Tested** | 12 shared + 7 server scripts, zero errors |
| FiveM compat | esx_lib + es_extended load | **Tested** | 27 scripts, zero errors; required load()-wrap + `__transformLua` bridge |
| FiveM compat | Cross-resource live exports (`exports['qb-core']:GetCoreObject()` → live table) | **Tested + Shipped** | v3 `6af03b7`: 17/17 live-export checks vs real qb-core + es_extended (`tools/live-exports-check.mjs`) — functions callable, identity preserved, mutations shared, source propagates |
| FiveM compat | Dependency-ordered resource loading | **Tested + Shipped** | v3 `6af03b7`: `loadAll()` orders by manifest `dependencies` + `@resource/` imports; fixes es_extended-before-esx_lib; cycle detection with clear errors |
| FiveM compat | Unsupported manifest directives diagnostics | **Tested + Shipped** | v3 `6af03b7`: ignored directives are reported per resource (`unsupported directive(s) ignored: ...`); missing exports/deps error clearly |
| FiveM compat | oxmysql bridge to real DB | Partial | oxmysql loads; MySQL layer not wired (design only) |
| Gameplay | Spawn/respawn/under-map rescue | Shipped | `server/resources/gtamp-online/` |
| Gameplay | vMenu server side | Shipped | `server/resources/vmenu/index.js` (182 lines) — vMenu client is alt:V-native C#, **not** the FiveM vMenu |
| Gameplay | Voice | Partial | client `.config [voice]`; server-side voice routing not audited here |
| Masterlist | Announce/list/presence/keys | Shipped | works, but see S1/S6/S7/S11/S12 |
| Website | Auth/forum/marketplace/badges | Shipped | works, but see S2/S3/S4/S9/S10 |
| Client | Launcher + custom UI + alt:V client launch | Shipped | `client-new/`, `sources/cpp/connect.cpp` |
| Client | Client-side FiveM Lua resources | **Not possible (by design)** | GTAMP client is the alt:V client; NUI/client-Lua cannot execute there. Standing decision, confirmed three times. |
| Ops | js-module SDK repair (`fix-jsmodule.ps1`) | Shipped | user runs after `git pull` (sandbox blocked from alt:V CDN) |

## 4. What is NOT in the repo (gap list, prioritized)

*(Updated 2026-10-11 after v3 `6af03b7`: the former top three gaps — live
exports + single-VM runtime, dependency-ordered loading, manifest
diagnostics — are implemented, tested, and shipped.)*

1. **Security fixes for S1–S9** with regression tests (see §5 plan) — in progress.
2. **Resource lifecycle beyond load** — stop/restart of a single resource,
   handler/timer/export cleanup on stop (Phase 3.2 of the dev plan).
3. **oxmysql→real-DB wiring for framework SQL flows** — the MySQL API exists and
   is tested against a mock; production pool behavior is untested against MariaDB.
4. **NUI/browser UI compat** — not started (Phase 9).
5. **Voice docs/integration tests** — client voice config exists; no tests.
6. **CI workflow** — the test suites run in-repo with plain Node but no CI config
   runs them automatically on push.

## 5. Remediation order (what this audit recommends, in sequence)

1. ~~Runtime work first~~ — **DONE** (v3 `6af03b7`: one-VM/live-exports,
   dependency-ordered loading, manifest diagnostics; 69/69 + 17/17 + 62/62).
2. Security fixes in one pass with tests, server-side of the repo — **in progress**:
   - masterlist: require key/admin on delete; auth+ratelimit on upvote; fix defaults
     (`OPEN_ANNOUNCE` default off, `TIMEOUT_MS` default 90000) and README agreement;
   - website: remove backdoor delete paths (`CravenzOwnerKey`, bare `Authorization`,
     `username==='Cravenz'`); stop reflecting Origin with credentials; restrict badge
     grant to owner-tier badges; require session for avatar set; env-required session
     secret;
   - wrapper (needs C++ rebuild): bind 7799/7899 to `127.0.0.1`; document token-verify
     bypass as an accepted design decision.
   Each fix gets a regression test where the surface is testable in-repo (masterlist +
   website are plain Node — testable; the wrapper is Windows-only — documented only).
