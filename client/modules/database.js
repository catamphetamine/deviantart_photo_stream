define([], function () {
	var database = {
		images: [],
		blacklisted: [],

		add_image: function (image) {

			if (this.blacklisted.has(image.url)) {
				return
			}

			// to do: deep equals
			// if (this.images.has(image)) {
			// 	return
			// }

			console.log('Adding image', image)

			this.images.push(image)
		},

		blacklist: function(image) {
			this.blacklisted.push(image.url)
			this.images.remove(image)

			ajax('/blacklist', { image: image.url }, { method: 'post' })
		},

		load_blacklist: function(blacklist) {
			
			return ajax('/blacklist').then(function(blacklist) {
				this.blacklisted = blacklist

				console.log('Blacklisted images', this.blacklisted)
			}
			.bind(this))
		}
	}

	return database
})
