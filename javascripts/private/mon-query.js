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

/* global utils, config */

var HTMLQuery = function (location, newroot) {
    var rootName = null;
    var pageName = null;
    var ajaxUrlName = null;

    var getURLParam = function (paramName, url, default_value) {
        return new Maybe(new RegExp('[\\?&]' + paramName + '=([^&#]*)')).bind(function (regexRes) {
            return regexRes.exec(url);
        }).maybe(default_value, function (results) {
            return results[1] || default_value;
        });
    };

    var fromURLtoVars = function (url) {
        rootName = getURLParam('root', url, config.DEFAULT_ROOT);
        pageName = getURLParam('page', url, config.DEFAULT_PAGE);
    };

    // we can have 0, 1 or 2 positional parameters
    if (!utils.isUndefined(location) && !utils.isUndefined(newroot)) {
        rootName = newroot;
        pageName = location;
    } else if (!utils.isUndefined(location)) {
        fromURLtoVars(location);
    } else {
        fromURLtoVars(window.location.href);
    }

    this.urlName = function () {
        if (!ajaxUrlName) {
            ajaxUrlName = config.SITE_BASE + '/' +
                    rootName + '/' + pageName + '.html';
        }
        return ajaxUrlName;
    };
    this.getRootName = function () {
        return rootName;
    };
    this.getPageName = function () {
        return pageName;
    };
    this.badClone = function(newPage) {
        if (newPage === undefined) {
            newPage = config.DEFAULT_PAGE;
        }
        return new HTMLQuery(newPage, rootName);
    }
};
