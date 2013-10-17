var sortjs = require('./sort'),
	printf = require('printf'),
	tm_ps,
	st = [],
	verbose = false,
	dcache = {},
	SIZE = 1000,
	lst = ['f'],
	TIMES = 500;

tm_ps = process.hrtime();


st.push('Sparse data, single argument')
st.push(measure("f",       "f", SIZE, TIMES, 'sortByF'));
st.push(measure("f:f ",    "f:f", SIZE, TIMES, 'sortByF'));
st.push(measure("sortByF", sortByF, SIZE, TIMES));

st.push(measure("n",       "n", SIZE, TIMES, 'sortByI'));
st.push(measure("n:n",     "n:n", SIZE, TIMES, 'sortByI'));
st.push(measure("sortByI", sortByI, SIZE, TIMES));

st.push(measure("s",       "s", SIZE, TIMES, 'sortByS'));
st.push(measure("s:s",     "s:s", SIZE, TIMES, 'sortByS'));
st.push(measure("sortByS", sortByS, SIZE, TIMES));

st.push('Sparse data, four arguments');
st.push(measure("f,f2,f3,f4",    ["f","f2", "f3", "f4"], SIZE, TIMES, 'sortByFFFF'));
st.push(measure("f: f,f2,f3,f4", ["f:f","f:f2", "f:f3", "f:f4"], SIZE, TIMES, 'sortByFFFF'));
st.push(measure("sortByFFFF",    sortByFFFF, SIZE, TIMES));

st.push('Dense data, four arguments');
st.push(measure("f,f2,f3,f4",    ["f", "f2", "f3", "f4"], SIZE, TIMES, 'sortByFFFF-D', { f: 10, f2: 10, f3: 10, f4: 10 }));
st.push(measure("f: f,f2,f3,f4", ["f:f", "f:f2", "f:f3", "f:f4"], SIZE, TIMES, 'sortByFFFF-D', { f: 10, f2: 10, f3: 10, f4: 10 }));
st.push(measure("sortByFFFF-D",  sortByFFFF, SIZE, TIMES));

st.push(measure("i,i2,i3,i4",    ["i", "i2", "i3", "i4"], SIZE, TIMES, 'sortByIIII-D', { i: 10, i2: 10, i3: 10, i4: 10 }));
st.push(measure("i: i,i2,i3,i4", ["i:i", "i:i2", "i:i3", "i:i4"], SIZE, TIMES, 'sortByIIII-D', { i: 10, i2: 10, i3: 10, i4: 10 }));
st.push(measure("f: i,i2,i3,i4", ["f:i", "f:i2", "f:i3", "f:i4"], SIZE, TIMES, 'sortByIIII-D', { i: 10, i2: 10, i3: 10, i4: 10 }));
st.push(measure("sortByIIII-D",  sortByIIII, SIZE, TIMES));

st.push(measure("s,s2,s3,s4",    ["s", "s2", "s3", "s4"], SIZE, TIMES, 'sortBySSSS-D', { s: 10, s2: 10, s3: 10, s4: 10 }));
st.push(measure("s: s,s2,s3,s4", ["s:s", "s:s2", "s:s3", "s:s4"], SIZE, TIMES, 'sortBySSSS-D', { s: 10, s2: 10, s3: 10, s4: 10 }));
st.push(measure("sortBySSSS-D",  sortBySSSS, SIZE, TIMES));

// st.push(measure("f,i,s,f2",       ["f","i", "s", "f2"], SIZE, TIMES, 'sortByFI'));
// st.push(measure("f:f,i:i,s:s,f:f2", ["f:f","i:i", "s:s", "f:f2"], SIZE, TIMES, 'sortByFI'));
// st.push(measure("sortByFI",      sortByFI, SIZE, TIMES));

// st.push(measure("f, s, i",       ["f","s", "i"], SIZE, TIMES, 'sortByFS'));
// st.push(measure("f:f, s:s, i:i", ["f:f","s:s", "i:i"], SIZE, TIMES, 'sortByFS'));
// st.push(measure("sortByFS",      sortByFS, SIZE, TIMES));

// st.push(measure("sortByF2 ", sortjs.sortByF, SIZE, TIMES));

// st.push(measure("sortjs:i ", "i", SIZE, TIMES));
// st.push(measure("sortjs:ii", "i:i", SIZE, TIMES));
// st.push(measure("sortByI  ", sortByI, SIZE, TIMES));

// st.push(measure("sortjs:s ", "s", SIZE, TIMES));
// st.push(measure("sortjs:ss", "s:s", SIZE, TIMES));
// st.push(measure("sortByS  ", sortByS, SIZE, TIMES));
console.log();
// st.push(measure("f:f", 10000, 100));
// st.push(measure("f:f", 10000, 500));
// st.push(measure("f:f", 10000, 1000));

console.log(printf('Array size = %d, average over %d samples', SIZE, TIMES));
for (var i in st) {
	print_stats(st[i]);
}

function getSortByF() {
	return sortByF;
}

function sortByF(a, b) {
	// if (a['f'] > b['f']) { return -1; }
	// else if (a['f'] < b['f']) { return 1; }

	if (a.f < b.f) { return -1; }
	else if (a.f > b.f) { return 1; }
	// else if (a.i < b.i) { return -1; }
	// else if (a.i > b.i) { return 1; }

	// var i;
	// for (i = 0; i < lst.length; i++) {
	// 	     if (a[ lst[i].name ] < b[ lst[i].name ]) { return -lst[i].dir; }
	// 	else if (a[ lst[i].name ] > b[ lst[i].name ]) { return  lst[i].dir; }
	// }
}
function sortByFFFF(a, b) {
	     if (a.f < b.f) { return -1; }
	else if (a.f > b.f) { return 1; }
	else if (a.f2 < b.f2) { return -1; }
	else if (a.f2 > b.f2) { return 1; }
	else if (a.f3 < b.f3) { return -1; }
	else if (a.f3 > b.f3) { return 1; }
	else if (a.f4 < b.f4) { return -1; }
	else if (a.f4 > b.f4) { return 1; }
}
function sortByIIII(a, b) {
	     if (a.i  < b.i) { return -1; }
	else if (a.i  > b.i) { return 1; }
	else if (a.i2 < b.i2) { return -1; }
	else if (a.i2 > b.i2) { return 1; }
	else if (a.i3 < b.i3) { return -1; }
	else if (a.i3 > b.i3) { return 1; }
	else if (a.i4 < b.i4) { return -1; }
	else if (a.i4 > b.i4) { return 1; }
}
function sortBySSSS(a, b) {
	     if (a.s < b.s) { return -1; }
	else if (a.s > b.s) { return 1; }
	else if (a.s2 < b.s2) { return -1; }
	else if (a.s2 > b.s2) { return 1; }
	else if (a.s3 < b.s3) { return -1; }
	else if (a.s3 > b.s3) { return 1; }
	else if (a.s4 < b.s4) { return -1; }
	else if (a.s4 > b.s4) { return 1; }
}
function sortByFI(a, b) {
	if (a.f < b.f) { return -1; }
	else if (a.f > b.f) { return 1; }
	else if (a.i < b.i) { return -1; }
	else if (a.i > b.i) { return 1; }
}
function sortByFS(a, b) {
	if (a.f < b.f) { return -1; }
	else if (a.f > b.f) { return 1; }
	else if (a.s < b.s) { return -1; }
	else if (a.s > b.s) { return 1; }
}
function sortBySI(a, b) {
	if (a.s < b.s) { return -1; }
	else if (a.s > b.s) { return 1; }
	else if (a.i < b.i) { return -1; }
	else if (a.i > b.i) { return 1; }
}
function sortByI(a, b) {
	if (a.i < b.i) { return -1; }
	else if (a.i > b.i) { return 1; }
	else if (a.f < b.f) { return -1; }
	else if (a.f > b.f) { return 1; }
}
function sortByS(a, b) {
	if (a.s > b.s) { return -1; }
	else if (a.s < b.s) { return 1; }
}

function measure(label, fieldList, N, times, compareTo, mul) {
	var i, set, data = [],
	tm_fs, tm_bs, tm_b,
	len = [], s, cltm = [], srtr, m, key,
	stpfn = typeof fieldList === "function";
	if (!mul) { mul = {}; }

	if (verbose) { console.log('measuring', label); }
	tm_fs = process.hrtime();
	key = N.toString() + Object.keys(mul).map(function(e) { return e + '=' + mul[e] }).join(','); // cache key
	if (!dcache[key]) {
		m = {
			f: 999999999999,
			i: 999999999999,
			s: 999999999999,
			f2: 999999999999,
			i2: 999999999999,
			s2: 999999999999,
			f3: 999999999999,
			i3: 999999999999,
			s3: 999999999999,
			f4: 999999999999,
			i4: 999999999999,
			s4: 999999999999
		}
		if (mul) {
			for (var j in mul) {
				m[j] = mul[j];
			}
		}
		for (i = 0; i < N; i++) {
			data.push({
				f: Math.random() * m.f,
				i: Math.round(Math.random() * m.i),
				s: new Number((Math.random() * m.s)).toString(),
				f2: Math.random() * m.f2,
				i2: Math.round(Math.random() * m.i2),
				s2: new Number((Math.random() * m.s2)).toString(),
				f3: Math.random() * m.f3,
				i3: Math.round(Math.random() * m.i3),
				s3: new Number((Math.random() * m.s3)).toString(),
				f4: Math.random() * m.f4,
				i4: Math.round(Math.random() * m.i4),
				s4: new Number((Math.random() * m.s4)).toString(),
			})
		}
		dcache[key] = data;
		if (verbose) { console.log('data length =	', data.length, 'generated in', hrtime2ms(process.hrtime(tm_fs)), 'ms'); }
	}
	data = dcache[key];

	if (!stpfn) {
		srtr = sortjs.getObjectSorter(fieldList);
	}


	if (verbose) { console.log('sorting by', fieldList, times, 'times'); }
	for (i = 0; i < times; i++) {
		tm_bs = process.hrtime();
		stpfn ? data.sort(fieldList) : data.sort(srtr); // sortjs.sort(data, fieldList);
		// sortjs.sort(data, fieldList);
		tm_b = process.hrtime(tm_bs);
		len.push(hrtime2ms(tm_b));
		process.stdout.write(printf('%13s: %5d/%d | %10.5f\r', label, i, times, hrtime2ms(tm_b)));
		// process.stdout.write(label + ': ' + i + '/' + times + ' | ' + hrtime2ms(tm_b) + " ms\r");
		// if (i % 1 === 0) {
		// 	process.stdout.write('.');
		// }
	}
	// process.stdout.write("\n");
	s = array_stats(len);
	if (!stpfn) {
		s.sorter = srtr.type;
	} else {
		s.sorter = '<fn:' + (stpfn.name || '_') + '>';
	}
	s.data_gen = hrtime2ms(process.hrtime(tm_fs));
	s.N = N;
	s.times = times;
	s.label = label;
	s.compareTo = compareTo;
	return s;
}

function print_stats(st) {
	// console.log(st.label, ' (N =', st.N, ', times =', st.times, ')', st.avg.toFixed(5), '+/-', st.d.toFixed(5), 'ms, min', st.min.toFixed(5), ', max', st.max.toFixed(5));//, '| data_gen', st.data_gen.toFixed(5));
	if (typeof st === "string") {
		console.log(st);
		for (var i = 0; i < st.length; i++) {
			process.stdout.write('-');
		}
		process.stdout.write('\n');
	} else {
		if (st.compareTo) {
			var cmp = get_stats_by_label(st.compareTo);
			// console.log(printf('%13s | %8.5f +/- %7.5f ms | min %8.5f | max %10.5f | rel(%8s) %8.5f', st.label, st.avg, st.d, st.min, st.max, st.compareTo, st.avg/cmp.avg));
			console.log(printf('%13s | %8.5f +/- %7.5f ms | sorter %s | rel(%8s) %8.5f', st.label, st.avg, st.d, st.sorter, st.compareTo, st.avg/cmp.avg));
		} else {
			console.log(printf('%13s | %8.5f +/- %7.5f ms | sorter %s', st.label, st.avg, st.d, st.sorter, st.compareTo));
			// console.log(printf('%13s | %8.5f +/- %7.5f ms | min %8.5f | max %10.5f', st.label, st.avg, st.d, st.min, st.max));
		}
	}
}

function get_stats_by_label(label) {
	for (var i = 0; i < st.length; i++) {
		if (st[i].label === label) 
			return st[i];
	}
	console.error("Couldn't find stat with label", label);
	return { avg: -1 }; // to not break the other output, negative values mean error
}

function array_stats(a) {
	var avg = 0, min = Number.MAX_VALUE, max = Number.MIN_VALUE, d = 0;
	for (var i = 0; i < a.length; i++) {
		avg += a[i];
		if (min > a[i]) { min = a[i]; }
		if (max < a[i]) { max = a[i]; }
	}
	avg /= a.length;
	for (var i = 0; i < a.length; i++) {
		d += Math.pow(a[i] - avg, 2);
	}
	d /= a.length;
	return {
		avg: avg,
		d: Math.sqrt(d),
		min: min,
		max: max
	}
}

function clone(opt) {
	var o = [];
	for (var i in data) {
		o[i] = data[i];
	}
	return o;
}


function hrtime2ms(tm) {
	return tm[0] * 1000 + tm[1] / 1000000; // first arg is in seconds, second in nanoseconds, return is in milliseconds
}