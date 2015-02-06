define(function (require) {
	require(['modules/photostream', 'modules/carousel', 'modules/database'], function (photostream, carousel, database) {

		Promise.longStackTraces()

		ajax('/configuration').then(function(configuration) {
			
			// document.addEventListener("DOMContentLoaded", function (event) {

			var plugin_modules = configuration.sources.map(function(source) {	
				return 'modules/plugins/' + source
			})

			require(plugin_modules, function() {

				var plugins = Array.prototype.slice.call(arguments)

				plugins.forEach(function(plugin) {
					photostream.plugin(plugin)
				})

				dust.isDebug = true

				var container = document.querySelector('.container')

				ajax('/templates/picture.html').then(function(template) {
					
					dust.loadSource(dust.compile(template, 'picture'))
				})
				.then(function() {

					carousel.start(container)

					document.querySelector('.control.favourite').addEventListener('click', function (event) {
						// add to favourites
						// and update the icon

						console.log('to do: favourite', carousel.current_image())

						window.open(carousel.current_image().url,'_blank')
					})

					var skip = document.querySelector('.control.skip')

					function move_carousel_if_idle(action) {
						if (carousel.cycling) {
							return event.preventDefault()
						}

						skip.classList.add('skipping')

						action().finally(function() {
							skip.classList.remove('skipping')
						})
					}

					skip.addEventListener('click', function (event) {
						move_carousel_if_idle(carousel.skip.bind(carousel))
					})

					document.addEventListener('keydown', function (event) {
						switch (event.keyCode) {
							// left
							case 37:
								return move_carousel_if_idle(carousel.previous.bind(carousel))

							// Right
							case 39:
								return move_carousel_if_idle(carousel.next.bind(carousel))
						}
					})
				})
			})
		})
	})
})