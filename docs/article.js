/* History page for jado. Layout, type, tables, and markup come from bitwrench.
   The story is the old one. The calls are jado 1.1.0. */
(function () {
	var navy = "#2e2d66";
	var paper = "#f4f1ea";
	var ink = "#1c1b22";
	var line = "#ddd6c8";
	var card = "#fffdf8";

	var css = [
		"html,body{background:" + paper + ";color:" + ink + ";margin:0;}",
		"body{line-height:1.55;font-size:17px;}",
		"a{color:" + navy + ";}",
		".jado-bar{background:" + navy + ";color:" + paper + ";}",
		".jado-bar a{color:" + paper + ";}",
		".jado-wrap{max-width:44rem;margin:0 auto;padding:1.4rem 1.25rem 3rem;}",
		".jado-bar p{margin:0;}",
		".jado-bar .jado-wrap{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap;padding-top:.85rem;padding-bottom:.85rem;}",
		"main.jado-wrap{padding-top:.35rem;}",
		".jado-mark{height:4.6rem;width:auto;display:block;margin:.3rem 0 .15rem;}",
		".jado-kicker{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin:0;}",
		"h1{font-weight:600;margin:.1rem 0 .4rem;color:" + navy + ";}",
		"h2{font-weight:600;margin:2.1rem 0 .35rem;color:" + navy + ";font-size:1.28rem;}",
		"p{margin:.55rem 0 .8rem;}",
		".jado-code{background:" + card + ";border:1px solid " + line + ";border-radius:8px;padding:.9rem 1rem;overflow:auto;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.84rem;white-space:pre;margin:.2rem 0 1rem;}",
		".jado-scroll{overflow-x:auto;margin:0 0 1rem;}",
		".bw-table{background:" + card + ";width:100%;border-color:" + line + ";margin:0;}",
		".bw-table th{background:#ebe6dc;border-color:" + line + ";font-weight:600;}",
		".bw-table td{border-color:" + line + ";vertical-align:top;}",
		".jado-live td:first-child{font-weight:400;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.8rem;}",
		".jado-live td{font-size:.92rem;}",
		".jado-links a, .jado-links span{margin-right:1rem;}",
		".jado-here{opacity:.72;}",
		"footer{margin-top:2.2rem;font-size:.9rem;}",
		"footer p{margin:.2rem 0;}"
	].join("");

	function show(v) {
		if (typeof v === "undefined") return "undefined";
		if (v === null) return "null";
		if (typeof v === "string") return JSON.stringify(v);
		try { return JSON.stringify(v); }
		catch (e) { return String(v); }
	}

	function run(fn) {
		try { return show(fn()); }
		catch (e) { return e.name || "Error"; }
	}

	function table(rows) {
		return ["div", {"class": "jado-scroll"}, [bw.htmlTable(rows, {
			useFirstRowAsHeaders: true,
			sortable: false,
			useDefaultStyle: false,
			atr: {"class": "bw-table bw-table-stripe jado-live"}
		})]];
	}

	function live(pairs) {
		return table([["Call", "Result"]].concat(pairs.map(function (row) {
			return [row[0], run(row[1])];
		})));
	}

	function pre(text) {
		return ["pre", {"class": "jado-code"}, text];
	}

	function walked(input) {
		var out = [];
		var called = false;
		jado.forEach(input, function (a, b) {
			called = true;
			if (arguments.length === 1) out.push(String(a));
			else out.push(String(a) + ":" + String(b));
		});
		return called ? out : "(not called)";
	}

	function sampleBox() {
		var box = document.createElement("div");
		box.innerHTML = "<button id='save'>save</button><p class='item'>ax</p><p class='item'>b</p>";
		return box;
	}

	var version = (typeof jado !== "undefined" && jado.version) ? jado.version().version : "";

	var page = bw.htmla([
		["style", {}, css],
		["header", {"class": "jado-bar"}, [
			["div", {"class": "jado-wrap"}, [
				["p", {"class": "jado-kicker"}, "deftio"],
				["p", {"class": "jado-links"}, [
					["a", {"href": "index.html"}, "jado"],
					["a", {"href": "https://github.com/deftio/jado"}, "Source"],
					["a", {"href": "https://www.npmjs.com/package/jado"}, "npm"],
					["a", {"href": "https://javascript.plainenglish.io/what-if-everything-in-javascript-were-iterable-8ad0ed813deb"}, "Medium"]
				]]
			]]
		]],
		["main", {"class": "jado-wrap"}, [
			["img", {"class": "jado-mark", "src": "jado-icon.svg", "alt": "jado"}, ""],
			["h1", {"class": "bw-h1"}, "jado"],
			["p", {}, "A small JavaScript library for map, filter, and reduce. A single value stays a single value."],
			["p", {}, "I wrote it while building a front end for a large scraper. Data arrived as an array, a plain object, one value, or null, and each shape wanted a slightly different loop for the same idea. This was around 2015. Arrays had map. Objects did not. A single value was usually wrapped in an array and then unwrapped. jQuery still covered most of the front end, and the later array methods on objects were not there yet."],
			["p", {}, "What I wanted was to call map, filter, reduce, or forEach on whatever landed, and get the same shape back. The name is jado. The longer published piece is the look back. This page is that story, and the rows run on the maintenance copy."],
			["p", {}, version
				? ("These calls are jado " + version + ". Two conventions were aligned with the language in that pass. null stays null, and reduce is (accumulator, value).")
				: "The library did not load, so the result columns are empty."],

			["h2", {"class": "bw-h2"}, "Arrays"],
			["p", {}, "Arrays were already in good shape. The language had the methods, and jado follows them. The useful part was that the same call would still make sense when the value was not an array."],
			["p", {}, "filter keeps a member when the predicate is == true. true and 1 pass. A string such as \"yes\" does not, even though it is truthy. reduce is (accumulator, value), the same order as Array.prototype.reduce. Addition hides the order, so the subtraction row is the one that shows it. forEach on an array is (index, value)."],
			pre(
				"[1, 2, 3].map(x => x * 2);          // [2, 4, 6]\n" +
				"[1, 2, 3].filter(x => x % 2 === 1); // [1, 3]\n" +
				"[1, 2, 3].reduce((acc, v) => acc - v, 10); // 4"
			),
			live([
				["jado.map([1, 2, 3], x => x * 2)", function () { return jado.map([1, 2, 3], function (x) { return x * 2; }); }],
				["jado.filter([1, 2, 3], x => x % 2 === 1)", function () { return jado.filter([1, 2, 3], function (x) { return x % 2 === 1; }); }],
				["jado.filter([0, 1, 2, 'yes'], x => x)", function () { return jado.filter([0, 1, 2, "yes"], function (x) { return x; }); }],
				["jado.reduce([1, 2, 3], (acc, v) => acc - v, 10)", function () { return jado.reduce([1, 2, 3], function (acc, v) { return acc - v; }, 10); }],
				["jado.forEach([1, 2, 3], (i, v) => …)", function () { return walked([1, 2, 3]); }]
			]),

			["h2", {"class": "bw-h2"}, "Objects"],
			["p", {}, "Plain objects never got those methods, so the usual path is to go out through entries and come back with fromEntries. The names are easy to drop on the way. jado walks the object by name and keeps the names."],
			["p", {}, "A plain object is a collection of fields. One user object and an array of users are different cases. map on one user walks the fields. forEach is (key, value). reduce is (accumulator, value), with no index. reducex is (accumulator, value, key), when the name matters. Key order is not part of the contract."],
			pre(
				"const obj = { a: 1, b: 2 };\n" +
				"Object.fromEntries(\n" +
				"  Object.entries(obj).map(([k, v]) => [k, v * 2])\n" +
				"); // { a: 2, b: 4 }"
			),
			live([
				["jado.map({a:1, b:2}, v => v * 2)", function () { return jado.map({a: 1, b: 2}, function (v) { return v * 2; }); }],
				["jado.filter({a:1, b:2}, v => v > 1)", function () { return jado.filter({a: 1, b: 2}, function (v) { return v > 1; }); }],
				["jado.reduce({a:1, b:2}, (acc, v) => acc + v, 0)", function () { return jado.reduce({a: 1, b: 2}, function (acc, v) { return acc + v; }, 0); }],
				["jado.reducex({a:1, b:2}, (acc, v, k) => acc + k + v, '')", function () {
					return jado.reducex({a: 1, b: 2}, function (acc, v, k) { return acc + k + v; }, "");
				}],
				["jado.forEach({a:1, b:2}, (k, v) => …)", function () { return walked({a: 1, b: 2}); }]
			]),

			["h2", {"class": "bw-h2"}, "The DOM"],
			["p", {}, "The browser was the other place the split showed up. getElementById is one element or null. querySelectorAll is a collection. You either write two paths, or you coerce the collection into an array before map and filter will run."],
			pre(
				"const items = document.querySelectorAll('.item');\n" +
				"Array.from(items).filter(el => el.textContent.includes('x'));\n" +
				"\n" +
				"const save = document.querySelector('#save'); // one element, or null"
			),
			["p", {}, "I wanted one call for both. jado does not walk a NodeList or an HTMLCollection. Both are one value, so the function runs once and receives the collection. A single element is also one value, so forEach runs once with that element. null from a missing element stays null, and the function is not called."],
			["p", {}, "The further wish was a lazy sequence with the same four methods, so a query could yield one element or many and the call would not change. That stayed a sketch."],
			pre(
				"document.query('.item')\n" +
				"  .filter(el => el.textContent.includes('x'))\n" +
				"  .forEach((el, i) => { el.dataset.idx = i; });\n" +
				"\n" +
				"document.query('#save').map(el => el.classList.add('hot'));"
			),
			live([
				["jado.forEach(querySelectorAll('.item'), el => toString(el))", function () {
					var got = "(not called)";
					jado.forEach(sampleBox().querySelectorAll(".item"), function (el) {
						got = Object.prototype.toString.call(el);
					});
					return got;
				}],
				["jado.forEach(querySelector('#save'), el => el.id)", function () {
					var id = "(not called)";
					jado.forEach(sampleBox().querySelector("#save"), function (el) { id = el.id; });
					return id;
				}],
				["jado.map(querySelector('#missing'), fn)", function () {
					return jado.map(sampleBox().querySelector("#missing"), function () { return "called"; });
				}]
			]),

			["h2", {"class": "bw-h2"}, "One value"],
			["p", {}, "When an API hands you one thing, the usual move is to wrap it, use the array method, and unwrap. That ceremony is what you pay when you do not yet know whether the next call will return one value or many."],
			pre(
				"([5].map(n => n + 1))[0];          // 6\n" +
				"([5].filter(n => n > 0))[0];       // 5\n" +
				"[5].reduce((acc, v) => acc + v, 0); // 5"
			),
			["p", {}, "jado leaves the value as one value. An accepted filter returns that value. A rejected one returns undefined. reduce with a seed calls the function once, as (accumulator, value). With no seed, the value comes back and the function is not called. forEach is called with the value only. There is no index of 0. A string is one value too, so the characters are not visited, and s2a('ab') is ['ab']."],
			live([
				["jado.map(5, n => n + 1)", function () { return jado.map(5, function (n) { return n + 1; }); }],
				["jado.filter(5, n => n > 0)", function () { return jado.filter(5, function (n) { return n > 0; }); }],
				["jado.filter(5, n => n > 9)", function () { return jado.filter(5, function (n) { return n > 9; }); }],
				["jado.reduce(5, (acc, v) => acc + v, 0)", function () { return jado.reduce(5, function (acc, v) { return acc + v; }, 0); }],
				["jado.reduce(5, fn) with no seed", function () { return jado.reduce(5, function () { throw new Error("called"); }); }],
				["jado.forEach(5, v => …)", function () { return walked(5); }],
				["jado.map('hi', s => s.toUpperCase())", function () { return jado.map("hi", function (s) { return s.toUpperCase(); }); }],
				["jado.s2a('ab')", function () { return jado.s2a("ab"); }]
			]),

			["h2", {"class": "bw-h2"}, "Null"],
			["p", {}, "This is where the crashes lived. Calling map on null throws. The usual guard is to coalesce to an array first. Lodash, as I remember it, coerced null to an empty array and returned []."],
			["p", {}, "Older notes said jado turned null into {}, so the next walk would not throw. I don't have a firm account of why. Walking a nullish value in that era threw, and {} was a short way to keep going. It is also possible I was treating a missing piece of a graph as no results. Looking back, I would leave null as null. A missing value and an empty object are different. This copy does that. The function is not called. reduce on null, undefined, [], or {} returns the seed. With no seed, those cases throw TypeError, the same way an empty array does in the language."],
			["p", {}, "A null inside an array or an object is still passed to the function. The guard is only for the value you handed in."],
			live([
				["jado.map(null, x => x + 1)", function () { return jado.map(null, function (x) { return x + 1; }); }],
				["jado.map(undefined, x => x + 1)", function () { return jado.map(undefined, function (x) { return x + 1; }); }],
				["jado.forEach(null, fn)", function () { return walked(null); }],
				["jado.reduce(null, (acc, v) => acc + v, 0)", function () {
					var called = false;
					var r = jado.reduce(null, function (acc, v) { called = true; return acc + v; }, 0);
					return called ? "called" : r;
				}],
				["jado.reduce(null, fn) with no seed", function () { return jado.reduce(null, function (acc, v) { return acc + v; }); }],
				["jado.map({a: null}, v => v === null)", function () { return jado.map({a: null}, function (v) { return v === null; }); }]
			]),

			["h2", {"class": "bw-h2"}, "On the prototypes"],
			["p", {}, "One other road was to put the methods on the built-ins, so a number could be mapped without a wrapper. Objects would have kept their names. The DOM might have offered the same four methods without a branch. Extending prototypes collides with other code, so this stayed a sketch. It is not in the library."],
			pre(
				"Number.prototype.map = function (fn) {\n" +
				"  return fn(this.valueOf());\n" +
				"};\n" +
				"(5).map(n => n + 1); // 6"
			),

			["h2", {"class": "bw-h2"}, "Why one call"],
			["p", {}, "The reason to care about a single value is that you often do not know whether the next function will return one or many. A helper can say the intent once."],
			["p", {}, "That holds when the one-or-many choice is a number, a string, or an array. A plain object is still a set of fields, so one record and a list of records remain different cases. An element and a NodeList remain different cases too. The library walks arrays and plain objects. Everything else is one value."],
			pre(
				"function normalizeTags(tags) {\n" +
				"  return jado.map(tags, s => s.trim().toLowerCase());\n" +
				"}\n" +
				"\n" +
				"function total(input) {\n" +
				"  return jado.reduce(input, (sum, n) => sum + n, 0);\n" +
				"}"
			),
			live([
				["jado.map('  Ab ', s => s.trim().toLowerCase())", function () {
					return jado.map("  Ab ", function (s) { return s.trim().toLowerCase(); });
				}],
				["jado.map(['  Ab ', 'C'], s => s.trim().toLowerCase())", function () {
					return jado.map(["  Ab ", "C"], function (s) { return s.trim().toLowerCase(); });
				}],
				["jado.reduce(12, (sum, n) => sum + n, 0)", function () { return jado.reduce(12, function (sum, n) { return sum + n; }, 0); }],
				["jado.reduce([12, 4], (sum, n) => sum + n, 0)", function () { return jado.reduce([12, 4], function (sum, n) { return sum + n; }, 0); }]
			]),

			["h2", {"class": "bw-h2"}, "How the cases line up"],
			["p", {}, "The language kept the methods on arrays. jado keeps the shape you passed in, for an array, a plain object, or one value. null stays null."],
			table([
				["You pass", "map", "filter", "reduce with a seed"],
				["array", "array", "the members that pass", "(accumulator, value)"],
				["plain object", "same names", "same names, kept fields", "(accumulator, value)"],
				["one value, kept", "one value", "the value", "(accumulator, value) once"],
				["one value, dropped", "", "undefined", ""],
				["null", "null, function not called", "null", "the seed"],
				["NodeList", "the function sees the list", "the function sees the list", "the function sees the list"]
			]),

			["h2", {"class": "bw-h2"}, "Where it sits"],
			["p", {}, "JavaScript drew the line at arrays. TypeScript drew it again, with a type for each container. jado was a try at one call for the shapes a scraper actually returned. The library is parked. It is not a case for changing the language."],
			["p", {}, [
				["a", {"href": "https://javascript.plainenglish.io/what-if-everything-in-javascript-were-iterable-8ad0ed813deb"}, "What if Everything in JavaScript Were Iterable?"],
				" is the published article. The rows on this page are the same story, on jado " + (version || "1.1.0") + "."
			]],
			["footer", {}, "BSD 2-clause. M. A. Chatterjee, deftio."]
		]]
	]);

	bw.DOM("#page", page);
}());
