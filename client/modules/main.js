define(function (require) {
	require(['modules/photostream', 'modules/carousel', 'modules/database', 'modules/plugins/deviantart.com'], function (photostream, carousel, database, deviantart) {

		// document.addEventListener("DOMContentLoaded", function (event) {

		Promise.longStackTraces();

		var container = document.querySelector('.container')

		photostream.plugin(deviantart)

		carousel.start(container)

		document.querySelector('.control.favourite').addEventListener('click', function (event) {
			// add to favourites
			// and update the icon

			console.log('to do: favourite', carousel.current_image())

			window.open(carousel.current_image().url,'_blank')
		})

		var skip = document.querySelector('.control.skip')

		skip.addEventListener('click', function (event) {
			if (carousel.cycling) {
				return event.preventDefault()
			}

			skip.classList.add('skipping')

			carousel.skip().finally(function() {
				skip.classList.remove('skipping')
			})
		})

		// })
	})
})