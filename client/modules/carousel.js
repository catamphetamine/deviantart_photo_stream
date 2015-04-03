define(['modules/photostream', 'modules/database', 'modules/template'], function (photostream, database, template) {

	function Invalid_image_error(message) {
		this.message = message
		this.name    = "Invalid_image_error"

		Error.captureStackTrace(this, Invalid_image_error)
	}

	Invalid_image_error.prototype             = Object.create(Error.prototype)
	Invalid_image_error.prototype.constructor = Invalid_image_error

	var carousel = {
		Max_image_height_to_width_ratio: 4,

		timers: {
			Carousel_cycle_interval: 5 * 60 * 1000,
			Retry_delay: 10 * 1000,
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

		cycle_after_blacklist: function(options) {
			return this.go_to(this.index, Object.extend({ refresh_on_exhaustion: true }, options))
		},

		cycle: function(options) {
			return this.go_to(this.index + 1, Object.extend({ refresh_on_exhaustion: true }, options))
		},

		go_to: function(to, options) {
			if (this.cycling) {
				return Promise.reject('Already cycling')
			}

			this.cycling = true

			if (this.cycle_timeout) {
				clearTimeout(this.cycle_timeout)
				this.cycle_timeout = null
			}

			this.index = to

			if (this.index < 0) {
				if (database.images.is_empty()) {
					this.index = 0
				}
				else {
					this.index = database.images.length - 1
				}
			}

			if (this.index < 0 || this.index >= database.images.length) {

				if (options.refresh_on_exhaustion) {

					this.index = -1

					return this.query_and_show_images().catch(function() {
						this.cycling = false
						return wait(carousel.timers.Retry_delay).then(function() {
							return this.go_to(to, options)
						}.bind(this))
					}
					.bind(this)).then(function() {
						this.cycling = false
					}
					.bind(this))
				}
				else {
					if (database.images.is_empty()) {
						return Promise.resolve()
					}
					this.index = 0
				}
			}

			console.log('')
			console.log('Cycling to image #' + (this.index + 1))

			var schedule_next_cycle = function() {

				this.cycle_timeout = this.cycle.bind(this).delayed(this.timers.Carousel_cycle_interval)
				this.cycling = false
			}
			.bind(this)

			var recursive_try = function() {
				return carousel.load_image(database.images[this.index]).catch(function() { 
					return wait(carousel.timers.Retry_delay).then(recursive_try)
				})
				.then(function(image) {
					return carousel.validate_image(image)
				})
				.then(function(image) {
					return carousel.show_image(image, options)
				})
				.then(schedule_next_cycle)
				.catch(Invalid_image_error, function() {
					console.log('Image isn\'t suitable')
					carousel.cycling = false
					return carousel.cycle()
				})
			}
			.bind(this)

			return recursive_try()
		},

		previous: function() {
			return this.go_to(this.index - 1, { forced: true })
		},

		next: function() {
			return this.go_to(this.index + 1, { forced: true })
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
			return carousel.cycle_after_blacklist({ forced: true })
		},

		load_image: function(image) {
			return new Promise(function (resolve, reject) {
				console.log('Load image', image.url)

				var loading_image = document.createElement('img')

				loading_image.onload = function() {
					image.width  = this.width
					image.height = this.height
					resolve(image)
				}

				loading_image.onerror = function(error) {
					reject(error)
				}

				loading_image.src = image.url
			})
		},

		validate_image: function(image) {
			console.log('Validate image')

			if (image.height / image.width  > carousel.Max_image_height_to_width_ratio) {
				throw new Invalid_image_error('Image is too slim')
			}

			return image
		},

		show_image: function(image, options) {
			// var image         = image_data.image_info
			// var image_element = image_data.image_element

			return new Promise(function (resolve, reject) {
				console.log('Showing image', image)

				var current_image = this.container.querySelector('.image:last-child')

				template.render("picture", image).then(function(new_image) {

					carousel.container.appendChild(new_image)

					// force css to animate between style class changes
					function finish() {

						function add_class (element, style_class) {

							return new Promise(function (resolve, reject) {
								/* Listen for a transition */
								var listener

								function remove_listener() {
									element.removeEventListener(whichTransitionEvent(), listener)
								}

								var resolved = false

								function finish() {
									if (resolved) {
										return
									}

									resolved = true

									remove_listener()
									resolve()
								}

								listener = function (event) {

									// // && !(!propertyName || event.propertyName === propertyName)
									if (event.target !== element) {
										return
									}

									finish()
								}

								element.addEventListener(whichTransitionEvent(), listener)

								element.classList.add(style_class)

								// in case of lags, unfreeze the animation
								Promise.delay(2000).then(finish)
							})
						}

						var shown_class = (options && options.forced) ? 'image_shown_fast' : 'image_shown_slow'
						var hidden_class = (options && options.forced) ? 'image_hidden_fast' : 'image_hidden_slow'

						// for testing
						// var shown_class = (options && options.forced) ? 'image_shown_slow' : 'image_shown_slow'
						// var hidden_class = (options && options.forced) ? 'image_hidden_slow' : 'image_hidden_slow'

						if (current_image) {
							current_image.classList.add(hidden_class)
						}

						add_class(new_image, shown_class).then(function() {

							if (current_image) {
								// for debugging
								// console.log('removing node', current_image)
								// console.log('event', event)

								current_image.removeNode()
							}

							resolve()
						})
					}

					finish.delayed(10)
				})
			}
			.bind(this))
		},

		blacklist_image: function() {
			database.blacklist(this.current_image())
		}
	}

	return carousel
})
