define([], function () {
    var template = {
        render: function (name, data) {
            return new Promise(function(resolve, reject) {
                dust.render(name, data, function(error, markup) {
                    if (error) {
                        return reject(error)
                    }

                    var dummy = document.createElement('div')
                    dummy.innerHTML = markup

                    resolve(dummy.firstChild)
                })
            })
        }
    }

    return template
})