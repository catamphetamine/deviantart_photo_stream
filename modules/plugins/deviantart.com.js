define(['modules/database', 'modules/carousel'], function (database, carousel) {
	return {
		run: function() {
			var resolver = Promise.pending()

			var parser = new DOMParser()

			function pick_images(document) {
				var elements = document.querySelectorAll('.tinythumb')

				var elements_array = []
				var i = 0
				while (i < elements.length) {
					elements_array.push(elements[i])
					i++
				}

				return elements_array
			}

			// DeviantArt.com is blocked by the Russian Firewall, so using a public anonymous proxy
			// url: "http://anonymouse.org/cgi-bin/anon-www.cgi/http://www.deviantart.com/",
			ajax('http://localhost:9000/', { url: 'http://www.deviantart.com/' }, {
				dataType: "html"
			})
			.then(function(data) {
				var document = parser.parseFromString(data, "text/html")

				Promise.map(pick_images(document), function(element) {
					// var resolver = Promise.pending()

					var deviation_link = element.parentNode.getAttribute('href')

					if (!deviation_link) {
						return;
					}

					ajax('http://localhost:9000/', { url: deviation_link }, {
						dataType: "html"
					})
					.then(function(data) {
						var document = parser.parseFromString(data, "text/html")
						var image = document.querySelector('img.dev-content-full')

						database.add_image(image.src)
						carousel.image_added()
					})
					.catch(function(error) {
						console.error('Loading image failed')
						if (error) {
							console.error(error)
						}
						// resolver.reject(error)
					})

					// return resolver.promise
				})

				return resolver.resolve()
			})
			.catch(function(error) {
				console.error('Loading DeviantArt images failed')
				if (error) {
					console.error(error)
				}
				resolver.reject(error || new Error('Loading DeviantArt images failed'))
			})

			return resolver.promise
		}
	}
})