/*
 *  jado.js  --- Javascript Assisted Document Output
 *	
 *  A Simple Standalone Javascript Report Generator
 *  There are no dependancies all that is required is in html:
 *  <script src='jado.js'></script> 
 *  
 *  Usage:
 *  Create a <div id='myreport'> element in which to host a jado document
 *  The in javascript
 *
 *
 *  M. A. Chatterjee 2014-07-22
 *
 *	@copy Copyright (C) <2014>  <M. A. Chatterjee>
 *  	
 *  @author M A Chatterjee <deftio [at] deftio [dot] com>
 *
 *	This software is provided 'as-is', without any express or implied
 *	warranty. In no event will the authors be held liable for any damages
 *	arising from the use of this software.
 *
 *	Permission is granted to anyone to use this software for any purpose,
 *	including commercial applications, and to alter it and redistribute it
 *	freely, subject to the following restrictions:
 *
 *	1. The origin of this software must not be misrepresented; you must not
 *	claim that you wrote the original software. If you use this software
 *	in a product, an acknowledgment in the product documentation is required.
 *
 *	2. Altered source versions must be plainly marked as such, and must not be
 *	misrepresented as being the original software.
 *
 *	3. This notice may not be removed or altered from any source
 *	distribution.
 *
 */	

//MCTD : Todos in the future
//builfDefaultReport creates a few templates for creating a nice
//report out of the box.  
function buildDefaultReport () {
}


//JADO  Jado Assisted Data Output  - Punny recursive name :) really just wanted something 
//which sounds like JATO and to say I wrote a mini lib with recursive acronym. 
//
//
//Document Object Model (DOM) for JADO mirrors HTML / XML tree structure    
//<tagname attrib1 = "value1" attrib2 = "value2">content_array[  ]</tag>
//
//{ _t: "tag",
//  _a: {"attrib1" : "value1", "attrib2" : "value2" }.
//  _c: "content" or [array of tag nodes] //string for content or array of these types of nodes
//}
//
// unvirsal bulky internal decoding but allows injection w/o special parseing eg without {} or _foo
// if HTML output then can force all attribs and value to be strings as 'grammar' check
// { "tagtype" : "div",  //string -- node type
//   "attrib" : { "attrib1"  : "value1"},   //dictionary of attributes
//   "content": []                          //array of objects of this type. if empty set to ""
// }
// a document consists of an array of such tag objects e.g. doc = [ , , , , , ]
// can abbreviate each item as t, a, c
// dom IDs etc are just attibutes
// templatable params are just functions()
// can output this "DOM" to HTML or PDF or ... since form is preserved.
// can be encoded as JSON (even functions using toString and 

/* for node or browser
(function(exports){

   // your code goes here
   // exports.test = function(){
   //     return 'hello world'
   //  };

})(typeof exports === 'undefined'? this['mymodule.js']={}: jado);
*/

//function __jado_extended_definition () {

(function( jado, undefined ){ // jado base declaration

//Jado internal used helper Functions -- map,filter,reduce, which are used "blindly" 
//internally in Jado because they work on mixed types e.g you can use map / filter / reduce on dictionaries
//or strings not just arrays.  They do not modify the original data structure ("no sideeffects")
//TODO strings, numbers, etc treat as ["string"] or [num] <-- 1 item thing so for ... in works, allows blind recursive use

// map(),    used internally, works on [] or {}
jado.map       = function (d,f)   {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {r[k]=f(d[k]);} else r=f(d);  return r; };

// mapx(), allows iterator to work on both key and value
// requires requires f to take 2 params: for arrays f(index,value), for  dicts f(key,value)
jado.mapx      = function (d,f)   {var k, r=_ct(d); for (k in d) {r[k]=f(k,d[k]);} return r; };

// filter, used internally, works on [] or {}
jado.filter    = function (d,f)   {var k, r=_ct(d); for (k in d) {if (f(d[k]) == true) {if (_to(r)=="array") {r.push(d[k])} else {r[k]=d[k]}}} return r;};

// filterx(),  allows iterator to work on both key and value
// requires requires f to take 2 params: for arrays f(index,value), for  dicts f(key,value)
jado.filterx   = function (d,f)   {var k, r=_ct(d); for (k in d) {if (f(k,d[k]) == true) {if (_to(r)=="array") {r.push(d[k])} else {r[k]=d[k]}}} return r;};

// reduce(), used internally, works on [] or {}
jado.reduce    = function (d,f,i) {var k, r=i;  for (k in d) {r = f(d[k],r);}    return r;};

// reducex(), used internally, works on [] or {}, allows access to index or key for each element, 
// requires requires f to take 3 params: for arrays f(index,value,aggregation), for  dicts f(key,value,aggregation)
jado.reducex   = function (d,f,i) {var k, r=i;  for (k in d) {r = f(k,d[k],r);}  return r;};

// Jado internal helpers continued -- typeOf, cloneType, deepClone 
// clones an empty type of same type as x.  only use for core types
jado.cloneType = function (x)     {var r = {"string":"","number":0,"object":{},"array":[], "function":function (x){return x;} }; return r[_to(x)];};

// returns true if x is an iterable container (e.g. array, dictionary, uintarray).  For purposes of JADO internal usage, isList(string) returns false by design.  while it
// is technically true that strings are a list of characters, most string related tasks are not character based but pattern based (eg. regex, tokenized, parsed etcg).  To treat a string
// as an array of characters, in a JADO sense, use the supplied jado.s2a() and jado.a2s() functions (string2array, array2string)
//jado.isList= function(x)     {return ["object","array","uint"].indexOf(_to(_v(x))) >= 0} 
//jado.isList= function(x)     {return (["object","array"].indexOf(typeof _v(x)) >= 0);} //fails on Date()
jado.isList    = function(x)     {var v=_v(x); if ("array" === _to(v)) return true;  if (_to(v)=="string") return false; if (Object.keys(v).length > 0) return true; return false} //fails on Date()

// crude deep copy by value of an object as long as no js dates or functions
jado.deepClone = function (x)     {return JSON.decode(JSON.encode(x));};

//A useable typeof operator.  See this fantastic reference: 
//https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
jado.typeOf    = function(x)      {return ({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase()};

//returns value of x, useful for when x is a function instead of a data type 
jado.getValue  = function (x)     {return _to(x) == "function" ? x():x;};

//array to string, and string to array, sometimes useful to make string mutable, or iterable.  note that if an element of an array is a function eg [2,3,function()return{3+2}] a2s will evaluate
//the function by default. use a2s(myArray,false) to prevent this
jado.a2s       = function(a,e)    {return _r(a,function(v,i){ if (e!=false) return i+_v(v).toString(); return i+v.toString();},"")};
jado.s2a       = function(s)      {return _r(s,function(v,i){i.push(v); return i;},[])};

//internally used syntactic sugar (short hand) but also availble for external use
var _f      = jado._f  = jado.filter;       //filter              
var _fx     = jado._fx = jado.filterx;      //filter with key,value
var _r      = jado._r  = jado.reduce;       //reduce
var _rx     = jado._rx = jado.reducex;      //reduce with key, value
var _m      = jado._m  = jado.map;          //map
var _mx     = jado._mx = jado.mapx;         //map with key, value
var _dc     = jado._dc = jado.deepClone;    //clone the value of an object
var _ct     = jado._ct = jado.cloneType;    //clone an empty type of the same type of object
var _to     = jado._to = jado.typeOf;       //typeOf but produces useful output for sub types e.g. not just "object" for everything
var _v      = jado._v  = jado.getValue;     //not to be confused with built-in valueOf(), allows lazy eval of functions which may be members of arrays or  dicts
var _il     = jado._il = jado.isList;       //returns whether a object is iterable in a for ... in sense.  But not for strings (see notes)

//    def collapseWS(self,s): #collapse and sequence of space, tabs, newlines etc to a single space
//        return ' '.join(s.split())
//
//
//======================================================
//jado operates on a simulated tree based dom which is "like" XML or HTML internally.
//each node contains a tag, attributes, content which use the internal conventions:
// {t: "", a: {}, c[]} // all proper Jado notes *must* have this form for Jado functions to work properly.
// where t must be a string of 0 or more chars, a is an optional dict of key-value pairs, and c[] is an
// array of content which can be 0 ore members of either strings, numbers, or other nodes of the
// internal jado form: {t,a,c}
//checks to see supplied dict is a special dict of 0 or members such that 
//each key is a string and each value is a string, number, or function but not an array or dict
//attrib can be "foo=bar" or dict with string:string mappings or string:number.toString() mappings
//content can be string or [] of which each member of the array must have proper form {t: a: c:}
jado.checkNodeForm = function (obj) {
    //t must be a string
    if ("t" in obj)  
        if (_typeof(obj[t]) != "string")
            return false;
    else
        return false;

    //a must be either a string of this form "foo=bar" or a dictionary of {"foo": "bar"} where
    //each key must be a string and each value may be a string or number
    if ("a" in obj)  
        if (_to(obj["t"]) != "string")
            return false;
    else
        return false;

    //content can be string or [] of which each member of the array must have proper form {t: a: c:}                
    if (_typeof(c) == "string") //leaf node and here is the value.  "" is a valid value
        return true;
    if (_typeof(c) == "array") //now we recursively check each member of the array to be of proper form
        return _r(obj[c],checkNodeForm,0)==obj[c].length;
    return true;
}

//check if a dictionary is suitable for a tac node object
jado.isAtrDict = function (d) {
    if (_to(d) == "object") {
        for (var a in d) {
            if ((_to(a) != "string")||(["string","number","function"].indexOf(_to(d[a])) < 0))
                return false;
        }
    }
    return true;
}

//make a new "proper" node from components
//tagtype must be string
//attrib can be "foo=bar" or dict with string:string mappings or string:number.toString() mappings
//content can be string or [] of which each member of the array must have proper form {t: a: c:} or be a string
// working mixed type version
//makeNode = function (tag,attrib,content) {
//    //TODO check proper input form
//    var xc = [];
//    if (_to(content)=="array")  {
//        xc=_r(content,function(x,i){if(_to(x)=="array") {i.push(makeNode(x.t,x.a,x.c))} else {i.push(x)}; return i;},[]);
//    }
//    else
//        xc= (_to(content)=="object") ? [content] : content;    
//    return {"t":tag.toString(), "a":isAtrDict(attrib)?attrib:{}, "c":xc}
//}

jado.makeNode = function (tag,attrib,content) {
    //TODO check proper input form
    xc = [];
    if (_to(content)=="array")  
        xc=_r(content,function(x,i){if(_to(x)=="array") {i.push(makeNode(x.t,x.a,x.c))} else {i.push(x)}; return i;},[]);
    else
        xc= [content]; //bare node, or string, or number   
    return {"t":tag.toString(), "a":jado.isAtrDict(attrib)?attrib:{}, "c":xc}
}
jado.emitHTMLStr=function(d) {
    var html = "";
    //TODO checkNodeForm() if fail then return ""
    if (_to(d)=="array") {
        html=_r( d, function(e,i) {return i+jado.emitHTMLStr(e);}, html);
    }         
    else if  (_to(d)=="object"){
        html += "<"+d.t+" "+_rx(d.a,function(k,v,i){i+= k+'="'+v+'" '; return i;},"")+">";
        //html += (_to(d.c) == "array") ? _r(d.c,function(v,i){i+=emitHTMLStr(v); return i;},"") : d.c;
        html += _r(d.c,function(v,i){i+=jado.emitHTMLStr(v); return i;},"");
        html += "</"+d.t+">";
    } 
    else if (_to(d)=="function") {
        html +=jado.emitHTMLStr(d());
    }
    else
        html += d; 
    return html;
}
//pretty print a jado node with html formatted output.  returns a string containing HTML for debugging / code viewing
jado.prettyPrintHTML = function(d,t) {
    var html = "";
    var sts = "<span style='color:blue'>", sas = "<span style='color:red'>", scs = "<span style='color:green'>";
    var se  = "</span>", tab="&nbsp;&nbsp;&nbsp;&nbsp;"; //default 'tab' stops
    var h = jado.htmlSafeStr; 
    t = (typeof t == "undefined") ? 0 : t; 
    var ts = function(t) { var s=""; for (c=0; c< t; c++) s+=tab; return s;};
    console.log(ts(t).length);
    //TODO checkNode() if fail then return ""
    if (_to(d) == "array") {
        html = _r(d,function(e,i) {return i+prettyPrintHTML(e,t+1);},html);
    }
    else {
        html += ts(t)+sts+h("<")+h(d.t) +se;
        var k,a=""; 
        for (k in d.a) 
            html+= ' '+sas+h(k+'="'+d.a[k])+'"'+se;
        html += sts+h(">")+se+'<br />';
        if (_to(d.c) == "array") {
            for (k in d.c) {
                if (_to(d.c[k]) == "string")
                    html+=ts(t+1)+jado.htmlSafeStr(d.c[k])+"<br />";
                else if (_to(d.c[k]) == "function")
                    html+=ts(t+1)+jado.htmlSafeStr(d.c[k]())+"<br />";
                else
                    html+=jado.prettyPrintHTML(d.c[k],t+1)
            }
        }
        else
            html +=ts(t+1)+ scs+ d.c+se+'<br />'; //remember this needs to be recursive eg 
        html += ts(t)+sts+h("</")+d.t+h(">")+se+'<br />';
    }  
    return "<span style='font-family:courier;font-size:10pt'>"+html+"</span>";
}

//generic pretty print a json object with html formatted output.  returns a string containing HTML
jado.prettyPrintJSON=function (json) {
	function f(json) {
		json = JSON.stringify(json, undefined, 2);
		if (typeof json != 'string') { json = JSON.stringify(json, undefined, 2);}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var sty = 'color: darkorange;';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
				    sty = 'color:red';
				} else {
				    sty = 'color:purple';
				}
			} else if (/true|false/.test(match)) {
				sty = 'color:grey';
			} else if (/null/.test(match)) {
				sty = 'color:black';
			} else
			    sty = 'color:green';
			return '<span style="' + sty + '">' + match + '</span>';
		});
	}
	return "<pre style=''>"+f(json)+"</pre>";
}

jado.prettyPrintJSON2=function (json) {
    var html = "";
    var f= function (j) {
        sw = {
            "object" : function () {_rx(j,function(k,v,i){return i+" "+k+":"+f(v)+",<br />";},html)},
            "array"  : function () {_rx(j,function(k,v,i){return i+" "+k+":"+f(v)+",<br />";},html)},
            "string" : function () {return  html+j;},
            "number" : function () {return  html+j;}
        }
    }
        if (_to(json) in sw)
            sw[_to(json)]();
        else
            html += json;
    return html;
}

//helper function replaces non valid HTML with HTML escaped equivalents.   
jado.htmlSafeStr = function (str) {
       return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/*
htmlSafeStr2 = function(str) {
    map(s2a[str],function(x){y=['&','&amp','<','&lt','>','&rt','"','&quot'].indexOf(x); return y<0 ? x : y);
}
*/
jado.memb = function() {
    return _s2a("this is a test");
}

console.log("end of __jado_extended");
   // return this;


//jado=__jado_extended_definition;
 
        //var jado=new __jado_extended_definition;
        //var foo=3;
        //jado.bar = function(){ return "bar"};
        //jado.barf = function(){ foo+=1; return foo;};
        console.log("iife");
        return jado;
        
    
})(window.jado = window.jado || {});
