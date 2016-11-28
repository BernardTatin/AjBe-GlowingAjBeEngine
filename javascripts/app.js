/*
 * app.js
 */
/*
 * The MIT License
 *
 * Copyright 2016 bernard.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/* global LazyLoad, purejsLib, Session */

"use strict";

var marcel_kernel = (function () {
    // constants
    var appConstants = {
        // javascript source base directory
        jsRoot: 'bright-marcel-kernel/javascripts'
    };
    // can be modified by program in a future release
    var appVariables = {
        monads: ['private/maybe.js', 'private/environment.js'],
        // first libs to load
        beforelibs: ['private/utils.js', 'private/mon-query.js'],
        // all libs
        libs: ['private/myajax.js', 'private/purejs-lib.js', 'private/jprint.js', 'private/pages.js'],
        // code entry point
        main_code: 'private/session.js',
        // library name
        libname: 'pure Javascript 0.2.3',
        // navigator name
        navigator: null
    };
    // normalize library name
    function normalize_libname(libname) {
        return appConstants.jsRoot + '/' + libname;
    }


    var self = {};

    // return only library name
    self.app_type = function () {
        return appVariables.libname;
    };
    // load all necessary code
    self.app_loader = function () {
        // TODO : must be elsewhere
        appVariables.navigator = navigator.appName + ' ' + navigator.appCodeName + ' ' + navigator.appVersion;
        // three steps loader
        LazyLoad.js(appVariables.monads.map(normalize_libname), function () {
            LazyLoad.js(appVariables.beforelibs.map(normalize_libname), function () {
                LazyLoad.js(appVariables.libs.map(normalize_libname), function () {
                    LazyLoad.js(normalize_libname(appVariables.main_code), function () {
                        function start() {
                            var session = new Session.Session();
                            session.run();
                        }
                        docReady(start);
                    });
                });
            });
        });
    };

    return self;
})();

// what to do on load
marcel_kernel.app_loader();
