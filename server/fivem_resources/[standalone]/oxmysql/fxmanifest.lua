-- NSM note: upstream's repo does not ship fxmanifest.lua (it is generated for
-- their release builds); this minimal manifest lets the resource load. The
-- MySQL API itself is provided natively by fivem-compat (cfx/runtime.js) and
-- '@oxmysql/lib/MySQL.lua' imports are intercepted there.
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'oxmysql'
author 'Linden'
description 'Database wrapper for FiveM'
version '2.14.3'

files {
    'lib/MySQL.lua',
}
