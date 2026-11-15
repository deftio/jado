/**
 * The rest of the public surface: counting set, paths, clone, log, and print.
 * npm test is the local suite. There is no CI job.
 */

var assert = require("assert");
var jado = require("../src/jado.js");

describe("small helpers", function () {
	it("reports list, length, and choice", function () {
		assert.strictEqual(jado.isList([]), true);
		assert.strictEqual(jado.isList({}), true);
		assert.strictEqual(jado.isList("ab"), false);
		assert.strictEqual(jado.isList(1), false);
		assert.strictEqual(jado.len("ab"), 1);
		assert.strictEqual(jado.len([1, 2]), 2);
		assert.strictEqual(jado.len({a: 1, b: 2}), 2);
		assert.strictEqual(jado.choice("a", {a: 1}, 0), 1);
		assert.strictEqual(jado.choice("missing", {a: 1}, 0), 0);
		assert.strictEqual(jado.choice(0, [9], 7), 9);
	});

	it("counts leaves, and can count the containers too", function () {
		assert.strictEqual(jado.lend({a: [1]}), 1);
		assert.strictEqual(jado.lend({a: [1]}, true), 3);
	});

	it("gets a value, including a function, and fills in undefined", function () {
		assert.strictEqual(jado.getValue(function () { return 4; }), 4);
		assert.strictEqual(jado.getValue(undefined, 8), 8);
		assert.strictEqual(jado.getValue(null, 8), null);
		assert.strictEqual(jado.setValue(undefined, 3), 3);
		assert.strictEqual(jado.setValue(3, 9), 3);
	});

	it("joins an array, and does not split a string into characters", function () {
		var calls = 0;
		var joined = jado.a2s([1, function () { calls += 1; return 2; }]);
		assert.strictEqual(joined, "12");
		assert.strictEqual(calls, 1);
		var raw = jado.a2s([1, function () { return 2; }], false);
		assert.ok(raw.indexOf("function") >= 0);
		assert.deepStrictEqual(jado.s2a("ab"), ["ab"]);
	});

	it("turns an object into pairs and leaves a single value as a pair with 0", function () {
		assert.deepStrictEqual(jado.o2a({a: 1}), [["a", 1]]);
		assert.deepStrictEqual(jado.o2a(5), [0, 5]);
	});

	it("names a custom object, and survives a constructor that throws", function () {
		function Box() {}
		assert.strictEqual(jado.typeOf(new Box()), "Box");
		assert.strictEqual(jado.typeOf(new Box(), true), "object");
		var bad = {};
		Object.defineProperty(bad, "constructor", {get: function () { throw new Error("no name"); }});
		assert.strictEqual(jado.typeOf(bad), "object");
	});

	it("makes empty values for the other core types", function () {
		assert.strictEqual(jado.cloneType(false), false);
		assert.strictEqual(jado.cloneType(function () {})(), undefined);
		assert.ok(jado.cloneType(/a/) instanceof RegExp);
		assert.strictEqual(jado.cloneType(new Float64Array([1])).length, 0);
		assert.strictEqual(jado.cloneType(new BigInt64Array([1n])).length, 0);
	});
});

describe("deepClone and applyd", function () {
	it("returns atomics and arrays as they are", function () {
		assert.strictEqual(jado.deepClone(null), null);
		assert.strictEqual(jado.deepClone(4), 4);
		var day = new Date();
		assert.strictEqual(jado.deepClone(day), day);
		var list = [1, {b: 2}];
		assert.strictEqual(jado.deepClone(list), list);
	});

	it("copies a plain object, and keeps keys the destination already has", function () {
		var src = {a: 1, b: {c: 2}};
		var copy = jado.deepClone(src);
		copy.b.c = 9;
		assert.strictEqual(src.b.c, 2);
		var dest = {a: 7};
		var merged = jado.deepClone(src, dest);
		assert.strictEqual(merged, dest);
		assert.strictEqual(merged.a, 7);
		assert.strictEqual(merged.b.c, 2);
	});

	it("does not pretend a numeric constructor is a class", function () {
		var odd = {};
		Object.defineProperty(odd, "constructor", {value: 0});
		assert.throws(function () { jado.deepClone(odd); });
	});

	it("rewrites nested leaves in place", function () {
		var data = {a: [1, {b: 2}], c: 3};
		jado.applyd(data, function (v) { return v + 1; });
		assert.deepStrictEqual(data, {a: [2, {b: 3}], c: 4});
		assert.strictEqual(jado.applyd(5, function (v) { return v + 1; }), 6);
	});
});

describe("forEach and the x forms on null", function () {
	it("visits list members and a single value, and skips null", function () {
		var seen = [];
		jado.forEach({a: 1, b: 2}, function (k, v) { seen.push(k + v); });
		jado.forEach(5, function (v) { seen.push(v); });
		jado.forEach(null, function () { seen.push("no"); });
		assert.deepStrictEqual(seen, ["a1", "b2", 5]);
	});

	it("returns null from the x functions without calling them", function () {
		var n = 0;
		var f = function () { n += 1; return true; };
		assert.strictEqual(jado.mapx(null, f), null);
		assert.strictEqual(jado.filterx(undefined, f), undefined);
		assert.strictEqual(jado.reducex(null, f, 1), 1);
		assert.throws(function () { jado.reducex(null, f); }, TypeError);
		assert.throws(function () { jado.reducex(undefined, f); }, TypeError);
		assert.throws(function () { jado.reducex([], f); }, TypeError);
		assert.strictEqual(jado.reducex([], f, 4), 4);
		assert.strictEqual(jado.reducex(5, function () { throw new Error("called"); }), 5);
		assert.strictEqual(n, 0);
	});

	it("filterx keeps array and object shape", function () {
		assert.deepStrictEqual(jado.filterx([1, 2, 3], function (k, v) { return v > 1; }), [2, 3]);
		assert.deepStrictEqual(jado.filterx({a: 1, b: 4}, function (k, v) { return k === "b"; }), {b: 4});
	});

	it("reduce without a seed uses the first value", function () {
		assert.strictEqual(jado.reduce([1, 2, 3], function (a, v) { return a - v; }), (1 - 2) - 3);
		assert.strictEqual(jado.reducex(["a", "b"], function (a, v) { return a + v; }), "ab");
	});
});

describe("counting set", function () {
	it("adds, decrements, deletes, and reads counts", function () {
		var c = jado.cset();
		assert.strictEqual(c.add("a"), 1);
		assert.strictEqual(c.add(["a", "b", "b"]), 4);
		assert.strictEqual(c.cnt("b"), 2);
		assert.strictEqual(c.cntk(), 2);
		assert.strictEqual(c.ttl(), 4);
		assert.deepStrictEqual(c.keys().sort(), ["a", "b"]);
		assert.deepStrictEqual(c.get("a"), {a: 2});
		assert.deepStrictEqual(c.get(["a", "missing"]), {a: 2, missing: 0});
		assert.strictEqual(c.dec("b"), 1);
		assert.strictEqual(c.dec("b"), 0);
		assert.strictEqual(c.cnt("b"), 0);
		assert.strictEqual(c.dec("gone"), 0);
		c.add("c");
		assert.strictEqual(c.del(["a", "c"]), 0);
		assert.strictEqual(c.cnt("a"), 0);
		assert.strictEqual(c.del("nope"), 0);
		assert.strictEqual(c.type, "jado.cset");
		assert.strictEqual(c.x2o(), undefined);
	});

	it("sets, clears, clones, and copies names", function () {
		var c = jado.cset();
		assert.strictEqual(c.set({a: 2, b: 4}), 0);
		assert.strictEqual(c.set("nope"), 0);
		assert.strictEqual(c.all().a, 2);
		var copy = c.clone();
		c.add("a");
		assert.strictEqual(copy.cnt("a"), 2);
		assert.deepStrictEqual(c.ap2o({z: 1}), {z: 1});
		assert.strictEqual(c.clr(), 0);
		assert.strictEqual(c.cntk(), 0);
	});

	it("reports order stats, and stays quiet when the set is empty", function () {
		var empty = jado.cset();
		assert.strictEqual(empty.avg(), undefined);
		assert.strictEqual(empty.vari(), undefined);
		assert.strictEqual(empty.std(), undefined);

		var c = jado.cset();
		c.set({a: 1, b: 3, d: 5});
		assert.strictEqual(c.avg(), 3);
		assert.ok(c.vari() > 0);
		assert.ok(c.std() > 0);
		assert.deepStrictEqual(c.min(), [["a", 1]]);
		assert.strictEqual(c.min(2).length, 2);
		assert.deepStrictEqual(c.max(), [["d", 5]]);
		assert.strictEqual(c.max(2).length, 2);
		assert.deepStrictEqual(c.med(), ["b", 3]);
		c.add("e");
		assert.strictEqual(c.med().length, 2);
	});

	it("counts the values when given an object", function () {
		var c = jado.cset();
		c.add({a: "x"});
		assert.strictEqual(c.cnt("x"), 1);
	});
});

describe("log", function () {
	afterEach(function () {
		jado.setLogEnable(false);
		jado.setLogF(function () {});
	});

	it("stays quiet until enabled, and can use another function", function () {
		var msgs = [];
		var dumped = [];
		var orig = console.log;
		console.log = function () { dumped.push(arguments[0]); };
		try {
			assert.strictEqual(jado.getLogEnable(), false);
			jado.log("hidden");
			assert.strictEqual(dumped.length, 0);
			assert.strictEqual(jado.setLogEnable(true), true);
			assert.strictEqual(jado.getLogEnable(), true);
			jado.setLogF("not a function");
			jado.log("still console");
			assert.strictEqual(dumped.length, 1);
			jado.setLogF(function (m) { msgs.push(m); });
			jado.log("shown");
			assert.deepStrictEqual(msgs, ["shown"]);
			assert.strictEqual(jado.setLogEnable(false), false);
			jado.log("after");
			assert.deepStrictEqual(msgs, ["shown"]);
		} finally {
			console.log = orig;
		}
	});
});

describe("paths", function () {
	it("converts strings and arrays, including a custom mark", function () {
		assert.deepStrictEqual(jado.strToPath("a/b/c"), ["a", "b", "c"]);
		assert.deepStrictEqual(jado.strToPath('a\\/b/c'), ["a/b", "c"]);
		assert.deepStrictEqual(jado.strToPath("a\\b"), ["a\\b"]);
		assert.deepStrictEqual(jado.strToPath('["a", 1]'), ["a", 1]);
		assert.strictEqual(jado.strToPath("[true]"), undefined);
		assert.strictEqual(jado.strToPath(4), undefined);
		assert.deepStrictEqual(jado.strToPath("a.b", "."), ["a", "b"]);
		assert.strictEqual(jado.pathToStr(["a", "b"]), "a/b");
		assert.strictEqual(jado.pathToStr(["a/b", "c"]), "a\\/b/c");
		assert.strictEqual(jado.pathToStr(["a", "b"], "."), "a.b");
		assert.strictEqual(jado.pathToStr([1, 2]), "1/2");
		assert.strictEqual(jado.pathToStr(["a", "b"], null, ""), "a/b");
		assert.strictEqual(jado.pathToStr(["a/b"], "/", "xy"), "ax/b");
		assert.deepStrictEqual(jado.strToPath("a/b", "/", ""), ["a", "b"]);
		assert.deepStrictEqual(jado.strToPath("a/b", "/", "xy"), ["a", "b"]);
	});

	it("normalizes a path and reads through objects and arrays", function () {
		var data = {a: {b: [10, {c: 3}]}, "": "empty", n: null};
		assert.deepStrictEqual(jado.pathNorm("a/b"), ["a", "b"]);
		assert.deepStrictEqual(jado.pathNorm(["a"]), ["a"]);
		assert.deepStrictEqual(jado.pathNorm(12), ["12"]);
		assert.strictEqual(jado.pathNorm(true).length, 0);
		assert.strictEqual(jado.p2v(data, "a/b/0"), 10);
		assert.strictEqual(jado.p2v(data, "a/b/1/c"), 3);
		assert.strictEqual(jado.p2v(data, "missing"), undefined);
		assert.strictEqual(jado.p2v(data, ""), "empty");
		assert.strictEqual(jado.p2v(42, []), 42);
		assert.strictEqual(jado.p2v(42, "nope"), undefined);
		assert.strictEqual(jado.p2v(data, "a.b.0", "."), 10);
	});

	it("logs and returns undefined when a step is null", function () {
		var msgs = [];
		jado.setLogEnable(true);
		jado.setLogF(function (m) { msgs.push(String(m)); });
		assert.strictEqual(jado.p2v({a: null}, "a/b"), undefined);
		assert.ok(msgs.join(" ").indexOf("bad path") >= 0);
		jado.setLogEnable(false);
	});

	it("walks keys and falls back to the log when no function is given", function () {
		var lines = [];
		jado.getkv({a: {b: 1}}, function (s) { lines.push(s); }, "root");
		assert.ok(lines.join(" ").indexOf("root/a/b-->1") >= 0);
		var logged = [];
		jado.setLogEnable(true);
		jado.setLogF(function (m) { logged.push(String(m)); });
		assert.strictEqual(jado.getkv(5), "");
		assert.ok(logged.length >= 1);
		jado.setLogEnable(false);
	});
});

describe("printing", function () {
	it("colors json and escapes text", function () {
		var html = jado.prettyPrintJSON({a: 1, b: true, c: false, d: null, e: "x<y"});
		assert.ok(html.indexOf("color:red") >= 0);
		assert.ok(html.indexOf("color:purple") >= 0);
		assert.ok(html.indexOf("color:grey") >= 0);
		assert.ok(html.indexOf("color:black") >= 0);
		assert.ok(html.indexOf("color:green") >= 0);
		assert.ok(html.indexOf("&lt;") >= 0);
		assert.strictEqual(jado.htmlSafeStr('a<b>&"'), "a&lt;b&gt;&amp;&quot;");
	});

	it("stringifies again when the first pass is not a string", function () {
		var orig = JSON.stringify;
		var n = 0;
		JSON.stringify = function () {
			n += 1;
			if (n === 1) return undefined;
			return '{"a": 1}';
		};
		try {
			var html = jado.prettyPrintJSON({a: 1});
			assert.ok(html.indexOf("<pre") === 0);
			assert.ok(html.indexOf("color:green") >= 0);
		} finally {
			JSON.stringify = orig;
		}
	});
});

describe("loader", function () {
	var id = require.resolve("../src/jado.js");

	function reload() {
		delete require.cache[id];
		return require(id);
	}

	after(function () {
		delete global.define;
		delete global.self;
		reload();
	});

	it("follows self when that global exists", function () {
		global.self = {};
		assert.strictEqual(reload().exportName, "jado");
		delete global.self;
	});

	it("registers with define.amd when that is present", function () {
		var got;
		global.define = function (deps, factory) { got = factory(); };
		global.define.amd = true;
		reload();
		assert.strictEqual(got.exportName, "jado");
		delete global.define;
		assert.strictEqual(reload().map(2, function (n) { return n + 1; }), 3);
	});

	it("installs on the root when there is no module system", function () {
		var fs = require("fs");
		var vm = require("vm");
		var root = {};
		vm.runInNewContext(fs.readFileSync(id, "utf8"), {self: root}, {filename: id});
		assert.strictEqual(root.jado.exportName, "jado");
		assert.strictEqual(root.jado.map(2, function (n) { return n + 1; }), 3);
	});
});

describe("version", function () {
	it("names this maintenance copy", function () {
		var v = jado.version();
		assert.strictEqual(v.version, "1.1.0");
		assert.strictEqual(v.license, "BSD-2 Clause");
		assert.ok(v.about.length > 0);
		assert.ok(v.copy.indexOf("Chatterjee") >= 0);
	});
});
