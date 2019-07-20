/*
 *  jado.js  --- Jado Aggregated Data Operations
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
//usage in browser
//<script type="text/javascript" src="./jado.js"></script>

//usage in nodejs
//var jado = require('./jado.js')["jado"];  //adds to current scope

/*JADO ->  Jado Aggregated Data Output  - or is that
           Jado Assisted Data Oddities  
  who knows..   really I was just looking for a punny recursive name :)  
  which sounds like JATO and to say I wrote a mini lib with a recursive acronym. 

Usage and Purpose:
Document Object Model (DOM) for JADO mirrors HTML / XML tree structure    
<tagname attrib1 = "value1" attrib2 = "value2">content_array[  ]</tag>

{ _t: "tag",
  _a: {"attrib1" : "value1", "attrib2" : "value2" }.
  _c: "content" or [array of tag nodes] //string for content or array of these types of nodes
}

universal bulky internal decoding but allows injection w/o special parseing eg without {} or _foo
if HTML output then can force all attribs and value to be strings as 'grammar' check
{ "tagtype" : "div",  //string -- node type
   "attrib" : { "attrib1"  : "value1"},   //dictionary of attributes
   "content": []                          //array of objects of this type. if empty set to ""
}

A (HTML DOM) document consists of an array of such tag objects e.g. doc = [ , , , , , ]
can abbreviate each item as t, a, c
dom IDs etc are just attibutes
templatable params are just functions()
can output this "DOM" to HTML or PDF or ... since form is preserved.
can be encoded as JSON (even functions using toString and )


*/

//begin Code
(function(jado){

//internall used debug mode can be toggled on or off.
var _dbg= false;
jado.setDebug    = function(v)   { if (v) _dbg=true; else _debug=false;}
jado.getDebug    = function()    { return _dbg; }


//Jado internally used helper Functions -- map,filter,reduce, which are used "blindly" 
//internally in Jado because they work on mixed types e.g you can use map / filter / reduce on dictionaries
//or strings not just arrays.  They do not modify the original data structure ("no sideeffects")
//also works on atomic items such as numbers, bools, etc.  

// map(),    used internally, works on [] or {}
jado.map       = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {r[k]=f(_v(d[k]));} else r=f(_v(d));  return r; }; 

// mapx(), allows iterator to work on both key and value
// requires requires f to take 2 params: for arrays f(index,value), for  dicts f(key,value)
jado.mapx      = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {r[k]=f(k,_v(d[k]));} else r=f(_v(d)); return r; }; 

// filter, used internally, works on [] or {}
jado.filter    = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {if (f(d[k]  ) == true) {if (_to(r)=="array") {r.push(d[k])} else {r[k]=d[k]}}} else if (f(d)==true) r=d[k]; return r;}; 

// filterx(),  allows iterator to work on both key and value
// requires requires f to take 2 params: for arrays f(index,value), for  dicts f(key,value)
jado.filterx   = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {if (f(k,d[k]) == true) {if (_to(r)=="array") {r.push(d[k])} else {r[k]=d[k]}}} else if (f(d)==true) r=d[k]; return r;}; 

// reduce(), used internally, works on [] or {}
jado.reduce    = function (d,f,i)   {var k, r=i;  if(_il(_v(d))) for (k in d) {r = f(d[k],r);} else {r = f(d,r);}  return r;}; 

// reducex(), used internally, works on [] or {}, allows access to index or key for each element, 
// requires requires f to take 3 params: for arrays f(index,value,aggregation), for  dicts f(key,value,aggregation)
jado.reducex   = function (d,f,i)   {var k, r=i;  if(_il(_v(d))) for (k in d) {r = f(k,d[k],r);} else {r = f(d,r);} return r;}; 

// Jado internal helpers continued -- typeOf, cloneType, deepClone 
// clones an empty type of same type as x.  only use for core types
jado.cloneType = function (x)       {var r = {"string":"","number":0,"object":{},"array":[], "function":function (x){return x;} }; return r[_to(x)];};

// returns true if x is an iterable container (e.g. array, dictionary, uintarray).  For purposes of JADO internal usage, isList(string) returns false by design.  while it
// is technically true that strings are a list of characters, most string related tasks are not character based but pattern based (eg. regex, tokenized, parsed etc).  To treat a string
// as an array of characters, in a JADO sense, use the supplied jado.s2a() and jado.a2s() functions (string2array, array2string)
//jado.isList    = function (x)       {var v=_v(x); if ("array"==_to(v)) return true;  if ("string"==_to(v)) return false; if (Object.keys(v).length > 0) return true; return false} //fails on Date()
jado.isList    = function (x)       {var t=_to(x); if ((t=="array") | (t=="object") )return true; return false;} //fails on Date()

//pass a test value x, a dictionary of choices c, and a default value def ==> returns c[x] if x in choices else default_value, works on arrays or dicts, for arrays pass index 
jado.choice    = function (x,c,def) {return (x in c) ? c[x] : def;}   

// crude deep copy by value of an object as long as no js dates or functions
jado.deepClone = function (x)       {return JSON.decode(JSON.encode(x));};

//return the length of an object in a jado sense (returns 1 if object is atomic in a Jado sense meaning strings are length 1)
jado.len       = function (x)       {if (_il(x)==false) { return 1;} else {if (_to(x) != "object") return x.length; else return Object.keys(x).length;} } 

//A useable typeof operator.  See this fantastic reference: 
//https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
jado.typeOf    = function (x)       {return (typeof x == "undefined") ? "undefined" : (({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase());};


//returns value of x, useful for when x is a regular function instead of a data type e.g. foo:function(){...}  --> data of proper form should be IIFE foo:(function(){....}) 
//jado.getValue  = function (x)       {return (_to(x) == "function") ? x():x;}; //working version
jado.getValue  = function (x,def)   {if (_to(x) == "function") return x(); return (_to(x) == "undefined")? def:x;};
jado.setValue  = function (x,def)   {return (_to(x) == "undefined")? def:x;};

//array to string, and string to array, sometimes useful to make string mutable, or iterable.  note that if an element of an array is a function eg [2,3,function()return{3+2}] a2s will evaluate
//the function by default. use a2s(myArray,false) to prevent this
jado.a2s       = function(a,e)      {return _r(a,function(v,i){ if (e!=false) return i+_v(v).toString(); return i+v.toString();},"")};
jado.s2a       = function(s)        {return _r(s,function(v,i){ i.push(v); return i;},[])};


//internally used syntactic sugar (short hand) but also availble for external use
var _f         = jado._f  = jado.filter;       //filter              
var _fx        = jado._fx = jado.filterx;      //filter with key,value
var _r         = jado._r  = jado.reduce;       //reduce
var _rx        = jado._rx = jado.reducex;      //reduce with key, value
var _m         = jado._m  = jado.map;          //map
var _mx        = jado._mx = jado.mapx;         //map with key, value
var _dc        = jado._dc = jado.deepClone;    //deep clone the value of an object
var _ct        = jado._ct = jado.cloneType;    //clone an empty type of the same type of object (works only for primitive objects eg not deep)
var _to        = jado._to = jado.typeOf;       //typeOf but produces useful output for sub types e.g. not just "object" for everything
var _v         = jado._v  = jado.getValue;     //not to be confused with JavaScript built-in valueOf(), allows lazy eval of functions which may be members of arrays or  dicts
var _sv        = jado._sv = jado.setValue;     // if x is undefined use this default value
var _il        = jado._il = jado.isList;       //returns true if an object is iterable in a "for x in y" sense.  But false for strings (see notes)
var _ch        = jado._ch = jado.choice;       //select from a dictionary or array of choices - extensible version of switch statement

//runtime version & license info
jado.version  = function() {
    return {
            'version'   : "1.0.0", 
            'about'     : "Jado is a simple library for functional Javascript operations on lists and objects.", 
            'copy'      : "(c) M A Chatterjee deftio (at) deftio (dot) com",    
            'license'   : "This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software. 	Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions: \n  1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation is required. \n  2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software. \n 3. This notice may not be removed or altered from any source distribution."};
}
    

//final push: recursive fns: recRilter, recMap, recReduce and key-value versions, and getvalue(deep-key), setvalue(deep-key) --> make "jsonxpath" compatible keys, 
//protect against circular references by making dict of keys
jado.getkv = function(d,p,r) {
    var r = _v(r,[]);
    var p = _v(p,".")+'/';
    return _rx(d,function(k,v,i){
        if (_il(v)) 
            v = jado.getkv(v,p+k,r);            
        console.log(p+k,':',v); 
        return v;
        },p);
       
}

//used for html functions such as "onclick" : function() 
jado.dispatch    = function(e,f) { if(_dbg){ console.log('dispatch: ' +e);} /* f(e)*/} //need to add table to store the f's somewhere


//jadoux begins here! 

//def collapseWS(self,s): #collapse and sequence of space, tabs, newlines etc to a single space
//     return ' '.join(s.split())
//======================================================
//jado operates on a simulated tree based dom which is "like" XML or HTML internally.
//each node contains a tag, attributes, content which use the internal conventions:
// {t: <string> a: {}, c[]} // all proper Jado notes *must* have this form for Jado functions to work properly.
// where t must be a string of 0 or more chars, a is an optional dict of key-value pairs, and c[] is an
// array of content which can be 0 ore members of either strings, numbers, or other nodes of the
// internal jado form: {t,a,c}
//checks to see supplied dict is a special dict of 0 or members such that 
//each key is a string and each value is a string, number, or function but not an array or dict
//attrib can be "foo=bar" or dict with string:string mappings or string:number.toString() mappings
//content can be string or [] of which each member of the array must have proper form {t: a: c:}
jado.checkNodeForm = function (obj) {
    //t must be a string
    if (_to(obj.t)!= "string")
        return false;
    
    if (jado.isAttrDict(obj.a)!=true)
        return false;

    //c must be an [] of which each member of the array must have proper form {t:"" a:{} c:[]} a function which reduces to a the correct type & form                  
    if (_to(obj["c"]) == "array"){ //now we recursively check each member of the array to be of proper form
        for (var i=0; i< obj["c"].length; i++) {
            if(_to(obj["c"][i]) == "object") {
                    if (jado.checkNodeForm(obj["c"][i]) != true)
                        return false;
            } else if (_to(obj["c"][i]) != "string")
                    return false;
        }
    }
    else
        return false;
    return true;
}

//check if a dictionary is suitable for a node object's attributes
jado.isAttrDict = function (d) {
    if (_to(d) == "object") {
        for (var a in d) { //could use _rx() and make this a one liner, but loop allows simple early break out
            if ((_to(a) != "string")||(["string","number","function"].indexOf(_to(d[a])) < 0))
                return false;
        }
    }
    else
        return false;
    return true;
}

/*jado.makeNode

make a new "proper" node from components
tagtype must be string
attrib can be "foo=bar" or dict with string:string mappings or string:number.toString() mappings
content can be string or [] of which each member of the array must have proper form {t: a: c:} or be a string
*/
jado.makeNode = function (tag,attrib,content) {
    //TODO check proper input form
    xc = [];
    if (_to(content)=="array")  
        xc=_r(content,function(x,i){if(_to(x)=="array") {i.push(makeNode(x.t,x.a,x.c))} else {i.push(x)}; return i;},[]);
    else
        xc= [content]; //bare node, or string, or number   
    return {"t":tag.toString(), "a":jado.isAttrDict(attrib)?attrib:{}, "c":xc}
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

//html tables are so useful they have their own function
jado.makeHTMLTable = function(data,attr) {    
    if ((_to(data) != "array") || (data.length < 1))
        return "";
    /*
    attr = (_to(attr)!="object")?{"id": "jado_tbl_"+Math.round(Math.random()*800000)} : attr;
    
    var ht= "<table "+ _rx(attrib,function(k,v,i){return i+'"'+k+'"="'+v'" '},"")+">";
    
    ht+="<thead><tr id='"+attr.id+"_row"+0+"'> ";
    ht+=_r(data[0],function(k,v,i){return i+"<th id='"+attr.id+"_col"+k+"' >"+v+"</th>"},"");    
    ht+="</tr>";
    //for (j=0; j< t[0].length; j++) {
    //    s+="<th style='text-align:left' id='"+attr.id+"_col"+j+"' >"+t[0][j]+"</th>";
    //}
    
    ht+="</thead><tbody>";
    ht+= _rx(data.slice(1,data.length),function(k,v,i){return "<tr id='"+attrib.id+"_row"+k+"'> "+_r(v,function(vj,ij){return ij+"<td"+ vj+"</td>";},i)},"");   
    
    //for (i=1; i< t.length; i++) {
    //    ht+="<tr id='"+id+"_row"+i+"'> ";
    //    
    //    for (j=0; j< t[i].length; j++) { ht+="<td>"+t[i][j]+"</td>"; }
    //    ht+="</tr>";
   // }    
    return ht+"</tbody></table>";
    */
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
//not working yet, use jado.choice() where approrpriate
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
    
    //use _ch()
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


})(typeof jado === 'undefined'? this['jado']={}: jado);

