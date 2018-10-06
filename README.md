[![License](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)](https://opensource.org/licenses/BSD-2-Clause)
![NPM version](http://img.shields.io/npm/v/jado.svg?style=flat-square)

# jado - a javascript data objects library

copyright (C) <2012>  <M. A. Chatterjee>  <deftio [at] deftio [dot] com>
version 0.23 M. A. Chatterjee
 
## About Jado

Jado is a small library for treating all javascript objects as iterables.  This allows generic (iterated) operations to be applied to any object type blindly which is useful some code and testing operations where the type is not known beforehand and some items may be singletons.

## Features

* works in both server side (node_js and browser) and provided in both source and minified forms
* no dependancies on any other libraries
* OSI approved open-source.  

## Installation (server side)
npm install jado --save 

## Usage
jado can be used in a browser or nodejs (server) with no dependancies.   

### Browser: Including jado in the browser:
In a browser just include script tags:
```
<script type="text/javascript" src="./jado.min.js"></script>
```

### In nodejs 
```
var jado = require('./jado.js')["jado"];  //adds to current scope
```

### Simple Code Example (same usage in either browser or nodejs)

More examples in the examples folder
```
```

#Source code home
all source is at github:
http://github.com/deftio/jado

Web url and examples
http://deftio.com/jado


## Linting 
jado uses eslint for static code checking and analysis.

```
npm install eslint --save-dev

./node_modules/.bin/eslint --init

```
Now run the lint test like this:
```
./node_modules/.bin/eslint jado.js   
```

## Tests  (requires mocha and chai test suites)  
jado is tested with the mocha framework installed locally using npm

```
npm install mocha --save-dev mocha

```

Run the tests as follows:
```
./node_modules/mocha/bin/mocha test/jado_test.js --reporter spec

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


