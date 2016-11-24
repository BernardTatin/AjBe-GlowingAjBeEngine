/*
 * maybe.js
 * A good usable maybe
 * from http://www.aaronhsmith.com/2015/09/08/introduction-monads-javascript/
 */

var Maybe = function(value) {
  var Nothing = {
    bind: function(fn) {
      return this;
    },
    isNothing: function() {
      return true;
    },
    val: function() {
      throw new Error("cannot call val() of nothing");
    },
    maybe: function(def, fn) {
      return def;
    }
  };

  var Just = function(value) {
    return {
      bind: function(fn) {
        return Maybe(fn.call(this, value));
      },
      isNothing: function() {
        return false;
      },
      val: function() {
        return value;
      },
      maybe: function(def, fn) {
        return fn.call(this, value);
      }
    };
  };

  if (typeof value === 'undefined' || value === null) {
    return Nothing;
  } else {
    return Just(value);
  };
};

