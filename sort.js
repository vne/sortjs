(function(exports) {
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
		}
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
		if (!fieldList || ! fieldList.constructor || (fieldList.constructor !== Array)) { return function() {}; }
		if (args && args.get && (typeof args.get !== "function")) {
			throw new Error("'get' argument is not a function");
		}
		if (args && args.context && (typeof args.context !== "object")) {
			throw new Error("'context' argument is not an object");
		}
		return function(a, b) {
			var i, ai, bi, sf, dir, opt, options, context;

			// cycle over field list
			for (i = 0; i < fieldList.length; i++) {
				sf = fieldList[i];
				dir = 1;
				options = {};

				// get sort direction
				if (sf.indexOf('-') === 0) {
					sf = sf.substr(1);
					dir = -1;
				}

				// check for sort flags
				if (sf.indexOf(':') === 1) {
					opt = sf.split(':');
					options[opt[0]] = true;
					sf = opt[1];
				}
				
				// get a pair of sort elements
				if (args && args.get) {
					// call function that should return sort elements
					context = {
						context: this,
						field: sf,
						dir: dir,
						options: options
					};
					context.element = a;
					ai = args.get(context);
					context.element = b;
					bi = args.get(context);
				} else if (args && args.context) {
					// get properties of an object from arguments (case of object of objects, a and b are keys in first-level object, sf is property of the second level)
					ai = args.context[a][sf];
					bi = args.context[b][sf];
				} else {
					// if a and b are objects, take their 'sf' property.
					// otherwise compare directly a and b. In the latter case fieldList array does not matter
					ai = typeof a === "object" ? a[sf] : a;
					bi = typeof b === "object" ? b[sf] : b;
				}

				// process options, convert a pair of elements to appropriate strings or numbers
				if (options && options.s) {
					ai = ai.toString();
					bi = bi.toString();
				} else if (options && options.i) {
					ai = ai.toString().toLowerCase();
					bi = bi.toString().toLowerCase();
				}
				if (options && options.f) {
					ai = parseFloat(ai);
					bi = parseFloat(bi);
				} else if (options && options.n) {
					ai = parseInt(ai);
					bi = parseInt(bi);
				}

				// do actual comparison
				if (ai < bi) {
					return -dir;
				} else if (ai > bi) {
					return dir;
				}
			}
			return 0;

		}	
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
		}
	}

	function improveObject() {
		_global.Object.prototype.sortjs = function(fieldList) {
			// console.warn('improving of an Object prototype is a bad thing');
			var array = Object.keys(this);
			array.sort(getObjectSorter(fieldList, {
				context: this
			}));
			return array;
		}
	}

	function clear() {
		clearArray();
		clearObject();
	}
	function clearArray() {
		delete _global.Array.prototype.sortjs;
	}
	function clearObject() {
		delete _global.Object.prototype.sortjs;
	}

	
	exports.getObjectSorter = getObjectSorter; // internal function that actually creates sorters
	exports.improve = improve;                 // calls improveArray and improveObject consequently
	exports.improveArray = improveArray;       // adds sortjs method to Array prototypes
	exports.improveObject = improveObject;     // adds sortjs method to Object prototypes
	exports.clear = clear;                     // calls clearArray and clearObject consequently
	exports.clearArray = clearArray;	       // removes sortjs method from Array prototype
	exports.clearObject = clearObject;         // removes sortjs method from Object prototype
	exports.sort = sortjs;                     // function that accepts two arguments: data to sort and properties array

})(typeof exports === "undefined" ? this['sortjs'] = {} : exports);
