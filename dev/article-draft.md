# A note on jado

jado is a small library from 2011 to 2018. I wrote it while working with uneven data, the sort of payload where a person, a place, or an attribute sometimes arrived as one value and sometimes as a list. The same shape showed up in the browser, where one call returns an element and another returns a collection.

The part worth keeping was narrow. A transformation did not need a branch for a single value, an array, and an object at every call. `jado.map(23, fn)` returns one number. `jado.map([23, 25], fn)` returns an array. `jado.map({a: 23}, fn)` returns an object with the same names. A string stays one string.

A plain object is not "one record." It is a set of fields, and map walks those fields. If an API returns either one user object or an array of user objects, jado does not make those the same case. The singleton case is a number, a string, a boolean, a date, and the other non-list values.

`null` used to become `{}`. I don't have a firm account of why. Walking a nullish value in ES5 threw, and turning it into an empty object was a short way to keep going. It is also possible I was treating a missing piece of a graph as no results. The helpers were often one line, and that compactness made the conversion easy to leave in. None of that is established as the reason. What is clear in hindsight is that a missing value and an empty object are different, and 1.1.0 keeps them different.

`jado.reduce` used to call the function as `(value, accumulator)`. It now uses `(accumulator, value)`, matching `Array.prototype.reduce`. `reducex` is `(accumulator, value, key)`.

This is a parking place for the library, not a case for using it instead of ordinary JavaScript. The implementation is still small on purpose.

The code is at [github.com/deftio/jado](https://github.com/deftio/jado). The page is [deftio.github.io/jado](https://deftio.github.io/jado/).
