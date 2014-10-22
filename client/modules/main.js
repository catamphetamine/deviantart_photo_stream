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
		})

		document.querySelector('.control.skip').addEventListener('click', function (event) {
			carousel.skip()
			// and update the icon with a spinner
			// and disable the button
		})

		// })
	})
})