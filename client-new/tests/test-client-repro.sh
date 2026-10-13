#!/bin/bash
# Launch the REAL client the way the real launcher does (incl. -customui),
# inside Wine, with NSM.exe serving the UI and a mock server on 7788.
cd /var/tmp/nsmreal
export WINEDEBUG=+seh
W=/usr/lib/wine/wine64
HASH=39a4cb14b4afd8c1eef1667c74e3b5936238c44f
P=prefix

pkill -x Xvfb 2>/dev/null; pkill -x NSM.exe 2>/dev/null; pkill -x altv.exe 2>/dev/null
pkill -f mock_masterlist 2>/dev/null; pkill -f mock_server.exe 2>/dev/null; pkill -f gtamp-server 2>/dev/null
sleep 1; WINEPREFIX=/var/tmp/nsmreal/prefix wineserver -k 2>/dev/null; WINEPREFIX=/var/tmp/nsmreal/svc wineserver -k 2>/dev/null; sleep 2
Xvfb :99 -screen 0 1600x1000x24 >/dev/null 2>&1 & XV=$!
sleep 1
export DISPLAY=:99

# --- services prefix (TEST MODE, started by this script only) ---
S=svc
rm -rf $S; mkdir -p $S/drive_c/svc/masterlist $S/drive_c/svc/server
WINEPREFIX=/var/tmp/nsmreal/$S $W wineboot -i >/dev/null 2>&1; sleep 2
cp /home/user/nsm/mocks/mock_masterlist.exe $S/drive_c/svc/masterlist/masterlist.exe
cp /home/user/nsm/mocks/mock_server.exe     $S/drive_c/svc/server/gtamp-server.exe
(cd $S/drive_c/svc/masterlist && WINEPREFIX=/var/tmp/nsmreal/$S $W masterlist.exe >/tmp/rr-ml.log 2>&1 &)
(cd $S/drive_c/svc/server     && WINEPREFIX=/var/tmp/nsmreal/$S $W gtamp-server.exe >/tmp/rr-srv.log 2>&1 &)
sleep 5

# --- launcher rig inside the SAME prefix as the extracted runtime ---
TD="$P/drive_c/users/user/AppData/Local/$HASH"
mkdir -p "$TD"
cp -r prefix/drive_c/rt/. "$TD/"          # pre-verified real runtime
RIG="$P/drive_c/nsmtest/rig/client-new"
mkdir -p "$RIG/packs" "$P/drive_c/nsmtest/rig/altv-runtime/$HASH" "$P/drive_c/nsmtest/rig/fakeGTA"
cp /home/user/nsm/bin/NSM.exe /home/user/nsm/bin/connect.exe /home/user/nsm/bin/discord_rpc.dll /home/user/nsm/mocks/discord_rpc_real.dll "$RIG/"
cp mp*.pack "$RIG/packs/"
printf 'dummy' > "$P/drive_c/nsmtest/rig/fakeGTA/GTA5.exe"
printf '218' > "$RIG/steam_appid.txt"
printf "gta_path = 'C:\\\\nsmtest\\\\rig\\\\fakeGTA'\n\nmasterlist_url = 'http://127.0.0.1:8080'\n\nembed_game_window = true\n\ngame_start_timeout_sec = 45\n" > "$RIG/.config"

# --- start NSM and Connect ---
export WINEPREFIX=/var/tmp/nsmreal/$P
( cd "$RIG" && $W NSM.exe > /tmp/rr-nsm.log 2>&1 &)
for i in $(seq 1 40); do curl -s -m 2 http://127.0.0.1:9987/api/gamestate >/dev/null 2>&1 && break; sleep 1; done
echo "=== preflight (packfix5) ==="
curl -s -m 3 http://127.0.0.1:9987/api/preflight; echo
echo "=== UI badge present? ==="
curl -s -m 3 http://127.0.0.1:9987/ | grep -c "gtaBadge\|refreshPreflight"
echo "API: $(curl -s -m 2 http://127.0.0.1:9987/api/gamestate)"
curl -s -m 3 -X POST http://127.0.0.1:9987/api/connect -H "Content-Type: application/json" -d '{"host":"127.0.0.1","port":"7788","name":"Repro"}'
echo
# watch the client for 120s
for i in $(seq 1 24); do
  sleep 5
  ST=$(curl -s -m 2 http://127.0.0.1:9987/api/gamestate | grep -o '"state":"[^"]*"' | cut -d'"' -f4)
  ALT=$(pgrep -c -x altv.exe 2>/dev/null || echo 0)
  echo "[t=$((i*5))s] state=$ST altv_procs=$ALT"
  [ "$ALT" = "0" ] && [ "$i" -gt 2 ] && break
done
echo "=== altv alive at end? ==="
pgrep -a -x altv.exe | head -2 || echo "altv.exe NOT running"
echo "=== client's own log ==="
LATEST=$(ls -t "$TD/logs/"launcher_*.log 2>/dev/null | head -1)
echo "log: $LATEST"
sed 's/\r//' "$LATEST" 2>/dev/null | tail -25
echo "=== NSM connect.log tail ==="
sed 's/\r//' "$TD/logs/connect.log" 2>/dev/null | grep -vE "pack check|candidate" | tail -12
echo "=== wine seh errors (from NSM+client stderr) ==="
grep -m 6 -iE "unhandled|page fault|SIGSEGV|Backtrace" /tmp/rr-nsm.log | head -6
echo REPRO_DONE
