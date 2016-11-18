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
    var root = null;
    var pageName = null;

    var getURLParam = function (paramName, url, default_value) {
        var results = new RegExp('[\\?&]' + paramName + '=([^&#]*)').exec(url);
        if (!results) {
            return default_value;
        } else {
            return results[1] || default_value;
        }
    };

    var fromURLtoVars = function (url) {
        root = getURLParam('root', url, config.DEFAULT_ROOT);
        pageName = getURLParam('page', url, config.DEFAULT_PAGE);
    };


    if (!utils.isUndefined(location) && !utils.isUndefined(newroot)) {
        root = newroot;
        pageName = location;
    } else if (!utils.isUndefined(location)) {
        fromURLtoVars(location);
    } else {
        fromURLtoVars(window.location.href);
    }

    this.getRootName = function () {
        return root;
    };
    this.getPageName = function () {
        return pageName;
    };

};