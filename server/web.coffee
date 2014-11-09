http = require 'http'

# Express application

express = require('express')
application = express()

application.use(require('body-parser').urlencoded({ extended: yes }))
application.use(require('cookie-parser')())
application.use(require('express-session')({ secret: 'chris carter', resave: yes, saveUninitialized: yes }))

application.use(require('express-domain-middleware'))

application.get '/fetch', (request, response) ->
	if not request.query.url
		response.writeHead(200, { 'Content-Type': 'text/plain' })
		response.write('"url" parameter is required')
		return response.end()

	url = request.query.url
	options = {}

	if configuration.proxy
		# Today they give me 403 Forbidden error no matter what proxy i use
		if not configuration.forbidden
			options.proxy = configuration.proxy
		else if configuration.may_use_anonymouse_org
			options.proxy = 
				host: 'anonymouse.org'
				port: 80
			url = '/cgi-bin/anon-www.cgi/' + url

	proxy(url, options, { 'Access-Control-Allow-Origin': '*' }, response)

# domains = require 'domain'

# server = http.createServer((request, response) ->
# 	url_parts = require('url').parse(request.url, true)
# 	query = url_parts.query

# 	domain = domains.create()

# 	domain.on 'error', (error) ->
# 		console.error('error', error.stack)

# 		# Note: we're in dangerous territory!
# 		# By definition, something unexpected occurred,
# 		# which we probably didn't want.
# 		# Anything can happen now!  Be very careful!

# 		try
# 			# make sure we close down within 30 seconds
# 			killtimer = setTimeout((-> process.exit(1)), 30 * 1000)
# 			# But don't keep the process open just for that!
# 			killtimer.unref()

# 			# stop taking new requests.
# 			server.close()

# 			# try to send an error to the request that triggered the problem
# 			response.writeHead(500, { 'Content-Type': 'text/plain' })
# 			response.end('Server error. Shutting down.' + '\n\n' + error.stack)
# 		catch error
# 			# oh well, not much we can do at this point.
# 			console.error('Error sending 500!', error.stack)

# 	# Because req and res were created before this domain existed,
# 	# we need to explicitly add them.
# 	# See the explanation of implicit vs explicit binding below.
# 	domain.add(request)
# 	domain.add(response)

# 	# Now run the handler function in the domain.
# 	domain.run ->
# 		if not query.url
# 			response.writeHead(200, { 'Content-Type': 'text/plain' })
# 			response.write('"url" parameter is required')
# 			return response.end()

# 		proxy query.url, process.domain.intercept (status, headers, data) ->
# 			# console.log status
# 			# console.log headers
# 			# console.log data
# 			headers['Access-Control-Allow-Origin'] = '*'
# 			response.writeHead(status, headers)
# 			response.write(data)
# 			response.end()
# )
# .listen(9000)

# http://blog.vanamco.com/proxy-requests-in-node-js/
proxy = (url, options, custom_headers, final_response) ->
	requested = null

	if options.proxy
		requested = 
			method   : 'GET'
			path     : url
			hostname : options.proxy.host
			port     : options.proxy.port
	
		console.log "Proxying #{url} through #{options.proxy.host}:#{options.proxy.port}"
	else
		requested = require('url').parse(url)
		# emulate browser
		requested.headers = 
			'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.12) Gecko/20101026 Firefox/3.6.12'
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			'Accept-Language': 'en-us,en;q=0.5'
			'Accept-Encoding': 'gzip,deflate'

	request = http.request(requested, (response) ->
		headers = Object.clone(response.headers)

		compressed = response.headers['content-encoding'] == 'gzip'

		if compressed
			headers['content-length'] = null
			headers['content-encoding'] = null

		headers = extend(headers, custom_headers)

		final_response.writeHead(response.statusCode, headers)

		# result.setEncoding('utf8')

		if compressed
			response = response.pipe(require('zlib').createGunzip())

		response.pipe(final_response)
	)

	# Post data
	# if data
	# 	request.write(data)

	request.end()

# application.post '/api', (request, response) ->
# 	json_rpc.call(request, response)

application.use(express.static(Root_folder + '/client'))

# for angular.js routes
application.use (request, response) -> response.sendFile(Root_folder + '/client/index.html')

server = null

# domain error handling
application.use (error, request, response, next) ->
	console.log('error on request %d %s %s', process.domain.id, request.method, request.url)
	console.log(error.stack)

	if error.domain
		# Note: we're in dangerous territory!
		# By definition, something unexpected occurred,
		# which we probably didn't want.
		# Anything can happen now!  Be very careful!

		try
			# make sure we close down within 30 seconds
			killtimer = setTimeout((-> process.exit(1)), 30 * 1000)
			# But don't keep the process open just for that!
			killtimer.unref()

			# stop taking new requests.
			server.close()

			# try to send an error to the request that triggered the problem
			response.writeHead(500, { 'Content-Type': 'text/plain' })
			response.end('Server error. Shutting down.' + '\n\n' + error.stack)
		catch error
			# oh well, not much we can do at this point.
			console.error('Error sending 500!', error.stack)
	else
		response.writeHead(500, { 'Content-Type': 'text/plain' })
		response.end('Server error')

server = application.listen configuration.port, ->
	log.info "Now go to http://localhost:#{configuration.port}/"