/**
jado test functions.

M A Chatterjee (c) 2014-2018

this file uses the mocha test framework:

npm install mocha --save-dev mocha

*/

var assert = require("assert");
//var should = require('chai').should();


// include jado!
var jado = require("../jado.js")["jado"];

//tests begin:

// ================================================================
describe("#typeOf()", function() {
  
	//simple way to test
	//it('A usable typeof operator for internal use in jado', function() {
	//  _typeOf("this is a string").should.equal('string');
	//});

	//using meta tests
	var x;
	var tests = [
		{args: [[]],              expected: "array"},
		{args: [{}],              expected: "object"},
		{args: [1],               expected: "number"},
		{args: ["test string"],   expected: "string"},
		{args: [x],				  expected: "undefined"},
		{args: [null],			  expected: "null"},
		{args: [function(){}],    expected: "function"}
	];
  
  	tests.forEach(function(test) {
    	it("jado.typeOf (internal type operator)  " + test.args.length + " args", function() {
	      	var res = jado.typeOf.apply(null, test.args);
	      	assert.equal(res, test.expected);
    	});
 	});

});

