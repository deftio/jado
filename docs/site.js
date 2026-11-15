/* jado parking page. Layout, type, table, and markup all come from bitwrench. */
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
		".jado-bar .jado-wrap{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding-top:.85rem;padding-bottom:.85rem;}",
		"main.jado-wrap{padding-top:.35rem;}",
		".jado-mark{height:4.6rem;width:auto;display:block;margin:.3rem 0 .15rem;}",
		".jado-kicker{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin:0;}",
		"h1{font-weight:600;margin:.1rem 0 .4rem;color:" + navy + ";}",
		"h2{font-weight:600;margin:1.8rem 0 .4rem;}",
		"p{margin:.55rem 0 .8rem;}",
		".jado-code{background:" + card + ";border:1px solid " + line + ";border-radius:8px;padding:.85rem 1rem;overflow:auto;line-height:1.45;}",
		".jado-card{background:" + card + ";border:1px solid " + line + ";border-radius:8px;padding:.15rem .8rem .4rem;}",
		".bw-table{background:" + card + ";width:100%;border-color:" + line + ";}",
		".bw-table th{background:#ebe6dc;border-color:" + line + ";font-weight:600;}",
		".bw-table td{border-color:" + line + ";vertical-align:top;}",
		".jado-live td:first-child{font-weight:400;}",
		".jado-live td{font-size:.92rem;}",
		".jado-links a{margin-right:1rem;}",
		"footer{margin-top:2.2rem;font-size:.9rem;}"
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

	var examples = [
		["jado.map(23, x => x + 1)", function () { return jado.map(23, function (x) { return x + 1; }); }],
		["jado.map([23, 25], x => x + 1)", function () { return jado.map([23, 25], function (x) { return x + 1; }); }],
		["jado.map({a:1, b:2}, x => x * 2)", function () { return jado.map({a: 1, b: 2}, function (x) { return x * 2; }); }],
		["jado.map('hi', x => x.toUpperCase())", function () { return jado.map("hi", function (x) { return x.toUpperCase(); }); }],
		["jado.map(null, x => x + 1)", function () { return jado.map(null, function (x) { return x + 1; }); }],
		["jado.filter(5, x => x > 0)", function () { return jado.filter(5, function (x) { return x > 0; }); }],
		["jado.filter(5, x => x > 9)", function () { return jado.filter(5, function (x) { return x > 9; }); }],
		["jado.reduce([1,2,3], (acc, v) => acc - v, 10)", function () { return jado.reduce([1, 2, 3], function (a, v) { return a - v; }, 10); }]
	];

	var liveRows = [["Call", "Result"]].concat(examples.map(function (row) {
		return [row[0], run(row[1])];
	}));

	var behavior = [
		["Input", "map", "filter", "reduce with a seed"],
		["null", "null", "null", "the seed"],
		["undefined", "undefined", "undefined", "the seed"],
		["{}", "{}", "{}", "the seed"],
		["[]", "[]", "[]", "the seed"],
		["5, kept", "fn(5)", "5", "fn(seed, 5)"],
		["5, dropped", "", "undefined", ""]
	];

	var version = (typeof jado !== "undefined" && jado.version) ? jado.version().version : "";

	var page = bw.htmla([
		["style", {}, css],
		["header", {"class": "jado-bar"}, [
			["div", {"class": "jado-wrap"}, [
				["p", {"class": "jado-kicker"}, "deftio"],
				["p", {"class": "jado-links"}, [
					["a", {"href": "https://github.com/deftio/jado"}, "Source"],
					["a", {"href": "https://www.npmjs.com/package/jado"}, "npm"],
					["a", {"href": "https://github.com/deftio/jado/blob/master/dev/article-draft.md"}, "Note"]
				]]
			]]
		]],
		["main", {"class": "jado-wrap"}, [
			["img", {"class": "jado-mark", "src": "jado-icon.svg", "alt": "jado"}, ""],
			["h1", {"class": "bw-h1"}, "jado"],
			["p", {}, "A small JavaScript library for map, filter, and reduce. A single value stays a single value."],
			["h2", {"class": "bw-h2"}, "Shape"],
			["p", {}, "An array is walked by index. A plain object is walked by name, and the names stay. A number, string, boolean, or date is one value. A plain object is a collection of fields, not one record."],
			["div", {"class": "jado-card bw-code"},
				"jado.map(23, x => x + 1)        // 24\n" +
				"jado.map([23, 25], x => x + 1)  // [24, 26]\n" +
				"jado.map({a: 1}, x => x * 2)    // {a: 2}\n" +
				"jado.map('hi', x => x.toUpperCase())  // 'HI'\n" +
				"jado.map(null, x => x + 1)      // null"
			],
			["h2", {"class": "bw-h2"}, "What comes back"],
			["p", {}, "null stays null, and undefined stays undefined. A filter that rejects a single value returns undefined. reduce needs a seed on an empty or nullish input, and then it returns that seed."],
			bw.htmlTable(behavior, {useFirstRowAsHeaders: true, sortable: false}),
			["h2", {"class": "bw-h2"}, "From this copy"],
			["p", {}, version ? ("These rows are evaluated in the page with jado " + version + ".") : "The library did not load, so this table is empty."],
			bw.htmlTable(liveRows, {useFirstRowAsHeaders: true, sortable: false, useDefaultStyle: false, atr: {"class": "bw-table bw-table-stripe jado-live"}}),
			["h2", {"class": "bw-h2"}, "Reduce"],
			["p", {}, "The callback is (accumulator, value), the same order as Array.prototype.reduce. That changed in 1.1.0. reducex is (accumulator, value, key)."],
			["h2", {"class": "bw-h2"}, "Where it sits"],
			["p", {}, "jado was written between 2011 and 2018. Older copies turned null into an empty object so the next walk would not throw. That threw away the difference between a missing value and an empty collection. This copy keeps the difference. The library is parked here. It is not a project looking for users."],
			["footer", {}, "BSD 2-clause. M. A. Chatterjee, deftio."]
		]]
	]);

	bw.DOM("#page", page);
}());
