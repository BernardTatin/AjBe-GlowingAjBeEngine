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
                new PageNavigation(new HTMLQuery(PAGES_ID.CONTENT, broot), PAGES_ID.CONTENT, query, true),
                new PageNavigation(new HTMLQuery(PAGES_ID.NAVIGATION, broot), PAGES_ID.NAVIGATION, query),
                new PageFooter(query, new HTMLQuery(PAGES_ID.FOOTER, broot)),
                new PageArticle(query));

            utils.getElementById('site-name').innerHTML = config.SITE_NAME;
            utils.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
            return this;
        }
    };
})();


