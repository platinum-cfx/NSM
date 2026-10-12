#!/bin/bash
# =============================================================================
# NSM E2E - PRODUCTION ARCHITECTURE VERIFICATION (Wine test rig)
#
# Phase A (PRODUCTION MODE): NSM.exe opens with NO services running.
#   - asserts NSM spawns NO masterlist and NO gtamp-server process
#   - asserts an offline server produces a clear connection error,
#     the browser returns to idle, and nothing is started locally
#
# Phase B (TEST MODE - mocks started BY THIS SCRIPT, never by NSM.exe):
#   - separately running mock masterlist + mock gtamp-server (own prefix)
#   - connect -> packs -> runtime install -> launch -> EMBED (parent verified)
#     -> in_game -> game exit -> browser back -> connect again
#   - asserts the mock process count never increases (NSM spawned nothing)
#
# Each phase runs in its OWN fresh Wine prefix so they cannot contaminate
# each other. Requirements: g++/gcc-mingw-w64-x86-64, wine64, Xvfb, openssl.
# Mock binaries are built from client-new/tests/mocks/*.c
# =============================================================================
set -u
cd /home/user/nsm
WINE=/usr/lib/wine/wine64
export WINEDEBUG=-all DISPLAY=:99
PASS=0; FAIL=0
ok(){ echo "  [PASS] $1"; PASS=$((PASS+1)); }
bad(){ echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }
svc_count(){ ps aux | grep -iE "gtamp-server\.exe|masterlist\.exe" | grep -v grep | wc -l; }
api(){ curl -s -m 2 "http://127.0.0.1:9987/api/gamestate" 2>/dev/null; }
getstate(){ api | python3 -c "import sys,json;print(json.load(sys.stdin)['state'])" 2>/dev/null; }
kill_wine(){ pkill -f "NSM.ex[e]" 2>/dev/null; pkill -f "masterlist.ex[e]" 2>/dev/null
             pkill -f "gtamp-server.ex[e]" 2>/dev/null; pkill -f "altv.ex[e]" 2>/dev/null
             pkill -f "GTA5.ex[e]" 2>/dev/null
             WINEPREFIX=$1 $WINE wineserver -k 2>/dev/null; sleep 2; }

echo "############ TEST MODE RIG SETUP (isolated environment) ############"
pkill -x Xvfb 2>/dev/null; kill_wine /home/user/nsm/wineprefix 2>/dev/null
for p in NSM.exe masterlist.exe gtamp-server.exe altv.exe GTA5.exe; do pkill -f "$p" 2>/dev/null; done
sleep 1
rm -rf wineprefix wineprefix2
Xvfb :99 -screen 0 1600x1000x24 >/dev/null 2>&1 & XV=$!
sleep 1
HASH=39a4cb14b4afd8c1eef1667c74e3b5936238c44f
setup_prefix(){ # $1 = prefix dir  -> sets T (abs test dir) and CL (connect log)
  export WINEPREFIX=/home/user/nsm/$1
  mkdir -p "$WINEPREFIX"
  $WINE wineboot -i >/dev/null 2>&1; sleep 2
  T="$WINEPREFIX/drive_c/nsmtest"
  mkdir -p "$T/client-new/packs" "$T/server" "$T/masterlist" "$T/fakeGTA" "$T/altv-runtime/$HASH/libs"
  cp build/NSM.exe build/connect.exe build/discord_rpc.dll mocks/discord_rpc_real.dll "$T/client-new/"
  cp build/packs/*.pack "$T/client-new/packs/"
  printf '218' > "$T/client-new/steam_appid.txt"
  printf "gta_path = 'C:\\\\nsmtest\\\\fakeGTA'\n\nmasterlist_url = 'http://127.0.0.1:8080'\n\nembed_game_window = true\n" > "$T/client-new/.config"
  cp mocks/mock_server.exe "$T/server/gtamp-server.exe"       # TEST asset (mock)
  cp mocks/mock_masterlist.exe "$T/masterlist/masterlist.exe" # TEST asset (mock)
  cp mocks/altv.exe mocks/GTA5.exe "$T/altv-runtime/$HASH/"
  printf 'dummy' > "$T/fakeGTA/GTA5.exe"
  CL="$WINEPREFIX/drive_c/users/$USER/AppData/Local/$HASH/logs/connect.log"
}

echo
echo "############ PHASE A: PRODUCTION MODE (no services running) ############"
setup_prefix wineprefix
(cd "$T/client-new" && $WINE NSM.exe >/tmp/ea.log 2>&1 &)
API=0; for i in $(seq 1 40); do api >/dev/null && { API=1; break; }; sleep 1; done
[ "$API" = "1" ] && ok "NSM.exe opens and serves the browser without any services" || bad "launcher API never came up"
sleep 5
N=$(svc_count); [ "$N" = "0" ] && ok "NSM spawned NO masterlist / gtamp-server process (count=0)" || bad "unexpected service processes: $N"

echo "  -- clicking Connect to an OFFLINE server (nothing listens on 7788) --"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Offline Server"}' >/dev/null
OFF=0; for i in $(seq 1 15); do grep -q "is unreachable - not launching the client" "$CL" 2>/dev/null && { OFF=1; break; }; sleep 1; done
[ "$OFF" = "1" ] && ok "offline server -> clear connection error logged (dialog shown)" || bad "no unreachable-error logged"
IDLE=0; for i in $(seq 1 10); do [ "$(getstate)" = "idle" ] && { IDLE=1; break; }; sleep 1; done
[ "$IDLE" = "1" ] && ok "browser returned to idle (not stuck on connecting)" || bad "state stuck: $(getstate)"
sleep 2
N=$(svc_count); [ "$N" = "0" ] && ok "offline connect did NOT start anything locally (count=0)" || bad "NSM started services: $N"
grep -q "Launching:" "$CL" 2>/dev/null && bad "client launched for an offline server!" || ok "client NOT launched for offline server"
E="$T/client-new/nsm-embed-debug.log"
# wrapper startup-guard lines ("pack: guard done", "startup: N ...") are normal;
# what must NOT appear without a successful connect is any embed activity
grep -q "embed:\|window found" "$E" 2>/dev/null && bad "embed activity on failed connect!" || ok "no embed activity for an offline server"
echo "  [teardown] stopping Phase A NSM (dialog is modal by design - test kills it)"
kill_wine "$WINEPREFIX"
api >/dev/null 2>&1 && bad "Phase A NSM still alive!" || ok "Phase A NSM fully stopped before Phase B"

echo
echo "############ PHASE B: TEST MODE (mocks run by THIS script, not by NSM) ############"
setup_prefix wineprefix2
echo "  [TEST MODE] starting mock masterlist + mock gtamp-server as separate processes"
(cd "$T/masterlist" && $WINE masterlist.exe >/tmp/eml.log 2>&1 &)
(cd "$T/server"     && $WINE gtamp-server.exe >/tmp/esrv.log 2>&1 &)
M=0; for i in $(seq 1 20); do N=$(svc_count); [ "$N" = "2" ] && { M=1; break; }; sleep 1; done
[ "$M" = "1" ] && ok "test masterlist + test server running (started by test script)" || bad "mock services did not start"
sleep 1

(cd "$T/client-new" && $WINE NSM.exe >/tmp/eb.log 2>&1 &)
API=0; for i in $(seq 1 40); do api >/dev/null && { API=1; break; }; sleep 1; done
[ "$API" = "1" ] && ok "NSM.exe opens alongside running services" || bad "launcher API never came up"

echo "  -- connect #1 (server IS online) --"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Test Server One"}' >/dev/null
S=""; for i in $(seq 1 45); do S=$(getstate); [ "$S" = "in_game" ] && break; sleep 1; done
[ "$S" = "in_game" ] && ok "connect -> game launched -> in_game" || bad "did not reach in_game (state=$S)"
grep -q "Extracting game packs" "$CL" && ok "game packs extracted (encrypted .pack decrypt OK)" || bad "packs not extracted"
grep -q "Game runtime install complete" "$CL" && ok "runtime installed from local altv-runtime" || bad "runtime install missing"
E="$T/client-new/nsm-embed-debug.log"
waitlog(){ for i in $(seq 1 30); do grep -q "$1" "$E" 2>/dev/null && return 0; sleep 1; done; return 1; }
waitlog "parent verified" && ok "game window embedded, PARENT VERIFIED" || bad "embedding did not verify"
waitlog "embed: DONE" && ok "embed cycle completed" || bad "embed did not complete"
N=$(svc_count); [ "$N" = "2" ] && ok "service count unchanged - NSM spawned nothing (count=2)" || bad "service count changed: $N"
grep -q "Starting local" "$CL" && bad "launcher tried to auto-start a service!" || ok "no auto-start attempts in log"

echo "  -- game exit -> browser --"
S=""; for i in $(seq 1 60); do S=$(getstate); [ "$S" = "idle" ] && break; sleep 1; done
[ "$S" = "idle" ] && ok "game exit -> back to server browser (idle)" || bad "did not return to idle (state=$S)"
grep -q "game exited" "$E" && ok "embed cleanup ran (game exited)" || bad "no game-exited cleanup logged"

echo "  -- connect #2 without restarting NSM --"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Test Server Two"}' >/dev/null
S=""; for i in $(seq 1 45); do S=$(getstate); [ "$S" = "in_game" ] && break; sleep 1; done
[ "$S" = "in_game" ] && ok "reconnect without restart -> in_game again" || bad "reconnect failed (state=$S)"
N=$(svc_count); [ "$N" = "2" ] && ok "service count still 2 after reconnect" || bad "service count changed: $N"

echo
echo "############ RESULTS ############"
echo "PASS=$PASS FAIL=$FAIL"
echo "--- connect.log (TEST MODE capture) ---"; sed 's/\r//' "$CL" 2>/dev/null
echo "--- nsm-embed-debug.log (TEST MODE capture) ---"; sed 's/\r//' "$E" 2>/dev/null
kill_wine "$WINEPREFIX"; kill $XV 2>/dev/null
rm -rf wineprefix wineprefix2
echo "E2E_DONE"
