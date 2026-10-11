-- esx-probe client: observes the REAL es_extended client runtime.
--   * join flow: NetworkIsPlayerActive -> esx:onPlayerJoined -> server DB load
--     -> esx:playerLoaded -> ESX.PlayerData applied + ESX.PlayerLoaded = true
--   * server -> client sync: esx:setJob / esx:setMoney update ESX.PlayerData
--   * ESX.TriggerServerCallback (callback form) and ESX.AwaitServerCallback
--     (promise form) round-trip to a real ESX.RegisterServerCallback
local ESX = exports['es_extended']:getSharedObject()

probe = {
    playerLoaded = 'waiting',
    jobName = nil,
    money = nil,
    coords = nil,
    setJobEvents = {},
    setMoneyEvents = 0,
    cbResult = 'pending',
    cbAwait = 'pending',
}

AddEventHandler('esx:setJob', function(job, lastJob)
    probe.setJobEvents[#probe.setJobEvents + 1] = (type(job) == 'table' and job.name) or tostring(job)
end)

RegisterNetEvent('esx:setMoney', function(money)
    probe.setMoneyEvents = probe.setMoneyEvents + 1
    probe.lastSetMoney = money
end)

CreateThread(function()
    -- wait for the full join flow to complete (server DB load + playerLoaded)
    local waited = 0
    while not ESX.PlayerLoaded and waited < 15000 do
        Wait(100)
        waited = waited + 100
    end
    probe.playerLoaded = ESX.PlayerLoaded == true
    probe.waitedMs = waited
    probe.jobName = ESX.PlayerData and ESX.PlayerData.job and ESX.PlayerData.job.name or nil
    probe.money = ESX.PlayerData and ESX.PlayerData.money or nil
    probe.group = ESX.PlayerData and ESX.PlayerData.group or nil
    probe.coords = ESX.PlayerData and ESX.PlayerData.coords or nil

    -- let post-load events settle
    Wait(500)

    -- server callback, callback form
    ESX.TriggerServerCallback('esx-probe:double', function(r)
        probe.cbResult = r
    end, 21)

    Wait(800)

    -- server callback, await form (xLib promise path)
    local ok, res = pcall(function()
        return ESX.AwaitServerCallback('esx-probe:double', 42)
    end)
    probe.cbAwait = ok and res or ('ERR:' .. tostring(res))
end)

exports('GetProbeJson', function()
    probe.pdJob = ESX.PlayerData and ESX.PlayerData.job and ESX.PlayerData.job.name or nil
    probe.pdMoney = ESX.PlayerData and ESX.PlayerData.money or nil
    return json.encode(probe)
end)
