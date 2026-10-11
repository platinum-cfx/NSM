import * as alt from 'alt-client';
import * as native from 'natives';

const LEGION_DEFAULT = { x: 198.8, y: -934.3, z: 31.7, heading: 140.0 };

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
  alt.log('[gtamp-online] Connection established. Requesting ground spawn...');

  // Request server to spawn player if not already done
  alt.emitServer('gtamp:requestSpawn');

  // Immediately place at Legion Square to prevent (0,0,0) under map
  placeOnGround(LEGION_DEFAULT.x, LEGION_DEFAULT.y, LEGION_DEFAULT.z, LEGION_DEFAULT.heading);

  // Show welcome notification
  try {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName('~g~Welcome to NSM Online!~s~\n~y~Legion Square Freemode~s~\nPress ~b~M~s~ or ~b~F1~s~ for ~p~vMenu~s~.');
    native.endTextCommandThefeedPostTicker(false, true);
  } catch (e) {}
});

// Server forces ground spawn
alt.onServer('gtamp:forceGroundSpawn', (x, y, z, heading) => {
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
