var _global, is_nodejs = false;
try {
	var assert, sortjs;
	_global = window;
} catch(e) {
	_global = global;
	is_nodejs = true;
}

if (is_nodejs) {
	assert = require('assert');
	sortjs = require('./sort');
}


var objectList = [
	{ id: 1, surname: 'Smith', name: 'John', age: 30, income: 32000, percent: 55.3 },
	{ id: 2, surname: 'smith', name: 'Susanne', age: 28, income: 40000, percent: 55.1 },
	{ id: 3, surname: 'Bittey', name: 'Chris', age: 55, income: 20000, percent: 87.5 },
	{ id: 4, surname: 'The Fourth', name: 'Jane', age: 387, income: 150000, percent: 15.8 },
	{ id: 5, surname: 'Quinne', name: 'Stew', age: 5, income: 8500, percent: 31.7 },
	{ id: 6, surname: 'augsburg', name: 'Theodor', age: 154, income: 210000, percent: 99.9 },
	{ id: 7, surname: 'Zorro', name: 'Vasily', age: 30, income: 17000, percent: 7.3 }
],
	objectObject = {
		1: { surname: 'Smith', name: 'John', age: 30, income: 32000, percent: 55.3 },
		2: { surname: 'smith', name: 'Susanne', age: 28, income: 40000, percent: 55.1 },
		3: { surname: 'Bittey', name: 'Chris', age: 55, income: 20000, percent: 87.5 },
		4: { surname: 'The Fourth', name: 'Jane', age: 387, income: 150000, percent: 15.8 },
		5: { surname: 'Quinne', name: 'Stew', age: 5, income: 8500, percent: 31.7 },
		6: { surname: 'augsburg', name: 'Theodor', age: 154, income: 210000, percent: 99.9 },
		7: { surname: 'Zorro', name: 'Vasily', age: 30, income: 17000, percent: 7.3 }
	};

function clone(opt) {
	var o = [];
	for (var i in objectList) {
		if (opt && opt.stringify) {
			o[i] = {};
			for (var j in objectList[i]) {
				o[i][j] = objectList[i][j].toString();
			}
		} else {
			o[i] = objectList[i];
		}
	}
	return o;
}



describe('objectSorter', function() {

	describe('wrong or empty arguments', function() {
		it('should return function that does nothing on empty argument', function() {
			assert.deepEqual(
				[1,2,3,4,5,6,7],
				clone().sort( sortjs.getObjectSorter() ).map(function(e) { return e.id })
			);
		});
		it('should return function that does nothing on non-array argument', function() {
			assert.deepEqual(
				[1,2,3,4,5,6,7],
				clone().sort( sortjs.getObjectSorter("sortMePls") ).map(function(e) { return e.id })
			);
			assert.deepEqual(
				[1,2,3,4,5,6,7],
				clone().sort( sortjs.getObjectSorter({"sortMePls": 1}) ).map(function(e) { return e.id })
			);
			assert.deepEqual(
				[1,2,3,4,5,6,7],
				clone().sort( sortjs.getObjectSorter(5 /* chosen by a fair dice roll */) ).map(function(e) { return e.id })
			);
		});
		it('should not change order when using non-existing properties for comparison', function() {
			assert.deepEqual(
				[1,2,3,4,5,6,7],
				clone().sort( sortjs.getObjectSorter(['abcdef', 'test']) ).map(function(e) { return e.id })
			);
		});
		it('should sort by single string argument', function() {
			assert.deepEqual(
				[6,3,5,1,2,4,7],
				clone().sort( sortjs.getObjectSorter('i:surname') ).map(function(e) { return e.id })
			);
		})
	});

	describe('case-insensitive string sort', function() {
		it('should return correct ID sequence', function() {
			assert.deepEqual(
				[6,3,5,1,2,4,7],
				clone().sort( sortjs.getObjectSorter(['i:surname', 'i:name']) ).map(function(e) { return e.id })
			);
		});
		it('should reverse only entries with the same surname', function() {
			assert.deepEqual(
				[6,3,5,2,1,4,7], 
				clone().sort( sortjs.getObjectSorter(['i:surname', '-i:name']) ).map(function(e) { return e.id })
			);
		});
	});

	describe('case-sensitive string sort', function() {
		it('should return correct ID sequence', function() {
			assert.deepEqual(
				[3,5,1,4,7,6,2],
				clone().sort( sortjs.getObjectSorter(['surname', 'name']) ).map(function(e) { return e.id })
			);
		});
		it('should return the same sequence as in case of non-reverse sorting by name', function() {
			assert.deepEqual(
				[3,5,1,4,7,6,2],
				clone().sort( sortjs.getObjectSorter(['surname', '-name']) ).map(function(e) { return e.id })
			);
		});
	});

	describe('integer sort', function() {
		it('should return correct ID sequence', function() {
			assert.deepEqual(
				[5,2,1,7,3,6,4],
				clone().sort( sortjs.getObjectSorter(['n:age', 'i:name']) ).map(function(e) { return e.id })
			);
			assert.deepEqual(
				[5,2,7,1,3,6,4],
				clone().sort( sortjs.getObjectSorter(['n:age', '-i:name']) ).map(function(e) { return e.id })
			);
			assert.deepEqual(
				[5,2,7,1,3,6,4],
				clone().sort( sortjs.getObjectSorter(['n:age', 'n:income']) ).map(function(e) { return e.id })
			);
		});
		it('should return incorrect ID sequence on string sort by integer property', function() {
			assert.deepEqual(
				[6,2,1,7,4,5,3],
				clone({stringify: true}).sort( sortjs.getObjectSorter(['i:age']) ).map(function(e) { return parseInt(e.id) })
			);
		});
	});

	describe('float sort', function() {
		it('should return correct ID sequence', function() {
			assert.deepEqual(
				[7,4,5,2,1,3,6],
				clone().sort( sortjs.getObjectSorter(['f:percent', 'n:income']) ).map(function(e) { return e.id })
			);
		});
		it('should return incorrect ID sequence on integer sort by float property', function() {
			assert.deepEqual(
				[7,4,5,1,2,3,6],
				clone().sort( sortjs.getObjectSorter(['n:percent', 'n:income']) ).map(function(e) { return e.id })
			);
		});
	});

});


describe('improvement of native prototypes', function() {
	beforeEach(function() {
		sortjs.improveArray();
		sortjs.improveObject();
	});
	afterEach(function() {
		sortjs.clear();
	});
	describe('existence of additional functions', function() {
		it('Array.sortjs', function() {
			assert.notEqual(undefined, Array.prototype.sortjs);
		});
		it('Object.sortjs', function() {
			assert.notEqual(undefined, Object.prototype.sortjs);
		});
	});
	describe('sortjs should work', function() {
		it('should sort arrays', function() {
			assert.deepEqual(
				[6,3,5,1,2,4,7],
				clone().sortjs( ['i:surname', 'i:name'] ).map(function(e) { return e.id })
			);
		});
		it('should sort object keys', function() {
			assert.deepEqual(
				[6,3,5,1,2,4,7],
				objectObject.sortjs(['i:surname', 'i:name']).map(function(e) { return parseInt(e) }) // parseInt is needed because object keys are implicitly converted to string in Javascript
			);
		});
	});
	describe('removal of improvements', function() {
		it('should remove added functions', function() {
			sortjs.clear();
			assert.equal(undefined, Array.prototype.sortjs);
			assert.equal(undefined, Object.prototype.sortjs);
		})
	});
});


describe('sortjs interface', function() {
	describe('arrays', function() {
		it('should sort arrays', function() {
			assert.deepEqual(
				[6,3,5,1,2,4,7],
				sortjs.sort(clone(), ['i:surname', 'i:name'] ).map(function(e) { return e.id })
			);
		});
	});
	describe('objects', function() {
		it('should sort object keys', function() {
			assert.deepEqual(
				[6,3,5,1,2,4,7],
				sortjs.sort(objectObject, ['i:surname', 'i:name']).map(function(e) { return parseInt(e) }) // parseInt is needed because object keys are implicitly converted to string in Javascript
			);
		})
	})
});

