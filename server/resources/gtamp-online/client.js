import * as alt from 'alt-client';
import * as native from 'natives';

const LEGION_DEFAULT = { x: 198.8, y: -934.3, z: 31.7, heading: 140.0 };

// FIX: the server now owns the spawn (spawn_after_connect = false in .cfg).
// We only teleport locally as a delayed fallback if the server's spawn event
// never arrives — previously we teleported immediately on connectionComplete
// and then got teleported AGAIN by the server, causing the double-jitter.
let receivedServerSpawn = false;

function placeOnGround(x, y, z, heading) {
  const localPed = alt.Player.local.scriptID;
  if (!localPed) return;

  try {
    // 1. Freeze entity so gravity cannot pull the ped through unloaded ground
    native.freezeEntityPosition(localPed, true);

    // 2. Request collision and streaming around coords
    native.requestCollisionAtCoord(x, y, z);
    native.loadScene(x, y, z);

    // 3. Set ped position
    native.setEntityCoords(localPed, x, y, z, false, false, false, true);
    if (typeof heading === 'number') {
      native.setEntityHeading(localPed, heading);
    }

    // 4. Poll until collision is loaded or timeout
    let attempts = 0;
    const interval = alt.setInterval(() => {
      attempts++;
      const hasCollision = native.hasCollisionLoadedAroundEntity(localPed);
      const [hasGround, groundZ] = native.getGroundZFor3dCoord(x, y, z + 5.0, 0, false);

      if ((hasCollision && hasGround) || attempts > 20) {
        alt.clearInterval(interval);

        const targetZ = (hasGround && groundZ > 10.0) ? (groundZ + 0.3) : z;
        native.setEntityCoords(localPed, x, y, targetZ, false, false, false, true);
        native.freezeEntityPosition(localPed, false);

        // Screen fade in & UI
        native.doScreenFadeIn(800);
        native.displayHud(true);
        native.displayRadar(true);

        alt.log(`[gtamp-online] Ground placement complete at (${x.toFixed(1)}, ${y.toFixed(1)}, ${targetZ.toFixed(1)})`);
      }
    }, 100);
  } catch (err) {
    alt.logError('[gtamp-online] Ground placement error: ' + err.message);
    try { native.freezeEntityPosition(localPed, false); } catch (e) {}
  }
}

alt.on('connectionComplete', () => {
  alt.log('[gtamp-online] Connection established. Requesting spawn from server...');

  // Ask the server to run its spawn logic (it sets model, spawns, and sends
  // gtamp:forceGroundSpawn back once the client resources are live).
  alt.emitServer('gtamp:requestSpawn');

  // Fallback: if the server hasn't spawned us within 1.5s (e.g. resource
  // restart race), place ourselves so we never fall through the world.
  alt.setTimeout(() => {
    if (!receivedServerSpawn) {
      alt.logWarning('[gtamp-online] No server spawn received, using local fallback.');
      placeOnGround(LEGION_DEFAULT.x, LEGION_DEFAULT.y, LEGION_DEFAULT.z, LEGION_DEFAULT.heading);
    }
  }, 1500);

  // Show welcome notification
  try {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName('~g~Welcome to NSM Online!~s~\n~y~Legion Square Freemode~s~\nPress ~b~M~s~ or ~b~F1~s~ for ~p~vMenu~s~.');
    native.endTextCommandThefeedPostTicker(false, true);
  } catch (e) {}
});

// Server owns the spawn — this is the authoritative placement
alt.onServer('gtamp:forceGroundSpawn', (x, y, z, heading) => {
  receivedServerSpawn = true;
  placeOnGround(x, y, z, heading);
});

// Watchdog: If the player ever drops below ground (Z < 5.0) or is at (0, 0, 0), rescue to Legion Square
alt.setInterval(() => {
  const localPlayer = alt.Player.local;
  if (!localPlayer || !localPlayer.valid) return;

  const pos = localPlayer.pos;
  // Detected falling under map / void / unspawned at (0,0,0)
  if (pos.z < 5.0 || (Math.abs(pos.x) < 2.0 && Math.abs(pos.y) < 2.0)) {
    alt.logWarning(`[gtamp-online] Player detected under map at (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}). Rescuing to Legion Square...`);
    placeOnGround(LEGION_DEFAULT.x, LEGION_DEFAULT.y, LEGION_DEFAULT.z, LEGION_DEFAULT.heading);
  }
}, 2000);
