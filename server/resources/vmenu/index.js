import alt from 'alt-server';

// Track spawned vehicles per player
const playerVehicles = new Map();

alt.log('[vMenu] vMenu Server Resource Initializing...');

// Vehicle Spawning
alt.onClient('vmenu:spawnVehicle', (player, modelName) => {
  if (!player || !player.valid) return;
  try {
    // Remove player's previous vehicle if exists
    if (playerVehicles.has(player.id)) {
      const oldVeh = playerVehicles.get(player.id);
      if (oldVeh && oldVeh.valid) {
        oldVeh.destroy();
      }
      playerVehicles.delete(player.id);
    }

    const pos = player.pos;
    const rot = player.rot;
    // Spawn vehicle slightly ahead of player
    const headingRad = rot.z;
    const forwardX = -Math.sin(headingRad) * 3.5;
    const forwardY = Math.cos(headingRad) * 3.5;

    const veh = new alt.Vehicle(
      modelName,
      pos.x + forwardX,
      pos.y + forwardY,
      pos.z + 0.5,
      rot.x,
      rot.y,
      rot.z
    );

    veh.dimension = player.dimension;
    playerVehicles.set(player.id, veh);

    // Give ownership to player and inform client
    alt.emitClient(player, 'vmenu:vehicleSpawned', veh);
    alt.log(`[vMenu] Spawned vehicle '${modelName}' for ${player.name}`);
  } catch (err) {
    alt.logError(`[vMenu] Failed to spawn vehicle '${modelName}': ${err.message}`);
    alt.emitClient(player, 'vmenu:notify', `~r~Invalid vehicle model: ${modelName}`);
  }
});

// Ped / Character Change
alt.onClient('vmenu:setPed', (player, modelName) => {
  if (!player || !player.valid) return;
  try {
    player.model = modelName;
    alt.log(`[vMenu] Changed model of ${player.name} to '${modelName}'`);
    alt.emitClient(player, 'vmenu:notify', `~g~Model changed to ${modelName}`);
  } catch (err) {
    alt.logError(`[vMenu] Failed to set ped '${modelName}': ${err.message}`);
    alt.emitClient(player, 'vmenu:notify', `~r~Invalid ped model: ${modelName}`);
  }
});

// Player Health & Armour
alt.onClient('vmenu:healPlayer', (player) => {
  if (!player || !player.valid) return;
  player.health = 200;
  player.clearBloodDamage();
  alt.emitClient(player, 'vmenu:notify', '~g~Player health restored.');
});

alt.onClient('vmenu:setArmour', (player, amount) => {
  if (!player || !player.valid) return;
  player.armour = typeof amount === 'number' ? amount : 100;
  alt.emitClient(player, 'vmenu:notify', '~b~Player armour restored.');
});

// Weapons
const ALL_WEAPONS = [
  0x1B06D571, // weapon_pistol
  0x5EF9FEC4, // weapon_combatpistol
  0x22D3FE03, // weapon_appistol
  0xD205520E, // weapon_heavypistol
  0xC1B3C3D1, // weapon_revolver
  0x13532244, // weapon_microsmg
  0x2BE6766B, // weapon_smg
  0x78A97CD0, // weapon_combatmg
  0xBFEFFF6D, // weapon_assaultrifle
  0x83BF0278, // weapon_carbinerifle
  0xC0A3098D, // weapon_specialcarbine
  0x05FC3C11, // weapon_sniperrifle
  0x0C472FE2, // weapon_heavysniper
  0x1D073A89, // weapon_pumpshotgun
  0xE284C527, // weapon_assaultshotgun
  0xB1CA77B1, // weapon_rpg
  0x42CD0B34, // weapon_minigun
  0x63AB0442, // weapon_hominglauncher
  0x99AEEB3B, // weapon_knife
  0x958A4A8F, // weapon_bat
  0x24B17070, // weapon_grenade
  0x2C3731D9, // weapon_molotov
  0xFB888791  // gadget_parachute
];

alt.onClient('vmenu:giveWeapon', (player, weaponHash, ammo) => {
  if (!player || !player.valid) return;
  player.giveWeapon(weaponHash, ammo || 9999, true);
  alt.emitClient(player, 'vmenu:notify', '~g~Weapon added.');
});

alt.onClient('vmenu:giveAllWeapons', (player) => {
  if (!player || !player.valid) return;
  for (const w of ALL_WEAPONS) {
    player.giveWeapon(w, 9999, false);
  }
  alt.emitClient(player, 'vmenu:notify', '~g~Full weapon arsenal received!');
});

alt.onClient('vmenu:removeAllWeapons', (player) => {
  if (!player || !player.valid) return;
  player.removeAllWeapons();
  alt.emitClient(player, 'vmenu:notify', '~y~All weapons removed.');
});

// Teleport
alt.onClient('vmenu:teleport', (player, x, y, z) => {
  if (!player || !player.valid) return;
  player.pos = new alt.Vector3(x, y, z);
  alt.emitClient(player, 'vmenu:notify', '~g~Teleported successfully!');
});

// Repair / Delete Vehicle
alt.onClient('vmenu:repairVehicle', (player) => {
  if (!player || !player.valid) return;
  if (player.vehicle) {
    player.vehicle.repair();
    alt.emitClient(player, 'vmenu:notify', '~g~Vehicle repaired and cleaned.');
  } else if (playerVehicles.has(player.id)) {
    const veh = playerVehicles.get(player.id);
    if (veh && veh.valid) veh.repair();
    alt.emitClient(player, 'vmenu:notify', '~g~Spawned vehicle repaired.');
  }
});

alt.onClient('vmenu:deleteVehicle', (player) => {
  if (!player || !player.valid) return;
  if (player.vehicle) {
    player.vehicle.destroy();
  } else if (playerVehicles.has(player.id)) {
    const veh = playerVehicles.get(player.id);
    if (veh && veh.valid) veh.destroy();
    playerVehicles.delete(player.id);
  }
  alt.emitClient(player, 'vmenu:notify', '~y~Vehicle deleted.');
});

// Weather and Time (Global)
alt.onClient('vmenu:setWeather', (player, weatherName) => {
  if (!player || !player.valid) return;
  for (const p of alt.Player.all) {
    p.setWeather(weatherName);
  }
  alt.emitClient(player, 'vmenu:notify', `~b~Weather set to ${weatherName}`);
});

alt.onClient('vmenu:setTime', (player, hour, minute) => {
  if (!player || !player.valid) return;
  for (const p of alt.Player.all) {
    p.setDateTime(1, 1, 2026, hour, minute, 0);
  }
  alt.emitClient(player, 'vmenu:notify', `~b~Time set to ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
});

// Cleanup on player disconnect
alt.on('playerDisconnect', (player) => {
  if (playerVehicles.has(player.id)) {
    const veh = playerVehicles.get(player.id);
    if (veh && veh.valid) {
      veh.destroy();
    }
    playerVehicles.delete(player.id);
  }
});
