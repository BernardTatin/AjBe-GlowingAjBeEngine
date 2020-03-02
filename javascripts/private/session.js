/*
 * session.js
 */
/*
 * JSHint options:
 */
 /*      global utils: true; */
 /*      global HTMLQuery: true; */
 /*      global allPages: true; */
 /*      global PagesCollection: true; */
 /*      global PageNavigation: true; */
 /*      global PageFooter: true; */
 /*      global PageArticle: true; */
 /*      global config: true; */



var session = (function() {
    "use strict";
    return {
        load: function () {
            var query = new HTMLQuery();
            var broot = query.getRoot();
            allPages = new PagesCollection(
                new PageNavigation(new HTMLQuery('content', broot), 'toc', query, true),
                new PageNavigation(new HTMLQuery('navigation', broot), 'navigation', query),
                new PageFooter(query, new HTMLQuery('footer', broot)),
                new PageArticle(query));

            utils.getElementById('site-name').innerHTML = config.SITE_NAME;
            utils.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
            return this;
        }
    };
})();


