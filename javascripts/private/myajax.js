/*
 * myajax.js
 *
 * classes for ajax request, using classic Javascript, before version 6
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


/* global utils */

"use strict";

var PrivateAjax = (function () {
    // this module pattern is described here
    //cf https://zestedesavoir.com/tutoriels/358/module-pattern-en-javascript/
    var self = {};

    self.AjaxStates = (function () {
        return {
            IDLE: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4
        };
    })();

    self.HttpStatus = (function () {
        return {
            OK: 200,
            NOTFOUND: 404
        };
    })();

    return self;
})();

var MyAjax = (function () {

    return {
        AjaxGetPage: function (ajax_listener) {
            var url = ajax_listener.urlName();
            var http_request = 'GET';
            var request = null;

            var prepareRequest = function () {
                request = window.getNewHttpRequest();
                request.ajax_listener = ajax_listener;

                if (request.timeout) {
                    request.timeout = 9000;
                }
                return request;
            };

            var openRequest = function () {
                request.open(http_request, url, true);
                request.onreadystatechange = function () {
                    if (request.readyState === PrivateAjax.AjaxStates.DONE) {
                        if (request.status === PrivateAjax.HttpStatus.OK) {
                            request.ajax_listener.on_success(request.responseText);
                        } else {
                            // TODO : afficher l'erreur
                            request.ajax_listener.on_failure("<h1>ERREUR " +
                                    request.status +
                                    " !!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
                        }
                    }
                };
            };

            this.send = function (data) {
                openRequest();
                if (utils.isUndefined(data)) {
                    request.send(null);
                } else {
                    request.send(data);
                }
            };

            try {
                request = prepareRequest();
            } catch (e) {
                ajax_listener.on_failure("<p>Prepare Request failed</p>");
            }
        }
    };

})();
