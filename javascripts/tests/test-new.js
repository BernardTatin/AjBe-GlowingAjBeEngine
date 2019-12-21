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
Cat.prototype = {
    getSpecie: function() {
        return this.Super.getSpecie();
    },
    getName: function() {
        return this.name;
    },
    print: function() {
        console.log(this.getSpecie()
            + ' '
            + this.getName());
    }
};

function Dog(theName) {
    this.Super = new Animal('Dog');
    this.name = theName;
}
Dog.prototype = {
    getSpecie: function() {
        return this.Super.getSpecie();
    },
    getName: function() {
        return this.name;
    },
    print: function() {
        console.log(this.getSpecie()
            + ' '
            + this.getName());
    }
};


let cat = new Cat('Plume');
let dog = new Dog('Hailey');
let friends = [cat, dog];

for (var i=0, l=friends.length; i<l; i++) {
    let f = friends[i];
    console.log('-----------------------');
    f.print();
    console.log('the constructor is: ' + f.constructor);
}
