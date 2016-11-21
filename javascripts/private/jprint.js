/*
 * File:   jprint.js
 * Author: bernard
 *
 * Created on %<%DATE%>%, %<%TIME%>%
 */
/*
 * The MIT License
 *
 * Copyright 2016 bernard.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



var jprint = (function () {
    var inPrint = false;
    var oldTocDisplay = false;
    var oldNavDisplay = false;

    var beforePrint = function () {
        inPrint = true;
        oldTocDisplay = document.getElementById('toc').style.display;
        oldNavDisplay = document.getElementById('navigation').style.display;
        document.getElementById('toc').style.display = 'none';
        document.getElementById('navigation').style.display = 'none';
    };
    var afterPrint = function () {
        inPrint = false;
        document.getElementById('toc').style.display = oldTocDisplay;
        document.getElementById('navigation').style.display = oldNavDisplay;
    };

    var self = {};

    self.initialize = function () {
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
    };
    self.isInPrint = function () {
        return inPrint;
    };

    return self;
})();

jprint.initialize();
