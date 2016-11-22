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


/* global purejsLib, config, Pages */

// var Session = (function () {
// var self = {};

Session = function () {
    window.article = null;
    purejsLib.addEvent(window, 'resize', function (e) {
        // cf http://www.sitepoint.com/javascript-this-event-handlers/
        // e = e || window.event;
        var article = window.article;
        if (article) {
            article.resizeSVG();
        }
    });

    this.query = new HTMLQuery();
};
Session.prototype.run = function () {
    var broot = this.query.getRootName();
    allPages = new Pages.PagesCollection(
            [
                new Pages.Page(new HTMLQuery('footer', broot), 'footer', true),
                new Pages.PageNavigation(new HTMLQuery('content', broot), 'toc', this.query, true),
                new Pages.PageNavigation(new HTMLQuery('navigation', broot), 'navigation', this.query, false),
                new Pages.PageArticle(this.query, 'article')
            ]);
    document.getElementById('site-name').innerHTML = config.SITE_NAME;
    document.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
    return this;
};
// self.Session = Session;
// return self;
// });