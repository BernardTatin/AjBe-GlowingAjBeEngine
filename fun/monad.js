/*
 monad.js
 */
// doesn't work...
// #!/usr/bin/env d8
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

/*
from : https://curiosity-driven.org/monads-in-javascript

Would be best with ES6 but I want some portability with old stuff.

Test with :
d8  monad.js testIdentity.js testJust.js
 */

"use strict";

/*
================================================================================
Identity monad

The identity monad is the simplest monad. It just wraps a value.
The Identity constructor will serve as the unit function.
*/
function Identity(value) {
    this.value = value;
}

Identity.prototype.bind = function(transform) {
    return transform(this.value);
};

Identity.prototype.toString = function() {
    return 'Identity(' + this.value + ')';
};


/*
================================================================================
Maybe monad

The maybe monad is similar to the identity monad but besides storing a value
it can also represent the absence of any value.

Just constructor is used to wrap the value:
 */
function Just(value) {
    this.value = value;
}

Just.prototype.bind = function(transform) {
    return transform(this.value);
};

Just.prototype.toString = function() {
    return 'Just(' +  this.value + ')';
};
/*
And Nothing represents an empty value.
*/
var Nothing = {
    bind: function() {
        return this;
    },
    toString: function() {
        return 'Nothing';
    }
};

/*
================================================================================
compose

 a function to encapsulate function composition.
 This takes two functions f and g and returns another function
 that computes f(g(x)).
 */

function compose(f, g) {
    return function(x) {
        return f(g(x));
    }
}
