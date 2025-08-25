[![License](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](https://opensource.org/licenses/BSD-2-Clause)
[![NPM version](https://img.shields.io/npm/v/jado.svg?style=flat-square)](https://www.npmjs.com/package/jado)
[![CI](https://github.com/deftio/jado/actions/workflows/ci.yml/badge.svg)](https://github.com/deftio/jado/actions/workflows/ci.yml)


# jado - a javascript data objects library

Jado is a small library for treating any javascript objects as iterables. This allows generic (iterated) operations to be applied to any object type blindly which is useful for code and testing operations where the type is not known beforehand and some items may be singletons.

## What It Does

```javascript
// Works on arrays as expected
jado.map([23,25], x => x+1)  // returns [24, 26]

// Also works on singletons - no special handling needed
jado.map(23, x => x+1)  // returns 24 (not [24])

// Works on objects, strings, null, undefined - anything
jado.filter({a:1, b:2}, x => x>1)  // returns {b:2}
```

You don't need to check if something is an array before operating on it.

## Modern Perspective (2025)

Modern JavaScript has excellent array methods now, which is great. But you still can't directly map/filter/reduce on:
- Plain objects
- Single values (non-arrays)
- DOM NodeLists without converting them first
- Mixed types without type checking

This leads to code like:
```javascript
// Still common in modern JS
const result = Array.isArray(input) 
  ? input.map(x => x + 1) 
  : [input].map(x => x + 1)[0];

// Or with DOM elements
const divs = document.getElementsByTagName('div');  // Returns HTMLCollection
Array.from(divs).map(div => ...)  // Need to convert first
```

With jado, these operations just work:
```javascript
// Same operation works on ANY type - with sensible behavior for each
jado.map(23, x => x * 2)           // 46 (singleton stays singular)
jado.map([1,2,3], x => x * 2)      // [2, 4, 6] (arrays work as expected)
jado.map({a:1, b:2}, x => x * 2)   // {a: 2, b: 4} (objects preserve keys)
jado.map('hello', x => x.toUpperCase()) // 'HELLO' (strings are atomic)
jado.map(true, x => !x)            // false (booleans work too)
jado.map(nodeList, node => ...)    // Works directly on DOM collections

// The behavior is always predictable: 
// - Collections (arrays/objects) are iterated
// - Atomics (numbers/strings/booleans/dates) are treated as single values
```

### The Design Idea

The DOM API itself shows this problem - `getElementById` returns one element, `getElementsByTagName` returns a collection. You write different code for each case. Jado's approach was to make the same operations work on both without thinking about it.

This pattern shows up in functional languages like Haskell where operations work uniformly across different container types. It's not that modern JavaScript's approach is wrong - explicit type handling has clear benefits. But there's something to be said for operations that handle the singleton/collection distinction automatically.

### What's Still Useful

1. **Testing and meta-programming** - When you don't know types ahead of time
2. **Reducing boilerplate** - No Array.isArray() checks or Array.from() conversions
3. **The counting set pattern** - `jado.cset()` combines frequency counting with statistics. In modern JS you'd need a Map for counting plus a stats library like Simple Statistics or d3-array
4. **Uniform operations** - One function that works on any input type
5. **Path-based navigation** - Deep object access with string paths (see below)

### Historical Note

Written 2014-2018, before ES6 iterables. The library solved real problems in JavaScript at the time, and while the language has evolved significantly, the core idea - treating all types uniformly for iteration operations - remains an interesting alternative approach.

## The Philosophy Behind Jado

### Why Uniform Operations Matter

Most programming pain comes from edge cases. What if the API returns one item instead of an array? What if the value is null? What if the object is empty? Traditional approaches handle this with defensive programming:

```javascript
// The defensive programming pyramid of doom
function processData(data) {
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.map(transform);
    }
    if (typeof data === 'object') {
        return Object.values(data).map(transform);
    }
    return [data].map(transform);
}
```

Jado's philosophy: **What if we just didn't care?** Make operations work uniformly on everything. A single value is just a collection of one. Null is just an empty collection. This isn't sloppiness - it's removing unnecessary distinctions.

### The Functor Pattern (Without the Jargon)

In functional programming, a functor is something you can map over. Haskell makes everything mappable through typeclasses. JavaScript went the opposite direction - different methods for different types. Jado brought the functor pattern to JavaScript without requiring you to understand category theory.

```javascript
// In Haskell, fmap works on anything
// fmap (+1) [1,2,3]     => [2,3,4]
// fmap (+1) (Just 5)    => Just 6
// fmap (+1) Nothing     => Nothing

// In jado, map works on anything
jado.map([1,2,3], x => x+1)   // [2,3,4]
jado.map(5, x => x+1)          // 6
jado.map(null, x => x+1)       // {}
```

### Known Quirks and Design Decisions

1. **Singletons stay singular** - `jado.map(5, x => x*2)` returns `10`, not `[10]`. This was deliberate - operations preserve the "shape" of the input.

2. **Null/undefined become empty objects** - Not errors, not null, but `{}`. This allows chaining operations without null checks.

3. **Empty string is a key, not root** - `jado.p2v(data, '')` looks for a key named `''`, not the root object. Use `[]` or `undefined` for root.

4. **Path escaping is imperfect** - Keys containing delimiters don't round-trip perfectly through string conversion. Use array paths for these cases.

5. **Strings aren't iterated character-by-character** - While strings are technically iterable, jado treats them as atomic values. Use `jado.s2a()` to convert to character array if needed.

### Why This Still Matters

JavaScript chose explicit type safety. TypeScript doubled down on it. But there's value in exploring the path not taken. Jado shows that many problems we solve with types could also be solved by making operations more uniform.

It's not that one approach is better - they solve different problems. Type safety catches errors at compile time. Uniform operations eliminate entire categories of runtime errors by making them impossible.

### The Testing Use Case

Where jado really shines is testing and meta-programming. When you're writing test utilities, you often don't know if you'll get one item or many. Jado lets you write one function that handles both:

```javascript
// Test helper that works with single or multiple values
function assertAllPositive(values) {
    const results = jado.map(values, v => v > 0);
    const allTrue = jado.reduce(results, (a, b) => a && b, true);
    return allTrue;
}

assertAllPositive(5);        // works
assertAllPositive([5, 10]);  // works
assertAllPositive({a: 5});   // works
```

Provided as UMD or ESM


## Features

* works in both server side (node_js and browser) and provided in both source and minified forms
* no dependancies on any other libraries
* OSI approved open-source.  

## Installation (server side)
npm install jado --save 

## Usage
jado can be used in a browser or nodejs (server) and has no dependancies.   

### Browser: Including jado in the browser:
In a browser just include script tags:

```html
<script type="text/javascript" src="./jado.min.js"></script>
```
or via CDN
```html
<script type="text/javascript" src="https://unpkg.com/jado/jado.min.js"></script>
```

### In nodejs 
```javascript
var jado = require('./jado.js');  //adds to current scope
```

### Simple Code Example (same usage in either browser or nodejs)
```javascript

//this works like an array.map
jado.map([23,25],function(x){return x+1}) // returns [24, 26]

//this works the same way, note that the result is also a singleton
jado.map(23,function(x){return x+1})  // returns 24 



//==================================
// jado also includes a stats object for counting keys and values called jado.cset:
// using the counting set jado.cset()
x = jado.cset()
x.add(2);  //add the key 2  ===> key 2 , count: 1
x.add(3);  //add the key 3  ===> key 3 , count: 1
x.add(3);  // key 3 ==>, count: 2
x.keys();  // returns [2,3]
x.add(4);  // returns [2,3,4]
x.add(7);  // returns [2,3,4,7]

//stats on the counts of the keys
x.avg();   // returns 1.25   // avg of the counts on the keys
x.std();   // returns 0.433  // std dev of the counts 
x.vari();  // returns 0.1875

// In modern JS, you'd need multiple tools:
// - Map for counting
// - Lodash for frequency: _.countBy()
// - Simple Statistics or d3-array for stats
// - Or write custom code combining all three


```

### Path-based Object Navigation

Jado includes path operations for navigating nested objects using string paths - functionality that predates similar features in lodash and other libraries:

```javascript
const data = {
  users: {
    admin: {
      name: 'Alice',
      permissions: ['read', 'write', 'delete']
    }
  },
  'config/settings': {  // Keys with special characters
    theme: 'dark'
  }
};

// Navigate with string paths
jado.p2v(data, 'users/admin/name')           // 'Alice'
jado.p2v(data, 'users/admin/permissions/1')  // 'write'

// Array paths for keys with delimiters
jado.p2v(data, ['config/settings', 'theme']) // 'dark'

// Path conversion utilities
jado.strToPath('users/admin/name')   // ['users', 'admin', 'name']
jado.pathToStr(['users', 'admin'])   // 'users/admin'

// Handles non-existent paths gracefully
jado.p2v(data, 'users/nobody')       // undefined (no errors!)
```

This predates JSONPath and lodash's `_.get()` by several years. Unlike JSONPath which uses complex query syntax, jado uses simple delimiter-based paths. Unlike XPath for XML, it's lightweight and JavaScript-native.

# Source code home
all source is at github:
http://github.com/deftio/jado

Web url and examples
http://deftio.com/jado


## Linting 
jado uses eslint for static code checking and analysis.

```bash
npm install eslint --save-dev
./node_modules/.bin/eslint --init

```

Now run the lint test like this:
```bash
npm run lint 
```

## Tests  (requires mocha and chai test suites)  
jado is tested with the mocha framework installed locally using npm

```bash
npm install mocha --save-dev mocha

```

Run the tests as follows:
```bash
npm run test 

```


## Building from Source

If you want to build jado from source:

```bash
# Clone the repository
git clone https://github.com/deftio/jado.git
cd jado

# Install dependencies
npm install

# Run the build
npm run build
```

This creates both UMD and ESM versions in the `dist/` directory:
- `dist/jado.umd.js` - Universal module (works everywhere)
- `dist/jado.esm.js` - ES Module version (for modern bundlers)

The build also maintains backward compatibility by copying the UMD version to the root directory.

## Release History
* 1.0.x Initial release

## License

(OSI Approved BSD 2-clause)

Copyright (c) 2011-2025, M. A. Chatterjee <deftio@deftio.com>



