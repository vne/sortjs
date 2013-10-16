var sortjs = require('./sort'),
	tm_ps,
	st = [],
	verbose = false;

tm_ps = process.hrtime();

st.push(measure("sortjs:f", "f:]f", 1000, 100));
st.push(measure("sortjs:f", "f:f", 1000, 500));
st.push(measure("sortjs:f", "f:f", 1000, 1000));
st.push(measure("sortByF ", sortByF, 1000, 100));
st.push(measure("sortByF ", sortByF, 1000, 500));
st.push(measure("sortByF ", sortByF, 1000, 1000));
// st.push(measure("f:f", 10000, 100));
// st.push(measure("f:f", 10000, 500));
// st.push(measure("f:f", 10000, 1000));

for (var i in st) {
	print_stats(st[i]);
}

function sortByF(a, b) {
	if (a.f > b.f) { return -1; }
	else if (a.f < b.f) { return 1; }
}


function print_stats(st) {
	console.log('timings for', st.label, ' (N =', st.N, ', times =', st.times, ')', st.avg.toFixed(5), '+/-', st.d.toFixed(5), 'ms, min', st.min.toFixed(5), ', max', st.max.toFixed(5), '| data_gen', st.data_gen.toFixed(5));
}
function measure(label, fieldList, N, times) {
	var i, set, data = [],
	tm_fs, tm_bs, tm_b,
	len = [], s, cltm = [],
	stpfn = typeof fieldList === "function";

	if (verbose) { console.log('measuring', label); }
	tm_fs = process.hrtime();
	for (i = 0; i < N; i++) {
		data.push({
			f: Math.random() * 999999999999,
			i: Math.round(Math.random() * 9999999999999),
			s: new Number((Math.random() * 99999999999999)).toString()
		})
	}
	if (verbose) { console.log('data length =	', data.length, 'generated in', hrtime2ms(process.hrtime(tm_fs)), 'ms'); }

	if (verbose) { console.log('sorting by', fieldList, times, 'times'); }
	for (i = 0; i < times; i++) {
		tm_bs = process.hrtime();
		stpfn ? data.sort(fieldList) : sortjs.sort(data, fieldList);
		// sortjs.sort(data, fieldList);
		tm_b = process.hrtime(tm_bs);
		len.push(hrtime2ms(tm_b));
		if (i % 1 === 0) {
			process.stdout.write('.');
		}
	}
	process.stdout.write("\n");
	s = array_stats(len);
	s.data_gen = hrtime2ms(process.hrtime(tm_fs));
	s.N = N;
	s.times = times;
	s.label = label;
	return s;
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