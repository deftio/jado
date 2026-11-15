[![License](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](https://opensource.org/licenses/BSD-2-Clause)
[![NPM version](https://img.shields.io/npm/v/jado.svg?style=flat-square)](https://www.npmjs.com/package/jado)

# jado

jado is a small JavaScript library for `map`, `filter`, and `reduce`. It came out of work on uneven collections, where a value might be one item or many, and the useful property was that the call did not grow a type check at every step.

It is kept as a small library. This is not an active project, and 1.1.0 is a maintenance pass.

## What it operates on

An array is walked by index. A plain object is walked by name, and the names are kept. Anything else is one value, and the result stays one value. A plain object is a collection of fields, not a single record.

A few rules are easy to get wrong:

* **Singletons** - `jado.map(23, fn)` returns one value, not a one-element array.
* **Strings** - a string is one value, not a list of characters. `jado.s2a` and `jado.a2s` are there when you actually want the characters.
* **Null** - `null` stays `null`, and `undefined` stays `undefined`. Neither becomes `{}`.
* **Contained nulls** - `jado.map({a: null}, fn)` still passes that `null` into `fn`. The same goes for a nullish member of an array.
* **Functions as members** - `map`, `mapx`, and `forEach` call `jado.getValue` on each member, so a function stored in the collection is invoked. `filter` and `reduce` do not do that. `jado.getValue` itself is the explicit call.
* **Object walks** - walks use `for...in`, so an inherited enumerable name is visited. Key order is not part of the contract.
* **Predicates** - `filter` keeps a member when the predicate result is `== true`. `true` and `1` pass. Other truthy values do not.

```javascript
jado.map([23, 25], function (x) { return x + 1; }); // [24, 26]
jado.map(23, function (x) { return x + 1; });       // 24
jado.map({a: 1, b: 2}, function (x) { return x * 2; }); // {a: 2, b: 4}
jado.map("hi", function (x) { return x.toUpperCase(); }); // "HI"
jado.map(null, function (x) { return x + 1; });     // null, function not called
```

DOM collections are not special-cased. A `NodeList` is not an array and not a plain object, so it is one value.

## Install

The package has no runtime dependencies. The built files are `dist/jado.umd.js` and `dist/jado.esm.js`.

```bash
npm install jado
```

```javascript
var jado = require("jado");
```

```html
<script src="dist/jado.umd.js"></script>
```

## Null and undefined

Older notes said `null` and `undefined` were turned into `{}` so the next call would not throw. That lost the difference between a missing value and an empty object. As of 1.1.0, `jado.map(null, fn)` is `null` and does not call `fn`. `jado.map(undefined, fn)` is `undefined`.

`filter` follows the same rule for a nullish input. `reduce` on `null`, `undefined`, `[]`, or `{}` returns the seed and does not call the function. With no seed, those cases throw `TypeError`. A single value with no seed is returned as itself.

Why the old conversion existed is not clear from the history. One plausible reason is that ES5 threw when you walked a nullish value, and `{}` was a short way to keep going. Another is that a missing piece of a graph was being treated as no results. Neither is established as the original reason. Absence is not an empty dictionary.

| Input | `map(fn)` | `filter(pred)` | `reduce(fn, seed)` |
|---|---|---|---|
| `null` | `null` | `null` | seed |
| `undefined` | `undefined` | `undefined` | seed |
| `{}` | `{}` | `{}` | seed |
| `[]` | `[]` | `[]` | seed |
| `5`, accepted | `fn(5)` | `5` | `fn(seed, 5)` |
| `5`, rejected |  | `undefined` |  |

## Reduce

`jado.reduce` now uses the same callback order as `Array.prototype.reduce`: `(accumulator, value)`. This changed in 1.1.0. Addition hides the old reversed order, so the tests use subtraction and string concatenation.

```javascript
jado.reduce([1, 2, 3], function (acc, value) { return acc - value; }, 10); // 4
```

`jado.reducex` is `(accumulator, value, key)`. The accumulator stays in the first position. A single value has no key, so the key is `undefined`. `mapx` and `filterx` still pass `(key, value)` on arrays and objects. On a single value, `mapx` calls `fn(value)` and `filterx` calls `fn(undefined, value)`.

An accepted single value from `filter` is that value. A rejected one is `undefined`.

## Paths

`jado.p2v` reads a nested value. A string path is split on `/`. An empty string is the key `""`, not the root. The root is an omitted path or `[]`. A missing path returns `undefined`. A key that contains the delimiter goes in an array path.

```javascript
jado.p2v(data, "users/admin/name");
jado.p2v(data, ["config/settings", "theme"]);
jado.p2v(data, "");   // key named ""
jado.p2v(data);       // data itself
```

## Counting set

`jado.cset()` counts how often each key is added, and can report a mean, variance, and standard deviation of those counts.

```javascript
var x = jado.cset();
x.add("a");
x.add("a");
x.add("b");
x.cnt("a"); // 2
x.ttl();    // 3
x.avg();    // 1.5
```

## Other notes

`jado.cloneType` returns an empty value for the core types: array, plain object, string, number, boolean, date, function, regexp, and the usual typed arrays. `null` and `undefined` come back as themselves. A custom class is not constructed, and the result is `undefined`.

## Building

```bash
git clone https://github.com/deftio/jado.git
cd jado
npm install
npm test
npm run lint
npm run build
```

The site in `docs/` is the GitHub Pages page. It is built with bitwrench.

## License

BSD 2-clause.

Copyright (c) 2011-2026, M. A. Chatterjee <deftio@deftio.com>
