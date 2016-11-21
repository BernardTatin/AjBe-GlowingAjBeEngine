/*
 * main-purejs.js
 */

/* global utils, config, MyAjax, BasePage, purejsLib, jprint, Page */

"use strict";
var allPages = null;
var linkTag = 'p';

var makeParentOf = function (parent, child) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

var Pages = (function () {
    var self = {};

    var BasePage = function (query, place) {
        var query = query;
        var place = place;
        var file_name = null;

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
            if (!file_name) {
                file_name = config.SITE_BASE + '/' +
                        query.getRootName() + '/' + this.getPageName() + '.html';
            }
            return file_name;
        };
        this.on_success = function (data) {
            if (this.before_on_success) {
                this.before_on_success(data);
            }
            if (this.main_on_success) {
                this.main_on_success(data);
            }
            if (this.after_on_success) {
                this.after_on_success(data);
            }
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
        this.base_after = function (data) {
            if (hasCopyright) {
                this.copyright();
                this.authors();
            }
            utils.app_string();
        };
        this.main_on_success = function (data) {
            var place = this.getPlace();
            document.getElementById(place).style.display = 'block';
        };
        this.after_on_success = function (data) {
            this.base_after();
        };
        this.before_on_success = function (data) {
            var place = this.getPlace();
            document.getElementById(place).innerHTML = this.supressMetaTags(data);
        };
    };
    makeParentOf(BasePage, self.Page);

    self.PageArticle = function (query, place) {
        // BasePage.call(this, query, place);
        self.Page.call(this, query, place, false);
        window.article = this;
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
            this.base_after(result);
        };
    };
    makeParentOf(self.Page, self.PageArticle);
    self.PageNavigation = function (query, place, mainHTMLQuery, hasTitle) {
        var mainHTMLQuery = mainHTMLQuery;
        var hasTitle = hasTitle;
        // BasePage.call(this, query, place);
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
                        var query = new HTMLQuery(href);
                        //console.log('toc_presentation : currentRoot = <' + currentRoot + '> currentPage : <' + currentPage + '>');
                        //console.log('toc_presentation : query.Root = <' + query.getRootName() + '> query.Page : <' + query.getPageName() + '>');
                        element.currentRoot = currentRoot;
                        element.currentPage = currentPage;
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
        this.before_on_success = function (result) {
            var place = this.getPlace();
            if (hasTitle && config.TOC_TITLE) {
                result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
            }
            document.getElementById(place).innerHTML = this.supressMetaTags(result);
        };
        this.after_on_success = function (result) {
            console.log('after_on_success');
            this.base_after(result);
            this.toc_presentation(mainHTMLQuery);
        };
        this.main_on_success = function (result) {
            if (!jprint.isInPrint()) {
                // f**k this !
                var self = this;
                var currentPage = query.getPageName();
                var currentRoot = query.getRootName();

                this.forEachElementById(linkTag,
                        function (element) {
                            element.currentRoot = currentRoot;
                            element.currentPage = currentPage;
                            element.myNavPage = self;
                            element.href = element.getAttribute('href');
                            //if (!element.hasClickEvent) {
                            purejsLib.addEvent(element, 'click', clickdEventListener);
                            element.hasClickEvent = true;
                            //}
                        });
            } else {
                document.getElementById(this.getPlace()).style.display = 'none';
            }
        };
    };
    makeParentOf(self.Page, self.PageNavigation);

    self.PagesCollection = function (newPages) {
        this.doload = function (pages) {
            pages.forEach(function (page) {
                if (page && !page.req) {
                    page.req = new MyAjax.AjaxGetPage(page);
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
        var query = new HTMLQuery(myself.href);
        var newRoot = query.getRootName();
        var newPage = query.getPageName();
        var content = null;
        var article = window.article;
        var changed = false;
        // buggy test ?
        // buggy init of these values ?
        console.log("clickdEventListener -> newRoot : <" + newRoot + '> myself.currentRoot : <' + myself.currentRoot + '>');
        if (newRoot !== myself.currentRoot) {
            var cQuery = new HTMLQuery('content', newRoot);
            content = new self.PageNavigation(cQuery, 'toc', query, true);
            changed = true;
            content.setQuery(cQuery);
            content.setMainHTMLQuery(cQuery);
        }
        if (changed || newPage !== myself.currentPage) {
            article = new self.PageArticle(query, 'article');
            window.article = article;
            changed = true;
        }
        if (changed) {
            allPages.doload([content, article]);
            if (!content) {
                myself.myNavPage.toc_presentation(query);
            }
        }
        return true;
    };

    return self;
})();