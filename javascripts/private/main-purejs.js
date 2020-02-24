/*
 * main-purejs.js
 */

"use strict";

var PAGESCTS = (function () {
    return {
        CONTENT: 0,
        NAVIGATION: 1,
        FOOTER: 2,
        ARTICLE: 3
    };
})();

var allPages = null;

var pageModule = {};

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

function BasePage(self, place, pageName) {
    this.isItLoaded = false;
    this.place = place;
    this.self = self;
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
    },
    getSelf: function() {
        return this.self;
    }
};


function Page(self, query, place, hasCopyright, pageName) {
    if (!self) {
        this.Super = new BasePage(this, place, pageName);
    } else {
        this.Super = new BasePage(self, place, pageName);
    }
    this.query = query;
    this.hasCopyright = hasCopyright;
    this.file_name = false;
}

Page.prototype = {
    getPageName: function () {
        return this.query.getPageName();
    },
    getName: function() {
        return this.Super.getName();
    },
    fileName: function () {
        console.log('try to find the file of page ' + this.getName());
        try {
/*
            if (utils.isUndefined(this.query)) {
                console.log('Page.fileName.query is  undefined');
            }
            if (this.query == null || this.query === null) {
                console.log('Page.fileName.query is null');
            }
            console.log('Properties af Page.query...');
            for (var item in this.query) {
                console.log('-> ' + item);
            }
            console.log('Properties of Page.query end');
*/            
            /*
    Here is the bug, a query with these properties!
    Properties af Page.query... main-purejs.js:106:17
    -> 0                        main-purejs.js:108:21
    -> 1                        main-purejs.js:108:21
    -> 2                        main-purejs.js:108:21
    -> 3                        main-purejs.js:108:21
    -> 4                        main-purejs.js:108:21
    -> 5                        main-purejs.js:108:21
    Properties af Page.query end
    instead of these:
    Properties af Page.query... main-purejs.js:106:17
    -> root                     main-purejs.js:108:21
    -> pageName                 main-purejs.js:108:21
    -> getPageName              main-purejs.js:108:21
    -> getRoot                  main-purejs.js:108:21
    -> urlParam                 main-purejs.js:108:21
    Properties af Page.query end
             */
            if (!this.file_name) {
                var p = this.getPageName();
                var r = this.query.getRoot();
                this.file_name = config.SITE_BASE
                    + '/'
                    + r     // this.query.getRoot()
                    + '/'
                    + p     // this.getPageName()
                    + '.html';
            }
        } catch (error) {
            this.file_name = null;
        }
        return this.file_name;
    },
    copyright: function () {
        this.setHTMLByClassName('copyright', config.COPYRIGHT);
    },
    authors: function () {
        this.setHTMLByClassName('authors', config.AUTHORS);
    },
    supressMetaTags: function (str) {
        var metaPattern = /<meta.+\/?>/g;
        return str.replace(metaPattern, '');
    },
    before_on_success: function (result) {
        var place = this.getPlace();
        utils.getElementById(place).innerHTML = this.supressMetaTags(result);
    },
    main_on_sucess: function (result) {
        if (this.getSelf()) {
            this.getSelf().main_on_sucess(result);
        }
    },
    after_on_success: function () {
        if (this.hasCopyright) {
            this.copyright();
            this.authors();
        }
        utils.app_string();
    },
    on_failure: function (result) {
        var place = this.getPlace();
        utils.getElementById(place).style.display = 'none';
    },
    on_success: function (result) {
        console.log('Page.on_success');
        var place = this.getPlace();
        utils.getElementById(place).style.display = 'block';
        this.before_on_success(result);
        this.main_on_sucess(result);
        this.after_on_success();
        this.set();
    },
    // from base class BasePage
    amILoaded: function () {
        return this.Super.amILoaded();
    },
    set: function () {
        return this.Super.set();
    },
    reset: function () {
        return this.Super.reset();
    },
    setHTMLByClassName: function (className, html) {
        return this.Super.setHTMLByClassName(className, html);
    },
    forEachElementById: function (id, onElement) {
        return this.Super.forEachElementById(id, onElement);
    },
    getPlace: function() {
        return this.Super.getPlace();
    },
    getSelf: function() {
        return this.Super.self;
    }
};


function AjaxGetPage(page) {
    this.Super = new AjaxGet(this, page.fileName());
    this.page = page;
    this.self = this;
    this.name = 'AjaxGetPage';
}
AjaxGetPage.prototype= {
    on_receive: function(data) {
        console.log('AjaxGetPage.prototype.on_receive');
        this.page.on_success(data);
    },
    on_failure: function (data) {
        console.log('AjaxGetPage.prototype.on_failure');
        this.page.on_failure(data);
    },
    createRequest: function () {
        this.Super.createRequest();
    },
    send: function (data) {
        this.Super.send(data);
    },
    getRoot: function() {
    }
};


function PagesCollection (content, navigation, footer, article) {
    this.pages = [null, null, null, null];
    this.reloadAll(content, navigation, footer, article);
}
PagesCollection.prototype = {
    doload: function () {
        this.pages.map(function (page) {
            if (!page.amILoaded()) {
                console.log('AjaxGetPage of ' + page.pageName)
                return new AjaxGetPage(page);
            } else {
                return null;
            }
        }).forEach(function (req) {
            if (req) {
                console.log('req.send of ' + req.page.pageName)
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

function PageArticle (query, place, hasCopyright) {
    this.Super = new Page(this, query, place, hasCopyright, 'article');
    window.article = this;
}

PageArticle.prototype = {
    getName: function() {
        return this.Super.getName();
    },
    resizeSVG: function () {
        /*
        var maxWidth = utils.getElementById(this.getPlace()).clientWidth;

        this.forEachElementById('svg',
            function (element) {
                var width = element.clientWidth;
                var height = element.clientHeight;
                var newHeight = height * maxWidth / width;
                element.style.width = maxWidth + 'px';
                element.style.height = newHeight + 'px';
            });
        */
    },
    after_on_success: function () {
        this.resizeSVG();
        this.Super.after_on_success();
    },
    // from base class Page
    main_on_sucess: function (result) {
    },
    amILoaded: function () {
        return this.Super.amILoaded();
    },
    fileName: function() {
        return this.Super.fileName();
    },
    on_success: function(result) {
        console.log('PageArticle.on_success');
        return this.Super.on_success(result);
    },
    getPlace: function() {
        return this.Super.getPlace();
    },
    getSelf: function() {
        return this.Super.self;
    }
};


var clickdEventListener = function (e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    e = e || window.event;
    var myself = e.target || e.srcElement;
    var href = myself.href;
    var query = new HTMLQuery(href);
    var lroot = query.getRoot();

    console.log('clickdEventListener: start');
    myself.self.query = query;
    myself.self.mainHTMLQuery = query;
    if (lroot !== myself.currentRoot) {
        console.log('clickdEventListener: reloadAll');
        allPages.reloadAll(new PageNavigation(new HTMLQuery('content', lroot), 'toc', query, true),
            new PageFooter(query, new HTMLQuery('footer', lroot)),
            new PageNavigation(new HTMLQuery('navigation', lroot), 'navigation', query),
            new PageArticle(query, 'article'));
    } else {
        console.log('clickdEventListener: reloadArticle');
        allPages.reloadArticle(new PageArticle(query, 'article'));
    }
    myself.self.toc_presentation(query);
    console.log('clickdEventListener: end');
    return true;
}
/*
    this.Super = new Page(this, query, place, false, 'Navigation ' + place);
    this.mainHTMLQuery = mainHTMLQuery;
    this.query = mainHTMLQuery;
    this.hasTitle = hasTitle;
*/

function PageFooter (query, mainHTMLQuery) {
    this.Super = new Page(this, query, 'footer', true, 'footer');
    this.mainHTMLQuery = mainHTMLQuery;
    this.query = mainHTMLQuery;
    this.hasTitle = false;
}

PageFooter.prototype = {
    // from base class Page
    getName: function() {
        return this.Super.getName();
    },
    amILoaded: function () {
        return this.Super.amILoaded();
    },
    fileName: function() {
        try {
            if (!this.file_name) {
                var p = 'footer';
                var r = this.mainHTMLQuery.getRoot();
                this.file_name = config.SITE_BASE
                    + '/'
                    + r     // this.query.getRoot()
                    + '/'
                    + p     // this.getPageName()
                    + '.html';
            }
        } catch (error) {
            this.file_name = null;
        }
        return this.file_name;
    },
    getPlace: function() {
        return this.Super.getPlace();
    },
    getSelf: function() {
        return this.Super.self;
    }
};

function PageNavigation (query, place, mainHTMLQuery, hasTitle) {
    this.Super = new Page(this, query, place, false, 'Navigation ' + place);
    this.mainHTMLQuery = mainHTMLQuery;
    this.query = mainHTMLQuery;
    this.hasTitle = hasTitle;
}

PageNavigation.prototype = {
    getName: function() {
        return this.Super.getName();
    },
    toc_presentation: function (query) {
        var currentPage = query.getPageName();
        var currentRoot = query.getRoot();
        var url = query.url;

        this.forEachElementById('p',
            function (element) {
                var href = element.getAttribute('href');
                var query = new HTMLQuery(href);

                element.className = 'normal-node';
                if (query.getPageName() === currentPage &&
                    query.getRoot() === currentRoot) {
                    var title = element.innerHTML;
                    utils.getElementById('main_title').innerHTML = title;
                    utils.setUrlInBrowser(url);
                    document.title = title;
                    element.className = 'current-node';
                }
            });
    },
    main_on_sucess: function (result) {
        var currentRoot = this.query.getRoot();
        var self = this;

        window.forEachElementById('p',
            function (element) {
                element.self = self;
                element.href = element.getAttribute('href');
                element.currentRoot = currentRoot;
                console.log('addEvent to ' + element.href.toString());
                purejsLib.addEvent(element, 'click', window.clickdEventListener);
            });
        this.toc_presentation(this.mainHTMLQuery);
    },
    after_on_success: function () {
        this.toc_presentation(this.mainHTMLQuery);
        this.Super.after_on_success();
    },
    before_on_success: function (result) {
        if (this.hasTitle && config.TOC_TITLE) {
            result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
        }
        this.Super.before_on_success(result);
    },
    on_success: function (result) {
        console.log('PageNavigation.on_success');
        if (!jprint.isInPrint()) {
            this.Super.on_success(result);
        } else {
            utils.getElementById(this.getPlace()).style.display = 'none';
        }
    },
    // from base class Page
    amILoaded: function () {
        return this.Super.amILoaded();
    },
    fileName: function() {
        return this.Super.fileName();
    },
    getPlace: function() {
        return this.Super.getPlace();
    },
    getSelf: function() {
        return this.Super.self;
    }


};


function start() {
    console.log('start...');
    window.article = null;
    window.clickdEventListener = clickdEventListener;
    purejsLib.addEvent(window, 'resize', function (e) {
        // cf http://www.sitepoint.com/javascript-this-event-handlers/
        e = e || window.event;
        var myself = e.target || e.srcElement;

        var article = window.article;
        console.log('Resize...');
        if (article) {
            console.log('Resize: article modification');
            article.resizeSVG();
        } else {
            console.log('Resize: article is null');
        }
        console.log('Resize OK');
    });
    console.log('start: create and load Session');
    session.load();
    console.log('start: OK');
}

docReady(start);
