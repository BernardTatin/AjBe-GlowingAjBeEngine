/*
 */

var config = (function() {
    var self = {};
    self.DEFAULT_ROOT = 'main';
    self.DEFAULT_PAGE = 'index';
    return self;
})();

var utils = (function() {
    var self = {};
    self.isUndefined = function(value) {
        var undefined;
        return value === undefined;
    };
    return self;
})();
