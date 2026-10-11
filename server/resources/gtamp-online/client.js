import * as alt from 'alt-client';
import * as native from 'natives';

alt.on('connectionComplete', () => {
  alt.log('[gtamp-online] Connection established! Preparing game environment...');

  // Ensure game screen fades in nicely
  native.doScreenFadeIn(1000);
  native.displayHud(true);
  native.displayRadar(true);

  // Show welcome notification
  try {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName('~g~Welcome to NSM Online!~s~\nSpawned at ~y~Legion Square~s~.\nPress ~b~M~s~ or ~b~F1~s~ for ~p~vMenu~s~.');
    native.endTextCommandThefeedPostTicker(false, true);
  } catch (e) {}
});

// Periodic heartbeat to keep connection alive
alt.setInterval(() => {
  // Client tick
}, 5000);
