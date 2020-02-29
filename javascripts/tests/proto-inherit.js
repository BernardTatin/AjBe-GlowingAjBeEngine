/*
 * proto-inherit.js
 * testing inheritance with prototypes
 * run:
 *  node proto-inherit.js
 */

"use strict";

function Animal(theSpecie, theName) {
    this.specie = theSpecie;
    this.name = theName;
}
/* Animal.prototype.getSpecie = function() {
    return this.specie;
}
Animal.prototype.getName = function() {
    return this.name;
}
Animal.prototype.print = function() {
    console.log(this.getName()
        + ' is a '
        + this.getSpecie());
} */

Animal.prototype = {
    getName: function() {
        return this.name;
    },
    print: function() {
        console.log(this.getName()
            + ' is a '
            + this.getSpecie());
    },
    getSpecie: function () {
        return this.specie;
    }
}

function Cat(theName) {
    Animal.call(this, 'Cat', theName);
}

function Dog(theName) {
    Animal.call(this, 'Dog', theName);
}
Cat.prototype = Object.create(Animal.prototype);
Dog.prototype = Object.create(Animal.prototype);


Dog.prototype.talk = function() {
    return 'Ouaf';
}
Dog.prototype.print = function() {
    console.log(this.getName()
        + ' is a '
        + this.getSpecie()
        + ' and shout '
        + this.talk());
}

/*
    =========================================================
    this form of prototype definition does not work for 
    the children, we must add each elements to the prototype 
    as above and not create a full new prototype which can
    erase the wanted one.
    =========================================================
 */
/* Dog.prototype = {
    talk: function () {
        return 'Ouaf';
    },
    print: function () {
        console.log(this.getName()
            + ' is a '
            + this.getSpecie()
            + ' and shout '
            + this.talk());
    }
} */

Cat.prototype.shout = function() {
    return "it's the night...";
}
Cat.prototype.print = function() {
    console.log(this.getName()
        + ' is a '
        + this.getSpecie()
        + ' and repeat '
        + this.shout());
}

let cat = new Cat('Plume');
let dog = new Dog('Hailey');
let friends = [cat, dog];

for (var i=0, l=friends.length; i<l; i++) {
    let f = friends[i];
    console.log('-----------------------');
    f.print();
    // f.nice_print();
}

