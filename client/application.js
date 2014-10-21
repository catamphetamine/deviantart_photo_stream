requirejs.config({
    baseUrl: 'libraries',
    paths: {
        modules: '../modules'
    }
})

requirejs(['modules/main'])