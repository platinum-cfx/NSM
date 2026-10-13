# NSM Launch-Failure Audit — Process & Window Ownership Map

> Audit date: 2026-10-13, against the merged `main` (`633deba4`) sources.
> Every claim cites a file and line. Written before the fix; the fix is
> described at the end.

## 1. What starts when `NSM.exe` is opened (current build)

| Step | What happens | Evidence |
|---|---|---|
| 1 | `CheckAlreadyRunning()` kills other NSM/connect instances; if altv.exe / GTA5.exe / altv-webengine.exe exist, asks to close them | connect.cpp:317-342 |
| 2 | Log dir `%LOCALAPPDATA%\<sha1("gtamp")>\logs` created; `connect.log` starts | connect.cpp:970-976 |
| 3 | Silent GTA detection (registry/Steam/vdf/drives; **never prompts** at startup) | connect.cpp:979, 565-707 |
| 4 | `StartLauncherServer()` binds 127.0.0.1:9987 (up to +30), serves the browser UI, and **opens the UI in an external Edge/Chrome `--app` window** (`OpenInAppWindow`) | browser_server.h:376-703, 204-224, 695 |
| 5 | A **second, hidden** native window `NSMMainWindow` is created on its own thread (class `NSMMainWindow`, 1280x820, **no content ever drawn**) | connect.cpp:989, 868-894 |
| 6 | `discord_rpc.dll` (our wrapper) is loaded **into NSM.exe** and `InitDiscordRPC` called → its `embed_thread` starts **inside NSM.exe**, snapshots existing GTA5 PIDs, polls for new GTA5.exe processes | connect.cpp:991-998; nsm-steam-presence-source.c:317-349 |

**So two windows/process-groups exist before any click**: the browser (an
external `msedge.exe`/`chrome.exe` app window) and a hidden, empty
`NSMMainWindow`.

## 2. What owns the working GTAMP server browser

The **external browser process** (Edge/Chrome `--app=http://127.0.0.1:9987/`)
renders `client-new/launcher/index.html`. It fetches `/api/config` from the
launcher, then the server list **directly from the configured masterlist**
(`cfg.masterlistUrl + '/servers'`, CORS), and POSTs `/api/connect` to the
launcher (index.html:1684-1716, 2203-2230). NSM.exe only owns the HTTP API
(9987/9988/9989) — it does not render the browser UI itself.

## 3. What happens when Connect is clicked (current build)

1. UI `connect()` → `POST /api/connect {host,port,name}` → state
   `connecting`, `hasConnectPending=true` (browser_server.h:471-491). The UI
   shows its **connecting modal** and polls `/api/gamestate` every second
   (index.html:2178-2230).
2. Session loop wakes (`WaitForConnect`), parses host/port, rebuilds
   `-connecturl altv://connect/<host>:<port>` (connect.cpp:1021-1034).
3. **Reachability check** (added in the architecture correction): TCP connect
   to the server; failure → log + dialog + back to `idle` (connect.cpp:1040-1056).
4. GTA path validation (prompts with folder picker only here) (connect.cpp:1060).
5. `EnsureGameFilesReady`: verifies the extracted runtime in
   `%LOCALAPPDATA%\<sha1("gtamp")>` against `g_Manifest`, else extracts the
   encrypted `mp1..mp7.pack` (connect.cpp:710-779).
6. `EnsureRuntimeInstalled`: if `altv.exe` missing, copies the first
   `altv-runtime\<hash>\` folder found next to the launcher (add-only)
   (connect.cpp:842-866). **Failures are silent** (log line only).
7. `proxy.dll` loaded **into NSM.exe** (`StartProxyAsync`); `config.dll`
   loaded, `GenerateConfig` writes the client config. **Both failures are
   completely silent** (connect.cpp:1128-1161).
8. **`ShowHostWindow("NSM - <server>")` — `NSMMainWindow` becomes VISIBLE,
   EMPTY (white). This happens before the client is even started**
   (connect.cpp:1163-1166).
9. `CreateProcessA(altv.exe, "-connecturl altv://connect/<ip>:<port>
   -directlaunch -customui http://127.0.0.1:9988/ui/index.html")`, cwd =
   runtime dir, `SteamAppId=271590` (connect.cpp:1169-1177). Failure →
   MessageBox **without the Win32 error code** (connect.cpp:1205-1209).
10. Watch loop: `in_game` is set the moment **a process named GTA5.exe
    exists** (connect.cpp:1181-1189) — window state is not checked by the
    launcher.
11. The wrapper's `embed_thread` (inside NSM.exe) finds the new GTA5.exe,
    waits for its `grcWindow`, and `SetParent`s it into **the first visible
    top-level window of its own process = `NSMMainWindow`**, styles it
    WS_CHILD, verifies the reparent, fits it (nsm-steam-presence-source.c:
    166-278, 317-370).
12. On game exit: altv.exe/GTA5.exe killed, host window hidden, back to the
    browser window (connect.cpp:1211-1233).

## 4. Which code opens the blank white window — and why it is a symptom

**The blank white window is `NSMMainWindow`, shown by `ShowHostWindow` at
connect.cpp:1165 before `altv.exe` exists.** It has no child, no paint
handler, and no content (`NsmHostWndProc` = `DefWindowProc`, no `WM_PAINT`
drawing; class has no `hbrBackground`). It is a *placeholder that stays empty
until the game embeds — or forever if the game never comes*.

The blank window is therefore a **symptom** of the real defect chain:

- **D1 — no failure containment in the watch loop.** The loop only breaks
  when altv.exe *exits* (or GTA5.exe disappears after being seen)
  (connect.cpp:1191-1200). If the real alt:V client **stays alive without
  launching GTA V** (its own error/updater window, a hang, a wait-for-input
  state), NSM waits **indefinitely** next to a blank window. This matches the
  reported experience exactly: second blank window + GTA V never starts.
- **D2 — `in_game` = "a GTA5.exe process exists"** (connect.cpp:1185-1189),
  so the state can lie (embedded or even usable is unknown).
- **D3 — silent failure paths**: `proxy.dll`/`config.dll` load failures
  (connect.cpp:1129, 1140-1141), missing altv-runtime (connect.cpp:865), and
  `CreateProcessA` failure without `GetLastError()` (connect.cpp:1205-1209).
  On a real machine any of these produces exactly "nothing happens".
- **D4 — no altv.exe exit-code logging** (`CloseHandle(pi.hProcess)` at
  connect.cpp:1204 discards it) — the single most valuable diagnostic for
  "client started then died" is thrown away.
- **D5 — no timeout** for "client alive but GTA V never appeared".

## 5. Why GTA V does not start on the real machine (launcher-side analysis)

The launcher-side chain is now fully instrumented (see fix). The candidate
causes that the launcher *could not distinguish between* before this audit
(all consistent with the report):

1. `altv.exe` starts and **exits immediately** (missing dependency in the
   copied runtime, GTA V not found by the client, outdated client vs updated
   GTA V) — D3/D4 hid which one.
2. `altv.exe` starts and **stays alive without launching GTA V** (its own
   updater/error UI waiting) — D1 turned this into "blank window forever".
3. `CreateProcessA` itself failed (runtime not installed; D3 hid the code).
4. GTA V **did** start but its window was never embedded (embed verify
   failed) — the game would then be running in its own window while NSM
   showed the blank host (D2).

**Which one actually happened on the reporting machine cannot be determined
from the current logs — that is itself finding D3/D4 and the reason the fix
is diagnostic-first.** The Wine test rig proves the happy path works
(connect → embed → in_game → exit → browser → reconnect, E2E 21/21), so the
failure is in the real-machine boundary conditions above. The new diagnostic
build logs (per stage, with Win32 error codes and exit codes) are designed to
identify the exact branch on the first real run; see
REAL_WINDOWS_TEST.md for the runbook.

## 6. The fix (this change set)

| Defect | Fix | Where |
|---|---|---|
| Blank window (D-symptom) | `NSMMainWindow` is **never shown by the launcher**; the wrapper shows it *after* `parent verified` + fit, so it appears already containing the game | connect.cpp / wrapper |
| D1 indefinite hang | Watch loop timeouts: `game_start_timeout_sec` (default 120 s) for "no GTA5.exe", 90 s for "GTA5.exe but no embed outcome"; every exit has a real error and recovers to `idle` | connect.cpp |
| D2 fake in_game | `in_game` set on embed outcome (`embed: DONE` / game window visible fallback), not process existence | connect.cpp |
| D3 silent failures | Every stage logs a timestamped line with the Win32 error code; missing proxy/config/runtime produce explicit warnings; pre-launch checklist (paths, files, DLL loads) logged | connect.cpp |
| D4 lost exit code | `GetExitCodeProcess` logged for altv.exe | connect.cpp |
| Duplicate connects | `/api/connect` answers `busy` while connecting/in_game (FiveM-style native guard) | browser_server.h |
| State opacity | `/api/gamestate` gains `detail` (stage text) shown by the UI connecting modal; state names unchanged (API contract kept) | both + index.html |
| Wrong-window race | Wrapper embeds **only when loaded by NSM.exe/connect.exe** (never inside altv.exe) | wrapper |
| Stale docs | LAUNCH_FLOW.md rewritten to the current architecture | docs |

Not changed (deliberately): the external app-window browser (works; WebView2
is the researched upgrade, gated and documented), the masterlist/VPS and
owner-run server model, pack extraction, the alt:V runtime itself.

## 7. Real-machine confirmation (2026-10-13, owner's Windows machine)

The owner's connect.log from the diagnostic build closed the loop:

```
Pre-launch: client = C:\Users\austi\AppData\Local\39a4...\altv.exe [present]
Pre-launch: gta_path = C:\Program Files (x86)\Steam\steamapps\common\Grand Theft Auto V [GTA5.exe present]
Launching: "...\altv.exe" -connecturl altv://connect/127.0.0.1:7788 -directlaunch -customui http://127.0.0.1:9988/ui/index.html
Client started (pid 27412).
Client exited before starting GTA V (exit code 3221225477).
```

3221225477 = 0xC0000005 (STATUS_ACCESS_VIOLATION): the client crashes
before starting GTA V - section 5 candidate 1/2 territory, with the crash
caused by `libs\libce2.dll` being absent from every distribution channel
(mp1 stub, background download removed, altv-runtime lacking it), while
the client's own update hashList (`proxy\update_release_modified.json`)
requires it with SHA1 1affc48a243bc183076544bf46c94f4cae1becb9.

Fix shipped with this evidence: the `game-packs` release (real mp1.pack +
SHA1-verified libce2.dll), the wrapper pack-guard background download
(stub -> full pack swap, verified in the Wine rig: 949,824 B stub
auto-upgraded to 226,614,288 B), and an explicit launcher WARNING when
libce2.dll is missing after pack extraction.
