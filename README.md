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
	{ id: 1, surname: 'Smith', name: 'John', age: 30, income: 32000, percent: 55.3, birthday: new Date('09/18/2013'), strdate: "09/18/2013" },
	{ id: 2, surname: 'smith', name: 'Susanne', age: 28, income: 40000, percent: 55.1, birthday: new Date('09/18/2012'), strdate: "09/18/2012" },
	{ id: 3, surname: 'Bittey', name: 'Chris', age: 55, income: 20000, percent: 87.5, birthday: new Date('08/18/2011'), strdate: "08/18/2011" },
	{ id: 4, surname: 'The Fourth', name: 'Jane', age: 387, income: 150000, percent: 15.8, birthday: new Date('07/18/2010'), strdate: "07/18/2010" },
	{ id: 5, surname: 'Quinne', name: 'Stew', age: 5, income: 8500, percent: 31.7, birthday: new Date('09/18/2009'), strdate: "09/18/2009" },
	{ id: 6, surname: 'augsburg', name: 'Theodor', age: 154, income: 210000, percent: 99.9, birthday: new Date('09/18/2009'), strdate: "09/18/2009" },
	{ id: 7, surname: 'Zorro', name: 'Vasily', age: 30, income: 17000, percent: 7.3, birthday: new Date('12/18/2008'), strdate: "12/18/2008" }
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

### Simple get the sorter function

	var sortjs = require('sortjs');
	var sortFn = sortjs.getObjectSorter(["surname", "name"]);

List of sort fields
-------------------

An array of property names should be specified to do the actual sort.
Property names are case-sensitive. They can have the following prefixes:

 *  &ndash;&nbsp;(minus sign) means reverse sorting by this property
 *  i: (letter 'i' followed by a colon) means case-insensitive string comparison by this property
 *  s: (letter 's' followed by a colon) means case-sensitive string comparison by this property
 *  n: (letter 'n' followed by a colon) means integer comparison by this property
 *  f: (letter 'f' followed by a colon) means float comparison by this property
 *  d: (letter 'd' followed by a colon) means date comparison by this property

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
            f |  0.85594 +/- 0.39481 ms | sorter 1 | rel( sortByF)  1.39450
          f:f |  1.23858 +/- 0.20522 ms | sorter F | rel( sortByF)  2.01788
      sortByF |  0.61380 +/- 0.08984 ms | sorter <fn:_>
            n |  0.81869 +/- 0.39290 ms | sorter 1 | rel( sortByN)  1.10172
          n:n |  1.93222 +/- 0.22229 ms | sorter F | rel( sortByN)  2.60019
          f:n |  1.24291 +/- 0.18595 ms | sorter F | rel( sortByN)  1.67258
      sortByN |  0.74311 +/- 1.03578 ms | sorter <fn:_>
            s |  1.02231 +/- 0.15645 ms | sorter 1 | rel( sortByS)  0.90074
          s:s |  2.23925 +/- 1.20828 ms | sorter F | rel( sortByS)  1.97296
      sortByS |  1.13497 +/- 1.14821 ms | sorter <fn:_>
            d |  6.97265 +/- 1.91867 ms | sorter 1 | rel( sortByD)  1.11903
          d:d | 13.62114 +/- 1.37493 ms | sorter F | rel( sortByD)  2.18604
      sortByD |  6.23096 +/- 0.41902 ms | sorter <fn:_>
Sparse data, four arguments
---------------------------
   f,f2,f3,f4 |  1.01354 +/- 0.21947 ms | sorter S | rel(sortByFFFF)  1.87147
f: f,f2,f3,f4 |  1.41474 +/- 0.19859 ms | sorter F | rel(sortByFFFF)  2.61226
   sortByFFFF |  0.54158 +/- 0.04026 ms | sorter <fn:_>
Dense data, four arguments
--------------------------
   f,f2,f3,f4 |  1.02665 +/- 0.14656 ms | sorter S | rel(sortByFFFF-D)  1.80118
f: f,f2,f3,f4 |  1.50496 +/- 0.33950 ms | sorter F | rel(sortByFFFF-D)  2.64035
 sortByFFFF-D |  0.56999 +/- 0.13108 ms | sorter <fn:_>
   n,n2,n3,n4 |  1.03933 +/- 0.48972 ms | sorter S | rel(sortByNNNN-D)  1.73908
n: n,n2,n3,n4 |  2.08253 +/- 0.40497 ms | sorter F | rel(sortByNNNN-D)  3.48466
f: n,n2,n3,n4 |  1.47462 +/- 0.51563 ms | sorter F | rel(sortByNNNN-D)  2.46745
 sortByNNNN-D |  0.59763 +/- 0.70503 ms | sorter <fn:_>
   s,s2,s3,s4 |  1.29927 +/- 0.40556 ms | sorter S | rel(sortBySSSS-D)  1.36926
s: s,s2,s3,s4 |  1.93002 +/- 0.66550 ms | sorter F | rel(sortBySSSS-D)  2.03400
 sortBySSSS-D |  0.94888 +/- 0.21068 ms | sorter <fn:_>
   d,d2,d3,d4 | 14.40979 +/- 1.49310 ms | sorter S | rel(sortByDDDD-D)  2.19868
d: d,d2,d3,d4 | 26.66083 +/- 2.93955 ms | sorter F | rel(sortByDDDD-D)  4.06797
 sortByDDDD-D |  6.55384 +/- 1.18187 ms | sorter <fn:_>
