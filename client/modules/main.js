define(function (require) {
	require(['modules/photostream', 'modules/carousel', 'modules/database', 'modules/plugins/deviantart.com'], function (photostream, carousel, database, deviantart) {

		// document.addEventListener("DOMContentLoaded", function (event) {

		Promise.longStackTraces();

		var container = document.querySelector('.container')

		photostream.plugin(deviantart)

		carousel.start(container)

		// })
	})
})