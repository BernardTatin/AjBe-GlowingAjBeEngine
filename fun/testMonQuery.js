/*
 testMonQuery.js
 usage:
    d8 --use_strict monad.js mon-query.js testing-environment.js testMonQuery.js
 */

var urls = [
    '/index.html',
    '/index.html?root=rootOnly',
    'index.html?page=pageOnly',
    '/ii/oo/index.html?root=fullRoot&page=fullPage',
    'index?root=&page=unePageSansRoot',
    'index?page=&page=uneDoublePage',
    'index?page=&root=rootSansPage'
];

for (var i=0; i<urls.length; i++) {
    try {
        var query = new HTMLQuery(urls[i]);
        print('url -> ', urls[i], ' root <', query.getRootName(), '> page <', query.getPageName(), '>');
    }
    catch (e) {
        print ('ERROR: ', e);
    }

}
