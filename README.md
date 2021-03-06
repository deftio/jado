[![License](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](https://opensource.org/licenses/BSD-2-Clause)
[![NPM version](https://img.shields.io/npm/v/jado.svg?style=flat-square)](https://www.npmjs.com/package/jado)
[![Build Status](https://travis-ci.org/deftio/jado.svg?branch=master)](https://travis-ci.org/deftio/jado)


# jado - a javascript data objects library
 
Jado is a small library for treating any javascript objects as iterables.  This allows generic (iterated) operations to be applied to any object type blindly which is useful some code and testing operations where the type is not known beforehand and some items may be singletons.

Note that many libraries (underscore etc) provide some measure of this on objects and have higher peformance for those ops.  Also the Javascript Iterable was introduced after this library was written.

Test and build packages updated for simple release.

Provided as UMD 


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


## Release History
* 1.0.x Initial release

## License

(OSI Approved BSD 2-clause)

Copyright (c) 2011-2016, M. A. Chatterjee <deftio at deftio dot com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


