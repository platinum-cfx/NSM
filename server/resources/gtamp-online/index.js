import alt from 'alt-server';
import http from 'http';

// Legion Square freemode spawn points
const SPAWN_POINTS = [
  { x: 198.8, y: -934.3, z: 30.7, heading: 140.0 },  // Center park benches
  { x: 215.76, y: -910.0, z: 30.69, heading: 180.0 }, // North walkway
  { x: 172.5, y: -944.5, z: 30.7, heading: 50.0 },   // West walkway
  { x: 232.0, y: -994.0, z: 29.3, heading: 320.0 }   // South plaza
];

const DEFAULT_PED_MODEL = 'mp_m_freemode_01';

function updateCount() {
  const online = alt.Player.all.length;
  // Notify local proxy
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
}

function notifyLeave(clientId) {
  // Notify local server proxy
  const req = http.request({
    hostname: '127.0.0.1',
    port: 7799,
    path: `/playerLeave?clientId=${encodeURIComponent(clientId)}`,
    method: 'GET',
    timeout: 1000
  });
  req.on('error', () => {});
  req.end();

  // Also notify masterlist
  const mlReq = http.request({
    hostname: '127.0.0.1',
    port: 8080,
    path: `/api/player/leave?host=127.0.0.1&port=7788&clientId=${encodeURIComponent(clientId)}`,
    method: 'GET',
    timeout: 1000
  });
  mlReq.on('error', () => {});
  mlReq.end();
}

function spawnPlayerAtLegion(player) {
  if (!player || !player.valid) return;

  const spawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];

  // Set character ped model (multiplayer freemode ped)
  try {
    player.model = DEFAULT_PED_MODEL;
  } catch (err) {
    alt.logError(`[gtamp-online] Error setting ped model: ${err.message}`);
  }

  // Spawn at ground level in Legion Square
  player.spawn(spawn.x, spawn.y, spawn.z, 0);
  player.rot = new alt.Vector3(0, 0, (spawn.heading * Math.PI) / 180);

  // Health and armour
  player.health = 200;
  player.armour = 100;

  // Starter loadout
  try {
    player.giveWeapon(0x1B06D571, 120, true); // weapon_pistol
    player.giveWeapon(0xFB888791, 1, false);  // gadget_parachute
  } catch (e) {}

  alt.log(`[gtamp-online] Spawned player ${player.name} (id: ${player.id}) at Legion Square (${spawn.x.toFixed(1)}, ${spawn.y.toFixed(1)}, ${spawn.z.toFixed(1)})`);
}

alt.on('playerConnect', (player) => {
  alt.log(`[gtamp-online] Player ${player.name} (id: ${player.id}) connected.`);
  spawnPlayerAtLegion(player);
  updateCount();
});

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
