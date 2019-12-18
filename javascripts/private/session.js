/*
 * session.js
 */

"use strict";

var session = (function() {
    var query = null;
    function initialize() {
        query = new HTMLQuery();
    }

    return {
        load: function () {
            initialize();
            var broot = query.getRoot();
            allPages = new PagesCollection(new PageNavigation(new HTMLQuery('content', broot), 'toc', query, true),
                new PageNavigation(new HTMLQuery('navigation', broot), 'navigation', query),
                new Page(new HTMLQuery('footer', broot), 'footer', true),
                new PageArticle(query, 'article'));

            utils.getElementById('site-name').innerHTML = config.SITE_NAME;
            utils.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
            return this;
        }
    };
})();


