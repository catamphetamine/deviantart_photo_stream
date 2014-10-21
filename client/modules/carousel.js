define(['modules/photostream', 'modules/database'], function (photostream, database) {
	var carousel = {
		timers: {
			Carousel_cycle_interval: 5 * 60 * 1000,
			// for testing:
			// Carousel_cycle_interval: 5 * 1000,
			Image_fade_time: 2 * 1000 // sync this value with the stylesheet
		},

		index: -1,

		current_image: function() {
			if (this.index < 0 || this.index >= database.images.length) {
				return
			}
			return database.images[this.index]
		},

		cycle: function(options) {
			this.index++

			if (this.index > database.images.length || database.images.is_empty()) {
				this.index = -1
				return photostream.refresh_images()
			}

			if (database.images.is_empty()) {
				console.log('No images to show')
			}
			else {
				console.log('Cycling to image #' + this.index)

				carousel.show_image(database.images[this.index], options)
			}
		},

		image_added: function() {
			if (this.index === -1) {
				this.cycle()
			}
		},

		start: function(container) {
			console.log('Start carousel')
			this.container = container

			container.addEventListener('click', function () {
				if (carousel.current_image()) {
					carousel.blacklist_image()
				}
				carousel.cycle({ forced: true })
			})

			this.cycle()
			setInterval(this.cycle.bind(this), this.timers.Carousel_cycle_interval)
		},

		show_image: function(image, options) {
			console.log('Show image', image)

			var current_image = this.container.querySelector('.image')

			var loading_image = document.createElement('img')

			loading_image.onload = function() {

				var new_image = document.createElement('div')
				new_image.classList.add('image')
				new_image.style.backgroundImage = 'url("' + image + '")'

				carousel.container.appendChild(new_image)

				setTimeout(function() {
					var shown_class = (options && options.forced) ? 'shown_forced' : 'shown'
					new_image.classList.add(shown_class)
				}, 
				100)

				if (current_image) {
					setTimeout(function() {
						carousel.container.removeChild(current_image)
					},
					carousel.timers.Image_fade_time + 1 * 1000)
				}
			}

			loading_image.src = image
		},

		blacklist_image: function() {
			database.blacklist.push(this.current_image())
			database.images.remove(this.current_image())
		}
	}

	database.on_image_added(carousel.image_added.bind(carousel))

	return carousel
})