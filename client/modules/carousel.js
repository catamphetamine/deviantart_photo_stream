define(['modules/photostream', 'modules/database'], function (photostream, database) {
	var carousel = {
		timers: {
			Carousel_cycle_interval: 5 * 60 * 1000,
			// for testing:
			// Carousel_cycle_interval: 10 * 1000,
			Image_fade_time: 2 * 1000, // sync this value with the stylesheet
			Query_images_interval: 10 * 1000
		},

		index: -1,

		current_image: function() {
			if (this.index < 0 || this.index >= database.images.length) {
				return
			}
			return database.images[this.index]
		},

		query_and_show_images: function() {
			return photostream.refresh_images().then(function() {
				this.cycling = false
				return this.cycle()
			}
			.bind(this))
		},

		cycle: function(options) {
			if (this.cycling) {
				return Promise.reject('Already cycling')
			}

			this.cycling = true

			if (this.cycle_timeout) {
				clearTimeout(this.cycle_timeout)
				this.cycle_timeout = null
			}

			this.index++

			if (this.index >= database.images.length || database.images.is_empty()) {
				this.index = -1

				return this.query_and_show_images().finally(function() {
					this.cycling = false
				}
				.bind(this))
			}

			console.log('Cycling to image #' + this.index)

			return carousel.show_image(database.images[this.index], options).then(function() {

				this.cycle_timeout = this.cycle.bind(this).delayed(this.timers.Carousel_cycle_interval)
				this.cycling = false
			}
			.bind(this))
		},

		image_added: function() {
			if (this.index === -1) {
				this.cycle()
			}
		},

		start: function(container) {
			console.log('Start carousel')
			this.container = container

			this.cycle().catch(function() {
				this.cycle.bind(this).delayed(this.timers.Query_images_interval)
			}
			.bind(this))
		},

		skip: function() {
			if (carousel.current_image()) {
				carousel.blacklist_image()
			}
			return carousel.cycle({ forced: true })
		},

		show_image: function(image, options) {
			return new Promise(function (resolve, reject) {
				console.log('Show image', image)

				var loading_image = document.createElement('img')

				loading_image.onload = (function() {

					var current_image = this.container.querySelector('.image:last-child')

					// to do: templater

					var new_image = document.createElement('section')
					new_image.classList.add('image')
					new_image.style.backgroundImage = 'url("' + image.url + '")'

					carousel.container.appendChild(new_image)

					var header = document.createElement('header')
					header.classList.add('picture_header')

					var title = document.createElement('h1')
					title.classList.add('picture_title')

					header.appendChild(title)

					var link = document.createElement('a')
					link.classList.add('picture_link')
					link.setAttribute('target', 'blank')
					link.setAttribute('href', image.link)
					link.innerHTML = image.title

					var author_link = document.createElement('a')
					author_link.classList.add('author_link')
					author_link.setAttribute('target', 'blank')
					author_link.setAttribute('href', image.author_link)
					author_link.innerHTML = image.author

					var by = document.createTextNode(' by ')

					title.appendChild(link)
					title.appendChild(by)
					title.appendChild(author_link)

					// var description = document.createElement('p')
					// description.innerHTML = image.descirption

					new_image.appendChild(header)
					// new_image.appendChild(description)

					// force css to animate between style class changes
					function finish() {
						var shown_class = (options && options.forced) ? 'shown_animated_fast' : 'shown_animated_slow'

						if (current_image) {
							/* Listen for a transition */
							new_image.addEventListener(whichTransitionEvent(), function() {
								current_image.removeNode()
							})
						}
						
						new_image.classList.add(shown_class)

						resolve()
					}

					finish.delayed(0)
				})
				.bind(this)

				loading_image.onerror = function(error) {
					reject(error)
				}

				loading_image.src = image.url
			}
			.bind(this))
		},

		blacklist_image: function() {
			database.blacklist.push(this.current_image().url)
			database.images.remove(this.current_image())
		}
	}

	return carousel
})