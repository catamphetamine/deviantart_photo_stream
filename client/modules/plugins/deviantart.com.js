define(['modules/photostream', 'modules/spider'], function (photostream, spider) {
	return {
		run: function() {
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

			return spider.fetch('http://www.deviantart.com/', { queue: 'deviantart.com', interval: 1000 })
			.then(function(data) {
				var document = parser.parseFromString(data, 'text/html')

				var images = pick_images(document)

				if (images.is_empty()) {
					return Promise.reject('No images')
				}

				return Promise.any(images.map(function(element) {
					var deviation_link = element.parentNode.getAttribute('href')

					if (!deviation_link) {
						return Promise.reject('No image link')
					}

					return spider.fetch(deviation_link, { queue: 'deviantart.com', interval: 1000 })
					.then(function(data) {
						var document = parser.parseFromString(data, 'text/html')

						var image = document.querySelector('img.dev-content-full')

						var h1 = document.querySelector('.dev-page-container h1')
						var link = h1.querySelector('a')
						var author = h1.querySelector('.username')

						// var description = document.querySelector('.dev-view-about .text')

						photostream.add_image({
							title       : link.firstChild.nodeValue,
							author      : author.firstChild.nodeValue,
							author_link : author.getAttribute('href'),
							url         : image.getAttribute('src'),
							link        : link.getAttribute('href')
						})
					})
				}))
			})
		}
	}
})