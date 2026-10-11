-- qb-probe client: exercises qb-core's REAL client code paths and records
-- what actually happened. No stubs of qb-core itself — this resource only
-- observes and calls the real framework.
--   * exports['qb-core']:GetCoreObject()  (live shared table)
--   * QBCore:Client:OnPlayerUpdated  ->  QBCore.PlayerData applied + local events
--   * QBCore.Functions.TriggerCallback  (promise form with Citizen.Await AND callback form)
--   * QBCore.Functions.Notify  ->  SendNUIMessage
local QBCore = exports['qb-core']:GetCoreObject()

probe = {
    jobEvents = {},
    gangEvents = 0,
    setDataCount = 0,
    notifyOk = false,
    cbPromise = 'pending',
    cbCallback = 'pending',
    cash = nil,
    job = nil,
    citizenid = nil,
    sourceOnCallback = nil,
}

AddEventHandler('QBCore:Client:OnJobUpdate', function(job)
    probe.jobEvents[#probe.jobEvents + 1] = (type(job) == 'table' and job.name) or tostring(job)
end)

AddEventHandler('QBCore:Client:OnGangUpdate', function(gang)
    probe.gangEvents = probe.gangEvents + 1
end)

AddEventHandler('QBCore:Player:SetPlayerData', function(pd)
    probe.setDataCount = probe.setDataCount + 1
    if type(pd) == 'table' and pd.citizenid then probe.citizenid = pd.citizenid end
end)

local function snapshot()
    local pd = QBCore.PlayerData or {}
    probe.cash = pd.money and pd.money.cash or nil
    probe.job = pd.job and pd.job.name or nil
    probe.citizenid = probe.citizenid or pd.citizenid or nil
end

exports('getProbeJson', function()
    snapshot()
    return __jsonEncode(probe)
end)

CreateThread(function()
    Wait(300)

    -- 1. Notify goes through qb-core's real client function -> SendNUIMessage
    local ok, err = pcall(function()
        QBCore.Functions.Notify('hello from qb-probe', 'success', 1000)
    end)
    probe.notifyOk = ok
    if not ok then probe.notifyErr = tostring(err) end

    -- 2. Server callback, promise form (Citizen.Await under the hood)
    local ok2, result = pcall(function()
        return QBCore.Functions.TriggerCallback('qb-probe:double', 21)
    end)
    probe.cbPromise = ok2 and result or ('ERR:' .. tostring(result))

    -- 3. Server callback, callback form (what most qb resources use).
    --    Real resources never issue two requests on the SAME callback name
    --    concurrently (the registry is keyed by name) — so wait for #2 first.
    Wait(400)
    QBCore.Functions.TriggerCallback('qb-probe:double', function(r)
        probe.cbCallback = r
    end, 50)
end)
