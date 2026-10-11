# NSM Security Review

> First full pass: 2026-10-11, against commit `ef97f96` (post-v3).
> Companion docs: `REPOSITORY_AUDIT.md` (findings S1–S14 with file:line
> evidence), `ARCHITECTURE.md` (component map).

## Status summary

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| S1 | High | masterlist: `DELETE /servers/:id` had **no authentication at all** | **FIXED + regression tests** (`masterlist/test-security.js`) |
| S2 | High | website: two deletion backdoors (hardcoded `CravenzOwnerKey` committed to a public repo; `username === 'Cravenz'`; ANY `Authorization` header value) | **FIXED + regression tests** (`website/test-security.js`) |
| S3 | High | website: CORS reflected arbitrary Origins with `Allow-Credentials: true` (any site could act as the visitor's session) | **FIXED + regression tests** — same-origin by default; explicit `ALLOWED_ORIGINS` allowlist only |
| S4 | High | website: staff could self-grant `b_owner`/`b_founder` → full owner takeover | **FIXED + regression tests** — owner-tier badges owner-only |
| S5 | Medium | server wrapper: token-verify proxy on `0.0.0.0:7799`; `clientTokenHashes` answered with all-`true` (Claim A) | **OPEN — documented, requires C++ rebuild** (see below) |
| S6 | Medium | masterlist: upvotes had no auth/dedup → scriptable boost inflation | **FIXED + regression tests** (per-IP-per-server dedup + rate limit) |
| S7 | Medium | masterlist: presence (`/api/player/heartbeat`) keyed by client-supplied ids → fabricated player counts | **OPEN — accepted for now** (see below) |
| S8 | Medium | website: `/api/servers/report` is unauthenticated → fabricated server records | **OPEN — accepted for now** (see below) |
| S9 | Medium | website: avatar of ANY user settable by username without a session | **FIXED + regression tests** (session-only + size cap) |
| S10 | Low | website: session secret defaulted to a committed constant | **FIXED + regression tests** (random per-boot fallback + loud warning) |
| S11 | Low | masterlist: `X-Forwarded-For` trusted unconditionally | **FIXED + regression tests** (`TRUST_PROXY=1` opt-in) |
| S12 | Low | masterlist: loopback/LAN announced hosts auto-`verified` | **FIXED + regression tests** (auto-verify only from loopback sources) |
| S13 | Info | wrapper uses RunPE process hollowing (AV false positives expected) | Documented in `ARCHITECTURE.md` — by design, not a vulnerability per se |
| S14 | Info | shipped `server.toml` has `debug = true` | OPEN — should default off before public exposure |
| C | Medium | masterlist defaults contradicted README (`OPEN_ANNOUNCE` open-by-default in code, `TIMEOUT_MS` 25 s vs documented 90 s) | **FIXED + regression tests** — code now matches docs: strict announce, 90 s timeout |

## What was changed (this pass)

### masterlist/server.js
- `OPEN_ANNOUNCE` now defaults **off** (strict key auth), matching the README.
  Migration for local dev: set `OPEN_ANNOUNCE=1` explicitly, or mint a key with
  `ADMIN_KEY` via `POST /keys`.
- `TIMEOUT_MS` default is now `90000` (was `25000`), matching the README and
  the 30 s announce interval.
- `TRUST_PROXY` (default off): `X-Forwarded-For` is only honored when set.
- `DELETE /servers/:id` + `POST /servers/:id/delete` require the admin key or
  the owning server key; anonymous deletes return 403; both routes are rate
  limited.
- Upvotes: per-IP-per-server dedup (in-memory, resets on restart — documented
  best effort) + rate limit.
- Loopback/LAN hosts are auto-verified **only** when the announce comes from a
  loopback address.
- `GET /health` now reports the effective config
  (`openAnnounce`, `timeoutMs`, `trustProxy`, `adminKeySet`) for ops and tests.

### website/server.js
- Both deletion backdoors removed. Deletion requires an authenticated
  admin/owner session or `X-Admin-Key` matching the `ADMIN_KEY` env (unset →
  that path is disabled).
- CORS: arbitrary-Origin reflection with credentials removed. Same-origin by
  default; `ALLOWED_ORIGINS` (comma list) is the only way to get
  credentialed CORS, and only for listed origins.
- Owner-tier badges (`b_owner`, `b_founder`) can only be granted/removed by
  the owner.
- Avatar changes require the caller's session; 200 KB size cap.
- Session secret: `GTAMP_SECRET` unset → random per-boot secret + console
  warning (sessions do not survive restarts until it is set).

### Tests added
- `masterlist/test-security.js` — 22 checks (boot with temp `DATA_DIR`, real
  HTTP): config defaults, announce auth, key minting, both delete paths
  (anonymous/foreign-key/admin/owner-key), upvote dedup, XFF spoofing.
- `website/test-security.js` — 24 checks across three boot configurations:
  both backdoors, admin key, login/register still working, badge escalation
  blocked (and confirmed meaningful), avatar authz + cap, CORS behavior with
  and without an allowlist, secret warning.
- Run: `node test-security.js` in `masterlist/` and `website/` (plain Node
  >= 18; the website needs `npm install` first).

## Open items and why

- **S5 (token-verify proxy)**: `sources/server/server.cpp:386-410` answers
  any POST containing `clientTokenHashes` with an all-`true` array, on
  `0.0.0.0:7799`. This is a deliberate mechanism of the NSM fork — it is how
  non-alt:V-registered GTAMP clients are accepted by the real alt:V server
  binary — so it cannot simply be deleted without breaking the platform's
  client story. Consequences that stand regardless: alt:V-side ban lists and
  token checks provide zero protection on an NSM server; access control must
  come from the server password and firewalling. Minimum hardening when the
  C++ wrapper is next rebuilt: bind 7799/7899 to `127.0.0.1`, and require
  `GET /updateOnline` callers to be local. Not fixable from this sandbox
  (Windows-only build; also S13 applies).
- **S7 / S8 (spoofable presence and server reports)**: the launcher protocol
  trusts client-supplied `clientId`/`server` fields and the website accepts
  anonymous `POST /api/servers/report`. Fabricated counts/records are possible.
  Proper fix is a protocol change (sign presence with the server key; tie
  reports to announced servers), which touches the C++ launcher and wrapper —
  scheduled with the platform pass, not silently "fixed" with a stub.
- **S14 (`debug = true` in shipped server.toml)**: flip to commented-out
  before the next public server package; left as-is here to avoid changing
  local-dev behavior mid-pass.

## Deployment checklist (operator-facing)

- Masterlist: set a long random `ADMIN_KEY`; leave `OPEN_ANNOUNCE` unset
  (strict); set `TRUST_PROXY=1` only behind your own proxy.
- Website: set `GTAMP_SECRET` (long random) and `ADMIN_KEY`; set
  `ALLOWED_ORIGINS` only if a real cross-origin client exists.
- Game server: firewall 7799/7898/7899 from the internet (they are for local
  tooling); use the server password for access control.
