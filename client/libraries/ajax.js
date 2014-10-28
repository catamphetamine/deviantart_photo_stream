function ajax(url, data, options) {
	var resolver = Promise.pending()

	var request = new XMLHttpRequest()

	// request.withCredentials = true

	var method = 'get'
	if (options && options.method) {
		method = options.method
	}

	if (data && method === 'get') {
		
		var first = true

		for (var key in data) {
			if (first) {
				url += '?'
				first = false
			}
			else {
				url += '&'
			}
			url += encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
		}
	}

	request.open(method.toUpperCase(), url, true)

	request.onload = function(e) {
		if (this.status != 200) {
			return resolver.reject(this.status)
		}

		// var data = JSON.parse(this.response);

		resolver.resolve(this.responseText)
	}

	request.onerror = function(error) {
		resolver.reject(error)
	}

	request.ontimeout = function() {
		resolver.reject('timeout')
	}

	request.onabort = function() {
		resolver.reject('abort')
	}

	if (data && method === 'post') {
		var parameters = JSON.stringify(data)

		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
		request.setRequestHeader("Content-length", parameters.length);
		request.send(parameters)
	}
	else {
		request.send()
	}

	return resolver.promise
}