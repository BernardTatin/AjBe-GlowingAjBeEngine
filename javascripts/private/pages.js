/*
 * pages.js
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

// TODO: bad JavaScript Stuff, see :
// http://alistapart.com/article/prototypal-object-oriented-programming-using-javascript

/* global utils, config, MyAjax, BasePage, purejsLib, jprint, Page, Environment, Session, MonQuery */

"use strict";


// TODO : must be elsewhere
var makeParentOf = function (parent, child) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

var Pages = (function () {
    // TODO : bad idea
    var linkTag = 'p';
    var self = {};

    var BasePage = function (theQuery, thePlace) {
        var query = theQuery;
        var place = thePlace;
        var file_name = null;
        // TODO: not very useful but funy! and stupid! and it's a BUG!
        var before_on_success = [];
        var after_on_success = [];

        this.setQuery = function (newquery) {
            query = newquery;
        };
        this.getPlace = function () {
            return place;
        };
        this.getRootName = function () {
            return query.getRootName();
        };
        this.getPageName = function () {
            return query.getPageName();
        };
        this.urlName = function () {
            return query.urlName();
        };
        this.addBefore = function (f) {
            before_on_success.push(f);
        };
        this.addAfter = function (f) {
            after_on_success.push(f);
        };
        this.on_success = function (data) {
            before_on_success.forEach(function (f) {
                data = f(data);
            });
            if (this.main_on_success) {
                this.main_on_success(data);
            }
            after_on_success.forEach(function (f) {
                f(data);
            });
        };
        this.on_failure = function (data) {
            document.getElementById(place).style.display = 'none';
        };
        this.setHTMLByClassName = function (className, html) {
            var nodes = document.getElementsByClassName(className);
            Array.from(nodes).forEach(function (node) {
                node.innerHTML = html;
            });
        };
        this.forEachElementById = function (tag, onElement) {
            var elements = document.getElementById(place).getElementsByTagName(tag);
            Array.from(elements).forEach(onElement);
        };
    };


    self.Page = function (query, place, hasCopyright) {
        var hasCopyright = hasCopyright;
        var mySelf = this;

        BasePage.call(this, query, place);
        this.copyright = function () {
            this.setHTMLByClassName('copyright', config.COPYRIGHT);
        };
        this.authors = function () {
            this.setHTMLByClassName('authors', config.AUTHORS);
        };
        this.supressMetaTags = function (str) {
            var metaPattern = /<meta.+\/?>/g;
            return str.replace(metaPattern, '');
        };
        this.main_on_success = function (data) {
            var place = this.getPlace();
            document.getElementById(place).style.display = 'block';
        };
        this.addBefore(function (data) {
            var place = mySelf.getPlace();
            document.getElementById(place).innerHTML = mySelf.supressMetaTags(data);
            return data;
        });
        this.addAfter(function (data) {
            if (hasCopyright) {
                mySelf.copyright();
                mySelf.authors();
            }
            utils.app_string();
        });
    };
    makeParentOf(BasePage, self.Page);

    self.PageArticle = function (query, place) {
        self.Page.call(this, query, place, false);
        Environment.article = this;
        this.resizeSVG = function () {
            var place = this.getPlace();
            var maxWidth = document.getElementById(place).clientWidth;
            this.forEachElementById('svg',
                    function (element) {
                        var width = element.clientWidth;
                        var height = element.clientHeight;
                        var newHeight = height * maxWidth / width;
                        element.style.width = maxWidth + 'px';
                        element.style.height = newHeight + 'px';
                    });
        };
        this.after_on_success = function (result) {
            this.resizeSVG();
        };
    };
    makeParentOf(self.Page, self.PageArticle);
    self.PageNavigation = function (query, place, mainHTMLQuery, hasTitle) {
        var mainHTMLQuery = mainHTMLQuery;
        var hasTitle = hasTitle;

        self.Page.call(this, query, place, false);

        this.setMainHTMLQuery = function (newQuery) {
            mainHTMLQuery = newQuery;
        };
        this.toc_presentation = function (query) {
            var currentPage = query.getPageName();
            var currentRoot = query.getRootName();
            var url = query.url;

            this.setQuery(query);
            this.setMainHTMLQuery(query);
            this.forEachElementById(linkTag,
                    function (element) {
                        var href = element.getAttribute('href');
                        var query = new MonQuery.HTMLQuery(href);
                        if (query.getPageName() === currentPage &&
                                query.getRootName() === currentRoot) {
                            var title = element.innerHTML;
                            document.getElementById('main_title').innerHTML = title;
                            utils.setUrlInBrowser(url);
                            document.title = title;
                            element.className = 'current-node';
                        } else {
                            element.className = 'normal-node';
                        }
                    });
        };
        this.main_on_success = function (result) {
            console.log('main_on_success...');
            if (!jprint.isInPrint()) {
                var currentPage = mainHTMLQuery.getPageName();
                var currentRoot = mainHTMLQuery.getRootName();
                var url = mainHTMLQuery.url;

                this.setQuery(mainHTMLQuery);
                if (hasTitle && config.TOC_TITLE) {
                    result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
                }
                this.forEachElementById(linkTag,
                        function (element) {
                            element.href = element.getAttribute('href');
                            purejsLib.addEvent(element, 'click', clickdEventListener);
                            var query = new MonQuery.HTMLQuery(element.href);
                            if (query.getPageName() === currentPage &&
                                    query.getRootName() === currentRoot) {
                                console.log('selected query : <' + element.href + '>');
                                var title = element.innerHTML;
                                document.getElementById('main_title').innerHTML = title;
                                utils.setUrlInBrowser(url);
                                document.title = title;
                                element.className = 'current-node';
                            } else {
                                element.className = 'normal-node';
                            }
                        });
                // this.toc_presentation(mainHTMLQuery);
            } else {
                document.getElementById(this.getPlace()).style.display = 'none';
            }
        };
    };
    makeParentOf(self.Page, self.PageNavigation);

    self.PagesCollection = function (newPages) {
        this.doload = function (pages) {
            pages.forEach(function (page) {
                if (page) {
                    if (!page.req) {
                        page.req = new MyAjax.AjaxGetPage(page);
                    }
                    page.req.send();
                }
            });
        };
        this.doload(newPages);
    };

    var clickdEventListener = function (e) {
        // cf http://www.sitepoint.com/javascript-this-event-handlers/
        e = e || window.event;
        var myself = e.target || e.srcElement;
        var query = new MonQuery.HTMLQuery(myself.href);
        var article = Environment.article;
        var currentRoot = article.getRootName();
        var currentPage = article.getPageName();
        var newRoot = query.getRootName();
        var newPage = query.getPageName();
        var content = null;
        var changed = false;
        // buggy test ?
        // buggy init of these values ?
        console.log("clickdEventListener -> newRoot : <" +
                newRoot + '> currentRoot : <' +
                currentRoot + '>');
        if (newRoot !== currentRoot) {
            var cQuery = query.badClone('content');
            content = new self.PageNavigation(cQuery, 'toc', query, true);
            changed = true;
            // TODO : is it useful ?
            content.setQuery(cQuery);
            content.setMainHTMLQuery(cQuery);
        }
        if (changed || newPage !== currentPage) {
            article = new self.PageArticle(query, 'article');
            Environment.article = article;
            changed = true;
            if (content !== null) {
                content.setMainHTMLQuery(query);
            }
        }
        if (changed) {
            // TODO : must create an environment with current query,
            //        current pages and so on...
            //        and here, I could redraw menus and titles
            Environment.allPages.doload([article, content]);
        }
        return true;
    };

    return self;
})();
