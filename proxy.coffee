# Роскомнадзор занёс в чёрный список DeviantART
# DeviantArt.com is blocked by the Russian Firewall, so using a public anonymous proxy

http = require 'http'

proxy_host_port = require('fs').readFileSync("#{__dirname}/proxy.txt", "utf8")

configuration = 
	proxy:
		host : proxy_host_port.split(':')[0]
		port : proxy_host_port.split(':')[1]

# http://blog.vanamco.com/proxy-requests-in-node-js/
proxy = (url, callback) ->
	request_options = 
		host   : configuration.proxy.host
		port   : configuration.proxy.port
		method : 'GET'
		path   : url
		
	console.log "Proxying #{url}"

	request = http.request request_options, (response) ->
		# result.setEncoding('utf8')
		chunks = []

		response.on('data', (chunk) -> chunks.push(chunk))
		response.on('end', () -> callback(null, response.statusCode, response.headers, chunks.join('')))
	
	# Post data
	# if data
	# 	request.write(data)

	request.end()

domains = require 'domain'

server = http.createServer((request, response) ->
	url_parts = require('url').parse(request.url, true)
	query = url_parts.query

	domain = domains.create()

	domain.on 'error', (error) ->
		console.error('error', error.stack)

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

	# Because req and res were created before this domain existed,
	# we need to explicitly add them.
	# See the explanation of implicit vs explicit binding below.
	domain.add(request)
	domain.add(response)

	# Now run the handler function in the domain.
	domain.run ->
		if not query.url
			response.writeHead(200, { 'Content-Type': 'text/plain' })
			response.write('"url" parameter is required')
			return response.end()

		proxy query.url, process.domain.intercept (status, headers, data) ->
			# console.log status
			# console.log headers
			# console.log data
			headers['Access-Control-Allow-Origin'] = '*'
			response.writeHead(status, headers)
			response.write(data)
			response.end()
)
.listen(9000)