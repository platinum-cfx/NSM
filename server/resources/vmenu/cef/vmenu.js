(() => {
  // Global Toggles
  const toggles = {
    godmode: false,
    fastrun: false,
    superjump: false,
    infammo: false,
    vehgodmode: false
  };

  // Helper to send events to alt:V client
  function send(event, ...args) {
    if (typeof alt !== 'undefined' && alt.emit) {
      alt.emit(event, ...args);
    } else {
      console.log(`[vMenu Debug] emit '${event}':`, ...args);
    }
  }

  // Menus structure
  const MENUS = {
    main: {
      title: 'MAIN MENU',
      items: [
        { label: 'Player Options', icon: '🧍', desc: 'Health, armour, godmode, running speed, and respawning.', sub: 'player' },
        { label: 'Ped / Character Changer', icon: '🎭', desc: 'Change your character into multiplayer, story, or service peds.', sub: 'ped' },
        { label: 'Vehicle Spawner', icon: '🚗', desc: 'Spawn and customize supercars, sports cars, emergency vehicles, and more.', sub: 'vehicle' },
        { label: 'Weapon Options', icon: '🔫', desc: 'Arm yourself with weapons, refill ammunition, or get infinite ammo.', sub: 'weapons' },
        { label: 'Teleport Locations', icon: '📍', desc: 'Fast-travel around Los Santos, Blaine County, or your map waypoint.', sub: 'teleports' },
        { label: 'Time & Weather', icon: '⛅', desc: 'Change the world weather, time of day, or freeze time.', sub: 'weather' }
      ]
    },

    player: {
      title: 'PLAYER OPTIONS',
      items: [
        { label: 'God Mode', icon: '🛡️', desc: 'Make your character immune to all damage.', toggle: 'godmode', action: () => {
          toggles.godmode = !toggles.godmode;
          send('vmenu:toggleGodmode', toggles.godmode);
        }},
        { label: 'Heal Player', icon: '❤️', desc: 'Restore full health and clear wounds.', action: () => {
          send('vmenu:heal');
        }},
        { label: 'Max Armour', icon: '🛡️', desc: 'Give full body armour (100%).', action: () => {
          send('vmenu:armour');
        }},
        { label: 'Clean Character', icon: '✨', desc: 'Wash away blood, dirt, and scrapes.', action: () => {
          send('vmenu:clean');
        }},
        { label: 'Clear Wanted Level', icon: '⭐', desc: 'Remove all police attention and wanted stars.', action: () => {
          send('vmenu:clearWanted');
        }},
        { label: 'Fast Run', icon: '⚡', desc: 'Greatly increases on-foot sprint speed.', toggle: 'fastrun', action: () => {
          toggles.fastrun = !toggles.fastrun;
          send('vmenu:toggleFastRun', toggles.fastrun);
        }},
        { label: 'Super Jump', icon: '🦘', desc: 'Jump significantly higher into the air.', toggle: 'superjump', action: () => {
          toggles.superjump = !toggles.superjump;
          send('vmenu:toggleSuperJump', toggles.superjump);
        }},
        { label: 'Suicide / Respawn', icon: '💀', desc: 'Respawn fresh at Legion Square.', action: () => {
          send('vmenu:suicide');
        }}
      ]
    },

    ped: {
      title: 'PED / CHARACTER CHANGER',
      items: [
        { label: 'Multiplayer Male (Freemode)', icon: '🧍', desc: 'Multiplayer customizable male character.', action: () => send('vmenu:setPed', 'mp_m_freemode_01') },
        { label: 'Multiplayer Female (Freemode)', icon: '🚶‍♀️', desc: 'Multiplayer customizable female character.', action: () => send('vmenu:setPed', 'mp_f_freemode_01') },
        { label: 'Story Characters', icon: '🎬', desc: 'Play as Michael, Franklin, or Trevor.', sub: 'ped_story' },
        { label: 'Emergency & Law Services', icon: '👮', desc: 'Play as Police, Sheriff, SWAT, or Paramedic.', sub: 'ped_emergency' },
        { label: 'Gangs & Civilians', icon: '🕶️', desc: 'Play as Ballas, Families, Vagos, or locals.', sub: 'ped_gangs' },
        { label: 'Special & Fun Peds', icon: '👽', desc: 'Alien, Space Ranger, Pogo Monkey, and Zombie.', sub: 'ped_special' }
      ]
    },

    ped_story: {
      title: 'STORY CHARACTERS',
      items: [
        { label: 'Michael De Santa', icon: '💼', desc: 'Michael Townley / De Santa model.', action: () => send('vmenu:setPed', 'player_zero') },
        { label: 'Franklin Clinton', icon: '🧢', desc: 'Franklin Clinton model.', action: () => send('vmenu:setPed', 'player_one') },
        { label: 'Trevor Philips', icon: '🎽', desc: 'Trevor Philips model.', action: () => send('vmenu:setPed', 'player_two') }
      ]
    },

    ped_emergency: {
      title: 'EMERGENCY & LAW PEDS',
      items: [
        { label: 'LSPD Police Officer', icon: '👮', desc: 'Los Santos Police Department patrolman.', action: () => send('vmenu:setPed', 's_m_y_cop_01') },
        { label: 'Sheriff Deputy', icon: '🤠', desc: 'Blaine County Sheriff deputy.', action: () => send('vmenu:setPed', 's_m_y_sheriff_01') },
        { label: 'SWAT Operator', icon: '🪖', desc: 'Tactical SWAT officer with heavy gear.', action: () => send('vmenu:setPed', 's_m_y_swat_01') },
        { label: 'Paramedic / EMS', icon: '🚑', desc: 'Emergency medical services paramedic.', action: () => send('vmenu:setPed', 's_m_m_paramedic_01') },
        { label: 'Firefighter', icon: '🚒', desc: 'Los Santos Fire Department member.', action: () => send('vmenu:setPed', 's_m_y_fireman_01') }
      ]
    },

    ped_gangs: {
      title: 'GANGS & LOCALS',
      items: [
        { label: 'Ballas Gangster', icon: '🟣', desc: 'Ballas South Central member.', action: () => send('vmenu:setPed', 'g_m_y_ballasout_01') },
        { label: 'Chamberlain Families', icon: '🟢', desc: 'Chamberlain Gangster Families member.', action: () => send('vmenu:setPed', 'g_m_y_famca_01') },
        { label: 'Los Santos Vagos', icon: '🟡', desc: 'Vagos street gang member.', action: () => send('vmenu:setPed', 'g_m_y_mexgoon_01') },
        { label: 'Downtown Skater', icon: '🛹', desc: 'Local urban street skater.', action: () => send('vmenu:setPed', 'a_m_y_skater_01') }
      ]
    },

    ped_special: {
      title: 'SPECIAL & FUN PEDS',
      items: [
        { label: 'Movie Alien', icon: '👽', desc: 'Intergalactic green movie alien.', action: () => send('vmenu:setPed', 's_m_m_movalien_01') },
        { label: 'Republican Space Ranger', icon: '🚀', desc: 'Armored Space Ranger hero.', action: () => send('vmenu:setPed', 'u_m_y_rsranger_01') },
        { label: 'Pogo the Monkey', icon: '🐵', desc: 'Pogo masked monkey suit.', action: () => send('vmenu:setPed', 'u_m_y_pogo_01') },
        { label: 'Undead Zombie', icon: '🧟', desc: 'Apocalyptic decaying zombie.', action: () => send('vmenu:setPed', 'u_m_y_zombie_01') }
      ]
    },

    vehicle: {
      title: 'VEHICLE SPAWNER',
      items: [
        { label: 'Vehicle Management', icon: '🔧', desc: 'Repair, clean, godmode, or delete your vehicle.', sub: 'veh_options' },
        { label: 'Super Cars', icon: '🏎️', desc: 'Fastest exotic hypercars in the game.', sub: 'veh_super' },
        { label: 'Sports Cars', icon: '🏁', desc: 'High performance sports coupes and sedans.', sub: 'veh_sports' },
        { label: 'Muscle Cars', icon: '🐎', desc: 'American muscle cars and hot rods.', sub: 'veh_muscle' },
        { label: 'Emergency Vehicles', icon: '🚨', desc: 'Police cruisers, ambulances, and fire trucks.', sub: 'veh_emergency' },
        { label: 'Motorcycles', icon: '🏍️', desc: 'Superbikes, dirt bikes, and cruisers.', sub: 'veh_motorcycles' },
        { label: 'Helicopters & Aircraft', icon: '🚁', desc: 'Attack choppers, civilian helicopters, and jets.', sub: 'veh_aircraft' }
      ]
    },

    veh_options: {
      title: 'VEHICLE OPTIONS',
      items: [
        { label: 'Repair Vehicle', icon: '🛠️', desc: 'Instantly fix engine, tires, bodywork, and wash dirt.', action: () => send('vmenu:repairVehicle') },
        { label: 'Clean Vehicle', icon: '🧼', desc: 'Wash away dust, mud, and dirt marks.', action: () => send('vmenu:cleanVehicle') },
        { label: 'Vehicle God Mode', icon: '🛡️', desc: 'Make your vehicle indestructible.', toggle: 'vehgodmode', action: () => {
          toggles.vehgodmode = !toggles.vehgodmode;
          send('vmenu:toggleVehGodmode', toggles.vehgodmode);
        }},
        { label: 'Max Engine Tune', icon: '🚀', desc: 'Apply maximum performance upgrades.', action: () => send('vmenu:tuneVehicle') },
        { label: 'Delete Current Vehicle', icon: '🗑️', desc: 'Removes the vehicle you are currently driving.', action: () => send('vmenu:deleteVehicle') }
      ]
    },

    veh_super: {
      title: 'SUPER CARS',
      items: [
        { label: 'Truffade Adder', icon: '🏎️', desc: 'Bugatti inspired hypercar.', action: () => send('vmenu:spawnVehicle', 'adder') },
        { label: 'Pegassi Zentorno', icon: '🏎️', desc: 'Futuristic aggressive hypercar.', action: () => send('vmenu:spawnVehicle', 'zentorno') },
        { label: 'Progen T20', icon: '🏎️', desc: 'Active aero hybrid supercar.', action: () => send('vmenu:spawnVehicle', 't20') },
        { label: 'Pegassi Osiris', icon: '🏎️', desc: 'Gull-wing exotic hypercar.', action: () => send('vmenu:spawnVehicle', 'osiris') },
        { label: 'Grotti Cheetah', icon: '🏎️', desc: 'Iconic Italian supercar.', action: () => send('vmenu:spawnVehicle', 'cheetah') },
        { label: 'Vapid FMJ', icon: '🏎️', desc: 'GT endurance race supercar.', action: () => send('vmenu:spawnVehicle', 'fmj') }
      ]
    },

    veh_sports: {
      title: 'SPORTS CARS',
      items: [
        { label: 'Annis Elegy RH8', icon: '🏁', desc: 'All-wheel drive Japanese tuner icon.', action: () => send('vmenu:spawnVehicle', 'elegy2') },
        { label: 'Karin Kuruma (Armored)', icon: '🛡️', desc: 'Bulletproof armor plated sports sedan.', action: () => send('vmenu:spawnVehicle', 'kuruma2') },
        { label: 'Dinka Jester', icon: '🏁', desc: 'Mid-engine hybrid track weapon.', action: () => send('vmenu:spawnVehicle', 'jester') },
        { label: 'Pfister Comet', icon: '🏁', desc: 'Rear-engine German sports icon.', action: () => send('vmenu:spawnVehicle', 'comet2') },
        { label: 'Dewbauchee Massacro', icon: '🏁', desc: 'British grand tourer.', action: () => send('vmenu:spawnVehicle', 'massacro') },
        { label: 'Karin Sultan', icon: '🏁', desc: 'Rally-inspired 4-door sports sedan.', action: () => send('vmenu:spawnVehicle', 'sultan') }
      ]
    },

    veh_muscle: {
      title: 'MUSCLE CARS',
      items: [
        { label: 'Vapid Dominator', icon: '🐎', desc: 'High horsepower modern muscle pony car.', action: () => send('vmenu:spawnVehicle', 'dominator') },
        { label: 'Bravado Gauntlet', icon: '🐎', desc: 'Heavy hitting classic American muscle.', action: () => send('vmenu:spawnVehicle', 'gauntlet') },
        { label: 'Imponte Phoenix', icon: '🐎', desc: 'T-top 70s muscle with iconic spoiler.', action: () => send('vmenu:spawnVehicle', 'phoenix') },
        { label: 'Declasse Sabre Turbo', icon: '🐎', desc: 'Pure Detroit vintage muscle iron.', action: () => send('vmenu:spawnVehicle', 'sabregt') }
      ]
    },

    veh_emergency: {
      title: 'EMERGENCY VEHICLES',
      items: [
        { label: 'Police Cruiser (Stanier)', icon: '🚨', desc: 'Classic LSPD patrol cruiser.', action: () => send('vmenu:spawnVehicle', 'police') },
        { label: 'Police Interceptor (Taurus)', icon: '🚨', desc: 'High-speed modern police interceptor.', action: () => send('vmenu:spawnVehicle', 'police3') },
        { label: 'Sheriff Cruiser', icon: '🚨', desc: 'Blaine County Sheriff patrol sedan.', action: () => send('vmenu:spawnVehicle', 'sheriff') },
        { label: 'FIB Buffalo', icon: '🚨', desc: 'Undercover federal investigation muscle sedan.', action: () => send('vmenu:spawnVehicle', 'fbi') },
        { label: 'Ambulance', icon: '🚑', desc: 'Full medical paramedic response unit.', action: () => send('vmenu:spawnVehicle', 'ambulance') },
        { label: 'Fire Truck', icon: '🚒', desc: 'Engine with operational water cannon.', action: () => send('vmenu:spawnVehicle', 'firetruk') }
      ]
    },

    veh_motorcycles: {
      title: 'MOTORCYCLES',
      items: [
        { label: 'Pegassi Bati 801', icon: '🏍️', desc: 'Superfast Italian track motorcycle.', action: () => send('vmenu:spawnVehicle', 'bati') },
        { label: 'Dinka Akuma', icon: '🏍️', desc: 'Exceptional acceleration naked streetfighter.', action: () => send('vmenu:spawnVehicle', 'akuma') },
        { label: 'Western Sanchez', icon: '🏍️', desc: 'Versatile dual-sport off-road dirt bike.', action: () => send('vmenu:spawnVehicle', 'sanchez') },
        { label: 'Shitzu Hakuchou', icon: '🏍️', desc: 'Heavyweight highway sport-tourer.', action: () => send('vmenu:spawnVehicle', 'hakuchou') }
      ]
    },

    veh_aircraft: {
      title: 'AIRCRAFT & HELICOPTERS',
      items: [
        { label: 'Buzzard Attack Chopper', icon: '🚁', desc: 'Equipped with miniguns and homing rockets.', action: () => send('vmenu:spawnVehicle', 'buzzard2') },
        { label: 'Maverick Helicopter', icon: '🚁', desc: 'Reliable twin-engine civilian chopper.', action: () => send('vmenu:spawnVehicle', 'maverick') },
        { label: 'P-996 LAZER Military Jet', icon: '✈️', desc: 'Supersonic fighter jet with explosive cannons.', action: () => send('vmenu:spawnVehicle', 'lazer') },
        { label: 'Western Besra', icon: '✈️', desc: 'Acrobatic agile trainer jet.', action: () => send('vmenu:spawnVehicle', 'besra') },
        { label: 'Buckingham Swift', icon: '🚁', desc: 'Luxury twin-rotor executive helicopter.', action: () => send('vmenu:spawnVehicle', 'swift') }
      ]
    },

    weapons: {
      title: 'WEAPON OPTIONS',
      items: [
        { label: 'Give All Weapons', icon: '🎒', desc: 'Load your inventory with every firearm and explosive.', action: () => send('vmenu:giveAllWeapons') },
        { label: 'Refill All Ammo', icon: '📦', desc: 'Max out ammunition counts on all current weapons.', action: () => send('vmenu:refillAmmo') },
        { label: 'Infinite Ammo', icon: '♾️', desc: 'Never run out of ammunition or have to reload.', toggle: 'infammo', action: () => {
          toggles.infammo = !toggles.infammo;
          send('vmenu:toggleInfAmmo', toggles.infammo);
        }},
        { label: 'Remove All Weapons', icon: '🗑️', desc: 'Clear all weapons from your character inventory.', action: () => send('vmenu:removeAllWeapons') },
        { label: 'Give Parachute', icon: '🪂', desc: 'Equip an emergency steerable parachute.', action: () => send('vmenu:giveWeapon', 0xFB888791, 1) },
        { label: 'Handguns & Pistols', icon: '🔫', desc: 'Pistol, Combat Pistol, AP Pistol, Heavy Pistol.', sub: 'wep_pistols' },
        { label: 'Submachine Guns', icon: '🔫', desc: 'Micro SMG, SMG, Combat MG.', sub: 'wep_smgs' },
        { label: 'Assault Rifles', icon: '🔫', desc: 'AK-47, Carbine Rifle, Special Carbine.', sub: 'wep_rifles' },
        { label: 'Sniper Rifles', icon: '🎯', desc: 'High power precision long-range rifles.', sub: 'wep_snipers' },
        { label: 'Heavy & Explosives', icon: '💥', desc: 'RPG, Minigun, Homing Launcher, Grenades.', sub: 'wep_heavy' }
      ]
    },

    wep_pistols: {
      title: 'PISTOLS & HANDGUNS',
      items: [
        { label: 'Standard Pistol', icon: '🔫', desc: 'Semi-automatic 9mm handgun.', action: () => send('vmenu:giveWeapon', 0x1B06D571, 200) },
        { label: 'Combat Pistol', icon: '🔫', desc: 'High capacity tactical combat sidearm.', action: () => send('vmenu:giveWeapon', 0x5EF9FEC4, 250) },
        { label: 'AP Pistol', icon: '🔫', desc: 'Fully automatic high rate-of-fire machine pistol.', action: () => send('vmenu:giveWeapon', 0x22D3FE03, 300) },
        { label: 'Heavy Pistol', icon: '🔫', desc: 'Powerful .45 ACP heavy caliber handgun.', action: () => send('vmenu:giveWeapon', 0xD205520E, 200) },
        { label: 'Heavy Revolver', icon: '🔫', desc: 'Devastating high caliber six-shooter.', action: () => send('vmenu:giveWeapon', 0xC1B3C3D1, 100) }
      ]
    },

    wep_smgs: {
      title: 'SUBMACHINE GUNS & MGS',
      items: [
        { label: 'Micro SMG', icon: '🔫', desc: 'Compact high-speed machine pistol.', action: () => send('vmenu:giveWeapon', 0x13532244, 400) },
        { label: 'SMG (MP5)', icon: '🔫', desc: 'Accurate and dependable 9mm submachine gun.', action: () => send('vmenu:giveWeapon', 0x2BE6766B, 500) },
        { label: 'Combat MG', icon: '🔫', desc: 'Heavy belt-fed squad light machine gun.', action: () => send('vmenu:giveWeapon', 0x78A97CD0, 600) }
      ]
    },

    wep_rifles: {
      title: 'ASSAULT RIFLES',
      items: [
        { label: 'Assault Rifle (AK-47)', icon: '🔫', desc: 'Iconic Russian 7.62mm rifle with great stopping power.', action: () => send('vmenu:giveWeapon', 0xBFEFFF6D, 400) },
        { label: 'Carbine Rifle (M4)', icon: '🔫', desc: 'Tactical modular American assault rifle.', action: () => send('vmenu:giveWeapon', 0x83BF0278, 450) },
        { label: 'Special Carbine (G36C)', icon: '🔫', desc: 'Compact German precision assault rifle.', action: () => send('vmenu:giveWeapon', 0xC0A3098D, 450) }
      ]
    },

    wep_snipers: {
      title: 'SNIPER RIFLES',
      items: [
        { label: 'Sniper Rifle', icon: '🎯', desc: 'Bolt-action precision scoped hunting rifle.', action: () => send('vmenu:giveWeapon', 0x05FC3C11, 100) },
        { label: 'Heavy Sniper (.50 cal)', icon: '🎯', desc: 'Armor-piercing anti-materiel sniper rifle.', action: () => send('vmenu:giveWeapon', 0x0C472FE2, 100) }
      ]
    },

    wep_heavy: {
      title: 'HEAVY & EXPLOSIVES',
      items: [
        { label: 'Rocket Launcher (RPG)', icon: '🚀', desc: 'Shoulder-fired unguided explosive rocket.', action: () => send('vmenu:giveWeapon', 0xB1CA77B1, 20) },
        { label: 'Homing Launcher', icon: '🚀', desc: 'Heat-seeking anti-aircraft missile launcher.', action: () => send('vmenu:giveWeapon', 0x63AB0442, 20) },
        { label: 'Minigun', icon: '⚙️', desc: 'Six-barrel rotary machine gun with insane fire rate.', action: () => send('vmenu:giveWeapon', 0x42CD0B34, 9999) },
        { label: 'Frag Grenades', icon: '💣', desc: 'Explosive fragmentation hand grenades.', action: () => send('vmenu:giveWeapon', 0x24B17070, 25) },
        { label: 'Molotov Cocktails', icon: '🔥', desc: 'Incendiary bottle bombs that spread fire.', action: () => send('vmenu:giveWeapon', 0x2C3731D9, 25) }
      ]
    },

    teleports: {
      title: 'TELEPORT LOCATIONS',
      items: [
        { label: 'Teleport to Waypoint', icon: '🎯', desc: 'Instantly warp to your purple map waypoint marker.', action: () => send('vmenu:tpWaypoint') },
        { label: 'Legion Square (Downtown)', icon: '🏛️', desc: 'Heart of Downtown Los Santos.', action: () => send('vmenu:teleport', 198.8, -934.3, 30.7) },
        { label: 'Los Santos Customs (Burton)', icon: '🔧', desc: 'Central vehicle modification garage.', action: () => send('vmenu:teleport', -365.4, -131.8, 38.7) },
        { label: 'Maze Bank Tower (Helipad)', icon: '🏢', desc: 'Highest point in Downtown Los Santos.', action: () => send('vmenu:teleport', -75.0, -818.6, 326.2) },
        { label: 'LSIA Airport (Runway)', icon: '🛫', desc: 'Los Santos International Airport main runway.', action: () => send('vmenu:teleport', -1037.7, -2737.8, 20.2) },
        { label: 'Sandy Shores Airfield', icon: '🌵', desc: 'Trevor’s desert runway in Blaine County.', action: () => send('vmenu:teleport', 1747.0, 3273.8, 41.1) },
        { label: 'Mount Chiliad Summit', icon: '⛰️', desc: 'Peak of Mount Chiliad overlooking the map.', action: () => send('vmenu:teleport', 452.0, 5567.0, 781.2) },
        { label: 'Fort Zancudo (Military Base)', icon: '🪖', desc: 'Restricted military base runway.', action: () => send('vmenu:teleport', -2047.0, 3132.0, 32.8) },
        { label: 'Del Perro Pier', icon: '🎡', desc: 'Amusement park and ocean boardwalk.', action: () => send('vmenu:teleport', -1652.0, -1071.0, 13.1) },
        { label: 'Vinewood Sign', icon: '⭐', desc: 'World famous Hollywood-style hillside sign.', action: () => send('vmenu:teleport', 711.4, 1198.0, 348.5) },
        { label: 'Diamond Casino & Resort', icon: '💎', desc: 'Vinewood luxury casino and resort entrance.', action: () => send('vmenu:teleport', 925.3, 46.8, 81.1) }
      ]
    },

    weather: {
      title: 'TIME & WEATHER',
      items: [
        { label: 'Weather: Extra Sunny', icon: '☀️', desc: 'Vibrant blue skies and clear daylight.', action: () => send('vmenu:setWeather', 'EXTRASUNNY') },
        { label: 'Weather: Clear', icon: '🌤️', desc: 'Crisp clear weather with gentle breeze.', action: () => send('vmenu:setWeather', 'CLEAR') },
        { label: 'Weather: Clouds', icon: '⛅', desc: 'Partly cloudy overcast sky.', action: () => send('vmenu:setWeather', 'CLOUDS') },
        { label: 'Weather: Overcast', icon: '☁️', desc: 'Heavy cloud cover and dim ambient light.', action: () => send('vmenu:setWeather', 'OVERCAST') },
        { label: 'Weather: Rain', icon: '🌧️', desc: 'Wet roads and atmospheric rainfall.', action: () => send('vmenu:setWeather', 'RAIN') },
        { label: 'Weather: Thunder', icon: '⚡', desc: 'Violent thunderstorms with flashes of lightning.', action: () => send('vmenu:setWeather', 'THUNDER') },
        { label: 'Weather: Foggy', icon: '🌫️', desc: 'Dense misty fog covering the city.', action: () => send('vmenu:setWeather', 'FOGGY') },
        { label: 'Weather: Snow', icon: '❄️', desc: 'Winter snowfall blanket across San Andreas.', action: () => send('vmenu:setWeather', 'XMAS') },
        { label: 'Time: Dawn (06:00)', icon: '🌅', desc: 'Early sunrise golden hour.', action: () => send('vmenu:setTime', 6, 0) },
        { label: 'Time: Noon (12:00)', icon: '☀️', desc: 'Midday sun directly overhead.', action: () => send('vmenu:setTime', 12, 0) },
        { label: 'Time: Sunset (18:00)', icon: '🌇', desc: 'Dramatic purple and orange evening dusk.', action: () => send('vmenu:setTime', 18, 0) },
        { label: 'Time: Midnight (00:00)', icon: '🌙', desc: 'Deep dark night with city neon lights.', action: () => send('vmenu:setTime', 0, 0) }
      ]
    }
  };

  // State management
  let menuStack = ['main'];
  let selectedIndex = 0;
  let isOpen = false;

  const container = document.getElementById('vmenu-container');
  const titleEl = document.getElementById('vmenu-subtitle');
  const counterEl = document.getElementById('vmenu-counter');
  const itemsEl = document.getElementById('vmenu-items');
  const descEl = document.getElementById('vmenu-desc');
  const closeBtn = document.getElementById('vmenu-close');

  function getCurrentMenuKey() {
    return menuStack[menuStack.length - 1];
  }

  function getCurrentMenu() {
    return MENUS[getCurrentMenuKey()] || MENUS.main;
  }

  function renderMenu() {
    const menu = getCurrentMenu();
    titleEl.textContent = menu.title;

    if (selectedIndex >= menu.items.length) {
      selectedIndex = Math.max(0, menu.items.length - 1);
    }

    counterEl.textContent = `${selectedIndex + 1} / ${menu.items.length}`;

    itemsEl.innerHTML = '';
    menu.items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'vmenu-row' + (idx === selectedIndex ? ' active' : '');

      const labelDiv = document.createElement('div');
      labelDiv.className = 'vmenu-row-label';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'vmenu-row-icon';
      iconSpan.textContent = item.icon || '•';

      const textSpan = document.createElement('span');
      textSpan.textContent = item.label;

      labelDiv.appendChild(iconSpan);
      labelDiv.appendChild(textSpan);
      row.appendChild(labelDiv);

      // Badge (Toggle or Submenu arrow)
      if (item.sub) {
        const arrow = document.createElement('span');
        arrow.className = 'vmenu-row-badge badge-arrow';
        arrow.textContent = '>';
        row.appendChild(arrow);
      } else if (item.toggle) {
        const tog = document.createElement('span');
        const isOn = !!toggles[item.toggle];
        tog.className = `vmenu-row-badge ${isOn ? 'badge-toggle-on' : 'badge-toggle-off'}`;
        tog.textContent = isOn ? 'ON' : 'OFF';
        row.appendChild(tog);
      }

      // Mouse click on row
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedIndex = idx;
        renderMenu();
        executeCurrent();
      });

      // Mouse hover on row
      row.addEventListener('mouseenter', () => {
        if (selectedIndex !== idx) {
          selectedIndex = idx;
          renderMenu();
        }
      });

      itemsEl.appendChild(row);
    });

    // Ensure active row is scrolled into view
    const activeRow = itemsEl.children[selectedIndex];
    if (activeRow) {
      activeRow.scrollIntoView({ block: 'nearest' });
    }

    // Update description footer
    const currentItem = menu.items[selectedIndex];
    descEl.textContent = currentItem && currentItem.desc ? currentItem.desc : 'Use arrow keys or mouse to select an option.';
  }

  function executeCurrent() {
    const menu = getCurrentMenu();
    const item = menu.items[selectedIndex];
    if (!item) return;

    if (item.sub) {
      menuStack.push(item.sub);
      selectedIndex = 0;
      renderMenu();
    } else if (typeof item.action === 'function') {
      item.action();
      renderMenu(); // re-render in case toggle changed
    }
  }

  function goBack() {
    if (menuStack.length > 1) {
      menuStack.pop();
      selectedIndex = 0;
      renderMenu();
    } else {
      closeMenu();
    }
  }

  function openMenu() {
    isOpen = true;
    container.classList.remove('hidden');
    renderMenu();
  }

  function closeMenu() {
    isOpen = false;
    container.classList.add('hidden');
    send('vmenu:close');
  }

  function toggleMenu() {
    if (isOpen) closeMenu();
    else openMenu();
  }

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
  });

  // Global Keyboard listener
  window.addEventListener('keydown', (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
      case 's':
      case 'S': {
        e.preventDefault();
        const menu = getCurrentMenu();
        selectedIndex = (selectedIndex + 1) % menu.items.length;
        renderMenu();
        break;
      }
      case 'ArrowUp':
      case 'w':
      case 'W': {
        e.preventDefault();
        const menu = getCurrentMenu();
        selectedIndex = (selectedIndex - 1 + menu.items.length) % menu.items.length;
        renderMenu();
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        executeCurrent();
        break;
      }
      case 'Backspace':
      case 'Escape': {
        e.preventDefault();
        goBack();
        break;
      }
      case 'm':
      case 'M':
      case 'F1': {
        e.preventDefault();
        closeMenu();
        break;
      }
    }
  });

  // Handle incoming commands from alt:V client script
  if (typeof alt !== 'undefined' && alt.on) {
    alt.on('vmenu:toggle', () => {
      toggleMenu();
    });
    alt.on('vmenu:open', () => {
      openMenu();
    });
    alt.on('vmenu:closeMenu', () => {
      closeMenu();
    });
  }

  // Initial state: hidden until toggled by player
  renderMenu();
})();
