SortJS
======

A lightweight and convenient generator of sort functions for
arrays of objects and objects of objects that works both on
server (NodeJS) and client (browser) sides.

Written by Vladimir Neverov <sanguini@gmail.com> in 2013.

Homepage: [https://github.com/vne/sortjs/wiki](https://github.com/vne/sortjs/wiki)

Usage
-----

SortJS can be used to sort arrays of objects and objects of objects
by multiple properties. An array may look like this:

	var array = [
		{ id: 1, surname: 'Smith', name: 'John', age: 30, income: 32000, percent: 55.3 },
		{ id: 2, surname: 'smith', name: 'Susanne', age: 28, income: 40000, percent: 55.1 },
		{ id: 3, surname: 'Bittey', name: 'Chris', age: 55, income: 20000, percent: 87.5 },
		{ id: 4, surname: 'The Fourth', name: 'Jane', age: 387, income: 150000, percent: 15.8 },
		{ id: 5, surname: 'Quinne', name: 'Stew', age: 5, income: 8500, percent: 31.7 },
		{ id: 6, surname: 'augsburg', name: 'Theodor', age: 154, income: 210000, percent: 99.9 },
		{ id: 7, surname: 'Zorro', name: 'Vasily', age: 30, income: 17000, percent: 7.3 }
	]

An object may look like this:

	var obj = {
		1: { surname: 'Smith', name: 'John', age: 30, income: 32000, percent: 55.3 },
		2: { surname: 'smith', name: 'Susanne', age: 28, income: 40000, percent: 55.1 },
		3: { surname: 'Bittey', name: 'Chris', age: 55, income: 20000, percent: 87.5 },
		4: { surname: 'The Fourth', name: 'Jane', age: 387, income: 150000, percent: 15.8 },
		5: { surname: 'Quinne', name: 'Stew', age: 5, income: 8500, percent: 31.7 },
		6: { surname: 'augsburg', name: 'Theodor', age: 154, income: 210000, percent: 99.9 },
		7: { surname: 'Zorro', name: 'Vasily', age: 30, income: 17000, percent: 7.3 }
	};

Both can be sorted using SortJS. In case of an array you get a sorted array, in case of an
object you get a sorted array of object keys.

By default, SortJS returns a copy of a source array (as opposed to build-in Javascript method).
This behaviour can be altered.


### As a module (default)

	var sortjs = require('sortjs');
	var sortedArray = sortjs.sort(array, ["surname", "name"]); // returns new array in requested order
	var sortedObjKeys = sortjs.sort(obj, ["surname", "name"]); // returns array of object keys sorted in requested order

	sortjs.sort(array, ["surname", "name"], true);             // perform an inplace sort like build-in Javascript method
	sortjs.inplace(array, ["surname", "name"]);                // another way of doing inplace sorting

### As an Array or Object method (includes mangling of native objects prototypes!)

	var sortjs = require('sortjs');
	sortjs.improve();                                      // add .sortjs method to Array and Object prototypes
	var sortedArray = array.sortjs(["surname", "name"]); 
	var sortedObjKeys = obj.sortjs(["surname", "name"]);   // be careful, this returns keys of the object

	sortjs.clear()                                         // remove added .sortjs method from Array and Object prototypes 

	sortjs.improve(true);                                  // add .sortjs method to prototypes performing inplace sorting for arrays
	array.sortjs(["surname", "name"]);
	sortjs.clear();

	array.isortjs(["surname", "name"]);                    // another way of doing inplace sorting

List of sort fields
-------------------

An array of property names should be specified to do the actual sort.
Property names are case-sensitive. They can have the following prefixes:

 *  &ndash;&nbsp;(minus sign) means reverse sorting by this property
 *  i: (letter 'i' followed by a colon) means case-insensitive string comparison by this property
 *  s: (letter 's' followed by a colon) means case-sensitive string comparison by this property
 *  n: (letter 'n' followed by a colon) means integer comparison by this property
 *  f: (letter 'f' followed by a colon) means float comparison by this property

Minus and one of the letters can be combined like this: '-i:property'. More than one letter prefix
is not allowed (and is not needed).

Examples:

 *  ['i:surname', 'i:name', 'i:midname'] - sort case-insensitevely by surname, then by name, then by midname
 *  ['-n:price', 'i:address'] - reverse numerical (integer) sort by price, then case-insensitevely by address

Tests and examples
------------------

More examples of library usage can be found in **test.js** file. To run tests you will
need [Mocha](http://visionmedia.github.io/mocha/), the tests themselves use built-in
NodeJS [assert](http://nodejs.org/api/assert.html) module. To run tests in browser
open **test.html** file.

Benchmarking
------------

TODO: explain

Array size = 1000, average over 500 samples
Sparse data, single argument
----------------------------
            f |  0.84983 +/- 0.36137 ms | sorter 1 | rel( sortByF)  1.33341
         f:f  |  1.09565 +/- 0.22603 ms | sorter F | rel( sortByF)  1.71911
      sortByF |  0.63734 +/- 0.13719 ms | sorter <fn:_>
            n |  2.94630 +/- 0.32551 ms | sorter 1 | rel( sortByI)  5.28199
          n:n |  1.45665 +/- 0.12823 ms | sorter F | rel( sortByI)  2.61142
      sortByI |  0.55780 +/- 0.18799 ms | sorter <fn:_>
            s |  0.98047 +/- 0.07994 ms | sorter 1 | rel( sortByS)  1.11397
          s:s |  1.71471 +/- 0.16757 ms | sorter F | rel( sortByS)  1.94817
      sortByS |  0.88016 +/- 0.14932 ms | sorter <fn:_>
Sparse data, four arguments
---------------------------
   f,f2,f3,f4 |  0.99000 +/- 0.16634 ms | sorter S | rel(sortByFFFF)  1.72934
f: f,f2,f3,f4 |  1.27399 +/- 0.36536 ms | sorter F | rel(sortByFFFF)  2.22542
   sortByFFFF |  0.57247 +/- 0.13836 ms | sorter <fn:_>
Dense data, four arguments
--------------------------
   f,f2,f3,f4 |  0.97672 +/- 0.19026 ms | sorter S | rel(sortByFFFF-D)  1.66231
f: f,f2,f3,f4 |  1.25018 +/- 0.26922 ms | sorter F | rel(sortByFFFF-D)  2.12772
 sortByFFFF-D |  0.58757 +/- 0.23306 ms | sorter <fn:_>
   i,i2,i3,i4 |  2.13215 +/- 0.39709 ms | sorter S | rel(sortByIIII-D)  3.85918
i: i,i2,i3,i4 |  6.21322 +/- 0.46786 ms | sorter F | rel(sortByIIII-D) 11.24590
f: i,i2,i3,i4 |  2.54000 +/- 0.27203 ms | sorter F | rel(sortByIIII-D)  4.59739
 sortByIIII-D |  0.55249 +/- 0.12784 ms | sorter <fn:_>
   s,s2,s3,s4 |  1.26455 +/- 0.46008 ms | sorter S | rel(sortBySSSS-D)  1.43919
s: s,s2,s3,s4 |  1.75010 +/- 0.18142 ms | sorter F | rel(sortBySSSS-D)  1.99180
 sortBySSSS-D |  0.87865 +/- 0.12496 ms | sorter <fn:_>
