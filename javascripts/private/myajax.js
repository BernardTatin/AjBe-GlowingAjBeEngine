/*
 * myajax.js
 *
 * classes for ajax request, using classic Javascript, before version 6
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
