/*
 * session.js
 */

"use strict";

var session = (function() {
    let query = null;
    function initialize() {
        query = new HTMLQuery();
    }

    return {
        load: function () {
            initialize();
            let broot = query.getRoot();
            allPages = new PagesCollection(
                new PageNavigation(new HTMLQuery('content', broot), 'toc', query, true),
                new PageNavigation(new HTMLQuery('navigation', broot), 'navigation', query),
                new PageFooter(query, new HTMLQuery('footer', broot)),
                new PageArticle(query, 'article'));

            utils.getElementById('site-name').innerHTML = config.SITE_NAME;
            utils.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
            return this;
        }
    };
})();


