Object.defineProperty(Array.prototype, "has", {
	enumerable: false,
	value: function(item) {
		return this.indexOf(item) >= 0
	}
})

Object.defineProperty(Array.prototype, "remove", {
	enumerable: false,
	value: function(item) {
		var removeCounter = 0

		for (var index = 0; index < this.length; index++) {
			if (this[index] === item) {
				this.splice(index, 1)
				removeCounter++
				index--
			}
		}

		return removeCounter
	}
})

Object.defineProperty(Array.prototype, "is_empty", {
	enumerable: false,
	value: function() {
		return this.length === 0
	}
})

Object.defineProperty(Array.prototype, "not_empty", {
	enumerable: false,
	value: function() {
		return this.length !== 0
	}
})

function do_while (test, tick) {
	tick = tick || 1000
	var resolver = Promise.pending()

	function cycle() {
		if (test()) {
			resolver.resolve()
		}
		else {
			setTimeout(cycle, tick)
		}
	}
	
	return resolver.promise
}

window.do_while = do_while