-- Only primitive args may reach alt.emitAllClients/alt.emitClient directly;
-- tables and functions must travel exclusively via the __fivem:net envelope.
TriggerClientEvent('nsm:prim', -1, 42, 'text', true)
TriggerClientEvent('nsm:obj', -1, { a = 1 })
TriggerClientEvent('nsm:cb', -1, function() end)

-- ESX's connection gate rejects players unless this reads 'on'
print('onesync convar: ' .. GetConvar('onesync', 'off'))
