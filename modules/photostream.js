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
			console.log('Refreshing image list')

			database.images = []

			return this.active_plugin.run()
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