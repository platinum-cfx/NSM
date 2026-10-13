# NSM Test Suite

## e2e-production.sh — two-phase end-to-end verification (Wine rig)

This is the as-run script from the verification rig (paths refer to the rig
layout: `build/` holds freshly compiled NSM.exe/connect.exe/discord_rpc.dll,
`build/packs/` holds encrypted stub packs, `mocks/` holds compiled mocks).

### Phase A — PRODUCTION MODE (no services running)
Proves the launcher is a pure client:
- NSM.exe opens and serves the browser UI with nothing else running
- it spawns NO masterlist and NO gtamp-server process (count asserted = 0)
- clicking Connect on an OFFLINE server logs a clear
  "Server X:port is unreachable - not launching the client." error,
  shows a Connection Error dialog, returns the browser to `idle`,
  starts nothing locally and launches no client

### Phase B — TEST MODE (mocks started BY THIS SCRIPT, never by NSM)
The script starts a mock masterlist and a mock gtamp-server as separate
processes, clearly labeled TEST MODE. Against them the full player flow is
asserted: connect -> encrypted pack extraction -> runtime install ->
launch -> single-window embed (SetParent + WS_CHILD PARENT VERIFIED) ->
in_game -> game exit -> back to browser -> connect again without restart.
The mock service count must never increase (NSM spawns nothing) and the
launcher log must contain no auto-start attempts.

### mocks/ (TEST ONLY)
- `mock_listener.c` — dual-mode TCP listener (used as mock masterlist and
  mock gtamp-server)
- `mock_altv.c` — mock altv.exe client stub
- `mock_gta5.c` — mock GTA5.exe with a real `grcWindow`-class window,
  PeekMessage loop, self-exits after ~22s (safe when embedded headless)
- `mock_altv_fail.c` — mock client that exits immediately with code 42
- `mock_altv_hang.c` — mock client that stays alive without starting GTA V
- `mock_discord_real.c` — mock Discord RPC forwarder

Build (mingw): `x86_64-w64-mingw32-gcc -O2 -mwindows -static -o <name>.exe <name>.c`
Mock GTA5/altv are placed into the test rig's `altv-runtime/<hash>/` dir.

**These mocks are test assets only. The production launcher never builds,
starts, or references them.**
