-- qb-probe server: one real qb-core server callback (CreateCallback), nothing else.
local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateCallback('qb-probe:double', function(source, cb, n)
    cb(tonumber(n) * 2)
end)
