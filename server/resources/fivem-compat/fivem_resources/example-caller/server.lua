-- FiveM-style resource that uses the v2 cfx-compat features.

-- exports: consume example-hello's export (cross-resource, FiveM syntax)
CreateThread(function()
    local sum = exports['example-hello']:addStuff(19, 23)
    print('exports cross-resource: 19 + 23 = ' .. tostring(sum))
end)

-- MySQL: oxmysql / mysql-async style with .await inside a thread
CreateThread(function()
    MySQL.ready(function()
        print('MySQL.ready fired')
    end)

    local ok, err = pcall(function()
        local rows = MySQL.query.await('SELECT identifier, firstname, lastname FROM users')
        if #rows > 0 then
            print('db query: ' .. #rows .. ' row(s), first = ' .. tostring(rows[1].firstname) .. ' ' .. tostring(rows[1].lastname))
        else
            print('db query: 0 row(s) - no players have joined yet')
        end

        local total = MySQL.scalar.await('SELECT COUNT(*) AS c FROM users')
        print('db scalar: ' .. tostring(total))

        MySQL.Async.query('SELECT identifier FROM users', {}, function(asyncRows)
            print('db callback style: ' .. #asyncRows .. ' row(s)')
        end)

        -- idempotent demo row (deleted first, so every boot looks the same);
        -- columns match the real esx-legacy `users` table
        MySQL.query.await("DELETE FROM users WHERE identifier = 'license:nsm-demo'")
        local insertId = MySQL.insert.await('INSERT INTO users (identifier, ssn, firstname, lastname) VALUES (?, ?, ?, ?)', { 'license:nsm-demo', '000000000', 'nsm', 'demo' })
        print('db insert id: ' .. tostring(insertId))

        local again = MySQL.scalar.await('SELECT COUNT(*) AS c FROM users')
        print('db scalar after insert: ' .. tostring(again))
    end)
    if not ok then
        print('DB example skipped/failed: ' .. tostring(err))
    end
end)

-- OneSync-style entity natives
CreateThread(function()
    local veh = CreateVehicle('adder', 200.0, -930.0, 31.0, 90.0, true, false)
    print('vehicle handle: ' .. tostring(veh) .. ' exists=' .. tostring(DoesEntityExist(veh)))

    SetVehicleNumberPlateText(veh, 'NSMTEST')
    print('plate: ' .. GetVehicleNumberPlateText(veh))

    local coords = GetEntityCoords(veh)
    print(('coords: %.1f, %.1f, %.1f'):format(coords.x, coords.y, coords.z))

    SetEntityHeading(veh, 180.0)
    print('heading: ' .. tostring(GetEntityHeading(veh)))

    DeleteEntity(veh)
    print('after delete exists=' .. tostring(DoesEntityExist(veh)))
end)

-- statebags on players (mapped to alt:V synced meta)
CreateThread(function()
    AddStateBagChangeHandler('money', nil, function(bagName, key, value)
        print(('statebag change: %s.%s = %s'):format(bagName, key, tostring(value)))
    end)

    Player(1).state.money = 500
    print('state read back: ' .. tostring(Player(1).state.money))

    Player(1).state.money = 750
end)

print('example-caller loaded')
