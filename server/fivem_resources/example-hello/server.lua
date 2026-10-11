-- Unmodified FiveM-style server script, running on NSM via cfx-compat.

RegisterNetEvent('nsm:hello', function(msg)
    local src = source
    local name = GetPlayerName(src)
    print(('nsm:hello from %s (src %d): %s'):format(name, src, msg))
    TriggerClientEvent('nsm:welcome', -1, name, msg)
end)

RegisterCommand('helloworld', function(source, args, rawCommand)
    print(('ran %s with %d arg(s): %s'):format(rawCommand, #args, table.concat(args, ' ')))
end, false)

RegisterNetEvent('playerDropped')

CreateThread(function()
    print('thread started; player count = ' .. GetPlayerCount())
    for i = 1, 3 do
        Citizen.Wait(100)
        print('tick ' .. i)
    end
    print('thread finished')
end)

SetConvar('nsm_test_convar', 'hello')
print('convar reads back: ' .. GetConvar('nsm_test_convar', 'unset'))
print('hash of "austi" = ' .. GetHashKey('austi'))
print('example-hello server.lua loaded OK')
