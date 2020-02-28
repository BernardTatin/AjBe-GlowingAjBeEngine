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
        console.log(`forEachElementById length: ${elements.length}`)
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

Page.prototype.getPageName = function () {
    return this.query.getPageName();
},
Page.prototype.fileName = function () {
    console.log('try to find the file of page ' + this.getName());
    try {
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
}
Page.prototype.copyright = function () {
    this.setHTMLByClassName('copyright', config.COPYRIGHT);
}
Page.prototype.authors = function () {
    this.setHTMLByClassName('authors', config.AUTHORS);
}
Page.prototype.supressMetaTags = function (str) {
    var metaPattern = /<meta.+\/?>/g;
    return str.replace(metaPattern, '');
}
Page.prototype.before_on_success = function (result) {
    var place = this.getPlace();
    utils.getElementById(place).innerHTML = this.supressMetaTags(result);
}
Page.prototype.main_on_sucess = function (result) {
    console.log('    Page.main_on_success');
}
Page.prototype.after_on_success = function () {
    if (this.hasCopyright) {
        this.copyright();
        this.authors();
    }
    utils.app_string();
}
Page.prototype.on_failure = function (result) {
    var place = this.getPlace();
    utils.getElementById(place).style.display = 'none';
}
Page.prototype.on_success = function (result) {
    console.log('    Page.on_success');
    var place = this.getSelf().getPlace();
    utils.getElementById(place).style.display = 'block';
    if (this.getSelf().before_on_success) {
        this.getSelf().before_on_success(result);
    }
    if (this.getSelf().main_on_sucess) {
        this.getSelf().main_on_sucess(result);
    }
    if (this.getSelf().after_on_success) {
        this.getSelf().after_on_success();
    }
    if (this.getSelf().set) {
        this.getSelf().set();
    }
}


function AjaxGetPage(page) {
    AjaxGet.call(this, page.fileName());
    this.page = page;
    this.name = 'AjaxGetPage';
}

AjaxGetPage.prototype = Object.create(AjaxGet.prototype);

AjaxGetPage.prototype.on_receive = function(data) {
    // console.log('AjaxGetPage.prototype.on_receive ' + this.page.getName());
    this.page.on_success(data);
}
AjaxGetPage.prototype.on_failure = function (data) {
    // console.log('AjaxGetPage.prototype.on_failure ' + this.page.getName());
    this.page.on_failure(data);
}
AjaxGetPage.prototype.getRoot = function() {
}


function PagesCollection (content, navigation, footer, article) {
    this.pages = [null, null, null, null];
    this.reloadAll(content, navigation, footer, article);
}
PagesCollection.prototype = {
    doload: function () {
        this.pages.map(function (page) {
            if (!page.amILoaded()) {
                console.log('AjaxGetPage of ' + page.getName())
                return new AjaxGetPage(page);
            } else {
                return null;
            }
        }).forEach(function (req) {
            if (req) {
                // console.log('req.send of ' + req.page.pageName)
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
    pageModule.article = this;
}

PageArticle.prototype = {
    getName: function() {
        return this.Super.getName();
    },
    forEachElementById: function (id, onElement) {
        return this.Super.forEachElementById(id, onElement);
    },
    resizeSVG: function () {
        var maxWidth = utils.getElementById(this.getPlace()).clientWidth;

        this.forEachElementById('svg',
            function (element) {
                var width = element.clientWidth;
                var height = element.clientHeight;
                var newHeight = height * maxWidth / width;
                element.style.width = maxWidth + 'px';
                element.style.height = newHeight + 'px';
            });
    },
    after_on_success: function () {
        this.resizeSVG();
        this.Super.after_on_success();
    },
    // from base class Page
    main_on_sucess: function (result) {
        return this.Super.main_on_sucess(result);
    },
    amILoaded: function () {
        return this.Super.amILoaded();
    },
    fileName: function() {
        return this.Super.fileName();
    },
    on_failure: function(result) {
        // console.log('PageArticle.on_failure');
        return this.Super.on_failure(result);
    },
    on_success: function(result) {
        // console.log('PageArticle.on_success');
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
    // from base class Pagesuccess
    on_failure: function(result) {
        // console.log('PageFooter.on_failure');
        return this.Super.on_failure(result);
    },
    on_success: function(result) {
        // console.log('PageFooter.on_success');
        return this.Super.on_success(result);
    },
    forEachElementById: function (id, onElement) {
        return this.Super.forEachElementById(id, onElement);
    },
    getName: function() {
        return this.Super.getName();
    },
    amILoaded: function () {
        return this.Super.amILoaded();
    },
    fileName: function() {
        console.log('try to find the file of page ' + this.getName());
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
        let currentPage = query.getPageName();
        let currentRoot = query.getRoot();
        let url = query.url;
        console.log('PageNavigation.toc_presentation');

        this.forEachElementById('p',
            function (element) {
                let href = element.getAttribute('href');
                let query = new HTMLQuery(href);

                element.className = 'normal-node';
                if (query.getPageName() === currentPage &&
                    query.getRoot() === currentRoot) {
                    let title = element.innerHTML;
                    utils.getElementById('main_title').innerHTML = title;
                    utils.setUrlInBrowser(url);
                    document.title = title;
                    element.className = 'current-node';
                }
            });
    },
    main_on_sucess: function (result) {
        console.log('PageNavigation.main_on_sucess');
        var currentRoot = this.query.getRoot();
        var self = this;

        this.forEachElementById('p',
            function (element) {
                element.self = self;
                element.href = element.getAttribute('href');
                element.currentRoot = currentRoot;
                console.log('addEvent to ' + element.href.toString());
                purejsLib.addEvent(element, 'click', pageModule.clickdEventListener);
            });
        this.toc_presentation(this.mainHTMLQuery);
    },
    after_on_success: function () {
        console.log('PageNavigation.after_on_success');
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
        if (!jprint.isInPrint()) {
            console.log('PageNavigation.on_success && !jprint.isInPrint');
            this.Super.on_success(result);
        } else {
            console.log('PageNavigation.on_success &&  jprint.isInPrint');
            utils.getElementById(this.getPlace()).style.display = 'none';
        }
    },
    // from base class Page
    on_failure: function(result) {
        // console.log('PageNavigation.on_failure');
        return this.Super.on_failure(result);
    },
    forEachElementById: function (id, onElement) {
        return this.Super.forEachElementById(id, onElement);
    },
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
    console.log('Resize...');
    if (article) {
        console.log('Resize: article modification');
        article.resizeSVG();
    } else {
        console.log('Resize: article is null');
    }
    console.log('Resize OK');
}

function start() {
    console.log('start...');
    pageModule.article = null;
    pageModule.clickdEventListener = clickdEventListener;
    purejsLib.addEvent(window, 'resize', resizeEvtListener);
    console.log('start: create and load Session');
    session.load();
    console.log('start: OK');
}

docReady(start);
