/* The front page. Current jado. Layout comes from bitwrench. */
(function () {
	var navy = "#2e2d66";
	var paper = "#f4f1ea";
	var ink = "#1c1b22";
	var line = "#ddd6c8";
	var card = "#fffdf8";
	var muted = "#5c5648";

	var css = [
		"html,body{background:" + paper + ";color:" + ink + ";margin:0;}",
		"body{line-height:1.55;font-size:17px;}",
		"a{color:" + navy + ";}",
		".jado-bar{background:" + navy + ";color:" + paper + ";}",
		".jado-bar a{color:" + paper + ";}",
		".jado-wrap{max-width:44rem;margin:0 auto;padding:1.4rem 1.25rem 3rem;}",
		".jado-bar p{margin:0;}",
		".jado-bar .jado-wrap{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap;padding-top:.85rem;padding-bottom:.85rem;}",
		"main.jado-wrap{padding-top:.2rem;}",
		".jado-mark{height:4.6rem;width:auto;display:block;margin:.15rem 0 .1rem;}",
		".jado-kicker{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin:0;}",
		"h1{font-weight:600;margin:.05rem 0 .35rem;color:" + navy + ";font-size:2.4rem;letter-spacing:-.02em;}",
		"h2{font-weight:600;margin:2.15rem 0 .35rem;color:" + navy + ";font-size:1.28rem;}",
		"p{margin:.5rem 0 .75rem;}",
		".jado-lede{font-size:1.12rem;}",
		".jado-results{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin:.3rem 0 1.1rem;}",
		".jado-result{background:" + card + ";border:1px solid " + line + ";border-radius:10px;padding:.75rem .9rem .7rem;}",
		".jado-result p{margin:0;}",
		".jado-result-k{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.74rem;line-height:1.35;color:" + muted + ";}",
		".jado-result-v{margin-top:.4rem;color:" + navy + ";font-size:1.2rem;font-weight:600;}",
		".jado-code{background:" + card + ";border:1px solid " + line + ";border-radius:10px;padding:.9rem 1rem;overflow:auto;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.84rem;white-space:pre;margin:.2rem 0 1rem;}",
		".jado-scroll{overflow-x:auto;margin:0 0 1rem;}",
		".bw-table{background:" + card + ";width:100%;border-color:" + line + ";margin:0;}",
		".bw-table th{background:#ebe6dc;border-color:" + line + ";font-weight:600;}",
		".bw-table td{border-color:" + line + ";vertical-align:top;}",
		".jado-live td:first-child{font-weight:400;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.8rem;}",
		".jado-live td{font-size:.92rem;}",
		".jado-links a{margin-right:1rem;}",
		"footer{margin-top:2.4rem;font-size:.9rem;color:" + muted + ";}",
		"footer p{margin:.2rem 0;}",
		"footer a{color:" + navy + ";}",
		"@media (max-width:640px){.jado-results{grid-template-columns:1fr;}h1{font-size:2.1rem;}}"
	].join("");

	function show(v) {
		if (typeof v === "undefined") return "undefined";
		if (v === null) return "null";
		if (typeof v === "string") return JSON.stringify(v);
		if (Array.isArray(v)) return "[" + v.map(show).join(", ") + "]";
		if (Object.prototype.toString.call(v) === "[object Object]") {
			var parts = [];
			for (var k in v) {
				if (Object.prototype.hasOwnProperty.call(v, k)) parts.push(k + ": " + show(v[k]));
			}
			return "{" + parts.join(", ") + "}";
		}
		try { return JSON.stringify(v); }
		catch (e) { return String(v); }
	}

	function run(fn) {
		try { return show(fn()); }
		catch (e) { return e.name || "Error"; }
	}

	function tile(label, fn) {
		return ["div", {"class": "jado-result"}, [
			["p", {"class": "jado-result-k"}, label],
			["p", {"class": "jado-result-v"}, run(fn)]
		]];
	}

	function table(rows) {
		return ["div", {"class": "jado-scroll"}, [bw.htmlTable(rows, {
			useFirstRowAsHeaders: true,
			sortable: false,
			useDefaultStyle: false,
			atr: {"class": "bw-table bw-table-stripe jado-live"}
		})]];
	}

	var version = (typeof jado !== "undefined" && jado.version) ? jado.version().version : "";

	var page = bw.htmla([
		["style", {}, css],
		["header", {"class": "jado-bar"}, [
			["div", {"class": "jado-wrap"}, [
				["p", {"class": "jado-kicker"}, "deftio"],
				["p", {"class": "jado-links"}, [
					["a", {"href": "https://github.com/deftio/jado"}, "Source"],
					["a", {"href": "https://www.npmjs.com/package/jado"}, "npm"],
					["a", {"href": "article.html"}, "Note"]
				]]
			]]
		]],
		["main", {"class": "jado-wrap"}, [
			["img", {"class": "jado-mark", "src": "jado-icon.svg", "alt": "jado"}, ""],
			["h1", {"class": "bw-h1"}, "jado"],
			["p", {"class": "jado-lede"}, "A small JavaScript library for map, filter, and reduce. A single value stays a single value."],
			["p", {}, version
				? ("This is jado " + version + ". null stays null, and reduce is (accumulator, value), the same order as Array.prototype.reduce.")
				: "The library did not load, so the figures below are empty."],

			["h2", {"class": "bw-h2"}, "The same call"],
			["p", {}, "An array is walked by index. A plain object is walked by name, and the names stay. A number, a string, or anything else is one value, and the result stays one value. A plain object is a collection of fields, not one record."],
			["div", {"class": "jado-results"}, [
				tile("jado.map(23, x => x + 1)", function () { return jado.map(23, function (x) { return x + 1; }); }),
				tile("jado.map([23, 25], x => x + 1)", function () { return jado.map([23, 25], function (x) { return x + 1; }); }),
				tile("jado.map({a:1, b:2}, x => x * 2)", function () { return jado.map({a: 1, b: 2}, function (x) { return x * 2; }); }),
				tile("jado.map('hi', s => s.toUpperCase())", function () { return jado.map("hi", function (s) { return s.toUpperCase(); }); }),
				tile("jado.map(null, x => x + 1)", function () { return jado.map(null, function (x) { return x + 1; }); }),
				tile("jado.reduce([1, 2, 3], (acc, v) => acc - v, 10)", function () {
					return jado.reduce([1, 2, 3], function (acc, v) { return acc - v; }, 10);
				})
			]],

			["h2", {"class": "bw-h2"}, "What comes back"],
			["p", {}, "filter on one value returns that value when the predicate passes, and undefined when it does not. A member of a list is kept only when the predicate is == true, so true and 1 pass. reduce on null, undefined, an empty array, or an empty object returns the seed and does not call the function. With no seed, those cases throw TypeError. A null stored inside an object is still passed in."],
			table([
				["You pass", "map", "filter", "reduce with a seed"],
				["null", "null", "null", "the seed"],
				["undefined", "undefined", "undefined", "the seed"],
				["{}", "{}", "{}", "the seed"],
				["[]", "[]", "[]", "the seed"],
				["5, kept", "fn(5)", "5", "fn(seed, 5)"],
				["5, dropped", "", "undefined", ""]
			]),
			table([
				["Call", "Result"],
				["jado.filter(5, n => n > 0)", run(function () { return jado.filter(5, function (n) { return n > 0; }); })],
				["jado.filter(5, n => n > 9)", run(function () { return jado.filter(5, function (n) { return n > 9; }); })],
				["jado.filter([0, 1, 2, 'yes'], x => x)", run(function () { return jado.filter([0, 1, 2, "yes"], function (x) { return x; }); })],
				["jado.reduce(null, (acc, v) => acc + v, 0)", run(function () {
					var called = false;
					var r = jado.reduce(null, function () { called = true; return 1; }, 0);
					return called ? "called" : r;
				})],
				["jado.map({a: null}, v => v === null)", run(function () { return jado.map({a: null}, function (v) { return v === null; }); })]
			]),

			["h2", {"class": "bw-h2"}, "Install"],
			["p", {}, "There are no runtime dependencies. The built files are dist/jado.umd.js and dist/jado.esm.js."],
			["pre", {"class": "jado-code"}, "npm install jado"],
			["pre", {"class": "jado-code"}, "var jado = require(\"jado\");"],

			["h2", {"class": "bw-h2"}, "The note"],
			["p", {}, [
				"jado came out of a scraper front end, around 2015, where the same value might arrive as one item or many. ",
				["a", {"href": "article.html"}, "The note"],
				" is that story, with these calls. The library is parked."
			]],
			["footer", {}, "BSD 2-clause. M. A. Chatterjee, deftio."]
		]]
	]);

	bw.DOM("#page", page);
}());
