/*
 * myajax.js
 *
 * classes for ajax request, using classic Javascript, before version 6
 */
"use strict";

Module("MyAjax", function (m) {
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

	Class("AjaxGet", {
		has: {
			url: {is: 'n/a', init: null},
			http_request: {is: 'ro', init: 'GET'},
			request: {is: 'n/a', init: null}
		},
		methods: {
			initialize: function (url) {
				this.url = url;
				return this;
			},
			createRequest: function() {
				var req = new XMLHttpRequest();
				req.self = this;
				if (req.timeout) {
					req.timeout = 9000;
				}
				req.lastState = AjaxStates.IDLE;
				req.open(this.http_request, this.url, true);
				req.onreadystatechange = function (aEvt) {
					if (this.readyState == AjaxStates.DONE) {
						if (this.status == HttpStatus.OK) {
							this.self.on_receive(this.responseText);
						} else {
							// TODO : afficher l'erreur
							this.self.on_failure("<h1>ERREUR!!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
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
		}
	});

	Class("AjaxLoadable", {
		has: {
			url: {is: 'n/a', init: null}
		},
		methods: {
			initialize: function(url) {
				this.url = url;
			},
			urlName: function() {
				return this.url;
			},
			on_success: function(data) {

			},
			on_failure: function(data) {

			}
		}

	});

	Class("AjaxGetPage", {
	    isa: MyAjax.AjaxGet,
	    has: {
	        ajax_loadable: {is: 'n/a', init: null}
	    },
	    override: {
	        initialize: function (ajax_loadable) {
	            this.SUPER(ajax_loadable.urlName());
	            this.ajax_loadable = ajax_loadable;
	        }
	    },
	    methods: {
	        on_receive: function (data) {
	            this.ajax_loadable.on_success(data);
	        },
	        on_failure: function (data) {
	            this.ajax_loadable.on_failure(data);
	        }
	    }
	});
});
