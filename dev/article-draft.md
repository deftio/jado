# A note on jado

I wrote jado while building a front end for a large scraper. Data arrived as an array, a plain object, a single value, or null, and each shape wanted a slightly different loop for the same idea. This was around 2015. Arrays had `map`. Objects did not. A single value was usually wrapped in an array and then unwrapped.

What I wanted was to call `map`, `filter`, `reduce`, or `forEach` and get the same shape back. The published piece is [What if Everything in JavaScript Were Iterable?](https://javascript.plainenglish.io/what-if-everything-in-javascript-were-iterable-8ad0ed813deb). This note is that story. The calls are the maintenance copy, 1.1.0. Two conventions were aligned with the language. `null` stays `null`, and `reduce` is `(accumulator, value)`.

## Arrays

Arrays were already in good shape. jado follows the language there, so the same call still makes sense when the value is not an array.

`filter` keeps a member when the predicate is `== true`. `true` and `1` pass. A string such as `"yes"` does not. `reduce` is `(accumulator, value)`. Addition hides the order. `jado.reduce([1, 2, 3], function (acc, v) { return acc - v; }, 10)` is `4`. `forEach` on an array is `(index, value)`.

## Objects

Plain objects never got those methods, so the usual path goes out through `Object.entries` and comes back with `Object.fromEntries`. jado walks the object by name and keeps the names.

A plain object is a collection of fields. One user object and an array of users are different cases. `forEach` is `(key, value)`. `reduce` has no index. `reducex` is `(accumulator, value, key)`. Key order is not part of the contract.

## The DOM

`getElementById` is one element or null. `querySelectorAll` is a collection. You write two paths, or you coerce the collection with `Array.from` before `map` will run.

I wanted one call for both. jado does not walk a `NodeList` or an `HTMLCollection`. The function runs once and receives the collection. A single element is one value, so `forEach` runs once with that element. `null` from a missing element stays `null`.

A lazy query with the same four methods, one element or many, stayed a sketch.

## One value

The usual move is to wrap the value in an array, use the method, and unwrap.

jado leaves it as one value. An accepted `filter` returns that value. A rejected one returns `undefined`. `reduce` with a seed calls the function once. With no seed, the value comes back and the function is not called. `forEach` is called with the value only. A string is one value. `jado.s2a("ab")` is `["ab"]`.

## Null

Calling `map` on `null` throws. Lodash, as I remember it, coerced `null` to an empty array.

Older notes said jado turned `null` into `{}`. I don't have a firm account of why. Looking back, I would leave `null` as `null`. This copy does that. The function is not called. `reduce` on `null`, `undefined`, `[]`, or `{}` returns the seed. With no seed, those cases throw `TypeError`.

A null inside an array or an object is still passed to the function.

## On the prototypes

Putting `map` on `Number.prototype` would have made `(5).map(fn)` work. Extending built-ins collides with other code, so that stayed a sketch.

## Why one call

You often do not know whether the next function will return one value or many. That holds for a number, a string, or an array.

```javascript
jado.map("  Ab ", function (s) { return s.trim().toLowerCase(); }); // "ab"
jado.map(["  Ab ", "C"], function (s) { return s.trim().toLowerCase(); }); // ["ab", "c"]
jado.reduce(12, function (sum, n) { return sum + n; }, 0); // 12
jado.reduce([12, 4], function (sum, n) { return sum + n; }, 0); // 16
```

A plain object is still a set of fields. An element and a `NodeList` are still different cases. The library walks arrays and plain objects. Everything else is one value.

## Where it sits

JavaScript drew the line at arrays. jado was a try at one call for the shapes a scraper actually returned. The library is parked.

The page is [deftio.github.io/jado](https://deftio.github.io/jado/). The code is at [github.com/deftio/jado](https://github.com/deftio/jado).
