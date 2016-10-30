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

Class("Query", {
    has: {
        root: {is: 'ro', init: null},
        pageName: {is: 'ro', init: null},
        url: {is: 'n/a', init: null}
    },
    methods: {
        initialize: function (location, root) {
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
        },
        urlParam: function (name, default_value) {
            return utils.urlParam(name, this.url, default_value);
        }
    }
});

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
        session: {is: 'ro', init: null},
        hasCopyright: {is: 'ro', init: false}
    },
    methods: {
        initialize: function (query, place, session, hasCopyright) {
            this.query = query;
            this.place = place;
            this.session = session;
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

Class("AjaxGetPage", {
    isa: MyAjax.AjaxGet,
    has: {
        page: {is: 'n/a', init: null}
    },
    override: {
        initialize: function (page) {
            this.SUPER(page.fileName());
            this.page = page;
        }
    },
    methods: {
        on_receive: function (data) {
            this.page.on_success(data);
        },
        on_failure: function (data) {
            this.page.on_failure(data);
        }
    }
});

Class("PagesCollection", {
    has: {
        pages: {is: 'n/a', init: null}
    },
    methods: {
        initialize: function (content, navigation, footer, article) {
            this.reloadAll(content, navigation, footer, article);
        },
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
    }
});

Class("PageArticle", {
    isa: Page,
    methods: {
        resizeSVG: function () {
            var maxWidth = utils.getElementById(this.getPlace()).clientWidth;
            console.log('resize SVG in');

            this.forEachElementById('svg',
                function (element) {
                    var width = element.clientWidth;
                    var height = element.clientHeight;
                    var newHeight = height * maxWidth / width;
                    element.style.width = maxWidth + 'px';
                    element.style.height = newHeight + 'px';
                    console.log('resize ' + width + ' -> ' + maxWidth);
                });
            console.log('resize SVG out');
        }
    },
    override: {
        after_on_success: function () {
            this.resizeSVG();
            this.SUPER();
        },
        initialize: function (query, place, session, hasCopyright) {
            this.SUPER(query, place, session, hasCopyright);
            window.article = this;
        }
    }
});

Class("PageContent", {
    isa: Page,
    has: {
        mainQuery: {is: 'n/a', init: null},
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
                    var query = new Query(href);

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
            var session = this.getSession();
            var currentRoot = this.query.getRoot();
            var self = this;

            this.forEachElementById('p',
                function (element) {
                    element.self = self;
                    element.href = element.getAttribute('href');
                    element.currentRoot = currentRoot;
                    element.session = session;
                    purejsLib.addEvent(element, 'click', clickdEventListener);
                });
            this.toc_presentation(this.mainQuery);
        }
    },
    override: {
        initialize: function (query, place, session, mainQuery, hasTitle) {
            this.SUPER(query, place, session);
            this.mainQuery = mainQuery;
            this.hasTitle = hasTitle;
        },
        after_on_success: function () {
            this.toc_presentation(this.mainQuery);
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
                var place = this.getPlace();
                utils.getElementById(place).style.display = 'none';
            }
        }
    }
});

var clickdEventListener = function (e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    e = e || window.event;
    var myself = e.target || e.srcElement;
    var href = myself.href;
    var query = new Query(href);
    var lroot = query.getRoot();

    myself.self.query = query;
    myself.self.mainQuery = query;
    if (lroot !== myself.currentRoot) {
        allPages.reloadAll(new PageContent(new Query('content', lroot), 'toc', myself.session, query, true),
            new PageContent(new Query('navigation', lroot), 'navigation', myself.session, query),
            new Page(new Query('footer', lroot), 'footer', myself.session, true),
            new PageArticle(query, 'article', myself.session));
    } else {
        allPages.reloadArticle(new PageArticle(query, 'article', myself.session));
    }
    myself.self.toc_presentation(query);
    // utils.setUrlInBrowser(href);
    return true;
}

Class("Session", {
    has: {
        query: {is: 'n/a', init: null}
    },
    methods: {
        initialize: function () {
            this.query = new Query();
        },
        load: function () {
            var broot = this.query.getRoot();
            allPages = new PagesCollection(new PageContent(new Query('content', broot), 'toc', this, this.query, true),
                new PageContent(new Query('navigation', broot), 'navigation', this, this.query),
                new Page(new Query('footer', broot), 'footer', this, true),
                new PageArticle(this.query, 'article', this));

            utils.getElementById('site-name').innerHTML = config.SITE_NAME;
            utils.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
            return this;
        }
    }

});

var resizeEventListener = function (e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    e = e || window.event;
    var myself = e.target || e.srcElement;

    console.log('resize...');
    if (allPages && allPages[PAGESCTS.ARTICLE]) {
        allPages[PAGESCTS.ARTICLE].resizeSVG();
        console.log('resize SVG!');
    }
};

function start() {
    var session;

    window.article = null;
    purejsLib.addEvent(window, 'resize', function (e) {
        // cf http://www.sitepoint.com/javascript-this-event-handlers/
        e = e || window.event;
        var myself = e.target || e.srcElement;

        console.log('resize...');
        var article = window.article;
        if (article) {
            article.resizeSVG();
            console.log('resize SVG!');
        } else {
            console.log('resize pas d\'article!');
        }
    });
    session = new Session();
    session.load();
}

docReady(start);
