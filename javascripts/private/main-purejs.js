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

var BasePage = function (query, place) {
    var query = query;
    var place = place;
    var file_name = null;

    this.getPlace = function () {
        return place;
    };
    this.getQuery = function () {
        return query;
    };
    this.getRootName = function () {
        if (!query) {
            console.log('query est null !!');
        }
        if (!query.getRootName) {
            console.log('query.getRootName est null !!');
        }
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
        var place = this.getPlace();
        document.getElementById(place).style.display = 'none';
    };
    this.setHTMLByClassName = function (className, html) {
        var nodes = document.getElementsByClassName(className);
        Array.from(nodes).forEach(function (node) {
            node.innerHTML = html;
        });
    };
    this.forEachElementById = function (id, onElement) {
        var elements = document.getElementById(this.getPlace()).getElementsByTagName(id);
        Array.from(elements).forEach(onElement);
    };
};


var Page = function (query, place, hasCopyright) {
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
makeParentOf(BasePage, Page);

var PageArticle = function (query, place) {
    BasePage.call(this, query, place);
    Page.call(this, query, place, false);
    window.article = this;
    this.resizeSVG = function () {
        var maxWidth = document.getElementById(this.getPlace()).clientWidth;
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
makeParentOf(Page, PageArticle);
var PageNavigation = function (query, place, mainHTMLQuery, hasTitle) {
    var mainHTMLQuery = mainHTMLQuery;
    var hasTitle = hasTitle;
    BasePage.call(this, query, place);
    Page.call(this, query, place, false);
    this.toc_presentation = function (query) {
        var currentPage = query.getPageName();
        var currentRoot = query.getRootName();
        var url = query.url;
        this.forEachElementById(linkTag,
                function (element) {
                    var href = element.getAttribute('href');
                    var query = new HTMLQuery(href);
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
        this.toc_presentation(mainHTMLQuery);
        this.base_after(result);
    };
    this.main_on_success = function (result) {
        console.log('main_on_success');
        if (!jprint.isInPrint()) {
            // f**k this !
            var self = this;

            this.forEachElementById(linkTag,
                    function (element) {
                        element.self = self;
                        element.href = element.getAttribute('href');
                        console.log('set event for <' + element.href + '>');
                        if (!element.hasClickEvent) {
                            purejsLib.addEvent(element, 'click', clickdEventListener);
                            element.hasClickEvent = true;
                        }
                    });
        } else {
            document.getElementById(this.getPlace()).style.display = 'none';
        }
    };
};
makeParentOf(Page, PageNavigation);

var PagesCollection = function (newPages) {
    this.doload = function (pages) {
        pages.forEach(function (page) {
            if (page && !page.req) {
                if (!page.urlName) {
                    console.log('page.urlName est null...')
                }
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
    if (newRoot !== myself.currentRoot) {
        content = new PageNavigation(new HTMLQuery('content', newRoot), 'toc', query, true);
        changed = true;
    }
    if (changed || newPage !== myself.currentPage) {
        article = new PageArticle(query, 'article');
        window.article = article;
        changed = true;
    }
    if (changed) {
        allPages.doload([content, article]);
        myself.self.query = query;
        myself.self.mainHTMLQuery = query;
        myself.self.toc_presentation(query);
    }
    return true;
};
var Session = function () {
    this.query = new HTMLQuery();
    this.load = function () {
        var broot = this.query.getRootName();
        allPages = new PagesCollection(
                [
                    new Page(new HTMLQuery('footer', broot), 'footer', true),
                    new PageNavigation(new HTMLQuery('content', broot), 'toc', this.query, true),
                    new PageNavigation(new HTMLQuery('navigation', broot), 'navigation', this.query, false),
                    new PageArticle(this.query, 'article')
                ]);
        document.getElementById('site-name').innerHTML = config.SITE_NAME;
        document.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
        return this;
    };
};
function start() {
    var session;
    window.article = null;
    purejsLib.addEvent(window, 'resize', function (e) {
        // cf http://www.sitepoint.com/javascript-this-event-handlers/
        // e = e || window.event;
        var article = window.article;
        if (article) {
            article.resizeSVG();
        }
    });
    session = new Session();
    session.load();
}

docReady(start);
