/*
 * html-query.js
 */
/*
 The MIT License (MIT)

 Copyright (c) 2016 Bernard Tatin

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/* global config */



var MonQuery = (function () {
    // how to make private variables :
    //    https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Contributor_s_Guide/Private_Properties

    let map = new WeakMap();

    let internal = function (object) {
        if (!map.has(object))
            map.set(object, {});
        return map.get(object);
    };

    var HTMLQuery = function (location, newroot) {
        // why I need this that ?
        var that = this;
        // Using the Maybe here is not the best idea I had,
        // too much object creation,
        // but it works and I'm happy with that.
        // (and I wanted to use it)
        internal(this).rootName = new Maybe(config.DEFAULT_ROOT);
        internal(this).pageName = new Maybe(config.DEFAULT_PAGE);
        internal(this).ajaxUrlName = new Maybe(null);


        var getURLParam = function (paramName, url, default_value) {
            return new Maybe(new RegExp('[\\?&]' + paramName + '=([^&#]*)')).bind(function (regexRes) {
                return regexRes.exec(url);
            }).maybe(default_value, function (results) {
                return results[1] || default_value;
            });
        };

        var fromURLtoVars = function (url) {
            internal(that).rootName = new Maybe(getURLParam('root', url, config.DEFAULT_ROOT));
            internal(that).pageName = new Maybe(getURLParam('page', url, config.DEFAULT_PAGE));
        };

        var init = function() {
            // we can have 0, 1 or 2 positional parameters
            if (location !== undefined && newroot !== undefined) {
                internal(that).rootName = new Maybe(newroot);
                internal(that).pageName = new Maybe(location);
            } else if (location !== undefined) {
                fromURLtoVars(location);
            } else {
                fromURLtoVars(window.location.href);
            }
        };

        init();
    };

    HTMLQuery.prototype.urlName = function () {
        if (internal(this).ajaxUrlName.isNothing()) {
            internal(this).ajaxUrlName = new Maybe(config.SITE_BASE + '/' +
                                                   internal(this).rootName.val() +
                                                   '/' +
                                                   internal(this).pageName.val() +
                                                   '.html');
        }
        return internal(this).ajaxUrlName.val();
    };
    HTMLQuery.prototype.getRootName = function () {
        return internal(this).rootName.val();
    };
    HTMLQuery.prototype.getPageName = function () {
        return internal(this).pageName.val();
    };

    HTMLQuery.prototype.badClone = function(newPage) {
        if (newPage === undefined) {
            newPage = config.DEFAULT_PAGE;
        }
        return new HTMLQuery(newPage, internal(this).rootName.val());
    };

    var self = {};
    self.HTMLQuery = HTMLQuery;

    return self;
})();
