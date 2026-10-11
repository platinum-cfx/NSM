import * as alt from 'alt-server';
import http from 'http';

// Legion Square ground-level spawn points
const SPAWN_POINTS = [
  { x: 198.8, y: -934.3, z: 31.7, heading: 140.0 },  // Center park benches
  { x: 215.76, y: -910.0, z: 31.7, heading: 180.0 }, // North walkway
  { x: 172.5, y: -944.5, z: 31.7, heading: 50.0 },   // West walkway
  { x: 232.0, y: -994.0, z: 30.5, heading: 320.0 }   // South plaza
];

const DEFAULT_PED_MODEL = 'mp_m_freemode_01';

function updateCount() {
  try {
    const online = alt.Player.all.length;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 7799,
      path: `/updateOnline?online=${online}`,
      method: 'GET',
      timeout: 1000
    });
    req.on('error', () => {});
    req.end();
    alt.log(`[gtamp-online] Online players: ${online}`);
  } catch (e) {}
}

function notifyLeave(clientId) {
  try {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 7799,
      path: `/playerLeave?clientId=${encodeURIComponent(clientId)}`,
      method: 'GET',
      timeout: 1000
    });
    req.on('error', () => {});
    req.end();

    const mlReq = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path: `/api/player/leave?host=127.0.0.1&port=7788&clientId=${encodeURIComponent(clientId)}`,
      method: 'GET',
      timeout: 1000
    });
    mlReq.on('error', () => {});
    mlReq.end();
  } catch (e) {}
}

function spawnPlayerAtLegion(player) {
  if (!player || !player.valid) return;

  const spawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];

  try {
    // 1. Spawn entity first at solid ground height
    player.spawn(spawn.x, spawn.y, spawn.z, 0);

    // 2. Set multiplayer freemode ped model
    try {
      player.model = DEFAULT_PED_MODEL;
    } catch (mErr) {
      alt.logError(`[gtamp-online] Error setting model: ${mErr.message}`);
    }

    player.rot = new alt.Vector3(0, 0, (spawn.heading * Math.PI) / 180);
    player.dimension = 0;
    player.health = 200;
    player.armour = 100;

    // Starter weapons
    try {
      player.giveWeapon(0x1B06D571, 120, true); // weapon_pistol
      player.giveWeapon(0xFB888791, 1, false);  // gadget_parachute
    } catch (wErr) {}

    // Send explicit ground placement event to client
    alt.emitClient(player, 'gtamp:forceGroundSpawn', spawn.x, spawn.y, spawn.z, spawn.heading);

    alt.log(`[gtamp-online] Spawned player ${player.name} (id: ${player.id}) at Legion Square (${spawn.x.toFixed(1)}, ${spawn.y.toFixed(1)}, ${spawn.z.toFixed(1)})`);
  } catch (err) {
    alt.logError(`[gtamp-online] Failed to spawn player ${player.name}: ${err.message}`);
  }
}

// When player connects to the server
alt.on('playerConnect', (player) => {
  alt.log(`[gtamp-online] Player ${player.name} (id: ${player.id}) connected.`);
  spawnPlayerAtLegion(player);
  updateCount();
});

// Client signals it has finished initial scene loading
alt.onClient('gtamp:requestSpawn', (player) => {
  if (player && player.valid) {
    spawnPlayerAtLegion(player);
  }
});

// Respawn on death
alt.on('playerDeath', (player, killer, weapon) => {
  alt.log(`[gtamp-online] Player ${player.name} died.`);
  alt.setTimeout(() => {
    if (player && player.valid) {
      try {
        player.clearBloodDamage();
      } catch (e) {}
      spawnPlayerAtLegion(player);
    }
  }, 2500);
});

alt.on('playerDisconnect', (player) => {
  alt.log(`[gtamp-online] Player ${player.name} disconnected.`);
  notifyLeave(`player_${player.id}`);
  setTimeout(updateCount, 100);
});

alt.onClient('gtamp:respawn', (player) => {
  if (player && player.valid) {
    spawnPlayerAtLegion(player);
  }
});
