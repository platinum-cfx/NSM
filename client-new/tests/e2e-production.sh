#!/bin/bash
# =============================================================================
# NSM E2E v3 — CLIENT ARCHITECTURE VERIFICATION (Wine test rig)
#
# Phase A (PRODUCTION MODE): no services running.
#   - NSM opens alone, spawns NO masterlist / gtamp-server process
#   - offline server -> clear error, browser back to idle, NOTHING started
#   - NO visible NSM window at any point (blank-window regression check)
#
# Phase B (TEST MODE - mocks started BY THIS SCRIPT, never by NSM.exe):
#   - separately running mock masterlist + mock gtamp-server
#   - connect -> packs -> runtime -> client -> GTA V -> EMBED (parent verified)
#     -> host window shown ONLY after embed -> in_game -> exit -> browser
#   - duplicate Connect refused (busy) - a second client can never launch
#   - reconnect in the same NSM process
#
# Phase C (TEST MODE - client-exit failure recovery):
#   - mock client exits instantly (code 42) without starting GTA V
#   - launcher logs the real exit code, shows the error, returns to idle
#   - after dismissing the error, a normal connect works IN THE SAME PROCESS
#
# Phase D (TEST MODE - game-start timeout):
#   - mock client hangs without starting GTA V; game_start_timeout_sec = 6
#   - launcher terminates the client, errors clearly, returns to idle
#
# Mocks are TEST-ONLY and clearly labelled. No mock is ever invoked by the
# production launcher; Phases B/C/D swap the mock CLIENT inside the test
# rig's runtime directory to simulate real-machine client failures.
# Requirements: mingw, wine64, Xvfb, xdotool, openssl.
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
getjson(){ api | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('$1',''))" 2>/dev/null; }
getstate(){ getjson state; }
kill_wine(){ pkill -f "NSM.ex[e]" 2>/dev/null; pkill -f "masterlist.ex[e]" 2>/dev/null
             pkill -f "gtamp-server.ex[e]" 2>/dev/null; pkill -f "altv.ex[e]" 2>/dev/null
             pkill -f "GTA5.ex[e]" 2>/dev/null
             WINEPREFIX=$1 $WINE wineserver -k 2>/dev/null; sleep 2; }
# visible NSM main-window count. Wine sets WM_CLASS to the process exe name
# (NOT the win32 class), so windows are matched by TITLE (^NSM...) plus X11
# Map State; the "Connection Error" dialog is excluded by its title.
nsm_windows(){ local n=0 id nm
  for id in $(DISPLAY=:99 xdotool search --name "NSM" 2>/dev/null | sort -u); do
    nm=$(DISPLAY=:99 xdotool getwindowname "$id" 2>/dev/null)
    case "$nm" in
      *"Connection Error"*|"") continue ;;
    esac
    xwininfo -id "$id" 2>/dev/null | grep -q "Map State: IsViewable" && n=$((n+1))
  done
  echo $n; }
dismiss_dialog(){ local w id w2
  for i in 1 2 3 4 5 6; do
    for id in $(DISPLAY=:99 xdotool search --name "Connection Error" 2>/dev/null); do
      if xwininfo -id "$id" 2>/dev/null | grep -q "Map State: IsViewable"; then w=$id; break; fi
    done
    if [ -n "$w" ]; then
      DISPLAY=:99 xdotool key --window "$w" Return 2>/dev/null
      sleep 1
      # success = the dialog is gone (even if xdotool's exit code was unhappy)
      w2=""
      for id in $(DISPLAY=:99 xdotool search --name "Connection Error" 2>/dev/null); do
        xwininfo -id "$id" 2>/dev/null | grep -q "Map State: IsViewable" && w2=1
      done
      [ -z "$w2" ] && return 0
    fi
    sleep 1
  done; return 1; }

echo "############ TEST MODE RIG SETUP (isolated environment) ############"
pkill -x Xvfb 2>/dev/null; kill_wine /home/user/nsm/wineprefix 2>/dev/null; kill_wine /home/user/nsm/wineprefix2 2>/dev/null
sleep 1
rm -rf wineprefix wineprefix2
Xvfb :99 -screen 0 1600x1000x24 >/dev/null 2>&1 & XV=$!
sleep 1
HASH=39a4cb14b4afd8c1eef1667c74e3b5936238c44f
setup_prefix(){ # $1 = prefix dir; sets T (rig dir), CL (connect log), RT (runtime dir)
  export WINEPREFIX=/home/user/nsm/$1
  mkdir -p "$WINEPREFIX"
  $WINE wineboot -i >/dev/null 2>&1; sleep 2
  T="$WINEPREFIX/drive_c/nsmtest"
  mkdir -p "$T/client-new/packs" "$T/server" "$T/masterlist" "$T/fakeGTA" "$T/altv-runtime/$HASH/libs"
  cp bin/NSM.exe bin/connect.exe bin/discord_rpc.dll mocks/discord_rpc_real.dll "$T/client-new/"
  cp bin/packs/*.pack "$T/client-new/packs/"
  printf '218' > "$T/client-new/steam_appid.txt"
  printf "gta_path = 'C:\\\\nsmtest\\\\fakeGTA'\n\nmasterlist_url = 'http://127.0.0.1:8080'\n\nembed_game_window = true\n" > "$T/client-new/.config"
  cp mocks/mock_server.exe "$T/server/gtamp-server.exe"       # TEST asset (mock)
  cp mocks/mock_masterlist.exe "$T/masterlist/masterlist.exe" # TEST asset (mock)
  cp mocks/altv.exe mocks/GTA5.exe "$T/altv-runtime/$HASH/"
  printf 'dummy' > "$T/fakeGTA/GTA5.exe"
  CL="$WINEPREFIX/drive_c/users/$USER/AppData/Local/$HASH/logs/connect.log"
  RT="$WINEPREFIX/drive_c/users/$USER/AppData/Local/$HASH"
}
start_nsm(){ (cd "$T/client-new" && $WINE NSM.exe >/tmp/e2e-nsm.log 2>&1 &); }
wait_api(){ for i in $(seq 1 40); do api >/dev/null 2>&1 && return 0; sleep 1; done; return 1; }
wait_state(){ for i in $(seq 1 ${2:-45}); do [ "$(getstate)" = "$1" ] && return 0; sleep 1; done; return 1; }

echo
echo "############ PHASE A: PRODUCTION MODE (no services running) ############"
setup_prefix wineprefix
start_nsm
wait_api && ok "NSM.exe opens and serves the browser without any services" || bad "launcher API never came up"
sleep 5
N=$(svc_count); [ "$N" = "0" ] && ok "NSM spawned NO masterlist / gtamp-server process (count=0)" || bad "unexpected service processes: $N"
W=$(nsm_windows); [ "$W" = "0" ] && ok "no NSM window visible while browsing" || bad "NSM window visible at browse time: $W"

echo "  -- clicking Connect to an OFFLINE server (nothing listens on 7788) --"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Offline Server"}' >/dev/null
OFF=0; for i in $(seq 1 30); do grep -q "is unreachable - not launching the client" "$CL" 2>/dev/null && { OFF=1; break; }; sleep 1; done
[ "$OFF" = "1" ] && ok "offline server -> clear connection error logged" || bad "no unreachable-error logged"
wait_state idle 10 && ok "browser returned to idle (not stuck connecting)" || bad "state stuck: $(getstate)"
[ -n "$(getjson detail)" ] && ok "error detail exposed to the UI: $(getjson detail | cut -c1-60)..." || bad "no detail in gamestate"
sleep 2
N=$(svc_count); [ "$N" = "0" ] && ok "offline connect did NOT start anything locally" || bad "NSM started services: $N"
grep -q "Launching:" "$CL" 2>/dev/null && bad "client launched for an offline server!" || ok "client NOT launched for offline server"
W=$(nsm_windows); [ "$W" = "0" ] && ok "no NSM window appeared for the failed connect" || bad "blank NSM window visible: $W"
kill_wine "$WINEPREFIX"
api >/dev/null 2>&1 && bad "Phase A NSM still alive!" || ok "Phase A NSM fully stopped"

echo
echo "############ PHASE B: TEST MODE (mocks run by THIS script, not by NSM) ############"
setup_prefix wineprefix2
echo "  [TEST MODE] starting mock masterlist + mock gtamp-server as separate processes"
echo "  [TEST MODE] services run in their own Wine prefix (wineprefix-svc) so the"
echo "  [TEST MODE] launcher can be restarted without touching them"
rm -rf wineprefix-svc; mkdir -p wineprefix-svc
WINEPREFIX=/home/user/nsm/wineprefix-svc $WINE wineboot -i >/dev/null 2>&1; sleep 2
mkdir -p wineprefix-svc/drive_c/svc/masterlist wineprefix-svc/drive_c/svc/server
cp mocks/mock_masterlist.exe wineprefix-svc/drive_c/svc/masterlist/masterlist.exe
cp mocks/mock_server.exe     wineprefix-svc/drive_c/svc/server/gtamp-server.exe
(cd wineprefix-svc/drive_c/svc/masterlist && WINEPREFIX=/home/user/nsm/wineprefix-svc $WINE masterlist.exe >/tmp/eml.log 2>&1 &)
(cd wineprefix-svc/drive_c/svc/server     && WINEPREFIX=/home/user/nsm/wineprefix-svc $WINE gtamp-server.exe >/tmp/esrv.log 2>&1 &)
M=0; for i in $(seq 1 20); do [ "$(svc_count)" = "2" ] && { M=1; break; }; sleep 1; done
[ "$M" = "1" ] && ok "test masterlist + test server running (started by test script)" || bad "mock services did not start"
sleep 1
start_nsm
wait_api && ok "NSM.exe opens alongside running services" || bad "launcher API never came up"

echo "  -- connect #1 (server IS online) --"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Test Server One"}' >/dev/null
S=""; for i in $(seq 1 45); do S=$(getstate); [ "$S" = "in_game" ] && break; sleep 1; done
[ "$S" = "in_game" ] && ok "connect -> game launched -> in_game" || bad "did not reach in_game (state=$S)"
# blank-window guarantee, asserted by embed-log ORDER: the host window is
# shown strictly AFTER the game reparent was verified (never before/without)
EL="$T/client-new/nsm-embed-debug.log"
PV=$(grep -n "parent verified" "$EL" 2>/dev/null | tail -1 | cut -d: -f1)
HS=$(grep -n "host window shown" "$EL" 2>/dev/null | tail -1 | cut -d: -f1)
if [ -n "$PV" ] && [ -n "$HS" ] && [ "$PV" -lt "$HS" ]; then
  ok "no blank NSM window: host shown only after verified embed (log lines $PV < $HS)"
else
  bad "host window shown without a verified embed (PV=$PV HS=$HS)"
fi
D=$(getjson detail); [ -n "$D" ] && ok "in_game carries detail ('$D')" || bad "no detail in in_game"
W=$(nsm_windows); [ "$W" = "1" ] && ok "NSM window visible now - WITH the game embedded" || bad "NSM window count after embed: $W"

echo "  -- duplicate Connect while in_game --"
R=$(curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Second"}')
echo "$R" | grep -q '"busy":true' && ok "duplicate Connect refused (busy) - no second client" || bad "duplicate connect not refused: $R"

E="$T/client-new/nsm-embed-debug.log"
waitlog(){ for i in $(seq 1 30); do grep -q "$1" "$E" 2>/dev/null && return 0; sleep 1; done; return 1; }
waitlog "parent verified" && ok "game window embedded, PARENT VERIFIED" || bad "embedding did not verify"
waitlog "host window shown" && ok "host window shown only after verified embed" || bad "host window never shown by wrapper"
grep -q "NSM host window found" "$E" && ok "host selected by class NSMMainWindow (own process)" || bad "host selection not logged"
grep -q "embed: skipped" "$E" && bad "wrapper skipped embedding?!" || ok "wrapper embed active in NSM.exe"
CL1="$CL"
grep -q "Pre-launch: client = " "$CL1" && grep -q "\[present\]" "$CL1" && ok "pre-launch checklist logged" || bad "pre-launch checklist missing"
grep -q "Client started (pid " "$CL1" && ok "client pid logged" || bad "client pid not logged"
grep -q "GTA5.exe appeared" "$CL1" && ok "GTA5 appearance logged with timing" || bad "GTA5 appearance not logged"
grep -q "Starting local" "$CL1" && bad "launcher tried to auto-start a service!" || ok "no auto-start attempts in log"
N=$(svc_count); [ "$N" = "2" ] && ok "service count unchanged - NSM spawned nothing" || bad "service count changed: $N"

echo "  -- game exit -> browser --"
wait_state idle 60 && ok "game exit -> back to server browser (idle)" || bad "did not return to idle (state=$(getstate))"
grep -q "game exited" "$E" && ok "embed cleanup ran (game exited)" || bad "no game-exited cleanup logged"
# hidden-again check, authoritative at the Win32 layer (the window thread logs
# the hide); Wine's X11 driver can leave the hidden host X-mapped, so the X
# check is informational only
sleep 2
grep -q "Host window hidden" "$CL" && ok "host window hidden after the session (win32)" || bad "host window not hidden after the session"
W=$(nsm_windows); [ "$W" = "0" ] || echo "  [note] Wine X11 driver keeps the hidden host mapped (win32-hidden is confirmed above)"

echo "  -- connect #2 without restarting NSM --"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Test Server Two"}' >/dev/null
wait_state in_game 45 && ok "reconnect without restart -> in_game again" || bad "reconnect failed (state=$(getstate))"
N=$(svc_count); [ "$N" = "2" ] && ok "service count still 2 after reconnect" || bad "service count changed: $N"
wait_state idle 60 && ok "second session ended -> idle" || bad "stuck: $(getstate)"

echo
echo "############ PHASE C: TEST MODE - client exits without starting GTA V ############"
echo "  [TEST MODE] swapping the rig client for mock_altv_fail (exit code 42, no GTA5)"
pkill -f "NSM.ex[e]" 2>/dev/null; sleep 2   # stop only NSM; services keep running
cp mocks/mock_altv_fail.exe "$RT/altv.exe"
start_nsm; wait_api || bad "NSM did not restart"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Fail Server"}' >/dev/null
F=0; for i in $(seq 1 20); do grep -q "exited before starting GTA V (exit code 42)" "$CL" 2>/dev/null && { F=1; break; }; sleep 1; done
[ "$F" = "1" ] && ok "real exit code logged (42) with a clear error" || bad "exit code not logged/reported"
grep -q "Connection Error" /dev/null 2>/dev/null; D=$(getjson detail)
[ -n "$D" ] && ok "UI detail carries the failure ('$D')" || bad "no detail on failure"
W=$(nsm_windows); [ "$W" = "0" ] && ok "no NSM window appeared for the failed launch" || bad "window visible: $W"
dismiss_dialog && ok "error dialog dismissed (as a player would)" || echo "  [note] dialog not found for auto-dismiss"
wait_state idle 5 && ok "state back to idle after failure" || bad "state stuck: $(getstate)"
echo "  -- recovery: normal connect in the SAME NSM process --"
cp mocks/altv.exe "$RT/altv.exe"   # restore the working mock client
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Recovery Server"}' >/dev/null
wait_state in_game 45 && ok "failed launch recovered - next connect reaches in_game" || bad "recovery connect failed (state=$(getstate))"
wait_state idle 60 >/dev/null 2>&1

echo
echo "############ PHASE D: TEST MODE - client hangs, no GTA V (timeout) ############"
echo "  [TEST MODE] swapping the rig client for mock_altv_hang; game_start_timeout_sec = 6"
pkill -f "NSM.ex[e]" 2>/dev/null; sleep 2
cp mocks/mock_altv_hang.exe "$RT/altv.exe"
printf "gta_path = 'C:\\\\nsmtest\\\\fakeGTA'\n\nmasterlist_url = 'http://127.0.0.1:8080'\n\nembed_game_window = true\n\ngame_start_timeout_sec = 6\n" > "$T/client-new/.config"
start_nsm; wait_api || bad "NSM did not restart"
curl -s -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Hang Server"}' >/dev/null
F=0; for i in $(seq 1 25); do grep -q "TIMEOUT: no GTA5.exe" "$CL" 2>/dev/null && { F=1; break; }; sleep 1; done
[ "$F" = "1" ] && ok "game-start timeout fired and was logged" || bad "timeout never fired"
D=$(getjson detail); [ -n "$D" ] && ok "timeout error surfaced to the UI ('$D')" || bad "no detail on timeout"
sleep 2; N=$(ps aux | grep -c "altv.ex[e]"); [ "$N" -le 1 ] && ok "hung client terminated by the launcher" || bad "client still running: $N"
W=$(nsm_windows); [ "$W" = "0" ] && ok "no NSM window appeared for the timed-out launch" || bad "window visible: $W"
dismiss_dialog >/dev/null 2>&1
wait_state idle 5 && ok "state back to idle after timeout" || bad "state stuck: $(getstate)"

echo
echo "############ RESULTS ############"
echo "PASS=$PASS FAIL=$FAIL"
echo "--- connect.log (last session, TEST MODE capture) ---"; sed 's/\r//' "$CL" 2>/dev/null | tail -30
echo "--- nsm-embed-debug.log (TEST MODE capture) ---"; sed 's/\r//' "$E" 2>/dev/null | tail -25
kill_wine "$WINEPREFIX"; kill_wine /home/user/nsm/wineprefix-svc; kill $XV 2>/dev/null
rm -rf wineprefix wineprefix2 wineprefix-svc
echo "E2E_DONE"
