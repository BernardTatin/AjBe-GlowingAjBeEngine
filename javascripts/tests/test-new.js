/*
 * test-new.js
 * testing the new operator
 * run:
 *  node test-new.js
 */

"use strict";

function Animal(theName) {
    this.name = theName;
}

Animal.prototype.getName = function() {
    return this.name;
};

var cat = new Animal('cat');
var dog = new Animal('dog');

console.log('cat: <' + cat.getName() + '>');
console.log('dog: <' + dog.getName() + '>');

console.log('the cat constructor is: ' + cat.constructor);
console.log('the dog constructor is: ' + dog.constructor);
