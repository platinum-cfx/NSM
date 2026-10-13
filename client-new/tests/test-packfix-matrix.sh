#!/bin/bash
# =============================================================================
# packfix scenario matrix - TEST MODE (round 2)
# Exercises the rewritten pack resolution in EnsureGameFilesReady against the
# real launcher binary. Mock masterlist + mock gtamp-server are started BY
# THIS SCRIPT as separate processes (never by NSM.exe). Dummy packs use the
# TEST extractor (mocks/mp_ext.dll); scenario 6 uses the REAL packs from the
# repo (stub mp1 + real mp2-7) plus the guard-downloaded FIXED full pack to
# prove the stub/libce2 flow end to end.
# =============================================================================
cd /home/user/nsm
export WINEDEBUG=-all
W=/usr/lib/wine/wine64
PASS=0; FAIL=0
ok(){ echo "  [PASS] $1"; PASS=$((PASS+1)); }
bad(){ echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }
HASH=39a4cb14b4afd8c1eef1667c74e3b5936238c44f
MLOG=/home/user/nsm/matrix-logs
mkdir -p "$MLOG"

pkill -x Xvfb 2>/dev/null; sleep 1
Xvfb :99 -screen 0 1600x1000x24 >/dev/null 2>&1 &
XV=$!
sleep 1
export DISPLAY=:99

S=mx-svc
rm -rf $S; mkdir -p $S/drive_c/svc/masterlist $S/drive_c/svc/server
WINEPREFIX=/home/user/nsm/$S $W wineboot -i >/dev/null 2>&1; sleep 2
cp mocks/mock_masterlist.exe $S/drive_c/svc/masterlist/masterlist.exe
cp mocks/mock_server.exe     $S/drive_c/svc/server/gtamp-server.exe
(cd $S/drive_c/svc/masterlist && WINEPREFIX=/home/user/nsm/$S $W masterlist.exe >/tmp/mx-ml.log 2>&1 &)
(cd $S/drive_c/svc/server     && WINEPREFIX=/home/user/nsm/$S $W gtamp-server.exe >/tmp/mx-srv.log 2>&1 &)
sleep 6

api(){ curl -s -m 3 http://127.0.0.1:9987/api/gamestate 2>/dev/null; }
connect(){ curl -s -m 3 -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d "{\"host\":\"127.0.0.1\",\"port\":\"7788\",\"name\":\"Matrix Test\"}" >/dev/null; }
getstate(){ api | grep -o '"state":"[^"]*"' | cut -d'"' -f4; }
wait_state(){ for i in $(seq 1 "${2:-60}"); do [ "$(getstate)" = "$1" ] && return 0; sleep 1; done; return 1; }
wait_api(){ for i in $(seq 1 40); do api >/dev/null 2>&1 && return 0; sleep 1; done; return 1; }

dismiss_dialog(){
  local seen=0
  for i in $(seq 1 15); do
    WID=$(xdotool search --onlyvisible --name "$1" 2>/dev/null | head -1)
    if [ -n "$WID" ]; then
      seen=1
      xdotool key --window "$WID" Return >/dev/null 2>&1
      sleep 1
      break
    fi
    sleep 1
  done
  [ "$seen" = "1" ]
}

cleanup_nsm(){
  pkill -x NSM.exe 2>/dev/null; pkill -x altv.exe 2>/dev/null; pkill -x GTA5.exe 2>/dev/null
  sleep 1
  WINEPREFIX=/home/user/nsm/$1 $W wineserver -k >/dev/null 2>&1
  sleep 1
  rm -rf "$1"
}

setup_rig(){ # $1=prefix $2=layout(root|client|parent) $3=name; echoes rig root
  local P="$1" LAY="$2" NAME="$3"
  rm -rf "$P"; mkdir -p "$P"
  WINEPREFIX=/home/user/nsm/$P $W wineboot -i >/dev/null 2>&1
  sleep 2
  local T="$P/drive_c/nsmtest/$NAME"
  local EXED="$T"; [ "$LAY" = "client" ] || [ "$LAY" = "parent" ] && EXED="$T/client-new"
  local PACKD="$T/packs"; [ "$LAY" = "client" ] && PACKD="$T/client-new/packs"
  mkdir -p "$EXED" "$PACKD" "$T/altv-runtime/$HASH" "$T/fakeGTA"
  cp bin/NSM.exe bin/connect.exe bin/discord_rpc.dll mocks/discord_rpc_real.dll "$EXED/"
  cp mocks/altv.exe mocks/GTA5.exe "$T/altv-runtime/$HASH/"
  printf 'dummy' > "$T/fakeGTA/GTA5.exe"
  printf '218' > "$EXED/steam_appid.txt"
  printf "gta_path = 'C:\\\\nsmtest\\\\$NAME\\\\fakeGTA'\n\nmasterlist_url = 'http://127.0.0.1:8080'\n\nembed_game_window = true\n" > "$EXED/.config"
  echo "$T"
}

start_nsm(){ ( cd "$1/$2" && WINEPREFIX=/home/user/nsm/$1 $W NSM.exe >/tmp/mx-nsm.log 2>&1 &); }

echo "############ SCENARIO 1: layout A - exe + packs at the NSM root ############"
P=mx-p1; T=$(setup_rig $P root layoutA)
cp testpacks/*.pack "$T/packs/"
CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
start_nsm $P "drive_c/nsmtest/layoutA"
wait_api && ok "S1: launcher API up (exe at NSM root)" || bad "S1: API never came up"
connect
if wait_state in_game 90; then ok "S1: full Connect -> in_game (packs from root\packs)"; else bad "S1: never reached in_game (state=$(getstate))"; fi
grep -q "NSM build:" "$CL" 2>/dev/null && ok "S1: build id logged" || bad "S1: build id missing"
grep -q "Selected pack directory: C:\\\\nsmtest\\\\layoutA\\\\packs" "$CL" 2>/dev/null && ok "S1: log names selected pack dir" || bad "S1: selected-dir log line missing"
grep -q "Post-extraction verification passed" "$CL" 2>/dev/null && ok "S1: post-extraction verification passed" || bad "S1: verification line missing"
grep -q "NSM.exe path = C:\\\\nsmtest\\\\layoutA\\\\NSM.exe" "$CL" 2>/dev/null && ok "S1: exe path logged" || bad "S1: exe path log line missing"
cp "$CL" "$MLOG/s1-connect.log" 2>/dev/null
cleanup_nsm $P

echo "############ SCENARIO 2: layout B (shipped ZIP layout) - exe + packs in client-new ############"
P=mx-p2; T=$(setup_rig $P client layoutB)
cp testpacks/*.pack "$T/client-new/packs/"
CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
start_nsm $P "drive_c/nsmtest/layoutB/client-new"
wait_api && ok "S2: launcher API up (exe in client-new)" || bad "S2: API never came up"
connect
if wait_state in_game 90; then ok "S2: full Connect -> in_game (packs from client-new\packs)"; else bad "S2: never reached in_game (state=$(getstate))"; fi
grep -q "Selected pack directory: C:\\\\nsmtest\\\\layoutB\\\\client-new\\\\packs" "$CL" 2>/dev/null && ok "S2: log names selected pack dir" || bad "S2: selected-dir log line missing"
grep -q "Post-extraction verification passed" "$CL" 2>/dev/null && ok "S2: post-extraction verification passed" || bad "S2: verification line missing"
cp "$CL" "$MLOG/s2-connect.log" 2>/dev/null
cleanup_nsm $P

echo "############ SCENARIO 3: parent fallback - exe in client-new, packs at the NSM root ############"
P=mx-p3; T=$(setup_rig $P parent layoutP)
cp testpacks/*.pack "$T/packs/"
CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
start_nsm $P "drive_c/nsmtest/layoutP/client-new"
wait_api && ok "S3: launcher API up" || bad "S3: API never came up"
connect
if wait_state in_game 90; then ok "S3: full Connect -> in_game (packs found via PARENT folder fallback)"; else bad "S3: never reached in_game (state=$(getstate))"; fi
grep -q "Selected pack directory: C:\\\\nsmtest\\\\layoutP\\\\packs" "$CL" 2>/dev/null && ok "S3: log names the PARENT pack dir" || bad "S3: selected-dir log line missing"
cp "$CL" "$MLOG/s3-connect.log" 2>/dev/null
cleanup_nsm $P

echo "############ SCENARIO 4: missing pack - mp4.pack absent (error must name mp4, not mp1) ############"
P=mx-p4; T=$(setup_rig $P client layoutM)
cp testpacks/*.pack "$T/client-new/packs/"
rm -f "$T/client-new/packs/mp4.pack"
CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
start_nsm $P "drive_c/nsmtest/layoutM/client-new"
wait_api && ok "S4: launcher API up" || bad "S4: API never came up"
connect
sleep 3
if dismiss_dialog "NSM - Game Files Error"; then ok "S4: error dialog shown"; else bad "S4: error dialog NOT shown"; fi
if wait_state idle 30; then ok "S4: state recovered to idle after the error"; else bad "S4: state stuck at $(getstate)"; fi
grep -q "mp4.pack : NOT FOUND (Windows error 2" "$CL" 2>/dev/null && ok "S4: log names mp4.pack NOT FOUND with error code" || bad "S4: mp4 NOT FOUND log line missing"
grep -q "candidate .*packs : 6/7 packs present" "$CL" 2>/dev/null && ok "S4: honest 6/7 candidate count logged" || bad "S4: 6/7 count missing"
grep -q "Game files preparation FAILED: Game packs incomplete" "$CL" 2>/dev/null && ok "S4: failure reason logged (incomplete folder)" || bad "S4: failure reason line missing"
grep -q "only 6 of the 7 pack files were found" "$CL" 2>/dev/null && ok "S4: dialog text names the 6/7 reality" || bad "S4: 6/7 dialog text missing from log"
grep -qi "folder .*contains" "$CL" 2>/dev/null && ok "S4: folder listing logged" || bad "S4: folder listing missing"
cp "$CL" "$MLOG/s4-connect.log" 2>/dev/null
cleanup_nsm $P

echo "############ SCENARIO 5a: corrupt pack - mp2.pack is random bytes (garbage DLL -> load failure) ############"
P=mx-p5a; T=$(setup_rig $P client layoutC)
cp testpacks/*.pack "$T/client-new/packs/"
head -c 500000 /dev/urandom > "$T/client-new/packs/mp2.pack"
printf '\x00%.0s' {1..16} >> "$T/client-new/packs/mp2.pack"
CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
start_nsm $P "drive_c/nsmtest/layoutC/client-new"
wait_api && ok "S5a: launcher API up" || bad "S5a: API never came up"
connect
sleep 3
if dismiss_dialog "NSM - Game Files Error"; then ok "S5a: error dialog shown"; else bad "S5a: error dialog NOT shown"; fi
if wait_state idle 30; then ok "S5a: state recovered to idle after the error"; else bad "S5a: state stuck at $(getstate)"; fi
grep -q "extractor DLL for mp2.pack did not load (Windows error" "$CL" 2>/dev/null && ok "S5a: log names mp2 extractor load failure" || bad "S5a: mp2 load-failure line missing"
grep -q "Pack file: C:.*layoutC.*mp2.pack" "$CL" 2>/dev/null && ok "S5a: absolute pack path in log" || bad "S5a: pack path missing"
grep -q "pack check: C:.*layoutC.*mp2.pack : present" "$CL" 2>/dev/null && ok "S5a: mp2 probed present before extraction" || bad "S5a: mp2 probe line missing"
if grep -q "mp1.pack could not be decrypted\|mp1.pack did not load" "$CL" 2>/dev/null; then bad "S5a: mp1 wrongly blamed"; else ok "S5a: mp1 not blamed"; fi
cp "$CL" "$MLOG/s5a-connect.log" 2>/dev/null
cleanup_nsm $P

echo "############ SCENARIO 5b: truncated pack - mp2.pack cut to a non-block size (decrypt failure) ############"
P=mx-p5b; T=$(setup_rig $P client layoutT)
cp testpacks/*.pack "$T/client-new/packs/"
head -c 500003 testpacks/mp2.pack > "$T/client-new/packs/mp2.pack"
CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
start_nsm $P "drive_c/nsmtest/layoutT/client-new"
wait_api && ok "S5b: launcher API up" || bad "S5b: API never came up"
connect
sleep 3
if dismiss_dialog "NSM - Game Files Error"; then ok "S5b: error dialog shown"; else bad "S5b: error dialog NOT shown"; fi
if wait_state idle 30; then ok "S5b: state recovered to idle after the error"; else bad "S5b: state stuck at $(getstate)"; fi
grep -q "FAILED: mp2.pack could not be decrypted: decryption failed - the encrypted data length is not a multiple of 16" "$CL" 2>/dev/null && ok "S5b: honest truncated-pack decrypt error" || bad "S5b: truncation error line missing"
cp "$CL" "$MLOG/s5b-connect.log" 2>/dev/null
cleanup_nsm $P

echo "############ SCENARIO 6: REAL packs - stub mp1 + real mp2-7 + guard-replaced FIXED mp1 ############"
if [ -f /var/tmp/realpacks/mp1.pack ] && [ -f /var/tmp/realpacks/mp7.pack ]; then
  P=mx-p6; T=$(setup_rig $P client layoutS)
  cp /var/tmp/realpacks/*.pack "$T/client-new/packs/"
  CL="$P/drive_c/users/user/AppData/Local/$HASH/logs/connect.log"
  EMB="$T/client-new/nsm-embed-debug.log"
  start_nsm $P "drive_c/nsmtest/layoutS/client-new"
  wait_api && ok "S6: launcher API up (real packs)" || bad "S6: API never came up"
  connect   # Connect #1 immediately: mp1 is still the stub
  sleep 4
  if dismiss_dialog "NSM - Game Files Error"; then ok "S6: stub warning dialog shown after Connect #1"; else bad "S6: stub dialog NOT shown (check race)"; fi
  if wait_state idle 30; then ok "S6: state recovered to idle"; else bad "S6: state stuck at $(getstate)"; fi
  grep -q "STUB - cannot provide libs" "$CL" 2>/dev/null && ok "S6: mp1 STUB flagged during selection" || bad "S6: STUB flag line missing"
  grep -q "pack mp1.pack SKIPPED: it is the small stub" "$CL" 2>/dev/null && ok "S6: stub skipped (no hopeless decrypt)" || bad "S6: stub skip line missing"
  grep -q "libce2.dll is unavailable - mp1.pack is the STUB" "$CL" 2>/dev/null && ok "S6: honest libce2/stub verification failure logged" || bad "S6: stub verification line missing"
  echo "  (waiting for the guard to download the FIXED full mp1.pack...)"
  UPG=0
  for i in $(seq 1 120); do
    [ "$(stat -c %s "$T/client-new/packs/mp1.pack" 2>/dev/null)" = "228682672" ] && { UPG=1; break; }
    sleep 3
  done
  [ "$UPG" = "1" ] && ok "S6: guard replaced mp1.pack with the FIXED full pack (228,682,672 B)" || bad "S6: guard never upgraded mp1.pack (size=$(stat -c %s "$T/client-new/packs/mp1.pack" 2>/dev/null))"
  connect   # Connect #2 with the FIXED full pack
  echo "  (extracting all real packs incl. the fixed mp1 - this takes a while)"
  OK2=0
  for i in $(seq 1 150); do
    grep -qE "Game files verified and ready|Post-extraction verification passed" "$CL" 2>/dev/null && { OK2=1; break; }
    sleep 3
  done
  [ "$OK2" = "1" ] && ok "S6: Connect #2 verifies game files with the FIXED mp1.pack" || bad "S6: Connect #2 never verified"
  grep -q "pack mp1.pack extracted OK" "$CL" 2>/dev/null && ok "S6: fixed mp1.pack extracted OK" || bad "S6: mp1 extract line missing"
  LCE=$(stat -c %s "$P/drive_c/users/user/AppData/Local/$HASH/libs/libce2.dll" 2>/dev/null)
  [ "$LCE" = "226394112" ] && ok "S6: real libs\\libce2.dll present at exactly 226,394,112 B" || bad "S6: libce2.dll size is $LCE (expected 226394112)"
  pkill -x NSM.exe 2>/dev/null   # stop before the real client launch (out of scenario scope)
  sleep 1
  cp "$CL" "$MLOG/s6-connect.log" 2>/dev/null
  cp "$EMB" "$MLOG/s6-embed.log" 2>/dev/null
  cleanup_nsm $P
else
  echo "  [SKIP] S6: /var/tmp/realpacks not present"
  bad "S6: real-pack scenario not run"
fi

kill $XV 2>/dev/null
pkill -x masterlist.exe 2>/dev/null; pkill -x gtamp-server.exe 2>/dev/null
WINEPREFIX=/home/user/nsm/$S $W wineserver -k >/dev/null 2>&1
sleep 1; rm -rf $S
echo
echo "MATRIX DONE: PASS=$PASS FAIL=$FAIL (logs in $MLOG)"
