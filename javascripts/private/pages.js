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

        // TODO: not very useful but funy! and stupid! and it's a BUG!
        this.before_on_success = null;
        this.after_on_success = null;
        this.main_on_success = null;
        this.on_failure = null;

        this.getQuery = function () {
            return query;
        };
        this.setQuery = function (newquery) {
            query = newquery;
        };
        this.getPlace = function () {
            return place;
        };
    };
    BasePage.prototype.on_success = function (data) {
        if (this.before_on_success) {
            data = this.before_on_success(data);
        }
        if (this.main_on_success) {
            data = this.main_on_success(data);
        }
        if (this.after_on_success) {
            this.after_on_success(data);
        }
    };
    BasePage.prototype.setHTMLByClassName = function (className, html) {
        var nodes = document.getElementsByClassName(className);
        Array.from(nodes).forEach(function (node) {
            node.innerHTML = html;
        });
    };
    BasePage.prototype.forEachElementById = function (tag, onElement) {
        var elements = document.getElementById(this.getPlace()).getElementsByTagName(tag);
        Array.from(elements).forEach(onElement);
    };
    BasePage.prototype.getRootName = function () {
        return this.getQuery().getRootName();
    };
    BasePage.prototype.getPageName = function () {
        return this.getQuery().getPageName();
    };
    BasePage.prototype.urlName = function () {
        return this.getQuery().urlName();
    };

    // ======================================================================

    var Page = function (query, place, hasCopyright) {
        this._hasCopyright = hasCopyright;
        this._mySelf = this;

        BasePage.call(this, query, place);
    };
        Page.prototype.copyright = function () {
            this.setHTMLByClassName('copyright', config.COPYRIGHT);
        };
        Page.prototype.authors = function () {
            this.setHTMLByClassName('authors', config.AUTHORS);
        };
        Page.prototype.supressMetaTags = function (str) {
            var metaPattern = /<meta.+\/?>/g;
            return str.replace(metaPattern, '');
        };
        Page.prototype.main_on_success = function (data) {
            var place = this.getPlace();
            document.getElementById(place).style.display = 'block';
            return data;
        };
        Page.prototype.before_on_success = function (data) {
            var place = this._mySelf.getPlace();
            document.getElementById(place).innerHTML = mySelf.supressMetaTags(data);
            return data;
        };
        Page.prototype.after_on_success = function (data) {
            if (this._hasCopyright) {
                this._mySelf.copyright();
                this._mySelf.authors();
            }
            utils.app_string();
        };
        Page.prototype.on_failure = function (data) {
            document.getElementById(this.getPlace()).style.display = 'none';
        };
    makeParentOf(BasePage, Page);

    // ======================================================================

    var PageArticle = function (query, place) {

        Page.call(this, query, place, false);
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
    };
    PageArticle.prototype.after_on_success = function (result) {
        this.resizeSVG();
    };
    PageArticle.prototype.on_failure = function (data) {
        document.getElementById(this.getPlace()).innerHTML = data;
    };
    makeParentOf(Page, PageArticle);

    var PageNavigation = function (query, place, mainHTMLQuery, hasTitle) {
        var mainHTMLQuery = mainHTMLQuery;
        var hasTitle = hasTitle;

        Page.call(this, query, place, false);

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
    makeParentOf(Page, PageNavigation);

    var PagesCollection = function (newPages) {
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
            content = new PageNavigation(cQuery, 'toc', query, true);
            changed = true;
            // TODO : is it useful ?
            content.setQuery(cQuery);
            content.setMainHTMLQuery(cQuery);
        }
        if (changed || newPage !== currentPage) {
            article = new PageArticle(query, 'article');
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

    self.Page = Page;
    self.PageArticle = PageArticle;
    self.PageNavigation = PageNavigation;
    self.PagesCollection = PagesCollection;
    return self;
})();
