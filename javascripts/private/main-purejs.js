/*
 * main-purejs.js
 *
 */
/*
 * JSHint options:
 */
 /*      global utils: true; */
 /*      global window: true; */
 /*      global config: true; */
 /*      global document: true; */
 /*      global console: true; */
 /*      global purejsLib: true; */
 /*      global jprint: true; */
 /*      global AjaxGetPage: true; */
 /*      global session: true; */
 /*      global docReady: true; */

 /*     global FOOTER_ZONES: false; */
 /*     global PAGES_ID: false; */
 /*     global PAGESCTS: false; */

"use strict";

/*
 *  allPages:
 *      the global PagesCollection inited in session.js
 */
var allPages = null;

/*
 * pageModule:
 *      global to put all sort of things
 * 
 * fields:
 *      article: the current article, used when resizing
 *      clickdEventListener: global event listener for click
 *          events on tags <p> with attibute href
 */
var pageModule = {};

/*
 * HTMLQuery:
 *      the current URL decrypted or the creation of a new URL
 * 
 * fields:
 *      root: the directory where is the file to get with Ajax
 *      pageName: the name of the page (footer, article, ...)
 *      url: the full URL
 */
function HTMLQuery(location, root) {
    if (!utils.isUndefined(location) && !utils.isUndefined(root)) {
        this.root = root;
        this.pageName = location;
    } else {
        if (utils.isUndefined(location) && utils.isUndefined(root)) {
            this.url = window.location.href;
        } else if (!utils.isUndefined(location)) {
            this.url = location;
        } else {
            this.url = window.location.href;
        }
        this.root = this.urlParam('root', config.DEFAULT_ROOT);
        this.pageName = this.urlParam('page', config.DEFAULT_PAGE);
    }
}
HTMLQuery.prototype = {
    getPageName: function() {
        return this.pageName;
    },
    getRoot: function() {
        return this.root;
    },
    urlParam: function (name, default_value) {
        return utils.urlParam(name, this.url, default_value);
    }
};

/*
 * BasePage:
 *      base for all prototypes of pages
 * 
 * The hierarchy:
 *      BasePage
 *          |
 *        Page
 *          +------------+---------------
 *          |            |              |
 *      PageArticle    PageFooter    PageNavigation
 * 
 * fields:
 *      isItLoaded: boolean, true when the page is loaded
 *      place: the tag id whre to put the content
 *      pageName: page name, for debug purpose only
 */
function BasePage(place, pageName) {
    this.isItLoaded = false;
    this.place = place;
    this.pageName = pageName;
}
BasePage.prototype = {
    setHTMLByClassName: function (className, html) {
        var nodes = document.getElementsByClassName(className);
        for (var i = 0, nl = nodes.length; i < nl; i++) {
            nodes[i].innerHTML = html;
        }
    },
    set: function () {
        this.isItLoaded = true;
    },
    reset: function () {
        this.isItLoaded = false;
    },
    amILoaded: function () {
        return this.isItLoaded;
    },
    forEachElementById: function (id, onElement) {
        var elements = utils.getElementById(this.getPlace()).getElementsByTagName(id);
        for (var i = 0, el = elements.length; i < el; i++) {
            onElement(elements[i]);
        }
    },
    getName: function() {
        return this.pageName;
    },
    getPlace: function() {
        return this.place;
    }
};

/*
 * Page:
 *      a simple page, used for the article content
 * 
 * fields:
 *      place: cf. BasePage
 *      pageName: cf. BasePage
 *      query:
 *      hasCopyright: boolean, if the field has a copyrigth, we
 *          had to fill the tags for the copyright and for the authors
 *      file_name: the name of the source file, computed
 *          and returned by fileName()
 */
function Page(place, pageName, query, hasCopyright) {
    BasePage.call(this, place, pageName);
    this.query = query;
    this.hasCopyright = hasCopyright;
    this.file_name = null;
}

Page.prototype = Object.create(BasePage.prototype);

Page.prototype.getPageName = function () {
    return this.query.getPageName();
};
Page.prototype.fileName = function () {
    try {
        if (!this.file_name) {
            var p = this.getPageName();
            var r = this.query.getRoot();
            this.file_name = config.SITE_BASE +
                '/' + 
                r + 
                '/' +
                p +
                '.html';
        }
    } catch (error) {
        this.file_name = null;
    }
    return this.file_name;
};
Page.prototype.copyright = function () {
    this.setHTMLByClassName(FOOTER_ZONES.COPYRIGHT, config.COPYRIGHT);
};
Page.prototype.authors = function () {
    this.setHTMLByClassName(FOOTER_ZONES.AUTHORS, config.AUTHORS);
};
Page.prototype.supressMetaTags = function (str) {
    var metaPattern = /<meta.+\/?>/g;
    return str.replace(metaPattern, '');
};
Page.prototype.kbefore_on_success = function (result) {
    var place = this.getPlace();
    // utils.getElementById(place).innerHTML = this.supressMetaTags(result);
    utils.getElementById(place).innerHTML = result;
};
Page.prototype.before_on_success = function (result) {
    this.kbefore_on_success(result);
};
Page.prototype.main_on_sucess = function (result) {
};
Page.prototype.kafter_on_success = function () {
    if (this.hasCopyright) {
        this.copyright();
        this.authors();
    }
    utils.app_string();
};
Page.prototype.after_on_success = function () {
    this.kafter_on_success();
};
Page.prototype.on_failure = function (result) {
    var place = this.getPlace();
    utils.getElementById(place).style.display = 'none';
};
Page.prototype.kon_success = function (result) {
    var place = this.getPlace();
    utils.getElementById(place).style.display = 'block';
    this.before_on_success(result);
    this.main_on_sucess(result);
    this.after_on_success();
    this.set();
};
Page.prototype.on_success = function (result) {
    this.kon_success(result);
};


/*
 * PageArticle:
 *      the content of the article
 * 
 * Fields:
 *      query: cf. Page
 *      place: cf Page
 *      hasCopyright: cf Page
 * 
 * Note:
 *      
 */
function PageArticle (query) {
    Page.call(this, PAGES_ID.ARTICLE, PAGES_ID.ARTICLE, query, false);
    this.mainHTMLQuery = query;
    pageModule.article = this;
}
PageArticle.prototype = Object.create(Page.prototype);

PageArticle.prototype.resizeSVG = function () {
    var maxWidth = utils.getElementById(this.getPlace()).clientWidth;

    this.forEachElementById('svg',
        function (element) {
            var width = element.clientWidth;
            var height = element.clientHeight;
            var newHeight = height * maxWidth / width;
            element.style.width = maxWidth + 'px';
            element.style.height = newHeight + 'px';
        });
};
PageArticle.prototype.after_on_success = function () {
    this.resizeSVG();
    this.kafter_on_success();
};

/*
 * PageFooter:
 *      the page footer...
 */
function PageFooter (query, mainHTMLQuery) {
    Page.call(this, PAGES_ID.FOOTER, PAGES_ID.FOOTER, query, true);
    this.mainHTMLQuery = mainHTMLQuery;
    this.query = mainHTMLQuery;
    this.hasTitle = false;
}
PageFooter.prototype = Object.create(Page.prototype);

PageFooter.prototype.fileName = function() {
    try {
        if (!this.file_name) {
            var p = PAGES_ID.FOOTER;
            var r = this.mainHTMLQuery.getRoot();
            this.file_name = config.SITE_BASE +
                '/' +
                r +
                '/' +
                p +
                '.html';
        }
    } catch (error) {
        this.file_name = null;
    }
    return this.file_name;
};

/*
 * PageNavigation:
 *      for the menus
 */
function PageNavigation (query, place, mainHTMLQuery, hasTitle) {
    Page.call(this, place, place, query, false);
    this.mainHTMLQuery = mainHTMLQuery;
    this.query = mainHTMLQuery;
    this.hasTitle = hasTitle;
}
PageNavigation.prototype = Object.create(Page.prototype);

PageNavigation.prototype.toc_presentation = function (query) {
    var currentPage = query.getPageName();
    var currentRoot = query.getRoot();
    var url = query.url;

    this.forEachElementById('p',
        function (element) {
            var href = element.getAttribute('href');
            var query = new HTMLQuery(href);
            var eltClassName = 'normal-node';

            if (query.getPageName() === currentPage &&
                query.getRoot() === currentRoot) {
                var title = element.innerHTML;
                utils.getElementById('main_title').innerHTML = title;
                utils.setUrlInBrowser(url);
                document.title = title;
                eltClassName = 'current-node';
            }
            element.className = eltClassName;
        });
};
PageNavigation.prototype.main_on_sucess = function (result) {
    var currentPage = this;
    var currentRoot = currentPage.query.getRoot();

    currentPage.forEachElementById('p',
        function (element) {
            element.href = element.getAttribute('href');
            if (element.href) {
                element.currentPage = currentPage;
                element.currentRoot = currentRoot;
                purejsLib.addEvent(element, 'click', pageModule.clickdEventListener);
            }
        });
    currentPage.toc_presentation(currentPage.mainHTMLQuery);
};
PageNavigation.prototype.after_on_success = function () {
    this.toc_presentation(this.mainHTMLQuery);
    this.kafter_on_success();
};
PageNavigation.prototype.before_on_success = function (result) {
    if (this.hasTitle && config.TOC_TITLE) {
        result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
    }
    this.kbefore_on_success(result);
};
PageNavigation.prototype.on_success = function (result) {
    if (!jprint.isInPrint()) {
        this.kon_success(result);
    } else {
        utils.getElementById(this.getPlace()).style.display = 'none';
    }
};
PageNavigation.prototype.getPageName = function () {
    return this.place;
};

/*
 * clickdEventListener:
 *      the listener of click events for each p with an href attribute
 */
var clickdEventListener = function (e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    e.stopImmediatePropagation();
    e = e || window.event;
    var myself = e.target || e.srcElement;
    var href = myself.href;
    var query = new HTMLQuery(href);
    var lroot = query.getRoot();

    var thePage = e.explicitOriginalTarget.currentPage;
    if (lroot !== myself.currentRoot) {
        allPages.reloadAll(new PageNavigation(new HTMLQuery(PAGES_ID.CONTENT, lroot), PAGES_ID.CONTENT, query, true),
            new PageNavigation(new HTMLQuery(PAGES_ID.NAVIGATION, lroot), PAGES_ID.NAVIGATION, query),
            new PageFooter(query, new HTMLQuery(PAGES_ID.FOOTER, lroot)),
            new PageArticle(query));
    } else {
        allPages.reloadArticle(new PageArticle(query));
    }
    thePage.toc_presentation(query);
    return true;
};

/*
 * PagesCollection:
 *      the set of all pages and their loading
 */
function PagesCollection (content, navigation, footer, article) {
    this.pages = [null, null, null, null];
    this.reloadAll(content, navigation, footer, article);
}
PagesCollection.prototype = {
    doload: function () {
        this.pages.map(function (page) {
            if (!page.amILoaded()) {
                return new AjaxGetPage(page);
            } else {
                return null;
            }
        }).forEach(function (req) {
            if (req) {
                req.send();
            }
        });
    },
    reloadAll: function (content, navigation, footer, article) {
        this.pages = [content, navigation, footer, article];
        this.doload();
    },
    reloadArticle: function (article) {
        article.reset();
        this.pages[PAGESCTS.ARTICLE] = article;
        this.doload();
    }
};

/*
 * resizeEvtListener:
 *      when resize occurs, we resize SVG elements
 */
function resizeEvtListener(e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    /*
        function EventHandler(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            console.log(target);
        }
    */
    e = e || window.event;
    var myself = e.target || e.srcElement;

    var article = pageModule.article;
    if (article) {
        article.resizeSVG();
    }
}

/*
 * start:
 *      running the application
 */
function start() {
    pageModule.article = null;
    pageModule.clickdEventListener = clickdEventListener;
    purejsLib.addEvent(window, 'resize', resizeEvtListener);
    session.load();
}

docReady(start);
