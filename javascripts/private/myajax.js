/*
 * myajax.js
 *
 * classes for ajax request, using classic Javascript, before version 6
 */
"use strict";

var AjaxStates = (function () {
    return {
        IDLE: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    };
})();

var HttpStatus = (function () {
    return {
        OK: 200,
        NOTFOUND: 404
    };
})();

function Ajax (self, url, http_request) {
    this.url = url;
    this.http_request = http_request;
    this.request = null;
    this.self = self;
    this.name = 'Ajax';
    return this;
}
Ajax.prototype = {
    createRequest: function() {
        var req = new XMLHttpRequest();
        req.self = this.self;
        if (req.timeout) {
            req.timeout = 9000;
        }
        req.lastState = AjaxStates.IDLE;
        req.open(this.http_request, this.url, true);
        req.onreadystatechange = function (aEvt) {
            if (this.readyState == AjaxStates.DONE) {
                if (this.status == HttpStatus.OK) {
                    req.self.on_receive(this.responseText);
                } else {
                    req.self.on_failure("<h1>ERREUR!!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
                }
            }
        };
        this.request = req;
    },
    send: function (data) {
        this.createRequest();
        if (utils.isUndefined(data)) {
            this.request.send(null);
        } else {
            this.request.send(data);
        }
    }
};

function AjaxGet(self, url) {
    this.Super = new Ajax(self, url, 'GET');
}
AjaxGet.prototype = {
    createRequest: function () {
        this.Super.createRequest();
    },
    send: function (data) {
        this.Super.send(data);
    }
};
