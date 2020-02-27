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
/*
Animal.prototype.getSpecie = function() {
    return this.specie;
};
*/

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
    Animal.call(this, 'Cat');
    this.name = theName;
}

function Dog(theName) {
    Animal.call(this, 'Dog');
    this.name = theName;
}
Cat.prototype = Object.create(Animal.prototype);
Dog.prototype = Object.create(Animal.prototype);

let cat = new Cat('Plume');
let dog = new Dog('Hailey');
let friends = [cat, dog];

for (var i=0, l=friends.length; i<l; i++) {
    let f = friends[i];
    console.log('-----------------------');
    f.print();
}

