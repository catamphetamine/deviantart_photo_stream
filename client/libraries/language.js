Object.extend = function(a, b) {
	if (b) {
		Object.keys(b).forEach(function(key) {
			a[key] = b[key]
		})
	}

	return a
}

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

Object.defineProperty(Element.prototype, "removeNode", {
	enumerable: false,
	value: function() {
		return this.parentNode.removeChild(this)
	}
})

Object.defineProperty(Function.prototype, "delayed", {
	enumerable: false,
	value: function(delay) {
		return setTimeout(this, delay)
	}
})

function do_while (test, tick) {
	tick = tick || 1000
	var resolver = Promise.pending()

	function cycle() {
		if (test()) {
			return resolver.resolve()
		}
		setTimeout(cycle, tick)
	}

	cycle()
	
	return resolver.promise
}

window.do_while = do_while

/* From Modernizr */
function whichTransitionEvent () {
	var t
	var el = document.createElement('fakeelement')
	var transitions = {
		'transition':'transitionend',
		'OTransition':'oTransitionEnd',
		'MozTransition':'transitionend',
		'WebkitTransition':'webkitTransitionEnd'
	}

	for (t in transitions) {
		if (el.style[t] !== undefined) {
			return transitions[t]
		}
	}
}

String.prototype.starts_with = function(what) {
	return this.indexOf(what) === 0
}

var wait = function(delay) {
	return new Promise(function (resolve, reject) {
		setTimeout(resolve, delay)
	})
}