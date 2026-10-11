fx_version 'cerulean'
game 'gta5'

author 'NSM compatibility suite'
description 'ESX client behavior probe: join flow, PlayerData sync, callbacks — observes the real framework, no mocks of ESX itself'
version '1.0.0'

server_scripts { 'server.lua' }
client_scripts { 'client/main.lua' }
dependency 'es_extended'
