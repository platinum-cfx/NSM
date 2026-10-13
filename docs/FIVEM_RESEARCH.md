# FiveM Reference Research — Client Architecture & Single-Window Implementation

> Research date: 2026-10-13. Sources: the **public** CitizenFX/FiveM repository
> (github.com/citizenfx/fivem, `master`) and the official Cfx.re documentation,
> exactly as listed in the brief. This note is written **before** the NSM code
> changes. Sections marked **[SOURCE]** are established by reading the cited
> source; sections marked **[HYPOTHESIS]** are reasoning that the source
> supports but does not directly prove.

## 1. FiveM launcher / bootstrap / runtime architecture **[SOURCE]**

Studied: `code/client/README.md`, `code/client/launcher/Bootstrap.cpp`,
`code/client/launcher/Main.cpp` (chunk 1 of 4), `code/client/` directory layout
(`citicore/`, `citigame/`, `console/`, `launcher/`, `shared/`, plus
`code/components/`).

- **One repository, many personalities.** The client entry point
  (`Main.cpp`) is compiled with different `LAUNCHER_PERSONALITY_*` macros from
  the same code base: the *main* personality is `CitizenFX.exe` (bootstrapper +
  updater), and a *game* personality is what actually runs inside/alongside
  GTA V. A `subprocess` personality is detected by the executable file name
  containing `subprocess`.
- **Bootstrapper responsibilities** (`Bootstrap.cpp`, `Bootstrap_DoBootstrap`):
  1. Ask the update service (`CFX_UPDATER_URL`) for the current bootstrap
     version using HTTP response headers (`x-amz-meta-bootstrap-version`,
     `-size`, `-object`); fall back to the `production` channel if a custom
     channel fails.
  2. If the version differs, **self-update**: download `CitizenFX.exe.new`
     (with a UI progress dialog: `UI_DoCreation` / `UI_UpdateText`), then
     `CreateProcess` the new exe with `-bootstrap "<old path>"` plus **pass-
     through of the original command line** — the caller's arguments (e.g. a
     `fivem://connect/...` link) survive the update handoff.
  3. Run install mode (`Install_RunInstallMode`) / post-install (Start-menu
     shortcut, elevation via the access-denied paths).
  4. Refuse to run from inside the game folder ("Please do not place
     FiveM.exe in your game folder").
  5. Persist cross-process state **before** handing off:
     `static HostSharedData<CfxState> initState("CfxInitState")` — a named
     shared-memory section that later processes (the game personality) read to
     learn paths, link protocol, product id, the initial game PID, etc.
  6. `VerifyViability()` + `Updater_RunUpdate(...)` fetches the actual
     content (the runtime components in `citizen/`), then the main
     personality runs the game.
- **Executable initialization** (`Main.cpp`, `RealMain`): OS version check,
  `EarlyLdrBlock_Init()` (block known-bad DLLs before any D3D/UI init),
  `SetSearchPathMode` safe search, preloading delay-listed **system** DLLs by
  absolute path (defends against DLL planting), exception server
  (`InitializeExceptionServer`) so crashes are reported with data, then
  `CfxState::Get()` (link protocol, product id), PATH/`SetDllDirectory`
  hardening, and a TLS-holder DLL for the game personality.
- **Launcher vs runtime lifecycle stages**: the bootstrapper personality ends
  by handing off (update handoff or `Updater_RunUpdate` spawning content);
  the runtime is a **component system** — `citicore/` is the "CitizenFX
  Runtime" that loads *components* (`code/components/*`, e.g. `glue`,
  `citizen-*`) and implements the CitizenFX Object Model. `citigame/` is an
  auxiliary component for "client-side lifecycle after bootstrapping".
- **State across startup**: `HostSharedData<T>("name")` shared sections
  (`CfxState`, `UUIState`, `TickCountData`) + named events and inherited
  handles — e.g. `RestartGameToOtherBuild` re-launches the game exe with an
  **inherited** `switchEvent` handle (`PROC_THREAD_ATTRIBUTE_HANDLE_LIST`) and
  the connect URL on the command line, so the "switch build" handoff never
  loses the pending connection.

**[HYPOTHESIS]** FiveM does not treat "launcher" and "game" as cooperating
equal processes: the bootstrapper is disposable and version-checked every
start; the *runtime* owns everything after handoff; state crosses process
boundaries through named shared memory, not through window hacks.

## 2. How the client handles connection requests and loading state **[SOURCE]**

Studied: `code/components/glue/src/ConnectToNative.cpp` (chunk 1 of 5).

- `ConnectTo(hostnameStr, fromUI, connectParams)`:
  - If the request does **not** come from the UI and the main UI NUI page
    exists, it is **forwarded into the UI**: `nui::PostFrameMessage("mpMenu",
    {"type":"connectTo", ...})` and returns. The UI (a CEF page hosted by the
    client itself, `CefOverlay`/`nui`) then drives the connection so the user
    sees state. The same channel posts `{"type":"connecting"}` once a real
    connection attempt starts.
  - **Duplicate-connect prevention at native level**: a `g_connected` flag —
    `"Ignoring ConnectTo because we're already connecting/connected."`
  - The actual transport is `netLibrary->ConnectToServer(hostname)`
    (`NetLibrary` component: the game's networking), with `cfx.re/join/...`
    resolution for one-click join IDs.
- Build switching during connect (`RestartGameToOtherBuild`): if the server
  needs a different game build, the client writes settings
  (`CitizenFX.ini`: `SavedBuildNumber`, `PoolSizesIncrease`), relaunches the
  game exe with `-b<build> -switchcl:<event> "<protocol>://connect/<addr>"`,
  waits on the old process via the shared `initialGamePid`, and exits — the
  connection request is carried across the relaunch **on the command line**.
- Settings (`loadSettings`/`saveSettings`) live in
  `%APPDATA%\CitizenFX\settings.json` and are pushed into the UI page as NUI
  messages.

**[HYPOTHESIS]** Loading state is owned by the *game-process* UI (the "mpMenu"
NUI main UI), not by the bootstrapper: after handoff the bootstrapper is gone;
the CEF overlay inside the game process shows connecting/loading/error
screens and receives connectTo/connecting messages.

## 3. Who owns UI, runtime, networking, game lifecycle **[SOURCE] + [HYPOTHESIS]**

| Concern | FiveM owner | Evidence |
|---|---|---|
| Bootstrap UI (update progress, errors) | Bootstrapper process (`CitizenFX.exe` main personality) via `UI_DoCreation`/`UI_DisplayError` **[SOURCE]** | Bootstrap.cpp |
| Launcher/browser UI (server list, connecting) | **The client runtime itself** — a CEF "main UI" (`nui::HasMainUI()`, `mpMenu`) hosted in the game process **[SOURCE]** | ConnectToNative.cpp |
| In-game UI (NUI resources) | Per-resource full-screen CEF pages overlaid on the game (`ui_page`, `SEND_NUI_MESSAGE`, `SET_NUI_FOCUS`) — **not** the launcher UI **[SOURCE]** | docs.fivem.net full-screen NUI |
| Networking | `NetLibrary` component (in-process with the game) **[SOURCE]** | ConnectToNative.cpp includes |
| Game lifecycle | `citigame`/component layer after bootstrap; relaunch handoff via command line + shared state **[SOURCE]** | client README, Main.cpp |
| Cross-process state | `HostSharedData<>` named sections, named/inheritable events **[SOURCE]** | Main.cpp, Bootstrap.cpp |

**Key distinction the brief asked for**: full-screen NUI (a *resource's*
in-game interface) is a different thing from FiveM's *external launcher UI*.
Both are CEF, but the launcher UI ("mpMenu") is hosted by the **game client
process** — the same process that renders the game. FiveM never reparents a
foreign browser window or a foreign game window: **one process owns the game
window and draws its UI (CEF) on top of it.**

## 4. Established by source vs hypothesis

- **Established [SOURCE]**: everything cited with file names above — bootstrap
  self-update + pass-through handoff, `HostSharedData` state, component-based
  runtime, `ConnectTo` routing through the in-process NUI main UI, native
  duplicate-connect guard, build-switch relaunch carrying the connect URL,
  licensing (below).
- **Hypothesis [HYPOTHESIS]**: that FiveM's *server browser* experience is
  single-window *because the game client hosts the UI*, and that the
  bootstrapper exits/defers after handoff in the common flow. Supported by the
  code paths read, but the full mpMenu lifecycle lives in components not read
  line-by-line here (`CefOverlay`, `mpMenu` component sources).

## 5. Licensing **[SOURCE]**

`LICENSE` at repo root: the repository is **© 2023 Take-Two Interactive
Software, Inc. All rights reserved**, use subject to the **Rockstar Games
Creator Platform License Agreement** (fivem.net/terms) — i.e. *not* open
source overall. An exception grants **LGPL-2.1** ("GNU Library General Public
License version 2") to a specific list: `code/client/shared/`,
`code/client/citicore/`, `code/client/launcher/`, `code/client/common/`,
`code/tools/`, `code/components/citizen-*/`, `font-renderer/`, `vfs-core/`,
`code/vendor/*.lua`.

**Consequence for NSM**: we may *read* all of it as research, but we will not
copy code into NSM. Any future reuse would have to come solely from the
LGPL-2.1 list, with attribution and LGPL obligations — not planned. NSM
implements its own compatible architecture. WebView2 (Microsoft, MIT-licensed
SDK/loader) is an independent, legally clean building block.

## 6. What applies to NSM today vs what requires replacing the alt client

### Directly applicable now (launcher-level, no client change)

1. **Explicit lifecycle states with real causes** (bootstrapper-style stage
   logging; FiveM logs every stage and shows `UI_DisplayError` with the real
   Win32 error code). → NSM gets a state machine with `detail` +
   timestamped stage logs + real error codes.
2. **Duplicate-connect prevention** (FiveM: native `g_connected` guard).
   → NSM: `/api/connect` guard while connecting/in_game.
3. **Carry the connection across process stages explicitly** (FiveM passes the
   connect URL through update handoffs and build switches). → NSM: server
   address/port preserved through every stage of the session loop; logged at
   each stage.
4. **Fail loudly with real errors** (FiveM: `UI_DisplayError` with error
   numbers on every failure path; DLLError triggers re-verification).
   → NSM: every silent skip (proxy.dll, config.dll load failures, missing
   runtime, exit codes) becomes a logged, surfaced failure.
5. **Never show an empty window** — FiveM's bootstrapper UI always shows text
   ("Bootstrapping...") or an error, never a blank frame. → NSM: the NSM host
   window stays hidden until the game window is actually embedded.

### NOT achievable by modifying the launcher (requires the game client)

1. **Drawing the launcher UI inside the game window** the way FiveM does:
   FiveM's client *is* the game host (CitizenFX components run inside the GTA
   process; CEF overlays render in the game's own window). NSM's runtime is
   **alt:V**, a separate third-party client that owns the GTA window; NSM
   cannot host CEF inside it without replacing/forking the alt client.
2. **In-game NUI resources** (`ui_page`, `SEND_NUI_MESSAGE`): a FiveM
   scripting feature of its runtime; NSM's equivalent must stay the alt:V
   resource system (+ our fivem-shim).
3. **NetLibrary-level connection state**: FiveM can show exact connect
   progress because networking is in-process. NSM's launcher can only observe
   process/window-level signals (GTA5.exe alive, game window present,
   embedded or not) — genuine in-game connection state is internal to alt:V.
   **This is a documented limitation**, not something a launcher patch can fix.

### The chosen NSM architecture (see LAUNCH_FAILURE_AUDIT.md for the map)

- **Persistent native NSM main window** (`NSMMainWindow`, owned by NSM.exe):
  hidden while browsing; shown **only after** the game window is verified-
  embedded into it; hidden again on session end. Loading feedback stays in
  the server-browser UI (the existing connecting modal), which remains the
  primary browsing surface.
- **Browser surface**: today an Edge/Chrome `--app` window (works, kept);
  the researched upgrade path to satisfy "one persistent window for browser +
  gameplay" is **WebView2 inside NSMMainWindow** (MIT-licensed loader, Win10/11
  ships the runtime). It is gated behind `.config` (`webview2_ui`) and falls
  back to the app window automatically — see the audit doc for status.
- **Game embedding**: `SetParent(grcWindow → NSMMainWindow)` by the NSM-side
  wrapper (the proven path), with parent verification — kept, but the host is
  now shown only on success.
