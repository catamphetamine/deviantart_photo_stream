define([], function () {
	var database = {
		images: [],
		blacklist: [],

		add_image: function(image) {
			if (this.blacklist.has(image)) {
				return
			}

			if (this.images.has(image)) {
				return
			}

			console.log('Adding image', image)

			this.images.push(image)
		}
	}

	return database
})
