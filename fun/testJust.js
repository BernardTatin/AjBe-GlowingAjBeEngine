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

"use strict";

function testJust(a, b) {
    var result = new Just(a).bind(function(value) {
                     return new Just(b).bind(function(value2) {
                          return new Just(value + value2)
                      });
                 });

    print('testJust : a=', a, ' b=', b, ' => ', result);
};

function testJustNothing(a, b) {
    var result = new Just(a).bind(function(value) {
                     return Nothing.bind(function(value2) {
                          return new Just(value + value2)
                      });
                 });

    print('testJustNothing : a=', a, ' b=', b, ' => ', result);
};

print ('=============================================================');
print ('Just');
print ('');
testJust (5, 6);
testJust (2, 3);
testJustNothing (5, 6);
testJustNothing (2, 3);

function getUser() {
    return new Just({
        getAvatar: function() {
            return Nothing; // no avatar
        }
    });
}

var url = getUser()
    .bind(function(user) {return user.getAvatar(); })
    .bind(function(avatar) { return avatar.url});

if (url instanceof Just) {
    print('URL has value: ' + url.value);
} else {
    print('URL is empty.');
}
