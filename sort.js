/*
	About: Summary
	SortJS is a library for sorting arrays of objects and objects of objects by one or several properties.

	Usage:
		> // return a copy of arrayOfObjects, sorted by "price" property
		> sortjs.sort(arrayOfObjects, "price");

		> // add .sortjs method to Array prototype
		> sortjs.improve();
		>
		> // do the sort. This also returns a sorted copy
		> arrayOfObjects.sortjs("price");
		If you prefer to do an inplace sort (just like the Javascript build-in sort), do the following:
		
		> // perform an inplace sort
		> sortjs.sort(arrayOfObjects, "price", true);
		
		or

		> sortjs.inplace(arrayOfObjects, "price");

		> // add .sortjs method to Array prototype so that it will perform an inplace sort by default
		> sortjs.improve(true);
		>
		> // do the inplace sort
		> arrayOfObjects.sortjs("price");

	Property list:
		All sorting functions accept the list of properties by which the objects should be sorted. Syntax is always the same:
		
		> "name" - asc sort by property "name"
		> ["name", "surname"] - asc sort by property "name", then asc sort by property "surname"
		> ["-name", "surname"] - desc sort by property "name", then asc sort by property "surname"
		By default, there is no type conversion and properties are simply compared. You can specify a type by adding a prefix:

		> "s:name" - asc compare as case-sensitive strings
		> "i:name" - asc compare as case-insensitive string
		> "-f:name" - desc compare as floats
		> "n:name" - asc compare as integers
		> "d:name" - asc compare as dates (new Date(x) is used to convert x to Date instance)
		Be warned that type conversion is SLOW. Avoid prefixes, if you are sure that your data has proper types.

*/

// put everything into a closure and expose public API via 'exports' argument
(function(exports) {
	"use strict";

	/*
		Function: getObjectSorter
		Returns a function that compares two objects by a list of given properties.

		For example, getObjectSorter(["a", "b"]) will return a function that
		compares two objects first by "a" property, then by "b" property.
		See *Property list* in <Summary> for details.

		Parameters:
			fieldList - an array of strings, each string containing the name of object property (with optional prefixes, see README)
			args - object with additional options

		Returns:
			sorter function
	*/
	function getObjectSorter(fieldList, args) {
		if (typeof fieldList === "string") {
			fieldList = [ fieldList ];
		}
		// return a no-op sorter when no field list was passed
		if (!fieldList || ! fieldList.constructor || (fieldList.constructor !== Array)) { return function() {}; }
		// check types of the additonal options
		if (args && args.get && (typeof args.get !== "function")) {
			throw new Error("'get' argument is not a function");
		}
		if (args && args.context && (typeof args.context !== "object")) {
			throw new Error("'context' argument is not an object");
		}
		var lst = [], // list of preprocessed sort fields
			has = {}, // hints for sort function chooser
			// Probably, useless. TODO: measure and remove
			first, second, third, // 1st, 2nd, 3rd field names to speed up sorting.
			sorters, // available sort functions, one of them is chosen according to hints
			sorter, // a sort function that is chosen from 'sorters'
			i, infld, dir, field, opt,
			flagfns = {
				noop: function(x) { return x; },
				tostring: function(x) { return x.toString(); },
				toistring: function(x) { return x.toString().toLowerCase(); },
				todate: function(x) { return new Date(x); },
				tofloat: function(x) { return typeof x !== "number" ? parseFloat(x) : x },
				toint: function(x) { return (typeof x === "number") && (x % 1 === 0) ? x : parseInt(x, 10) }
			};
		// cycle over input field list
		for (i = 0; i < fieldList.length; i++) {
			infld = fieldList[i];
			field = { src: infld, flagfn: flagfns.noop };
			dir = 1;

			// get current field sort direction
			if (infld.indexOf("-") === 0) {
				infld = infld.substr(1);
				dir = -1;
			}
			// check for sort flags in the current field
			if (infld.indexOf(":") === 1) {
				opt = infld.split(":");
				field[opt[0]] = true;
				infld = opt[1];
				has.flags = true;
			}
			field.dir = dir;
			field.name = infld;
			if (args && args.get) {
				// prepare context for callback, set appropriate flags
				field.context = {
					field: infld,
					dir: dir,
					options: field
				};
				field.use_callback = true;
				has.callbacks = true;
			} else if (args && args.context) {
				// set appropriate flags
				field.use_context = true;
				field.context = args.context;
				has.contexts = true;
			}
			// process field options
			if (field.s) {
				// case-sensitive comparison
				field.to_string = true;
				field.flagfn = flagfns.tostring;
				has.str = true;
			}
			else if (field.i) {
				// case-insensitive comparison
				field.to_istring = true;
				field.flagfn = flagfns.toistring;
				has.istr = true;
			} else if (field.f) {
				// float comparison
				field.to_float = true;
				field.flagfn = flagfns.tofloat;
				has.floats = true;
			}
			else if (field.n) {
				// integer comparison
				field.to_int = true;
				field.flagfn = flagfns.toint;
				has.ints = true;
			} else if (field.d) {
				// date comparison
				field.to_date = true;
				field.flagfn = flagfns.todate;
				has.dates = true;
			}

			lst.push(field);
		}
		// set shortcuts for first three field names
		if (lst.length > 0) { first  = lst[0].name; }
		if (lst.length > 1) { second = lst[1].name; }
		if (lst.length > 2) { third  = lst[2].name; }
		/* console.log(lst, has); */

		// Define an array of possible sorting functions.
		// It is defined here because of speed: sorters need to access
		// the 'lst' array and closures are faster then
		// binded functions.
		sorters = {
			universal: function(a, b) {
				var i, ai, bi, f;
				for (i = 0; i < lst.length; i++) {
					f = lst[i];
					if (!f.use_callback && !f.use_context) {
						ai = typeof a === "object" ? a[f.name] : a;
						bi = typeof b === "object" ? b[f.name] : b;
						/*console.log('simple', ai, bi, f.name);*/
					} else if (f.use_context) {
						ai = f.context[a][f.name] || a;
						bi = f.context[b][f.name] || b;
						/*console.log('contexts', ai, bi, f.name);*/
					} else {
						f.context.this = this;
						f.context.element = a;
						ai = args.get(f.context);
						f.context.element = b;
						bi = args.get(f.context);
					}

					// process options, convert a pair of elements to appropriate strings or numbers
					if (f.to_int || f.to_float || f.to_string || f.to_istring || f.to_date) {
						ai = f.flagfn(ai);
						bi = f.flagfn(bi);
					}
					// if (f.to_string) {
					// 	ai = ai.toString();
					// 	bi = bi.toString();
					// } else if (f.to_istring) {
					// 	ai = typeof ai !== "string" ? ai.toString().toLowerCase() : ai.toLowerCase();
					// 	bi = typeof bi !== "string" ? bi.toString().toLowerCase() : bi.toLowerCase();
					// } else if (f.to_float) {
					// 	ai = typeof ai !== "number" ? parseFloat(ai) : ai;
					// 	bi = typeof bi !== "number" ? parseFloat(bi) : bi;
					// } else if (f.to_int) {
					// 	ai = (typeof ai === "number") && (ai % 1 === 0) ? ai : parseInt(ai, 10);
					// 	bi = (typeof bi === "number") && (bi % 1 === 0) ? bi : parseInt(bi, 10);
					// 	/*console.log('to_int', f.name, ai, bi, typeof ai, ai % 1 );*/
					// }

					// do actual comparison
					if (ai < bi) {
						return -f.dir;
					} else if (ai > bi) {
						return f.dir;
					}
				}
			},
			simple: function(a, b) {
				var i;
				for (i = 0; i < lst.length; i++) {
						 if (a[ lst[i].name ] < b[ lst[i].name ]) { return -lst[i].dir; }
					else if (a[ lst[i].name ] > b[ lst[i].name ]) { return  lst[i].dir; }
				}
			},
			single: function(a, b) {
				if (a[first] < b[first]) { return -lst[0].dir; }
				else if (a[first] > b[first]) { return lst[0].dir; }
				else if (a[second] < b[second]) { return -lst[1].dir; }
				else if (a[second] > b[second]) { return lst[1].dir; }
				else if (a[third] < b[third]) { return -lst[2].dir; }
				else if (a[third] > b[third]) { return lst[2].dir; }
			},
			withflags: function(a, b) {
				var i, ai, bi, f;
				for (i = 0; i < lst.length; i++) {
					f = lst[i];
					ai = typeof a === "object" ? a[f.name] : a;
					bi = typeof b === "object" ? b[f.name] : b;

					// process options, convert a pair of elements to appropriate strings or numbers
					// if (f.to_string) {
					// 	ai = ai.toString();
					// 	bi = bi.toString();
					// } else if (f.to_istring) {
					// 	ai = typeof ai !== "string" ? ai.toString().toLowerCase() : ai.toLowerCase();
					// 	bi = typeof bi !== "string" ? bi.toString().toLowerCase() : bi.toLowerCase();
					// } else if (f.to_float || f.to_int) {
					// 	ai = typeof ai !== "number" ? parseFloat(ai) : ai;
					// 	bi = typeof bi !== "number" ? parseFloat(bi) : bi;
					// } else if (f.to_int) {
					// 	ai = (typeof ai === "number") && (ai % 1 === 0) ? ai : parseInt(ai, 10);
					// 	bi = (typeof bi === "number") && (bi % 1 === 0) ? bi : parseInt(bi, 10);
					// 	/*console.log('to_int', f.name, ai, bi, typeof ai, ai % 1 );*/
					// } else if (f.to_date) {
					// 	ai = 
					// }
					// ai = f.flagfn(ai);
					// bi = f.flagfn(bi);
					if (f.to_int || f.to_float || f.to_string || f.to_istring || f.to_date) {
						ai = f.flagfn(ai);
						bi = f.flagfn(bi);
					}

					// do actual comparison
					if (ai < bi) {
						return -f.dir;
					} else if (ai > bi) {
						return f.dir;
					}
				}
			},
			withcontexts: function(a, b) {
				var i, ai, bi, f;
				for (i = 0; i < lst.length; i++) {
					f = lst[i];
					if (!f.use_callback && !f.use_context) {
						ai = typeof a === "object" ? a[f.name] : a;
						bi = typeof b === "object" ? b[f.name] : b;
						/*console.log('simple', ai, bi, f.name);*/
					} else if (f.use_context) {
						ai = f.context[a][f.name] || a;
						bi = f.context[b][f.name] || b;
						/*console.log('contexts', ai, bi, f.name);*/
					} else {
						f.context.this = this;
						f.context.element = a;
						ai = args.get(f.context);
						f.context.element = b;
						bi = args.get(f.context);
					}

					// do actual comparison
					if (ai < bi) {
						return -f.dir;
					} else if (ai > bi) {
						return f.dir;
					}
				}
			}
		}; /* sorters */

		// choose a most appropriate sort function
		if (has.flags && (has.contexts || has.callbacks)) {
			/*console.log('\nuniversal', has.contexts, has.callbacks);*/
			sorter = sorters.universal;
			sorter.type = "U";
		} else if (has.flags) {
			/*console.log('\nflags');*/
			sorter = sorters.withflags;
			sorter.type = "F";
		} else if (has.contexts || has.callbacks) {
			/*console.log('\ncontexts');*/
			sorter = sorters.withcontexts;
			sorter.type = "C";
		} else if (lst.length < 3) {
			/*console.log('\nsingle');*/
			sorter = sorters.single;
			sorter.type = "1";
		} else {
			/*console.log('\nsimple');*/
			sorter = sorters.simple;
			sorter.type = "S";
		}
		return sorter;
	}


	/*
		Function: sort
		Sorts an array or an object keys

		Parameters:
			data - array of objects or object of objects
			fieldList - an array of strings, each string containing the name of object property (with optional prefixes, see *Property list* in <Summary>)
			inplace - optional, boolean. If true, perform an inplace sort (just like the built-in array sort)
	*/
	function sort(data, fieldList, inplace) {
		var array;
		if (data.constructor === Array) {
			array = inplace ? data : data.slice(0);
			array.sort(getObjectSorter(fieldList));
		} else if (data.constructor === Object) {
			array = Object.keys(data);
			array.sort(getObjectSorter(fieldList, {
				context: data
			}));
		} else {
			throw new Error("Sorry, don't know how to sort this kind of things");
		}
		return array;
	}

	/*
		Function: inplace
		Same as sort, but do a mandatory inplace sorting.
	*/
	function inplace(data, fieldList) {
		return sort(data,fieldList, true);
	}

	/*
		Function: improve
		Add .sortjs method (and .isortjs for Array) to <Array.prototype> and <Object.prototype>.

		Parameters:
			inplace - optional, boolean. If true, <Array.prototype.sortjs> method would perform an inplace sort by default
	*/
	
	function improve(inplace) {
		improveArray(inplace);
		improveObject(); // TODO: remove it from the default?
	}

	/*
		Function: improveArray
		Add .sortjs and .isortjs methods to <Array.prototype>.

		Parameters:
			inplace - optional, boolean. If true, <Array.prototype.sortjs> method would perform an inplace sort by default
	*/
	function improveArray(inplace) {
		Array.prototype.sortjs = function(fieldList) {
			var array = inplace ? this : this.slice(0); // slice(0) does cloning of the array
			array.sort(getObjectSorter(fieldList));
			return array;
		};
		Array.prototype.isortjs = function(fieldList) {
			this.sort(getObjectSorter(fieldList));
			return this;
		};
	}

	/*
		Function: improveObject
		Add .sortjs method to <Object.prototype>.
	*/
	function improveObject() {
		Object.prototype.sortjs = function(fieldList) {
			// console.warn('improving of an Object prototype is a bad thing');
			var array = Object.keys(this);
			array.sort(getObjectSorter(fieldList, {
				context: this
			}));
			return array;
		};
	}

	/*
		Function: clear
		Remove all sortjs methods from <Array.prototype> and <Object.prototype>.
	*/
	function clear() {
		clearArray();
		clearObject();
	}

	/*
		Function: clearArray
		Remove all sortjs methods from <Array.prototype>.
	*/
	function clearArray() {
		delete Array.prototype.sortjs;
		delete Array.prototype.isortjs;
	}

	/*
		Function: clearObject
		Remove all sortjs methods from <Object.prototype>.
	*/
	function clearObject() {
		delete Object.prototype.sortjs;
	}


	exports.getObjectSorter = getObjectSorter; // internal function that actually creates sorters
	exports.improve = improve;                 // calls <improveArray> and <improveObject> consequently
	exports.improveArray = improveArray;       // adds sortjs method to <Array.prototype>
	exports.improveObject = improveObject;     // adds sortjs method to <Object.prototype>
	exports.clear = clear;                     // calls <clearArray> and <clearObject> consequently
	exports.clearArray = clearArray;	       // removes sortjs method from <Array.prototype>
	exports.clearObject = clearObject;         // removes sortjs method from <Object.prototype>
	exports.sort = sort;                       // function that accepts two arguments: data to sort and properties array
	exports.inplace = inplace;                 // helper function that always do inplace sorting

	/*
		Class: Array.prototype
		Functions that are added to Array prototype after <improve> call

		Function: sortjs
		Sort an array

		Parameters:
			fieldList - an array of strings, each string containing the name of object property (with optional prefixes, see *Property list* in <Summary>)

		Returns:
			sorted copy of an array if .improve was called without arguments or with false argument. Does an inplace sort otherwise.

		Function: isortjs
		Do an inplace sort of an array

		Parameters:
			fieldList - an array of strings, each string containing the name of object property (with optional prefixes, see *Property list* in <Summary>)

		Returns:
			sorted array



		Class: Object.prototype
		Functions that are added to Object prototype after <improve> call

		Function: sortjs
		Sort object keys

		Parameters:
			fieldList - an array of strings, each string containing the name of object property (with optional prefixes, see *Property list* in <Summary>)

		Returns:
			sorted array of object keys


	*/

})(typeof exports === "undefined" ? this.sortjs = {} : exports);
