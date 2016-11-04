"use strict";

var marcel_kernel = (function () {
    // constants
    var appConstants = {
        // javascript source base directory
        jsRoot: 'bright-marcel-kernel/javascripts'
    },
    // can be modified by program in a future release
    appVariables = {
        // code entry point
        main_code: 'private/main-purejs.js',
        // first libs to load
        beforelibs: ['public/joose.min.js', 'private/utils.js'],
        // all libs
        libs: ['private/myajax.js', 'private/purejs-lib.js', 'private/jprint.js'],
        // library name
        libname: 'pure Javascript 0.2.0',
        // navigator name
        navigator: null
    };
    // normalize library name
    function normalize_libname(libname) {
        return appConstants.jsRoot + '/' + libname;
    }

    return {
        // return only library name
        app_type: function () {
            return appVariables.libname;
        },
        // load all necessary code
        app_loader: function () {
            // TODO : must be elsewhere
            appVariables.navigator = navigator.appName + ' ' + navigator.appCodeName + ' ' + navigator.appVersion;
            // three steps loader
            LazyLoad.js(appVariables.beforelibs.map(normalize_libname), function () {
                LazyLoad.js(appVariables.libs.map(normalize_libname), function () {
                    LazyLoad.js(normalize_libname(appVariables.main_code), function () {
                    });
                });
            });
        }
    };
})();

// what to do on load
marcel_kernel.app_loader();
