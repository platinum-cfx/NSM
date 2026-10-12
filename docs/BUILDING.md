# Building and Running NSM

> Verified 2026-10-11 against the repository at commit range `a82d23e..0c387bd`.
> "Verified in-sandbox" means the command was executed and produced the stated
> result during this audit/work cycle. Windows-only builds could NOT be
> executed in the development sandbox and are marked NOT VERIFIED HERE.

## Component overview

| Component | Language/Platform | Build command | Status |
|---|---|---|---|
| masterlist | plain Node ≥ 18, **zero deps** | `node server.js` | verified; `masterlist.exe` = pkg build (not verified here) |
| website | Node ≥ 18 + Express/EJS/ws/bcryptjs | `npm ci && npm start` | verified (tests); `NSMwebsite.exe` = pkg build (not verified here) |
| cfx-compat (FiveM layer) | JS + vendored wasmoon, zero npm deps | runs as an alt:V JS resource | verified via test suites |
| server wrapper (`gtamp-server.exe`) | C++ (Win32, WinHTTP) MSVC | `sources/server/build.bat` | **NOT VERIFIED HERE** (Windows/MSVC only) |
| launcher (`NSM.exe`/`connect.exe`) | C++ (Win32) | see `sources/cpp/` | **NOT VERIFIED HERE** (Windows only) |
| alt:V server/client binaries | third-party | downloaded from alt:V | embedded as RCDATA 101 in the wrapper; CDN blocked from the dev sandbox |

## Node components (verified)

```bash
# masterlist — zero dependencies
cd masterlist
node server.js                  # listens on :8080 (PORT, HOST, ADMIN_KEY, TRUST_PROXY, OPEN_ANNOUNCE, TIMEOUT_MS)
node test-security.js           # 22 security regression checks

# website
cd website
npm ci                          # uses the committed package-lock.json
npm start                       # listens on :3000
node test-security.js           # 24 security regression checks (needs npm ci first)

# cfx-compat (the FiveM compatibility layer) — no npm install needed
cd server/resources/fivem-compat
node test/run-tests.js          # 69 unit/integration checks (mock alt:V)
node tools/lua-fork-transform.test.mjs   # qb-core compile gate; SKIPS without a clone in real_resources/
node tools/live-exports-check.mjs        # live exports vs real frameworks; SKIPS without clones
# optional: real framework clones (GPL-3.0, legally redistributable)
git clone --depth 1 https://github.com/qbcore-framework/qb-core real_resources/qb-core
git clone --depth 1 https://github.com/esx-framework/esx-legacy real_resources/esx-legacy
node tools/load-real.mjs qb-core
node tools/load-real.mjs "esx-legacy/[core]/esx_lib,esx-legacy/[core]/es_extended"
```

CI runs all of the above on every push (`.github/workflows/ci.yml`), including
the real-framework gates. Framework clones currently track upstream HEAD; the
framework milestones will pin exact commits.

## Dependency policy

- `website/package-lock.json` is **committed** (reproducible `npm ci`;
  ranges in `package.json` are locked by the lockfile).
- masterlist and cfx-compat deliberately have **zero runtime npm deps**
  (wasmoon is vendored under `server/resources/fivem-compat/vendor/wasmoon`,
  MIT license).
- No third-party binaries are downloaded or committed by the build process.
  Prebuilt binaries already in the repo (alt:V server payload inside
  `gtamp-server.exe`, `masterlist.exe`, `NSMwebsite.exe`, client exes/dlls)
  are distribution artifacts of their respective components.
- `real_resources/` (framework clones) is gitignored — never committed.

## Windows components (NOT VERIFIED HERE — requires a Windows machine)

- **Server wrapper**: `sources/server/server.cpp` + `runpe.h` + `resources.rc`
  (embeds `altv-server.exe` as RCDATA resource 101). Build with the MSVC
  toolchain via `sources/server/build.bat`. The shipped
  `server/gtamp-server.exe` was built this way upstream. Notes:
  - The wrapper uses RunPE (process hollowing) — expect antivirus false
    positives; document for users rather than "fixing".
  - `fix-jsmodule.ps1` (in `server/`) repairs the js-module SDK-version
    mismatch against the alt:V server release; run it after `git pull` on the
    server machine (the alt:V CDN is unreachable from some networks).
  - `UpdateServerToml()` parses `.cfg` (key = value). Inline `#` comments are
    stripped only outside quotes (fixed 2026-10-11; the fix is in source but
    was NOT compile-tested in this sandbox — please rebuild once and confirm).
- **Launcher**: `sources/cpp/connect.cpp` (plus `browser/` for its embedded
  UI server). Windows only; not rebuilt in this cycle.
- **Packaging Node exes**: `masterlist.exe` / `NSMwebsite.exe` are
  `pkg` builds (`pkg server.js` with the assets listed in
  `website/package.json`). Not exercised in this sandbox; prefer plain `node`
  where possible.

## Environment variables (complete, per component)

| Component | Variable | Default | Meaning |
|---|---|---|---|
| masterlist | `PORT` | 8080 | HTTP port |
| masterlist | `HOST` | 0.0.0.0 | bind address |
| masterlist | `ADMIN_KEY` | *(unset)* | mints server keys; unset = key creation disabled |
| masterlist | `OPEN_ANNOUNCE` | 0 (strict) | `1` = accept announces without a key (dev only) |
| masterlist | `TIMEOUT_MS` | 90000 | drop a server after this much heartbeat silence |
| masterlist | `TRUST_PROXY` | 0 | `1` = honor `X-Forwarded-For` (only behind your own proxy) |
| masterlist | `VERIFY_PORT` | 1 | TCP-probe announced game ports |
| masterlist | `DATA_DIR` | ./data | where `keys.json` lives |
| website | `PORT` | 3000 | HTTP port |
| website | `GTAMP_SECRET` | *(random per boot + warning)* | session signing secret — SET THIS in production |
| website | `ADMIN_KEY` | *(unset)* | machine key for `X-Admin-Key` server deletion; unset = disabled |
| website | `ALLOWED_ORIGINS` | *(empty = same-origin)* | comma list of origins allowed credentialed CORS |
| website | `DATA_DIR` | ./data | JSON store directory |
| website | `MASTERLIST_URL` | http://127.0.0.1:8080 | masterlist to mirror |
| server | `.cfg` keys | see `server/.cfg` | name/port/player_slots/announce/masterlist_url/server_key/... |

## Troubleshooting

- **js-module version mismatch on server start** → run
  `powershell -ExecutionPolicy Bypass -File fix-jsmodule.ps1` (in `server/`).
- **Masterlist announce returns 401** → strict key auth is the default now;
  set `ADMIN_KEY`, mint a key with `POST /keys`, put it in the server's `.cfg`
  as `server_key` (or set `OPEN_ANNOUNCE=1` for a purely local setup).
- **AV flags `gtamp-server.exe`** → expected (RunPE wrapper); whitelist or
  rebuild from source.
- **Ports in use**: game 7788, masterlist 8080, website 3000, wrapper local
  services 7799/7898/7899. Only 7788/8080/3000 need to be public.

---

## UPDATE 2026-10-12 (`01ed635`) — corrections and new components

**Correction:** the table above lists `masterlist` and `website` components
(`node server.js`, `NSMwebsite.exe`). Those are **not part of this repository**
(stale notes carried over from the upstream GTAMP project). The real masterlist
in this repo is the resource below.

| Component | Build | Status |
|---|---|---|
| `server/resources/nsm-masterlist` | none (plain JS resource, Node http) | verified live in-sandbox (curl: /servers, ping, leave, announce merge, CORS) |
| `client-new/discord_rpc.dll` (Steam-presence wrapper) | `x86_64-w64-mingw32-gcc -shared -O2 -o discord_rpc.dll nsm-steam-presence-source.c discord.def -ladvapi32` (run in `client-new/`) | built + verified on a real Windows machine; the real library ships renamed as `discord_rpc_real.dll` |
| Client bundle rebuild | `cd server/resources/fivem-compat && npm install --no-save esbuild && node tools/build-client-bundle.mjs --esbuild "npx --no-install esbuild"` | unchanged; build lingers 600–900 s after "done." (Lua timers) — output files are complete |
| `client-extras/CHECK-STEAM.bat` | none (self-reading PowerShell-in-batch) | diagnostic tool; writes STEAM-CHECK.txt to Desktop + Downloads and opens it |

Note: the `nsm-game.exe` launcher-shim experiment from `2025af4` was fully
reverted in `9bd5e27` — `NSM.exe` is the original untouched client binary again.

## CORRECTION 2026-10-12 (later) — masterlist/ is real; my "stale" note was wrong

The earlier update above claimed the `masterlist` and `website` rows were
"stale upstream notes". That was wrong for `masterlist/`: the component IS in
this repo (`masterlist/masterlist.exe`, `masterlist/server.js`,
`masterlist/start.bat`, `masterlist/README.md`). The earlier "does not exist"
check was fooled by the sparse checkout hiding it from the working tree.

The `nsm-masterlist` server resource added in `01ed635` was therefore a
duplicate of an existing component and has been **removed**: the server runs
no masterlist at all. Use `masterlist/masterlist.exe` (see its README:
servers announce with keys, launcher reads /servers).
