define(['modules/photostream', 'modules/spider'], function (photostream, spider) {
	return {
		run: function() {
			var parser = new DOMParser()

			function pick_images(document) {
				var elements = document.querySelectorAll('a[artstation-open-project] > img')

				var elements_array = []
				var i = 0
				while (i < elements.length) {
					elements_array.push(elements[i])
					i++
				}

				return elements_array
			}

			return spider.fetch('https://www.artstation.com/', { queue: 'artstation.com', interval: 1000 })
			.then(function(data) {
				var document = parser.parseFromString(data, 'text/html')

				// because they use Angular.js we're currently unable to fetch the images

				var images = pick_images(document)

				if (images.is_empty()) {
					return Promise.reject('No images')
				}

				return Promise.any(images.map(function(element) {
					var artwork_link = element.parentNode.getAttribute('href')

					if (!artwork_link) {
						return Promise.reject('No image link')
					}

					return spider.fetch(artwork_link, { queue: 'artstation.com', interval: 1000 })
					.then(function(data) {
						var document = parser.parseFromString(data, 'text/html')

						var image = document.querySelector('artstation-artwork > .artwork img')

						var title = document.querySelector('.artwork-info-container h3.title')
						var author = document.querySelector('.artwork-info-container .artist .name')

						// var description = document.querySelector('.dev-view-about .text')

						var result = photostream.add_image({
							title       : title.firstChild.nodeValue,
							author      : author.firstChild.nodeValue,
							author_link : author.getAttribute('href'),
							url         : image.getAttribute('src'),
							link        : artwork_link
						})

						if (!result) {
							return Promise.reject('Image blacklisted')
						}
					})
				}))
			})
		}
	}
})