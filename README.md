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

## Modern Perspective (2024)

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
// Same operation on any type
jado.map(input, x => x + 1);  // Works whether input is 23 or [23, 25]
jado.map(nodeList, node => ...)  // Works directly on DOM collections
```

### The Design Idea

The DOM API itself shows this problem - `getElementById` returns one element, `getElementsByTagName` returns a collection. You write different code for each case. Jado's approach was to make the same operations work on both without thinking about it.

This pattern shows up in functional languages like Haskell where operations work uniformly across different container types. It's not that modern JavaScript's approach is wrong - explicit type handling has clear benefits. But there's something to be said for operations that handle the singleton/collection distinction automatically.

### What's Still Useful

1. **Testing and meta-programming** - When you don't know types ahead of time
2. **Reducing boilerplate** - No Array.isArray() checks or Array.from() conversions
3. **The counting set pattern** - `jado.cset()` provides statistics on collections with no modern equivalent
4. **Uniform operations** - One function that works on any input type

### Historical Note

Written 2014-2018, before ES6 iterables. The library solved real problems in JavaScript at the time, and while the language has evolved significantly, the core idea - treating all types uniformly for iteration operations - remains an interesting alternative approach.

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


```

More examples in the examples folder (TBD)
The project works but I moved on to other things.  Build just updated for NPM.

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

Copyright (c) 2011-, M. A. Chatterjee <deftio at deftio dot com>



