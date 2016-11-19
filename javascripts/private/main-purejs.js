/*
 * main-purejs.js
 */

/* global utils, config, MyAjax, BasePage, purejsLib, jprint, Page */

"use strict";

var allPages = null;
var linkTag = 'p';


Class("BasePage", {
//    isa: MyAjax.AjaxLoadable,
    methods: {
        initialize: function () {
            this.isItLoaded = false;
        },
        setHTMLByClassName: function (className, html) {
            var nodes = document.getElementsByClassName(className);
            Array.from(nodes).forEach(function (node) {
                node.innerHTML = html;
            });
        },
        forEachElementById: function (id, onElement) {
            var elements = document.getElementById(this.getPlace()).getElementsByTagName(id);
            Array.from(elements).forEach(onElement);
        }
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
        main_on_sucess: function (result) {

        },
        urlName: function () {
            if (!this.file_name) {
                this.file_name = config.SITE_BASE + '/' +
                        this.query.getRootName() + '/' + this.getPageName() + '.html';
            }
            return this.file_name;
        },
        on_failure: function (result) {
            var place = this.getPlace();
            document.getElementById(place).style.display = 'none';
        },
        base_after: function (result) {
            if (this.hasCopyright) {
                this.copyright();
                this.authors();
            }
            utils.app_string();
        },
        on_success: function (result) {
            var place = this.getPlace();
            document.getElementById(place).style.display = 'block';
            this.main_on_sucess(result);
        }
    },
    after: {
        on_success: function (result) {
            this.base_after(result);
        }

    },
    before: {
        on_success: function (result) {
            var place = this.getPlace();
            document.getElementById(place).innerHTML = this.supressMetaTags(result);
        }
    }
});


Class("PageArticle", {
    isa: Page,
    methods: {
        resizeSVG: function () {
            var maxWidth = document.getElementById(this.getPlace()).clientWidth;

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
    after: {
        on_success: function (result) {
            this.resizeSVG();
            this.base_after(result);
        }
    },
    override: {
        initialize: function (query, place, session, hasCopyright) {
            this.SUPER(query, place, session, hasCopyright);
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
        }
    },
    override: {
        initialize: function (query, place, session, mainHTMLQuery, hasTitle) {
            this.SUPER(query, place, session);
            this.mainHTMLQuery = mainHTMLQuery;
            this.hasTitle = hasTitle;
        },
        main_on_sucess: function (result) {
            var session = this.getSession();
            var currentRoot = this.query.getRootName();
            var currentPage = this.query.getPageName();
            // f**k this !
            var self = this;

            this.forEachElementById(linkTag,
                    function (element) {
                        element.self = self;
                        element.href = element.getAttribute('href');
                        // element.currentRoot = currentRoot;
                        /* if (window.page) {
                         element.currentPage = window.page.getPageName();
                         } else {
                         element.currentPage = null;
                         } */
                        element.session = session;
                        if (!element.hasClickEvent) {
                            purejsLib.addEvent(element, 'click', clickdEventListener);
                            element.hasClickEvent = true;
                        }
                    });
        },
        on_success: function (result) {
            if (!jprint.isInPrint()) {
                this.SUPER(result);
            } else {
                document.getElementById(this.getPlace()).style.display = 'none';
            }
        }
    },
    after: {
        on_success: function (result) {
            this.toc_presentation(this.mainHTMLQuery);
            this.base_after(result);
        }
    },
    before: {
        on_success: function (result) {
            var place = this.getPlace();
            if (this.hasTitle && config.TOC_TITLE) {
                result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
            }
            document.getElementById(place).innerHTML = this.supressMetaTags(result);
        }

    }
});

var PagesCollection = function (newPages) {
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
    if (newRoot !== myself.currentRoot) {
        content = new PageNavigation(new HTMLQuery('content', newRoot), 'toc', myself.session, query, true);
        changed = true;
    }
    if (changed || newPage !== myself.currentPage) {
        article = new PageArticle(query, 'article', myself.session);
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
                    new PageNavigation(new HTMLQuery('content', broot), 'toc', this, this.query, true),
                    new PageNavigation(new HTMLQuery('navigation', broot), 'navigation', this, this.query),
                    new Page(new HTMLQuery('footer', broot), 'footer', this, true),
                    new PageArticle(this.query, 'article', this)
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
