<script>
  import { onMount } from 'svelte';
  import PauseMenu from './PauseMenu.svelte';

  let statusText = "Connecting to server...";
  let isConnected = false;
  let isDisconnected = false;   // true after disconnect/failed — shows exit screen
  let disconnectReason = "";    // reason text from server
  let uiVisible = true;
  let uiReady = false;          // set to true when alt:V sends ui:ready
  let debugMode = false;        // only true if .cfg has debug = true
  let showExitConfirm = false;  // true when alt:V emits 'exit' (e.g. Alt+F4)
  let isReconnecting = false;   // true when user clicks Reconnect
  let reconnectTimer = null;

  let isConsoleOpen = false;
  let isConsoleTransparent = false;
  let showPauseMenu = false; // Added state for Pause Menu
  let logs = [];
  let consoleInput = "";

  function copyLog(htmlString) {
      const temp = document.createElement('div');
      temp.innerHTML = htmlString;
      const text = temp.innerText || temp.textContent;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(text);
      }
  }

  function updateControlsState() {
      if (typeof alt !== 'undefined' && isConnected) {
          const state = showExitConfirm || isConsoleOpen || showPauseMenu;
          alt.emit('ui:open', state);
          alt.emit('console:execute', `__INTERNAL_UI_STATE__ ${isConsoleOpen} ${showPauseMenu}`);

          if (showPauseMenu) {
              alt.emit('cursor', true);
              if (typeof alt.showCursor === 'function') {
                  alt.showCursor(true);
                  alt.toggleGameControls(false);
              }
          } else if (!isConsoleTransparent && !isConsoleOpen && !showExitConfirm) {
              alt.emit('cursor', false);
              if (typeof alt.showCursor === 'function') {
                  alt.showCursor(false);
                  alt.toggleGameControls(true);
              }
          }
      }
  }

  function toggleTransparency() {
      isConsoleTransparent = !isConsoleTransparent;
      if (typeof alt !== 'undefined') {
          if (isConsoleTransparent) {
              alt.emit('cursor', false);
              if (typeof alt.showCursor === 'function') {
                  alt.showCursor(false);
                  alt.toggleGameControls(true);
              }
          } else {
              alt.emit('cursor', true);
              if (typeof alt.showCursor === 'function') {
                  alt.showCursor(true);
                  alt.toggleGameControls(false);
              }
          }
      }
  }

  function focusOnOpen(node) {
      setTimeout(() => node.focus(), 10);
  }

  function scrollOnOpen(node) {
      setTimeout(() => node.scrollTop = node.scrollHeight, 10);
  }

  const colors = [
      '#1e1e1e', '#666666', '#bd3f39', '#df5853', '#55b87f', '#63cd91',
      '#3972c2', '#508ee3', '#e6e34d', '#f6f366', '#ae4cb6', '#c978d1',
      '#4ba6c9', '#59b6d7', '#C0C0C0', '#FFFFFF'
  ];

  let htmlBuffer = "";

  function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function confirmExit() {
      if (typeof alt !== 'undefined') {
          alt.emit('exit');
      } else {
          window.close();
      }
  }

  function cancelExit() {
      showExitConfirm = false;
      setTimeout(() => {
          updateControlsState();
      }, 70);
  }

  function executeCommand() {
      if (!consoleInput.trim()) return;
      if (typeof alt !== 'undefined') {
          alt.emit('console:execute', consoleInput);
      } else {
          logs = [...logs, "Command executed: " + consoleInput];
      }
      consoleInput = "";
  }

    function handleReconnect() {
        if (!isReconnecting) {
            isReconnecting = true;
            setTimeout(() => {
                if (typeof alt !== 'undefined') alt.emit('console:execute', 'reconnect');
            }, 4000);
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
                isReconnecting = false;
            }, 5000);
        }
    }
  onMount(async () => {
      if (typeof alt !== 'undefined') {
          alt.on('ui:ready', () => {
              uiReady = true;
          });

          alt.on('settings:update', (data) => {
              // debug mode disabled
          });

          alt.on('version:update', (version, branch, lastIp, debug) => {
              // debug mode disabled
          });

          alt.on('connectionState:update', (state) => {
              uiReady = true;
              if (!isConnected) {
                  alt.emit('ui:open', true);
                  alt.emit('cursor', true); // Try standard events
                  if (typeof alt.showCursor === 'function') {
                      alt.showCursor(true);
                      alt.toggleGameControls(false);
                  }
              }
          });

          // alt:V controls UI visibility (hide in-game, show on exit)
          alt.on('ui:toggle', (state) => {
              uiVisible = typeof state === 'boolean' ? state : !uiVisible;
          });

          alt.on('connection:connecting', () => { statusText = "Connecting to server..."; isDisconnected = false; isReconnecting = false; });
          alt.on('connection:joining', () => { statusText = "Joining game..."; isReconnecting = false; });
          alt.on('connection:startingResources', () => { statusText = "Starting resources..."; isReconnecting = false; });
          alt.on('connection:preloadingMods', () => { statusText = "Preloading mods..."; isReconnecting = false; });
          alt.on('connection:reloadingGameMap', () => { statusText = "Reloading game map..."; isReconnecting = false; });
          alt.on('connection:startingGame', () => { statusText = "Starting game..."; isReconnecting = false; });
          alt.on('connection:downloadingResources', () => { statusText = "Downloading resources..."; isReconnecting = false; });
          alt.on('connection:validatingResources', () => { statusText = "Validating resources..."; isReconnecting = false; });
          alt.on('connection:downloadingRuntimes', () => { statusText = "Downloading runtimes..."; isReconnecting = false; });
          alt.on('connection:inQueue', (msg) => { statusText = "In queue: " + (msg || ""); isReconnecting = false; });

          alt.on('connection:disconnected', (msg) => {
              isConnected = false;
              isDisconnected = true;
              isReconnecting = false;
              if (reconnectTimer) clearTimeout(reconnectTimer);
              disconnectReason = msg || "Connection lost";
              uiVisible = true;
              isConsoleOpen = false;
              alt.emit('ui:open', true);
          });

          alt.on('connection:failed', (msg) => {
              isConnected = false;
              isDisconnected = true;
              isReconnecting = false;
              if (reconnectTimer) clearTimeout(reconnectTimer);
              disconnectReason = msg || "Connection failed";
              uiVisible = true;
              isConsoleOpen = false;
          });

          alt.on('connection:connected', () => {
              isConnected = true;
              isDisconnected = false;
              disconnectReason = "";
              isConsoleOpen = false;
              alt.emit('ui:open', false);
          });

          alt.on('exit', () => {
              if (showExitConfirm) return;
              showExitConfirm = true;
              updateControlsState();
          });

          alt.on('console:push', (color, value) => {
              if (value && value.includes('__TOGGLE_PAUSE_MENU__')) {
                  if (isConnected && !showExitConfirm && !isDisconnected) {
                      showPauseMenu = !showPauseMenu;
                      updateControlsState();
                  }
                  return;
              }

              let safeValue = value.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;");
                 
              // Pattern coloring
              safeValue = safeValue.replace(/\[Error\]/gi, '<span style="color: #ef4444; font-weight: bold;">$&</span>')
                                   .replace(/\[Warning\]/gi, '<span style="color: #eab308; font-weight: bold;">$&</span>')
                                   .replace(/\[Success\]/gi, '<span style="color: #10b981; font-weight: bold;">$&</span>')
                                   .replace(/\[Done\]/gi, '<span style="color: #10b981; font-weight: bold;">$&</span>')
                                   .replace(/\[Info\]/gi, '<span style="color: #3b82f6; font-weight: bold;">$&</span>');

              let colorHex = colors[color] || '#C0C0C0';
              if (color !== 14) {
                  htmlBuffer += `<span style="color: ${colorHex}">${safeValue}</span>`;
              } else {
                  htmlBuffer += safeValue;
              }
          });

          alt.on('console:end', () => {
              if (htmlBuffer) {
                  logs = [...logs, htmlBuffer];
                  if (logs.length > 200) logs.shift();
                  htmlBuffer = "";
              }
              const output = document.querySelector('.console-output');
              if (output) {
                  setTimeout(() => output.scrollTop = output.scrollHeight, 10);
              }
          });

          alt.on('console:reset', () => {
              htmlBuffer = "";
          });

          alt.on('console:open', (state) => {
              // no console
          });

          alt.on('console:clear', () => {
              logs = [];
          });
      } else {
          // In browser (non-alt:V) mode — show UI immediately
          uiReady = true;
          window.debugExit = () => { showExitConfirm = true; };
          window.debugDisconnect = (reason = "Connection lost") => {
              isConnected = false;
              isDisconnected = true;
              isReconnecting = false;
              if (reconnectTimer) clearTimeout(reconnectTimer);
              disconnectReason = reason;
              uiVisible = true;
              showExitConfirm = false;
          };
      }

      const handleKeyDown = (e) => {
          if (showExitConfirm) {
              if (e.code === 'Enter' || e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmExit();
              }
              if (e.code === 'Escape' || e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelExit();
              }
              return;
          }

          // Handle Pause Menu Toggle
          if (isConnected && !isConsoleOpen && !showExitConfirm && !isDisconnected) {
              if (e.code === 'Escape' || e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  showPauseMenu = !showPauseMenu;
                  updateControlsState();
              }
          }

          if (uiReady && isDisconnected && uiVisible && !isConsoleOpen) {
              if (e.code === 'Enter' || e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmExit();
              }
              if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
                  if (debugMode) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReconnect();
                  }
              }
          }

          if (e.code === 'F8' || e.key === 'F8') {
              e.preventDefault();
          }
      };

      const handleGlobalMouseAndKeyUp = (e) => {
          if (showExitConfirm || (uiReady && isDisconnected && uiVisible) || (uiReady && !isConnected && uiVisible)) {
              if (e.type === 'keyup' && (e.code === 'Escape' || e.key === 'Escape' || e.code === 'Enter' || e.key === 'Enter')) {
                  e.preventDefault();
                  e.stopPropagation();
              }
          }
      };

      document.addEventListener('keydown', handleKeyDown, { capture: true });
      document.addEventListener('keyup', handleGlobalMouseAndKeyUp, { capture: true });

      return () => {
          document.removeEventListener('keydown', handleKeyDown, { capture: true });
          document.removeEventListener('keyup', handleGlobalMouseAndKeyUp, { capture: true });
      };
  });
</script>

<main>
  <!-- Loading overlay: shown until alt:V sends ui:ready -->
  <div class="gta-modal loading-overlay" class:ready={uiReady} on:mousedown|self={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <div class="gta-content">
      <h1 class="gta-title">CONNECTING</h1>
      <div class="gta-divider"></div>
    </div>
    <div class="loader loader--large"></div>
  </div>

  <!-- Disconnect / Failed screen -->
  {#if uiReady && isDisconnected && uiVisible}
  <div class="gta-modal" style={isConsoleOpen ? 'opacity: 0.2' : 'opacity: 1'} on:mousedown|self={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <div class="gta-content">
      <h1 class="gta-title">DISCONNECTED</h1>
      <div class="gta-divider"></div>
      <p class="gta-desc">{disconnectReason}</p>
      <div class="gta-divider"></div>
    </div>
    <div class="gta-actions">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#if debugMode}
          {#if !isReconnecting}
          <div class="gta-action" on:click={handleReconnect}>
              <span>RECONNECT</span>
              <kbd>R</kbd>
          </div>
          {:else}
          <div class="gta-action" style="cursor: default; opacity: 0.5;">
              <span>RECONNECTING</span>
              <div class="loader" style="position: relative; right: 0; bottom: 0; margin-left: 10px;"></div>
          </div>
          {/if}
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="gta-action" on:click={confirmExit}>
          <span>Exit</span>
          <kbd>Enter</kbd>
        </div>
    </div>
  </div>
  {/if}

  <!-- Connection progress screen: shown when ready, connecting, not yet in game -->
  {#if uiReady && !isConnected && !isDisconnected && uiVisible}
  <div class="gta-modal" style={isConsoleOpen ? 'opacity: 0.2' : 'opacity: 1'} on:mousedown|self={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <div class="gta-content">
      <h1 class="gta-title">CONNECTING</h1>
      <div class="gta-divider"></div>
      <p class="gta-desc">{statusText}</p>
      <div class="gta-divider"></div>
    </div>
    <div class="loader"></div>
  </div>
  {/if}

  <!-- Console removed -->

  <!-- Exit Confirmation Modal (Alt+F4) -->
  {#if showExitConfirm}
  <div class="gta-modal" on:mousedown|self={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <div class="gta-content">
      <h1 class="gta-title">QUIT</h1>
      <div class="gta-divider"></div>
      <p class="gta-desc">Are you sure you want to quit Grand Theft Auto V? All unsaved data will be lost.</p>
      <div class="gta-divider"></div>
    </div>
    <div class="gta-actions">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="gta-action" on:click={cancelExit}>
        <span>No</span>
        <kbd>Esc</kbd>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="gta-action" on:click={confirmExit}>
        <span>Yes</span>
        <kbd>Enter</kbd>
      </div>
    </div>
  </div>
  {/if}

  <!-- Pause Menu -->
  {#if showPauseMenu}
      <PauseMenu on:close={() => { showPauseMenu = false; updateControlsState(); }} />
  {/if}
</main>

<style>
  :global(html), :global(body) {
    transition: opacity 0.2s ease;
  }

  main {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* ── Loading overlay ── */
  .loading-overlay {
    z-index: 9998;
  }
  
  .loading-overlay.ready {
    opacity: 0;
    pointer-events: none;
  }

  .loader--large {
    width: 56px;
    height: 56px;
    border-width: 5px;
  }

  /* ── Shared Screen Styles (Connection & Disconnect) ── */
  .loader {
    position: absolute;
    bottom: 45px;
    right: 50px;
    width: 32px;
    height: 32px;
    border: 3px solid transparent;
    border-bottom-color: #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite, fadeIn 0.6s ease;
    zoom: 0.7;
  }


  .reconnect-btn:active {
    background: rgba(85, 184, 127, 0.2);
  }

  /* ── Console (Shadcn Style) ── */
  .console {
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    height: 50vh;
    background: rgba(9, 9, 11, 0.85); /* hsl(240 10% 3.9%) with opacity */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    font-family: 'Gilroy', 'Inter', sans-serif;
    z-index: 9999;
    pointer-events: auto;
    box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    user-select: text;
    transition: background 0.3s, backdrop-filter 0.3s;
  }

  .console.transparent {
    background: rgba(9, 9, 11, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    pointer-events: none;
    max-width: 35%;
  }

  .console-header {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    pointer-events: auto; /* Allow clicking the toggle even if the parent is pointer-events: none */
  }

  .transparent-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: #e2e8f0;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .transparent-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .console-output {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    color: #e2e8f0; /* slate-200 */
    font-size: 14px;
    line-height: 1.6;
    word-wrap: break-word;
    white-space: pre-wrap;
    font-weight: 500;
  }

  .log-line {
      min-height: 20px;
      margin-bottom: 2px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
  }

  .log-text {
      flex: 1;
      word-break: break-all;
  }

  .copy-btn {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, color 0.2s;
      padding: 2px 4px;
      margin-left: 8px;
  }

  .log-line:hover .copy-btn {
      opacity: 1;
  }

  .copy-btn:hover {
      color: #f8fafc;
  }

  .console-input-row {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    padding: 8px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.2s ease;
  }

  .console-input-row:focus-within {
    background: rgba(255, 255, 255, 0.06);
  }

  .prompt {
    color: #10b981; /* emerald-500 */
    margin-right: 12px;
    font-weight: 700;
    font-size: 14px;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #f8fafc; /* slate-50 */
    font-family: 'Gilroy', 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    caret-color: #10b981;
  }

  input::placeholder {
    color: #64748b; /* slate-500 */
  }

  /* Custom Scrollbar for console output */
  .console-output::-webkit-scrollbar {
    width: 6px;
  }
  .console-output::-webkit-scrollbar-track {
    background: transparent;
  }
  .console-output::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
  .console-output::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* ── GTA V Exit Modal ── */
  .gta-modal {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #000000 url('./assets/bg.png') no-repeat center center;
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    pointer-events: auto;
    animation: fadeIn 0.15s ease;
  }

  .gta-content {
    width: 80%;
    max-width: 900px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    zoom: 0.7;
  }

  .gta-title {
    font-family: 'Gilroy', 'Inter', sans-serif;
    color: #f3b72c;
    font-size: 80px;
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 800;
  }

  .gta-divider {
    height: 2px;
    background: #ffffff;
    width: 100%;
    margin: 15px 0;
  }

  .gta-desc {
    color: #ffffff;
    font-family: 'Gilroy', 'Inter', sans-serif;
    font-size: 22px;
    margin: 0;
    line-height: 1.5;
    font-weight: 500;
  }

  .gta-actions {
    position: absolute;
    bottom: 40px;
    right: 50px;
    display: flex;
    gap: 30px;
    zoom: 0.7;
  }

  .gta-action {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .gta-action:hover {
    opacity: 0.7;
  }

  .gta-action span {
    color: #ffffff;
    font-family: 'Gilroy', 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 600;
  }

  .gta-action kbd {
    background: #ffffff;
    color: #000000;
    font-family: 'Gilroy', 'Inter', sans-serif;
    font-weight: 700;
    font-size: 16px;
    padding: 6px 12px;
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }


  /* ── Animations ── */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
