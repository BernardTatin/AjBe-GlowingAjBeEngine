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
HTMLQuery.prototype.getPageName = function() {
    return this.pageName;
}
HTMLQuery.prototype.getRoot = function() {
    return this.root;
}
HTMLQuery.prototype.urlParam = function (name, default_value) {
    return utils.urlParam(name, this.url, default_value);
}

Class("BasePage", {
    has: {
        isItLoaded: {is: 'ro', init: false}
    },
    methods: {
        initialize: function () {
            this.isItLoaded = false;
        },
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
    }
});

Class("Page", {
    isa: BasePage,
    has: {
        query: {is: 'n/a', init: null},
        place: {is: 'ro', init: null},
        hasCopyright: {is: 'ro', init: false}
    },
    methods: {
        initialize: function (query, place, hasCopyright) {
            this.query = query;
            this.place = place;
            this.hasCopyright = hasCopyright;
        },
        getPageName: function () {
            return this.query.getPageName();
        },
        fileName: function () {
            if (!this.file_name) {
                this.file_name = config.SITE_BASE + '/' +
                    this.query.getRoot() + '/' + this.getPageName() + '.html';
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
            var place = this.getPlace();
            utils.getElementById(place).style.display = 'block';
            this.before_on_success(result);
            this.main_on_sucess(result);
            this.after_on_success();
            this.set();
        },
    }
});

function AjaxGetPage(page) {
    this.Super = new AjaxGet(this, page.fileName());
    this.page = page;
    this.self = this;
    this.name = 'AjaxGetPage';
}
AjaxGetPage.prototype.on_receive = function(data) {
    console.log('AjaxGetPage.prototype.on_receive');
    this.page.on_success(data);
}
AjaxGetPage.prototype.on_failure = function (data) {
    console.log('AjaxGetPage.prototype.on_failure');
    this.page.on_failure(data);
}
AjaxGetPage.prototype.createRequest = function () {
    this.Super.createRequest();
}
AjaxGetPage.prototype.send = function (data) {
    this.Super.send(data);
}


function PagesCollection (content, navigation, footer, article) {
    this.reloadAll(content, navigation, footer, article);
}
PagesCollection.prototype.doload = function () {
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
}
PagesCollection.prototype.reloadAll = function (content, navigation, footer, article) {
    this.pages = [content, navigation, footer, article];
    this.doload();
}
PagesCollection.prototype.reloadArticle = function (article) {
    article.reset();
    this.pages[PAGESCTS.ARTICLE] = article;
    this.doload();
}


Class("PageArticle", {
    isa: Page,
    methods: {
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
        }
    },
    override: {
        after_on_success: function () {
            this.resizeSVG();
            this.SUPER();
        },
        initialize: function (query, place, hasCopyright) {
            this.SUPER(query, place, hasCopyright);
            window.article = this;
        }
    }
});

Class("PageNavigation", {
    isa: Page,
    has: {
        mainHTMLQuery: {is: 'n/a', init: null},
        hasTitle: {is: 'n/a', init: false}
    },
    methods: {
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

            this.forEachElementById('p',
                function (element) {
                    element.self = self;
                    element.href = element.getAttribute('href');
                    element.currentRoot = currentRoot;
                    purejsLib.addEvent(element, 'click', clickdEventListener);
                });
            this.toc_presentation(this.mainHTMLQuery);
        }
    },
    override: {
        initialize: function (query, place, mainHTMLQuery, hasTitle) {
            this.SUPER(query, place);
            this.mainHTMLQuery = mainHTMLQuery;
            this.hasTitle = hasTitle;
        },
        after_on_success: function () {
            this.toc_presentation(this.mainHTMLQuery);
            this.SUPER();
        },
        before_on_success: function (result) {
            if (this.hasTitle && config.TOC_TITLE) {
                result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
            }
            this.SUPER(result);
        },
        on_success: function (result) {
            if (!jprint.isInPrint()) {
                this.SUPER(result);
            } else {
                utils.getElementById(this.getPlace()).style.display = 'none';
            }
        }
    }
});

var clickdEventListener = function (e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    e = e || window.event;
    var myself = e.target || e.srcElement;
    var href = myself.href;
    var query = new HTMLQuery(href);
    var lroot = query.getRoot();

    myself.self.query = query;
    myself.self.mainHTMLQuery = query;
    if (lroot !== myself.currentRoot) {
        allPages.reloadAll(new PageNavigation(new HTMLQuery('content', lroot), 'toc', query, true),
            new PageNavigation(new HTMLQuery('navigation', lroot), 'navigation', query),
            new Page(new HTMLQuery('footer', lroot), 'footer', true),
            new PageArticle(query, 'article'));
    } else {
        allPages.reloadArticle(new PageArticle(query, 'article'));
    }
    myself.self.toc_presentation(query);
    return true;
}

function start() {
    console.log('start...');
    window.article = null;
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
