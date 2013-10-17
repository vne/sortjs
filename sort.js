(function(exports) {
	"use strict";
	var _global,
		sortjs = function(data, fieldList, inplace) {
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
		};

	try {
		_global = window;
	} catch(e) {
		_global = global;
	}



	/*
		getObjectSorter

		Get a function that compares two objects by a list of given properties.
		e.g. getObjectSorter(['a', 'b']) will return a function that compares two objects first by 'a' property, then by 'b' property.

		Property names can have the following prefixes:
			- (minus sign) means reverse sorting by this property
			i: (letter 'i' followed by a colon) means case-insensitive string comparison by this property
			s: (letter 'i' followed by a colon) means case-sensitive string comparison by this property
			n: (letter 'n' followed by a colon) means integer comparison by this property
			f: (letter 'f' followed by a colon) means float comparison by this property
		Minus and one of the letters can be combined like this: '-i:property_name'

		Examples:
			getObjectSorter(['i:surname', 'i:name', 'i:midname']) - sort case-insensitevely by surname, then by name, then by midname
			getObjectSorter(['-n:price', 'i:address']) - reverse numerical (integer) sort by price, then case-insensitevely by address
	*/
	function getObjectSorter(fieldList, args) {
		if (typeof fieldList === "string") {
			fieldList = [ fieldList ];
		}
		if (!fieldList || ! fieldList.constructor || (fieldList.constructor !== Array)) { return function() {}; }
		if (args && args.get && (typeof args.get !== "function")) {
			throw new Error("'get' argument is not a function");
		}
		if (args && args.context && (typeof args.context !== "object")) {
			throw new Error("'context' argument is not an object");
		}
		var lst = [], i, infld, dir, field, opt, has = {}, sorter, sorters, first, second, third,
			flagfns = {
				noop: function(x) { return x; },
				tostring: function(x) { return x.toString(); },
				toistring: function(x) { return x.toString().toLowerCase(); },
			};
		for (i = 0; i < fieldList.length; i++) {
			infld = fieldList[i];
			field = { src: infld, flagfn: flagfns.noop };
			dir = 1;

			// get sort direction
			if (infld.indexOf("-") === 0) {
				infld = infld.substr(1);
				dir = -1;
			}
			// check for sort flags
			if (infld.indexOf(":") === 1) {
				opt = infld.split(":");
				field[opt[0]] = true;
				infld = opt[1];
				has.flags = true;
			}
			field.dir = dir;
			field.name = infld;
			if (args && args.get) {
				field.context = {
					field: infld,
					dir: dir,
					options: field
				};
				field.use_callback = true;
				has.callbacks = true;
			} else if (args && args.context) {
				field.use_context = true;
				field.context = args.context;
				has.contexts = true;
			}
			if (field.s) {
				field.to_string = true;
				field.flagfn = flagfns.tostring;
				has.str = true;
			}
			else if (field.i) {
				field.to_istring = true;
				field.flagfn = flagfns.toistring;
				has.istr = true;
			}
			if (field.f) {
				field.to_float = true;
				field.flagfn = parseFloat;
				has.floats = true;
			}
			else if (field.n) {
				field.to_int = true;
				field.flagfn = parseInt;
				has.ints = true;
			}

			lst.push(field);
		}
		if (lst.length > 0) { first  = lst[0].name; }
		if (lst.length > 1) { second = lst[1].name; }
		if (lst.length > 2) { third  = lst[2].name; }
		// console.log(lst, has);

sorters = {
			universal: function(a, b) {
				var i, ai, bi, f;
				for (i = 0; i < lst.length; i++) {
					f = lst[i];
					if (!f.use_callback && !f.use_context) {
						ai = typeof a === "object" ? a[f.name] : a;
						bi = typeof b === "object" ? b[f.name] : b;
						// console.log('simple', ai, bi, f.name);
					} else if (f.use_context) {
						ai = f.context[a][f.name];
						bi = f.context[b][f.name];
					} else {
						f.context.this = this;
						f.context.element = a;
						ai = args.get(f.context);
						f.context.element = b;
						bi = args.get(f.context);
					}

					// process options, convert a pair of elements to appropriate strings or numbers
					if (f.to_string) {
						ai = ai.toString();
						bi = bi.toString();
					} else if (f.to_istring) {
						ai = typeof ai !== "string" ? ai.toString().toLowerCase() : ai.toLowerCase();
						bi = typeof bi !== "string" ? bi.toString().toLowerCase() : bi.toLowerCase();
					} else if (f.to_float) {
						ai = typeof ai !== "number" ? parseFloat(ai) : ai;
						bi = typeof bi !== "number" ? parseFloat(bi) : bi;
					} else if (f.to_int) {
						ai = (typeof ai === "number") && (ai % 1 === 0) ? ai : parseInt(ai, 10);
						bi = (typeof bi === "number") && (bi % 1 === 0) ? bi : parseInt(bi, 10);
						// console.log('to_int', f.name, ai, bi, typeof ai, ai % 1 );
					}

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
					if (f.to_string) {
						ai = ai.toString();
						bi = bi.toString();
					} else if (f.to_istring) {
						ai = typeof ai !== "string" ? ai.toString().toLowerCase() : ai.toLowerCase();
						bi = typeof bi !== "string" ? bi.toString().toLowerCase() : bi.toLowerCase();
					} else if (f.to_float || f.to_int) {
						ai = typeof ai !== "number" ? parseFloat(ai) : ai;
						bi = typeof bi !== "number" ? parseFloat(bi) : bi;
					} else if (f.to_int) {
						ai = (typeof ai === "number") && (ai % 1 === 0) ? ai : parseInt(ai, 10);
						bi = (typeof bi === "number") && (bi % 1 === 0) ? bi : parseInt(bi, 10);
						// console.log('to_int', f.name, ai, bi, typeof ai, ai % 1 );
					}
					ai = f.flagfn(ai);
					bi = f.flagfn(bi);

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
						// console.log('simple', ai, bi, f.name);
					} else if (f.use_context) {
						ai = f.context[a][f.name];
						bi = f.context[b][f.name];
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
		}; // sorters

		// return FNS.universal;
		if (has.flags && (has.contexts || has.callbacks)) {
			// console.log('\nuniversal', has.contexts, has.callbacks);
			sorter = sorters.universal;
			sorter.type = "U";
		} else if (has.flags) {
			// console.log('\nflags');
			sorter = sorters.withflags;
			sorter.type = "F";
		} else if (has.contexts || has.callbacks) {
			// console.log('\ncontexts');
			sorter = sorters.withcontexts;
			sorter.type = "C";
		} else if (lst.length < 3) {
			// console.log('\nsingle');
			sorter = sorters.single;
			sorter.type = "1";
		} else {
			// console.log('\nsimple');
			sorter = sorters.simple;
			sorter.type = "S";
		}
		return sorter;

		// return function(a, b) {
		// 	var i, ai, bi, sf, dir, opt, options, context;

		// 	// cycle over field list
		// 	for (i = 0; i < fieldList.length; i++) {
		// 		sf = fieldList[i];
		// 		dir = 1;
		// 		options = {};

		// 		// get sort direction
		// 		if (sf.indexOf('-') === 0) {
		// 			sf = sf.substr(1);
		// 			dir = -1;
		// 		}

		// 		// check for sort flags
		// 		if (sf.indexOf(':') === 1) {
		// 			opt = sf.split(':');
		// 			options[opt[0]] = true;
		// 			sf = opt[1];
		// 		}
				
		// 		// get a pair of sort elements
		// 		if (args && args.get) {
		// 			// call function that should return sort elements
		// 			context = {
		// 				context: this,
		// 				field: sf,
		// 				dir: dir,
		// 				options: options
		// 			};
		// 			context.element = a;
		// 			ai = args.get(context);
		// 			context.element = b;
		// 			bi = args.get(context);
		// 		} else if (args && args.context) {
		// 			// get properties of an object from arguments (case of object of objects, a and b are keys in first-level object, sf is property of the second level)
		// 			ai = args.context[a][sf];
		// 			bi = args.context[b][sf];
		// 		} else {
		// 			// if a and b are objects, take their 'sf' property.
		// 			// otherwise compare directly a and b. In the latter case fieldList array does not matter
		// 			ai = typeof a === "object" ? a[sf] : a;
		// 			bi = typeof b === "object" ? b[sf] : b;
		// 		}

		// 		// process options, convert a pair of elements to appropriate strings or numbers
		// 		if (options && options.s) {
		// 			ai = ai.toString();
		// 			bi = bi.toString();
		// 		} else if (options && options.i) {
		// 			ai = typeof ai !== "string" ? ai.toString().toLowerCase() : ai.toLowerCase();
		// 			bi = typeof bi !== "string" ? bi.toString().toLowerCase() : bi.toLowerCase();
		// 		}
		// 		if (options && options.f) {
		// 			ai = typeof ai !== "number" ? parseFloat(ai) : ai;
		// 			bi = typeof bi !== "number" ? parseFloat(bi) : bi;
		// 		} else if (options && options.n) {
		// 			ai = typeof ai !== "number" ? parseInt(ai) : ai;
		// 			bi = typeof bi !== "number" ? parseInt(bi) : bi;
		// 		}

		// 		// do actual comparison
		// 		if (ai < bi) {
		// 			return -dir;
		// 		} else if (ai > bi) {
		// 			return dir;
		// 		}
		// 	}
		// 	return 0;

		// }	
	}


	function improve(inplace) {
		improveArray(inplace);
		improveObject(); // TODO: remove it from the default?
	}

	function improveArray(inplace) {
		_global.Array.prototype.sortjs = function(fieldList) {
			var array = inplace ? this : this.slice(0); // slice(0) does cloning of the array
			array.sort(getObjectSorter(fieldList));
			return array;
		};
		_global.Array.prototype.isortjs = function(fieldList) {
			this.sort(getObjectSorter(fieldList));
			return this;
		};
	}

	function improveObject() {
		_global.Object.prototype.sortjs = function(fieldList) {
			// console.warn('improving of an Object prototype is a bad thing');
			var array = Object.keys(this);
			array.sort(getObjectSorter(fieldList, {
				context: this
			}));
			return array;
		};
	}

	function clear() {
		clearArray();
		clearObject();
	}
	function clearArray() {
		delete _global.Array.prototype.sortjs;
		delete _global.Array.prototype.isortjs;
	}
	function clearObject() {
		delete _global.Object.prototype.sortjs;
	}
	function inplace(data, fieldList) {
		return sortjs(data,fieldList, true);
	}

function getSortByF() {
	return sortByF;
}

function sortByF(a, b) {
	// if (a['f'] > b['f']) { return -1; }
	// else if (a['f'] < b['f']) { return 1; }
	if (a.f > b.f) { return -1; }
	else if (a.f < b.f) { return 1; }
	// var i;
	// for (i = 0; i < lst.length; i++) {
	// 	     if (a[ lst[i].name ] < b[ lst[i].name ]) { return -lst[i].dir; }
	// 	else if (a[ lst[i].name ] > b[ lst[i].name ]) { return  lst[i].dir; }
	// }
}
	exports.getObjectSorter = getObjectSorter; // internal function that actually creates sorters
	exports.improve = improve;                 // calls improveArray and improveObject consequently
	exports.improveArray = improveArray;       // adds sortjs method to Array prototypes
	exports.improveObject = improveObject;     // adds sortjs method to Object prototypes
	exports.clear = clear;                     // calls clearArray and clearObject consequently
	exports.clearArray = clearArray;	       // removes sortjs method from Array prototype
	exports.clearObject = clearObject;         // removes sortjs method from Object prototype
	exports.sort = sortjs;                     // function that accepts two arguments: data to sort and properties array
	exports.inplace = inplace;                 // helper function that always do inplace sorting
	exports.getSortByF = getSortByF;
	exports.sortByF = sortByF;

})(typeof exports === "undefined" ? this.sortjs = {} : exports);
