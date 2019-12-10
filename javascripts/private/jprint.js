/*
 * File:   jprint.js
 * Author: bernard
 *
 * Created on %<%DATE%>%, %<%TIME%>%
 */

var jprint = (function () {
    var inPrint = false;
    var oldTocDisplay = false;
    var oldNavDisplay = false;

    var beforePrint = function () {
        inPrint = true;
        oldTocDisplay = utils.getElementById('toc').style.display;
        oldNavDisplay = utils.getElementById('navigation').style.display;
        utils.getElementById('toc').style.display = 'none';
        utils.getElementById('navigation').style.display = 'none';
    };
    var afterPrint = function () {
        inPrint = false;
        utils.getElementById('toc').style.display = oldTocDisplay;
        utils.getElementById('navigation').style.display = oldNavDisplay;
    };
    return {
        initialize: function () {
            inPrint = false;
            oldNavDisplay = false;
            oldTocDisplay = false;
            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function (mql) {
                    if (mql.matches) {
                        beforePrint();
                    } else {
                        afterPrint();
                    }
                });
            }
            window.onbeforeprint = beforePrint;
            window.onafterprint = afterPrint;
        },
        isInPrint: function() {
            return inPrint;
        }
    };
})();

jprint.initialize();
