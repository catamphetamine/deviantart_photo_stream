# Роскомнадзор занёс в чёрный список DeviantART
# DeviantArt.com is blocked by the Russian Firewall, so using a public anonymous proxy

include = (path) -> require(__dirname + '/' + path)
global.include = include

http = require 'http'

Root_folder = require('path').normalize(__dirname + '/..')
global.Root_folder = Root_folder

include 'language'

fs = require('fs')
global.extend = require 'node.extend'

# Configuration
configuration = JSON.parse(fs.readFileSync(Root_folder + '/configuration.json'))
global.configuration = configuration

if typeof configuration.proxy == 'string'
	configuration.proxy =
		host : configuration.proxy.split(':')[0]
		port : configuration.proxy.split(':')[1]

# Logging
log4js = require 'log4js'
log = log4js.getLogger()
log.setLevel(if configuration.debug then 'DEBUG' else 'INFO')
global.log = log

include('web')