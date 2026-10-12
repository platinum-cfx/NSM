-- mp-demo server: exercised by test/multiplayer.test.mjs through the REAL
-- index.js server wiring and a REAL MariaDB.
local QBCore = exports['qb-core']:GetCoreObject()

-- client -> server: identity round trip + a per-player DB write.
-- Replies ONLY to the sender (targeted emit).
RegisterNetEvent('mp-demo:server:ping', function(note)
    local src = source
    local name = GetPlayerName(src)
    MySQL.insert('INSERT INTO mp_demo_notes (src, name, note) VALUES (?, ?, ?)', { src, name, tostring(note) })
    TriggerClientEvent('mp-demo:client:pong', src, 'pong:' .. tostring(name) .. ':' .. tostring(note))
end)

-- broadcast to every connected client (-1 target)
RegisterNetEvent('mp-demo:server:broadcast', function(text)
    TriggerClientEvent('mp-demo:client:bcast', -1, tostring(text))
end)

-- server-side command invoked from a client's ExecuteCommand / chat
RegisterCommand('mpnote', function(source, args)
    if not args[1] then return end
    TriggerClientEvent('mp-demo:client:cmdok', source, 'recorded ' .. tostring(args[1]))
end, false)

-- exports used by the test harness (live in-VM calls)
exports('login', function(src, citizenid, newData)
    return QBCore.Player.Login(src, citizenid, newData)
end)

exports('addMoney', function(src, amount)
    local Player = QBCore.Players[src]
    if not Player then return false end
    return Player.Functions.AddMoney('cash', amount, 'mp-test')
end)

exports('getMoney', function(src)
    local Player = QBCore.Players[src]
    if not Player then return -1 end
    return Player.PlayerData.money.cash or -1
end)

exports('save', function(src)
    QBCore.Player.Save(src)
    return true
end)

exports('citizenid', function(src)
    local Player = QBCore.Players[src]
    if not Player then return false end
    return Player.PlayerData.citizenid
end)

exports('setJob', function(src, job, grade)
    local Player = QBCore.Players[src]
    if not Player then return false end
    return Player.Functions.SetJob(job, grade)
end)
