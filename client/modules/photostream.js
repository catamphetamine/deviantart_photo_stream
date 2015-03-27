define(['modules/database'], function (database) {
	var photostream = {
		plugins: [],

		// timers: {
		// 	Image_refresh_failure_wait: 10 * 1000
		// },

		plugin: function(runner) {
			this.plugins.push(runner)
			this.active_plugin = runner
		},

		refresh_images: function() {
			return new Promise(function (resolve, reject) {
				if (this.refreshing_images) {
					return reject('Already refreshing images')
				}

				console.log('Refreshing image list')

				this.refreshing_images = true

				database.images = []

				return this.active_plugin.run().finally(function() {
					this.refreshing_images = false
					return resolve()
				}
				.bind(this))
			}
			.bind(this))
		},

		add_image: function(image) {

			if (image.url.lastIndexOf('http') > 0) {
				image.url = image.url.substring(image.url.lastIndexOf('http'))
			}

			if (image.link.lastIndexOf('http') > 0) {
				image.link = image.link.substring(image.link.lastIndexOf('http'))
			}

			if (image.author_link.lastIndexOf('http') > 0) {
				image.author_link = image.author_link.substring(image.author_link.lastIndexOf('http'))
			}

			return database.add_image(image)
		}

		// go: function() {
		// 	this.refresh_images().then(function() {
		// 		// setTimeout(refresh_images, Image_list_refresh_interval)
		// 	})
		// 	.catch(function(error) {
		// 		setTimeout(this.refresh_images.bind(this), this.timers.Image_refresh_failure_wait)
		// 	}
		// 	.bind(this))
		// }
	}

	return photostream
})