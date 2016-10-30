"use strict";

var marcel_kernel = (function () {
    var appConstants = {
        jsRoot: 'bright-marcel-kernel/javascripts'
    },
        appVariables = {
            config: 'gitio/pages/config.js',
            main_code: 'private/main-purejs.js',
            libs: ['public/joose.min.js', 'private/utils.js', 'private/myajax.js', 'private/purejs-lib.js', 'private/jprint.js'],
            libname: 'pure Javascript 0.1.1',
            navigator: null
        };

    function normalize_libname(libname) {
        return appConstants.jsRoot + '/' + libname;
    }

    return {
        app_type: function () {
            return appVariables.libname;
        },
        app_loader: function () {
            appVariables.navigator = navigator.appName + ' ' + navigator.appCodeName + ' ' + navigator.appVersion;
            LazyLoad.js(appVariables.config, function () {
                LazyLoad.js(appVariables.libs.map(normalize_libname), function () {
                    LazyLoad.js(normalize_libname(appVariables.main_code), function () {
                    });
                });
            });
        }
    };
})();

marcel_kernel.app_loader();
