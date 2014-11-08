define([], function () {
    /**
     *  Break apart any path into parts
     *  'http://example.com:12345/blog/foo/bar?startIndex=1&pageSize=10' ->
     *    {
     *      "host": "example.com",
     *      "port": "12345",
     *      "search": {
     *        "startIndex": "1",
     *        "pageSize": "10"
     *      },
     *      "path": "/blog/foo/bar",
     *      "protocol": "http:"
     *    }
     */
    function getPathInfo(path) {
        //  create a link in the DOM and set its href
        var link = document.createElement('a');
        link.setAttribute('href', path);

        //  return an easy-to-use object that breaks apart the path
        return {
            host:     link.hostname,  //  'example.com'
            port:     link.port,      //  12345
            // search:   processSearchParams(link.search),  //  {startIndex: 1, pageSize: 10}
            path:     link.pathname,  //  '/blog/foo/bar'
            protocol: link.protocol   //  'http:'
        }
    }

    var spider = {
        last_accessed: {},

        fetch: function (url, options) {
            options = options || {}

            // console.log('fetch', url)
            // console.log('queue', options.queue)

            if (!options.queue) {
                return ajax('/fetch', { url: url })
            }

            // var host = getPathInfo(url).host
            var now = new Date().getTime()

            if (!this.last_accessed[options.queue] ||
                now - this.last_accessed[options.queue] >= options.interval) {

                this.last_accessed[options.queue] = now

                return ajax('/fetch', { url: url })
            }
            
            return Promise.delay(options.interval).then((function() {
                return this.fetch(url, options)
            }).bind(this))
        }
    }

    return spider
})