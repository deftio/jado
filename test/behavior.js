/**
 * Behavior matrix for map, filter, reduce and the x variants.
 * Shape is part of the result: a single value stays a single value.
 */

var assert = require("assert");
var jado = require("../src/jado.js");

function calls(fn) {
	var n = 0;
	var wrapped = function () {
		n += 1;
		return fn.apply(null, arguments);
	};
	wrapped.count = function () { return n; };
	return wrapped;
}

describe("nullish values", function () {
	it("map returns null and undefined without calling the function", function () {
		var f = calls(function (x) { return x; });
		assert.strictEqual(jado.map(null, f), null);
		assert.strictEqual(jado.map(undefined, f), undefined);
		assert.strictEqual(f.count(), 0);
	});

	it("map still hands contained null and undefined to the function", function () {
		var seen = [];
		jado.map({a: null}, function (x) { seen.push(x); return x; });
		jado.map([undefined], function (x) { seen.push(x); return x; });
		assert.strictEqual(seen[0], null);
		assert.strictEqual(seen[1], undefined);
	});

	it("filter returns null and undefined without calling the predicate", function () {
		var f = calls(function () { return true; });
		assert.strictEqual(jado.filter(null, f), null);
		assert.strictEqual(jado.filterx(undefined, f), undefined);
		assert.strictEqual(f.count(), 0);
	});

	it("reduce on null or undefined returns the seed and does not call the function", function () {
		var f = calls(function (a, v) { return a + v; });
		assert.strictEqual(jado.reduce(null, f, 10), 10);
		assert.strictEqual(jado.reduce(undefined, f, 10), 10);
		assert.strictEqual(f.count(), 0);
	});
});

describe("shape", function () {
	it("map keeps a single value single, and keeps array and object containers", function () {
		assert.strictEqual(jado.map(5, function (x) { return x + 1; }), 6);
		assert.deepStrictEqual(jado.map([1, 2], function (x) { return x + 1; }), [2, 3]);
		assert.deepStrictEqual(jado.map({a: 1, b: 2}, function (x) { return x + 1; }), {a: 2, b: 3});
		assert.strictEqual(jado.map("ab", function (x) { return x.toUpperCase(); }), "AB");
		assert.deepStrictEqual(jado.map([], function (x) { return x; }), []);
		assert.deepStrictEqual(jado.map({}, function (x) { return x; }), {});
	});

	it("filter on a single value returns the value or undefined", function () {
		assert.strictEqual(jado.filter(5, function (x) { return x > 0; }), 5);
		assert.strictEqual(jado.filter(5, function () { return false; }), undefined);
		assert.deepStrictEqual(jado.filter([1, 2, 3], function (x) { return x > 1; }), [2, 3]);
		assert.deepStrictEqual(jado.filter({a: 1, b: 3}, function (x) { return x > 1; }), {b: 3});
		assert.deepStrictEqual(jado.filter([], function () { return true; }), []);
		assert.deepStrictEqual(jado.filter({}, function () { return true; }), {});
	});

	it("filter uses == true, so true and 1 pass and other truthy values do not", function () {
		assert.deepStrictEqual(jado.filter([1, 2], function () { return 1; }), [1, 2]);
		assert.deepStrictEqual(jado.filter([1, 2], function () { return "yes"; }), []);
	});

	it("filterx on a single value passes undefined as the key", function () {
		var args;
		var kept = jado.filterx(5, function (k, v) { args = [k, v]; return true; });
		assert.strictEqual(kept, 5);
		assert.strictEqual(args[0], undefined);
		assert.strictEqual(args[1], 5);
		assert.strictEqual(jado.filterx(5, function () { return false; }), undefined);
	});

	it("mapx on a single value is called with the value only", function () {
		assert.strictEqual(jado.mapx(5, function (v) { return v + 1; }), 6);
		assert.deepStrictEqual(jado.mapx({a: 1}, function (k, v) { return k + v; }), {a: "a1"});
	});
});

describe("reduce argument order", function () {
	it("subtracts in accumulator-then-value order", function () {
		assert.strictEqual(jado.reduce([1, 2, 3], function (acc, value) { return acc - value; }, 10), 4);
	});

	it("concatenates strings in left-to-right order", function () {
		assert.strictEqual(jado.reduce(["a", "b", "c"], function (acc, value) { return acc + value; }, ""), "abc");
	});

	it("reducex passes accumulator, value, then key", function () {
		var seen = [];
		var total = jado.reducex({a: 1, b: 2}, function (acc, value, key) {
			seen.push([acc, value, key]);
			return acc + value;
		}, 0);
		assert.strictEqual(total, 3);
		assert.deepStrictEqual(seen, [[0, 1, "a"], [1, 2, "b"]]);
	});

	it("reducex on a single value uses undefined as the key", function () {
		var got = jado.reducex(5, function (acc, value, key) { return [acc, value, key]; }, 10);
		assert.deepStrictEqual(got, [10, 5, undefined]);
	});

	it("throws when an empty or nullish reduce has no seed, and returns a bare single value", function () {
		assert.throws(function () { jado.reduce([], function (a, b) { return a; }); }, TypeError);
		assert.throws(function () { jado.reduce(null, function (a, b) { return a; }); }, TypeError);
		assert.throws(function () { jado.reduce({}, function (a, b) { return a; }); }, TypeError);
		assert.strictEqual(jado.reduce(5, function () { throw new Error("called"); }), 5);
		assert.strictEqual(jado.reduce([], function (a, b) { return a + b; }, 4), 4);
	});
});

describe("cloneType", function () {
	it("preserves null and undefined and makes empty core containers", function () {
		assert.strictEqual(jado.cloneType(null), null);
		assert.strictEqual(jado.cloneType(undefined), undefined);
		assert.deepStrictEqual(jado.cloneType([1, 2]), []);
		assert.deepStrictEqual(jado.cloneType({a: 1}), {});
		assert.strictEqual(jado.cloneType("hi"), "");
		assert.strictEqual(jado.cloneType(4), 0);
		assert.strictEqual(jado.cloneType(true), false);
		assert.ok(isNaN(jado.cloneType(new Date()).getTime()));
		assert.strictEqual(jado.cloneType(new Uint8Array([1, 2, 3])).length, 0);
		assert.ok(jado.cloneType(new Uint8Array([1])) instanceof Uint8Array);
	});

	it("does not call a custom constructor", function () {
		function Box(n) { this.n = n; }
		assert.strictEqual(jado.cloneType(new Box(1)), undefined);
	});
});

describe("walks and paths", function () {
	it("object walks still see inherited enumerable names", function () {
		var proto = {z: 1};
		var obj = Object.create(proto);
		obj.a = 2;
		assert.deepStrictEqual(jado.map(obj, function (v) { return v + 1; }), {a: 3, z: 2});
	});

	it("map calls getValue on members", function () {
		assert.deepStrictEqual(jado.map([function () { return 5; }], function (v) { return v; }), [5]);
	});

	it("empty string is a key, and a missing path is undefined", function () {
		var data = {"": "empty", a: {"1": "n"}, "config/settings": {theme: "dark"}};
		assert.strictEqual(jado.p2v(data, ""), "empty");
		assert.strictEqual(jado.p2v(data, undefined), data);
		assert.strictEqual(jado.p2v(data, []), data);
		assert.strictEqual(jado.p2v(data, "nope"), undefined);
		assert.strictEqual(jado.p2v(data, "a/1"), "n");
		assert.strictEqual(jado.p2v(data, ["config/settings", "theme"]), "dark");
	});
});

describe("callers of reduce", function () {
	it("keeps counting-set totals after the callback-order change", function () {
		var c = jado.cset();
		c.add("a");
		c.add("a");
		c.add("b");
		assert.strictEqual(c.cnt("a"), 2);
		assert.strictEqual(c.ttl(), 3);
		assert.strictEqual(c.avg(), 1.5);
	});

	it("lends a nested value by counting leaves", function () {
		assert.strictEqual(jado.lend({a: [1, 2], b: 3}), 3);
	});
});
