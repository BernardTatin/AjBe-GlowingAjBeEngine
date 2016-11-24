/*
 *
 * utils.js
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


/* global marcel_kernel */

"use strict";

var utils = (function () {
    var env = null;
    var vername = null;
    /**
     TODO : it's a duplicate of lazyload.js function getEnv

     Populates the <code>env</code> variable with user agent and feature test
     information.

     @method getEnv
     @private
     */
    function getEnv() {
        if (!env) {
            var ua = navigator.userAgent;
            env = {
            };

            (env.webkit = /AppleWebKit\//.test(ua))
                    || (env.ie = /MSIE|Trident/.test(ua))
                    || (env.opera = /Opera/.test(ua))
                    || (env.gecko = /Gecko\//.test(ua))
                    || (env.unknown = true);
            if (env.webkit) {
                env.name = 'Webkit';
            } else if (env.ie) {
                env.name = 'MSIE';
            } else if (env.gecko) {
                env.name = 'Gecko';
            } else {
                env.name = 'unknown';
            }
        }
        return env;
    }

    var self = {};

    self.setUrlInBrowser = function (url) {
        if (window.history && window.history.pushState) {
            window.history.pushState(document.title, document.title, url);
        }
    };
    self.app_string = function () {
        var element = document.getElementById('appname');
        if (element) {
            if (!vername) {
                vername = 'using ' + marcel_kernel.app_type() + ' on ' + getEnv().name + ' engine';
            }
            element.innerHTML = vername;
        }
    };

    return self;
})();
