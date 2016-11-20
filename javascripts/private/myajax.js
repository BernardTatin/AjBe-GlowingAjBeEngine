/*
 * myajax.js
 *
 * classes for ajax request, using classic Javascript, before version 6
 */
/* global utils */

"use strict";

var PrivateAjax = (function () {
    return {
        AjaxStates: (function () {
            return {
                IDLE: 0,
                OPENED: 1,
                HEADERS_RECEIVED: 2,
                LOADING: 3,
                DONE: 4
            };
        })(),
        HttpStatus: (function () {
            return {
                OK: 200,
                NOTFOUND: 404
            };
        })()
    };
})();

var MyAjax = (function () {

    return {
        AjaxGetPage: function (ajax_loadable) {
            var url = ajax_loadable.urlName();
            var http_request = 'GET';
            var request = null;

            this.prepareRequest = function () {
                request = window.getNewHttpRequest();
                request.ajax_loadable = ajax_loadable;

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
                            request.ajax_loadable.on_success(request.responseText);
                        } else {
                            // TODO : afficher l'erreur
                            request.ajax_loadable.on_failure("<h1>ERREUR " +
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
                request = this.prepareRequest();
            } catch (e) {
                ajax_loadable.on_failure("<p>Prepare Request failed</p>");
            }
        }
    };

})();
