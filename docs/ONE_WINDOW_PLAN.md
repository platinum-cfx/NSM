# One-window NSM (alt:V-style UX) — plan + evidence

Goal (user, verbatim): "make it work like altv.exe is the whole app — verify → server
list → play, one window. but for nsm.exe with our server list we made."

## Current window flow (measured)

Open NSM.exe → NSM window (embedded browser, our masterlist list, served from
launcher_html_data.h on 127.0.0.1:9987). On Connect: altv.exe is launched VISIBLE
(connect.cpp:1659 STARTUPINFO not set to hidden) → its window pops up (the client
home/connect screen — the "another tab" + duplicate server list the user saw) → then
GTA V window (currently separate because embed input is frozen, embed_game_window=false).

## Facts from the code

- UI already polls /api/gamestate every 1 s after Connect (pollGameState in
  launcher_html_data.h) but IGNORES the `detail` field → ready-made status channel.
- connect.cpp already has NsmSetDetail + a watch loop (client pid, GTA start, embed log
  tail via NsmTailEmbedLog, timeouts, failReason) → client-status piping slots right in.
- The client's own log (targetDir\logs\launcher_*.log) has clean stage lines:
  No skin specified → Backup file … valid → Backup file copied → Starting gtamp patches
  injection → Injected gtamp patches successfully → gtamp patches executed → Launcher
  patch completed → Starting gtamp injection → Injected DLL successfully → Injection
  finished → Waiting for the window. (User's 15:21 log.)
- The client needs its window only for interactive states: password prompt, permission
  request, error dialogs, game-path picker (-changegamepath), platform-invalid restart.
  With -directlaunch + our servers (no password) it is pure status → safe to hide,
  auto-restore when it stalls waiting for input.
- Startup "verify" (the alt:V feel): real deep verify (hash+patch) runs inside the client
  at connect (took ~2 s in the user's log). At NSM start we can cheaply check: gta_path
  present, GTA5.exe present, 94-file runtime, and the client's forbidden-file rules
  (7launcher\, 7lcfg_gtav.ini, Run_GTAV.exe, commandline.txt, d3d11.dll, dinput8.dll,
  dsound.dll, dxgi.dll, socialclub.ini, steam000.wow, steam001.wow, steam_api.ini).

## Unit 1 — packfix5 (this build)

1. Launch client hidden: si.dwFlags=STARTF_USESHOWWINDOW, si.wShowWindow=SW_HIDE.
2. Tail the client's launcher_*.log in the watch loop; map stage lines → NsmSetDetail;
   echo every line into connect.log as "Client: …".
3. Auto-restore the client window if it stalls (log exists + no new lines 20 s + no GTA)
   or logs an interactive/error line ("Selected platform", "Restarting as admin",
   "Possible solutions", "password"); on client exit, put the last client-log error into
   failReason so the UI shows the REAL cause.
4. /api/preflight endpoint: gtaPath/GTA5.exe/runtime/forbidden checks → UI badge
   "GTA V ✓" / "GTA V ✗ (reason)" in the header; refresh on server-list refresh.
5. UI: show data.detail live in the connecting dialog (connText).
6. E2E must stay 43/43 (hidden launch only affects altv.exe mock spawn; restore logic
   tolerates missing log files).

## Unit 2 — packfix6 (next build; the game INSIDE the window)

Embed input freeze root cause (hypothesis to verify): a WS_CHILD window can never be
GetForegroundWindow; GTA/alt:V gates input on activation/foreground + uses raw input +
ClipCursor. Wrapper already does SetParent+AttachThreadInput+SetFocus (wrapper.c:227-273)
— not enough.
Plan: (a) host forwards WM_ACTIVATE/WM_NCACTIVATE/WM_SETFOCUS to the child + refocus on
host activation + ClipCursor(NULL) after fit; (b) lab-verify with a mock game that logs
WM_ACTIVATE/WM_KEYDOWN/WM_MOUSEACTIVATE/WM_INPUT while embedded (extend E2E rig);
(c) if lab shows input still dead → switch to "top-level overlay" embed (game stays
top-level, frameless, glued to host client rect) — preserves foreground status for the
game. Real acceptance = user's machine either way (standing rule).

## Not doing

- No patching of altv.exe/altv-client.dll; no MITM of api.alt-mp.com; the client's own
  public-list tab stays (harmless) until a supported hide is found.
