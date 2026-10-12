-- esx-probe server: a real ESX server callback + observation of the server-side
-- player lifecycle. Nothing here mocks ESX — it uses the real framework.
local ESX = exports['es_extended']:getSharedObject()

ESX.RegisterServerCallback('esx-probe:double', function(source, cb, n)
    cb(tonumber(n) * 2)
end)

probe = {
    loaded = false,
    dropped = false,
}

AddEventHandler('esx:playerLoaded', function(playerId, xPlayer, isNew)
    if playerId == 1 then
        probe.loaded = true
        probe.isNew = isNew
        probe.identifier = xPlayer.identifier
        probe.jobName = xPlayer.getJob().name
    end
end)

AddEventHandler('playerDropped', function(reason)
    if source == 1 then
        probe.dropped = true
        probe.dropReason = reason
    end
end)

exports('GetProbeJson', function()
    local xPlayer = ESX.GetPlayerFromId(1)
    probe.xPlayerAlive = xPlayer ~= nil
    probe.money = xPlayer and xPlayer.getMoney() or nil
    return json.encode(probe)
end)

exports('SetJob', function(job, grade)
    local xPlayer = ESX.GetPlayerFromId(1)
    if not xPlayer then return false end
    return xPlayer.setJob(job, grade)
end)

exports('AddMoney', function(amount)
    local xPlayer = ESX.GetPlayerFromId(1)
    if not xPlayer then return false end
    xPlayer.addMoney(amount)
    return xPlayer.getMoney()
end)
