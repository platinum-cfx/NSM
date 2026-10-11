fx_version 'cerulean'
game 'gta5'

author 'NSM compatibility suite'
description 'Multiplayer integration demo: bidirectional events, statebags, DB writes with two real client runtimes'
version '1.0.0'

server_scripts { 'server/main.lua' }
client_scripts { 'client/main.lua' }
dependency 'qb-core'
