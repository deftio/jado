#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

"use strict";
//The above shenbang allows running on systems whether nodejs exec is called 'node'
//or called 'nodejs' which is common on many debian systems such as Ubuntu.

//more traditional shebang would be:
//#!/usr/bin/env node

//begin actual javascript below

var jado = require('../jado.js');
let version = jado.version()["version"];

var fs = require("fs");

//console.log ("jado version:"+jado.version()["version"]+" package version updater loaded.\n ");

/* process cmd line
process.argv[0] --> nodejs executable
process.argv[1] --> /full/path/to/this/file/update-jado-package.js 
process.argv[2] --> input_filename
process.argv[3] --> output_filename

example:

update-jado-package 
*/

var readJSONFile  = function (fname,callback_fn) {       
   fs.readFile(fname, "utf8", function (err, data) { if (err) throw err; callback_fn(JSON.parse(data)); });
};

var saveJSONFile = function (fname,data) {
	fs.writeFile(fname, data, function (err) {
        if (err) return console.log(err);
    });
}


if (process.argv.length <=2) {
	console.log("update-jado-package: no arguments supplied (no operations performed).  \nThis tool updates the version number in package.json\n\n");
	console.log("usage:\n ./udpate-jado-package original-package.json updated.json\n\n");
}
else {
	if ((typeof process.argv[2] == "string") && (typeof process.argv[3] == "string")) {
		var savePackage = function (data) {
			data["version"] = version;  
			saveJSONFile(process.argv[3],JSON.stringify(data, null, "\t")); 
		}
		readJSONFile(process.argv[2], savePackage); 
	}
}
