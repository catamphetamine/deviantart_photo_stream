define([], function () {
	var database = {
		images: [],
		blacklist: [],

		listeners: {
			on_image_added: []
		},

		add_image: function (image) {
			if (this.blacklist.has(image)) {
				return
			}

			if (this.images.has(image)) {
				return
			}

			console.log('Adding image', image)

			this.images.push(image)

			this.listeners.on_image_added.forEach(function(listener) {
				listener()
			})
		},

		on_image_added: function (action) {
			this.listeners.on_image_added.push(action)
		}
	}

	return database
})
