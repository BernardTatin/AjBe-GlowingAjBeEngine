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
        AjaxLoadable: function () {
            this.urlName = function () {
                return null;
            };
            this.on_success = function (data) {
            };
            this.on_failure = function (data) {
            };
        },
        AjaxGetPage: function (ajax_loadable) {
            if (!ajax_loadable) {
                console.log("ajax_loadable est null");
            }
            if (!ajax_loadable.urlName) {
                console.log("ajax_loadable.urlName est null");
            }
            var url = ajax_loadable.urlName();
            var http_request = 'GET';
            var request = null;

            this.prepareRequest = function () {
                var req = window.getNewHttpRequest();

                req.self = this;
                if (req.timeout) {
                    req.timeout = 9000;
                }
                request = req;
                return req;
            };
            this.openRequest = function () {
                var req = request;
                req.open(http_request, url, true);
                req.onreadystatechange = function (aEvt) {
                    if (this.readyState === PrivateAjax.AjaxStates.DONE) {
                        if (this.status === PrivateAjax.HttpStatus.OK) {
                            this.ajax_loadable.on_success(this.responseText);
                        } else {
                            // TODO : afficher l'erreur
                            this.ajax_loadable.on_failure("<h1>ERREUR " +
                                    this.status +
                                    " !!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
                        }
                    }
                };
            };

            this.send = function (data) {
                this.openRequest();
                if (utils.isUndefined(data)) {
                    request.send(null);
                } else {
                    request.send(data);
                }
            };

            var req = this.prepareRequest();
            req.ajax_loadable = ajax_loadable;
        }
    };

})();
