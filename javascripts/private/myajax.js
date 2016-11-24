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

var MyAjax = (function () {
    // how to make private variables :
    //    https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Contributor_s_Guide/Private_Properties

    // for private fields
    // perhaps it's too heavy,
    // anyway, I like it
    let map = new WeakMap();

    let internal = function (object) {
        if (!map.has(object))
            map.set(object, {});
        return map.get(object);
    };

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


    // not very clever but I'm testing JavaScript
    var AjaxData = function (ajax_listener) {
        this.url = ajax_listener.urlName();
        this.http_request = 'GET';
        this.request = window.getNewHttpRequest();
        this.request.ajax_listener = ajax_listener;

        if (this.request.timeout) {
            this.request.timeout = 9000;
        }
    };

    var AjaxGetPage = function (ajax_listener) {
        var that = this;
        internal(this).ajax_data = new AjaxData(ajax_listener);

        // hmmmm... It works, but not sure it's a good thing
        internal(this).openRequest = function () {
            internal(that).ajax_data.request.lastState = PrivateAjax.AjaxStates.IDLE;
            internal(that).ajax_data.request.open(internal(that).ajax_data.http_request, internal(that).ajax_data.url, true);
            internal(that).ajax_data.request.onreadystatechange = function () {
                var req = internal(that).ajax_data.request;
                if (req.readyState === PrivateAjax.AjaxStates.DONE) {
                    if (req.status === PrivateAjax.HttpStatus.OK) {
                        req.ajax_listener.on_success(req.responseText);
                    } else {
                        // TODO : afficher l'erreur
                        req.ajax_listener.on_failure("<h1>ERREUR " +
                                req.status +
                                " !!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
                    }
                }
            };
        };
    };

    AjaxGetPage.prototype.send = function (data) {
        internal(this).openRequest();
        if (data === undefined || !data) {
            internal(this).ajax_data.request.send(null);
        } else {
            internal(this).ajax_data.request.send(data);
        }
    };

    var self = {};
    self.AjaxGetPage = AjaxGetPage;
    return self;
})();
