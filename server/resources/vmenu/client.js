import * as alt from 'alt-client';
import * as native from 'natives';

let webview = null;
let isOpen = false;

// Active trainer player flags
let isGodmode = false;
let isFastRun = false;
let isSuperJump = false;
let isInfAmmo = false;
let isVehGodmode = false;

function showNotification(msg) {
  try {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(msg);
    native.endTextCommandThefeedPostTicker(false, true);
  } catch (e) {}
}

function initWebView() {
  if (webview) return;
  webview = new alt.WebView('http://resource/cef/vmenu.html');

  // Listeners from CEF
  webview.on('vmenu:close', () => {
    closeMenu();
  });

  webview.on('vmenu:toggleGodmode', (val) => {
    isGodmode = !!val;
    try {
      native.setEntityInvincible(alt.Player.local.scriptID, isGodmode);
    } catch (e) {}
    showNotification(isGodmode ? '~g~God Mode Enabled' : '~r~God Mode Disabled');
  });

  webview.on('vmenu:heal', () => {
    alt.emitServer('vmenu:healPlayer');
    try {
      native.setEntityHealth(alt.Player.local.scriptID, 200, 0);
      native.clearPedBloodDamage(alt.Player.local.scriptID);
    } catch (e) {}
  });

  webview.on('vmenu:armour', () => {
    alt.emitServer('vmenu:setArmour', 100);
    try {
      native.setPedArmour(alt.Player.local.scriptID, 100);
    } catch (e) {}
  });

  webview.on('vmenu:clean', () => {
    try {
      native.clearPedBloodDamage(alt.Player.local.scriptID);
      native.resetPedVisibleDamage(alt.Player.local.scriptID);
      native.clearPedWetness(alt.Player.local.scriptID);
    } catch (e) {}
    showNotification('~g~Character cleaned.');
  });

  webview.on('vmenu:clearWanted', () => {
    try {
      native.setPlayerWantedLevel(alt.Player.local.scriptID, 0, false);
      native.setPlayerWantedLevelNow(alt.Player.local.scriptID, false);
    } catch (e) {}
    showNotification('~g~Wanted level cleared.');
  });

  webview.on('vmenu:toggleFastRun', (val) => {
    isFastRun = !!val;
    showNotification(isFastRun ? '~g~Fast Run Enabled' : '~r~Fast Run Disabled');
  });

  webview.on('vmenu:toggleSuperJump', (val) => {
    isSuperJump = !!val;
    showNotification(isSuperJump ? '~g~Super Jump Enabled' : '~r~Super Jump Disabled');
  });

  webview.on('vmenu:suicide', () => {
    try {
      native.setEntityHealth(alt.Player.local.scriptID, 0, 0);
    } catch (e) {}
  });

  // Ped Changer
  webview.on('vmenu:setPed', (modelName) => {
    alt.emitServer('vmenu:setPed', modelName);
  });

  // Vehicle Spawner
  webview.on('vmenu:spawnVehicle', (modelName) => {
    alt.emitServer('vmenu:spawnVehicle', modelName);
  });

  webview.on('vmenu:repairVehicle', () => {
    alt.emitServer('vmenu:repairVehicle');
    try {
      const veh = alt.Player.local.vehicle;
      if (veh) {
        native.setVehicleFixed(veh.scriptID);
        native.setVehicleDeformationFixed(veh.scriptID);
        native.setVehicleUndriveable(veh.scriptID, false);
        native.setVehicleEngineHealth(veh.scriptID, 1000.0);
        native.setVehicleDirtLevel(veh.scriptID, 0.0);
      }
    } catch (e) {}
  });

  webview.on('vmenu:cleanVehicle', () => {
    try {
      const veh = alt.Player.local.vehicle;
      if (veh) {
        native.setVehicleDirtLevel(veh.scriptID, 0.0);
      }
    } catch (e) {}
    showNotification('~g~Vehicle cleaned.');
  });

  webview.on('vmenu:toggleVehGodmode', (val) => {
    isVehGodmode = !!val;
    try {
      const veh = alt.Player.local.vehicle;
      if (veh) {
        native.setEntityInvincible(veh.scriptID, isVehGodmode);
      }
    } catch (e) {}
    showNotification(isVehGodmode ? '~g~Vehicle God Mode Enabled' : '~r~Vehicle God Mode Disabled');
  });

  webview.on('vmenu:tuneVehicle', () => {
    try {
      const veh = alt.Player.local.vehicle;
      if (veh) {
        native.setVehicleModKit(veh.scriptID, 0);
        native.setVehicleMod(veh.scriptID, 11, native.getNumVehicleMods(veh.scriptID, 11) - 1, false); // Engine
        native.setVehicleMod(veh.scriptID, 12, native.getNumVehicleMods(veh.scriptID, 12) - 1, false); // Brakes
        native.setVehicleMod(veh.scriptID, 13, native.getNumVehicleMods(veh.scriptID, 13) - 1, false); // Transmission
        native.setVehicleMod(veh.scriptID, 15, native.getNumVehicleMods(veh.scriptID, 15) - 1, false); // Suspension
        native.toggleVehicleMod(veh.scriptID, 18, true); // Turbo
        showNotification('~g~Max vehicle tuning applied!');
      } else {
        showNotification('~r~You are not inside a vehicle.');
      }
    } catch (e) {}
  });

  webview.on('vmenu:deleteVehicle', () => {
    alt.emitServer('vmenu:deleteVehicle');
  });

  // Weapons
  webview.on('vmenu:giveWeapon', (hash, ammo) => {
    alt.emitServer('vmenu:giveWeapon', hash, ammo);
  });

  webview.on('vmenu:giveAllWeapons', () => {
    alt.emitServer('vmenu:giveAllWeapons');
  });

  webview.on('vmenu:removeAllWeapons', () => {
    alt.emitServer('vmenu:removeAllWeapons');
  });

  webview.on('vmenu:refillAmmo', () => {
    try {
      const ped = alt.Player.local.scriptID;
      const curWeapon = native.getCurrentPedWeapon(ped, 1);
      native.setPedAmmo(ped, curWeapon, 9999);
      showNotification('~g~Ammunition refilled.');
    } catch (e) {}
  });

  webview.on('vmenu:toggleInfAmmo', (val) => {
    isInfAmmo = !!val;
    try {
      native.setPedInfiniteAmmoClip(alt.Player.local.scriptID, isInfAmmo);
    } catch (e) {}
    showNotification(isInfAmmo ? '~g~Infinite Ammo Enabled' : '~r~Infinite Ammo Disabled');
  });

  // Teleports
  webview.on('vmenu:teleport', (x, y, z) => {
    alt.emitServer('vmenu:teleport', x, y, z);
  });

  webview.on('vmenu:tpWaypoint', () => {
    try {
      const blip = native.getFirstBlipInfoId(8); // 8 is Waypoint blip
      if (native.doesBlipExist(blip)) {
        const coords = native.getBlipInfoIdCoord(blip);
        alt.emitServer('vmenu:teleport', coords.x, coords.y, coords.z + 1.0);
        showNotification('~g~Teleported to waypoint.');
      } else {
        showNotification('~y~No waypoint found! Place a waypoint marker on the map first.');
      }
    } catch (e) {
      showNotification('~r~Failed to find waypoint.');
    }
  });

  // Weather & Time
  webview.on('vmenu:setWeather', (weatherName) => {
    alt.emitServer('vmenu:setWeather', weatherName);
  });

  webview.on('vmenu:setTime', (hour, minute) => {
    alt.emitServer('vmenu:setTime', hour, minute);
  });
}

function openMenu() {
  initWebView();
  isOpen = true;
  alt.showCursor(true);
  alt.toggleGameControls(false);
  webview.focus();
  webview.emit('vmenu:open');
}

function closeMenu() {
  if (!isOpen) return;
  isOpen = false;
  alt.showCursor(false);
  alt.toggleGameControls(true);
  if (webview) {
    webview.unfocus();
    webview.emit('vmenu:closeMenu');
  }
}

function toggleMenu() {
  if (isOpen) closeMenu();
  else openMenu();
}

// Keybind listener: 'M' key (77) or 'F1' key (112)
alt.on('keyup', (key) => {
  if (key === 77 || key === 112) {
    toggleMenu();
  } else if (key === 27 && isOpen) { // Escape
    closeMenu();
  }
});

// Auto seat player when server spawns their vehicle
alt.onServer('vmenu:vehicleSpawned', (veh) => {
  alt.setTimeout(() => {
    try {
      if (veh && veh.valid) {
        native.setPedIntoVehicle(alt.Player.local.scriptID, veh.scriptID, -1);
      }
    } catch (e) {}
  }, 100);
});

// Server notifications
alt.onServer('vmenu:notify', (msg) => {
  showNotification(msg);
});

// Per-frame tick for active trainer perks
alt.everyTick(() => {
  const ped = alt.Player.local.scriptID;

  if (isSuperJump) {
    native.setSuperJumpThisFrame(ped);
  }

  if (isFastRun) {
    native.setRunSprintMultiplierForPlayer(ped, 1.49);
  }

  if (isInfAmmo) {
    native.setPedInfiniteAmmoClip(ped, true);
  }

  if (isGodmode) {
    native.setEntityInvincible(ped, true);
  }

  if (isVehGodmode && alt.Player.local.vehicle) {
    native.setEntityInvincible(alt.Player.local.vehicle.scriptID, true);
  }
});

alt.log('[vMenu] vMenu Client Initialized. Press M or F1 in-game to toggle.');
