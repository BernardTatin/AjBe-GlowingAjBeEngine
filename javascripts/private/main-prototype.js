var Query = Class.create({
    urlParam: function (name, default_value) {
        return utils.urlParam(name, this.url, default_value);
    },
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
    getRoot: function () {
        return this.root;
    },
    getPageName: function () {
        return this.pageName;
    }
});

var Page = Class.create({
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
        $(this.getPlace()).select('.copyright').each(function (element) {
            $(element).innerHTML = config.COPYRIGHT;
        });
    },
    authors: function () {
        $(this.getPlace()).select('.authors').each(function (element) {
            $(element).innerHTML = config.AUTHORS;
        });
    },
    before_on_success: function (result) {
        $(this.getPlace()).innerHTML = result;
    },
    main_on_sucess: function(result) {
        
    },
    after_on_success: function() {
        this.copyright();
        this.authors();
    },
    on_success: function (result) {
        this.before_on_success(result);
        this.main_on_sucess(result);
        this.after_on_success();
    },
    initialize: function (query, place, session) {
        this.query = query;
        this.place = place;
        this.session = session;
    },
    getPlace: function () {
        return this.place;
    },
    getSession: function () {
        return this.session;
    }
});

var PageContent = Class.create(Page, {
    toc_presentation: function (query) {
        var place = this.getPlace();
        var currentPage = query.getPageName();
        var currentRoot = query.getRoot();

        $(place).select('p').each(function (element) {
            var href = $(element).readAttribute('href');
            var query = new Query(href);
            var lpage = query.getPageName();
            var lroot = query.getRoot();

            $(element).removeClassName('current-node');
            if (lpage === currentPage &&
                    lroot === currentRoot) {
                var title = $(element).innerHTML;
                $('main_title').innerHTML = title;
                document.title = title;
                $(element).addClassName('current-node');
            }
        });
    },
    main_on_sucess: function($super, result) {
        var session = this.getSession();
        var place = this.getPlace();
        var currentRoot = this.query.getRoot();
        var self = this;

        $(place).select('p').each(function (element) {
            var href = $(element).readAttribute('href');
            var query = new Query(href);
            var lroot = query.getRoot();

            $(element).observe("click", function () {
                var the_page = new Page(query,
                        'article',
                        session);

                this.query = query;
                this.mainQuery = query;
                session.private_load(the_page);
                if (lroot !== currentRoot) {
                    var the_content = new PageContent(new Query('content', lroot),
                            'toc',
                            session,
                            query);
                    var the_footer = new Page(new Query('footer', lroot),
                            'footer',
                            session);

                    session.private_load(the_footer);
                    session.private_load(the_content);
                }
                self.toc_presentation(query);
                utils.setUrlInBrowser(href);
            });
        });
        self.toc_presentation(this.mainQuery);
    },
    after_on_success: function ($super) {
        $super();
        self.toc_presentation(this.mainQuery);
        utils.setUrlInBrowser(this.mainQuery.url);
    },
    initialize: function ($super, query, place, session, mainQuery) {
        $super(query, place, session);
        this.mainQuery = mainQuery;
    }
});

var Session = Class.create({
    getQuery: function () {
        return this.query;
    },
    getFooter: function () {
        return this.footer;
    },
    getContent: function () {
        return this.content;
    },
    private_load: function (the_page) {
        var request = new Ajax.Request(the_page.fileName(), {
            method: 'get',
            onSuccess: function (transport) {
                var result = transport.responseText || "no response text";
                the_page.on_success(result);
            },
            onFailure: function () {
                the_page.on_success("<h1>ERREUR!!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
            }
        });
    },
    load: function () {
        var broot = this.query.getRoot();
        var the_page = new Page(this.query,
                'article',
                this);
        var the_footer = new Page(new Query('footer', broot),
                'footer',
                this);
        var the_content = new PageContent(new Query('content', broot),
                'toc',
                this,
                this.query);
        this.lastContent = the_content;
        this.private_load(the_page);
        this.private_load(the_footer);
        this.private_load(the_content);
        return this;
    },
    initialize: function () {
        this.query = new Query();
        this.lastContent = null;
    }

});

function start() {
    var session = new Session();
    session.load();
    utils.setUrlInBrowser(session.query.url);
    Application.app_string();
}

start();