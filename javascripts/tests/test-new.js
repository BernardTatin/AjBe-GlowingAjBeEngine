/*
 * test-new.js
 * testing the new operator
 * run:
 *  node test-new.js
 */

"use strict";

function Animal(theSpecie) {
    this.specie = theSpecie;
}

Animal.prototype.getSpecie = function() {
    return this.specie;
};

function Cat(theName) {
    this.Super = new Animal('Cat');
    this.name = theName;
}
Cat.prototype.getSpecie = function() {
    return this.Super.getSpecie();
}
Cat.prototype.getName = function() {
    return this.name;
}

function Dog(theName) {
    this.Super = new Animal('Dog');
    this.name = theName;
}
Dog.prototype.getSpecie = function() {
    return this.Super.getSpecie();
}
Dog.prototype.getName = function() {
    return this.name;
}

let cat = new Cat('Plume');
let dog = new Dog('Hailey');
let friends = [cat, dog];

for (var i=0, l=friends.length; i<l; i++) {
    let f = friends[i];
    console.log('-----------------------');
    console.log(f.getSpecie() + ' ' + f.getName());
    console.log('the constructor is: ' + f.constructor);
}
