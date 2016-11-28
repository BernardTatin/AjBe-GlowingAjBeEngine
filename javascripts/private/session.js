/*
 *
 * session.js
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


/* global purejsLib, config, Pages, MonQuery, Environment */

var Session = (function () {
    var self = {};

    Session = function () {
        Environment.article = null;
        purejsLib.addEvent(window, 'resize', function (e) {
            // cf http://www.sitepoint.com/javascript-this-event-handlers/
            // e = e || window.event;
            var article = Environment.article;
            if (article) {
                article.resizeSVG();
            }
        });

    };

    Session.prototype.run = function () {
        var query = new MonQuery.HTMLQuery(window.location.href);

        Environment.allPages = new Pages.PagesCollection(
                [
                    new Pages.Page(query.badClone('footer'),
                            'footer', true),
                    new Pages.PageNavigation(query.badClone('content'),
                            'toc', query, true),
                    new Pages.PageNavigation(query.badClone('navigation'),
                            'navigation', query, false),
                    new Pages.PageArticle(query, 'article')
                ]);
        document.getElementById('site-name').innerHTML =
                config.SITE_NAME;
        document.getElementById('site-description').innerHTML =
                config.SITE_DESCRIPTION;
        return this;
    };

    self.Session = Session;
    return self;
})();
