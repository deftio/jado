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


//JADO  Javascript Assisted DOM Output  - punny takeoff on JATO :)
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

jado = function () {}

// poor man's reduce, used internally, works on [] or {}
jado._r  = function (d,f,i) {var k, r=i;  for (k in d) {r = f(d[k],r);}   return r; }

// poor man's map,    used internally, works on [] or {}
jado._m  = function (d,f)   {var k, r=jado._ct(d); for (k in d) {r[k]=f(d[k]);} return r; }

// poor man's filter, used internally, works on [] or {}
//jado._f  = function (d,f)   {var k, r=jado._ct(d); for (k in d) {if (f(d[k]) == true) {r.push(d[k])}} return r;}
jado._f  = function (d,f)   {var k, r=jado._ct(d); for (k in d) { if (f(d[k]) == true) { if (jado._to(r)=="array") { r.push(d[k])} else {r[k]=d[k]}}} return r;}

// poor man's reduce_xtended, used internally, works on [] or {}, allows access to index or key for each element, 
// requires f to take 3 params: for arrays f(index,value,aggregation), for  dicts f(key,value,aggregation)
jado._rx = function (d,f,i) {var k, r=i;  for (k in d) {r = f(k,d[k],r);}   return r; }

// clones an empty type of same type as x.  (could also have ,"function":function(){})
jado._ct = function (x)     {var r = {"string":"","number":0,"object":{},"array":[]}; return r[jado._typeOf(x)];}

// crude deep copy by value of an object as long as no js dates or functions
jado._dc = function (x)     {return JSON.decode(JSON.encode(x));}

//A useable typeof operator.  See this fantastic reference: 
//https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
jado._typeOf = function(obj) {return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}
jado._to = jado._typeOf; //syntactic sugar for jado._typeOf


//======================================================
//checks to see supplied dict is a special dict of 0 or members such that 
//each key is a string and each value is a string, number, or function but not an array or dict
//attrib can be "foo=bar" or dict with string:string mappings or string:number.toString() mappings
//content can be string or [] of which each member of the array must have proper form {t: a: c:}
jado.checkNodeForm = function (obj) {
    //t must be a string
    if ("t" in obj)  
        if (jado._typeof(obj[t]) != "string")
            return false;
    else
        return false;

    //a must be either a string of this form "foo=bar" or a dictionary of {"foo": "bar"} where
    //each key must be a string and each value may be a string or number
    if ("a" in obj)  
        if (jado._typeOf(obj["t"]) != "string")
            return false;
    else
        return false;

    //content can be string or [] of which each member of the array must have proper form {t: a: c:}                
    if (jado._typeof(c) == "string") //leaf node and here is the value.  "" is a valid value
        return true;
    if (jado._typeof(c) == "array") //now we recursively check each member of the array to be of proper form
        return _r(obj[c],checkNodeForm,0)==obj[c].length;
    return true;
}

//check if a dictionaty is suitable for a tac node object
jado.isAtrDict = function (d) {
    if (jado._typeOf(d) == "object") {
        var a; 
        for (a in d) {
            if (jado._typeOf(a) != "string")
                return false;
            if (["string","number","function"].indexOf(jado._typeOf(d[a])) < 0)
                return false;
        }
    }
    return true;
}

//make a new "proper" node from components
//tagtype must be string
//attrib can be "foo=bar" or dict with string:string mappings or string:number.toString() mappings
//content can be string or [] of which each member of the array must have proper form {t: a: c:}
jado.makeNode = function (tagtype,attrib,content) {
    //TODO check proper input form
    var xc = [];
    //console.log("****************",tagtype,'|',attrib,'|',content,"----------------");
    if (jado._typeOf(content)=="array")  {
        xc=jado._r(content,
               function(x,i){if(jado._to(x)=="array") {i.push(jado.makeNode(x.t,x.a,x.c))} else {i.push(x)}; return i;},[]);
        //for (i in content) {            
        //    xc.push(jado.makeNode(content[i].t,content[i].a ,content[i].c )); //TODO support mixed string and node arrays
        //}
    }
    else
        xc= (jado._typeOf(content)=="object") ? [content] : content;    
    return {"t":tagtype.toString(), "a":jado.isAtrDict(attrib)?attrib:{}, "c":xc}
}

jado.emitHTMLStr=function(d) {
    var html = "";
    //TODO checkNodeForm() if fail then return ""
    if (jado._typeOf(d)=="array") {
        html=jado._r( d, function(e,i) {return i+jado.emitHTMLStr(e);}, html);
    }
    else if (jado._to(d)=="string") {
        html=d;
    }     
    else {
        html += "<"+d.t+" ";
        //var k,a=""; 
        //for (k in d.a) 
        //    html+= k+'="'+d.a[k]+'" ';
        html += jado._rx(d.a,function(k,v,i){i+= k+'="'+v+'" '; return i;},"");
        html += ">";
        if (jado._typeOf(d.c) == "array") { //this is where ._r which operates on arrays an strings might work
            //for (k in d.c) { html+=jado.emitHTMLStr(d.c[k]) }
            html+= jado._r(d.c,function(v,i){i+=jado.emitHTMLStr(v); return i;},"");    
        }
        else
            html +=  d.c; //remember this needs to be recursive eg 
        html += "</"+d.t+">";
    }  
    return html;
}


//generic pretty print a json object with html formatted output.  returns a string containing HTML
jado.prettyPrintJSON=function (json) {
	function f(json) {
		json = JSON.stringify(json, undefined, 2);
		if (typeof json != 'string') {
			 json = JSON.stringify(json, undefined, 2);
		}
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
			}
			return '<span style="' + sty + '">' + match + '</span>';
		});
	}
	return "<pre style=''>"+f(json)+"</pre>";
}

//helper function replaces non valid HTML with HTML escaped equivalents.   
jado.htmlSafeStr = function (str) {
       return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    if (jado._typeOf(d) == "array") {
        html = jado._r(
            d,
            function(e,i) {return i+jado.prettyPrintHTML(e,t+1);},
            html)
    }
    else {
        html += ts(t)+sts+h("<")+h(d.t) +se;
        var k,a=""; 
        for (k in d.a) 
            html+= ' '+sas+h(k+'="'+d.a[k])+'"'+se;
        html += sts+h(">")+se+'<br />';
        if (jado._typeOf(d.c) == "array") {
            for (k in d.c) {
                if (jado._to(d.c[k]) == "string")
                    html+=ts(t+1)+jado.htmlSafeStr(d.c[k])+"<br />";
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


