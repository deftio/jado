/**
 * jado.js - ESM Module
 * A small library for treating any javascript objects as iterables
 * @author M A Chatterjee <deftio [at] deftio [dot] com>
 * @license BSD-2-Clause
 */

"use strict";

var jado = {};
jado.exportName = "jado"; // this is the name you give to your library in browser apps.  In nodejs this is not relavant.

//internall used debug mode can be toggled on or off.
/*
var _log= false;
jado.setLogEnable= function(v)   { _log = (v==true) ? true:false; return _log;}
jado.getLogEnable= function()    { return _log; }

//jado.log         = function()    { if(_log) console.log(Array.prototype.slice.call(arguments, 0).join(','))}; //defaults to console, can be redirected

jado.log         = function()    { if(_log) console.log(arguments)}; //defaults to console, can be redirected

//set a different log output function (default is console.log)
jado.setLogF     = function(f)   { jado.log = (_to(f)!="function") ? jado.log : function(){ if(_log) f(arguments[0])};} 
*/

//Jado internally used helper Functions -- map,filter,reduce, which are used "blindly" 
//internally in Jado because they work on mixed types e.g you can use map / filter / reduce on dictionaries
//or strings not just arrays.  They do not modify the original data structure ("no sideeffects")
//also works on atomic items such as numbers, bools, etc.  


// map takes each item and applies a function to it.
// map(),    used internally, works on [] or {}
jado.map       = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {r[k]=f(_v(d[k]));} else r=f(_v(d));  return r; }; 


// mapx(), allows iterator to work on both key and value
// requires requires f to take 2 params: for arrays f(index,value), for  dicts f(key,value)
jado.mapx      = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {r[k]=f(k,_v(d[k]));} else r=f(_v(d)); return r; }; 

// forEach(), apply function to each memmber
jado.forEach   = function (d,f)    {var k;  if(_il(_v(d))) for (k in d) {f(k,_v(d[k]));} else f(_v(d)); }; 

// filter takes each item and sees whether it passes the test supplied by the passed function
// filter, used internally, works on [] or {}
jado.filter    = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {if (f(d[k]  ) == true) {if (_to(r)=="array") {r.push(d[k])} else {r[k]=d[k]}}} else if (f(d)==true) r=d[k]; return r;}; 

// filterx(),  allows iterator to work on both key and value
// requires requires f to take 2 params: for arrays f(index,value), for  dicts f(key,value)
jado.filterx   = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {if (f(k,d[k]) == true) {if (_to(r)=="array") {r.push(d[k])} else {r[k]=d[k]}}} else if (f(d)==true) r=d[k]; return r;}; 

// reduce takes each item and aggregates using the supplied function and starting value
// reduce(), used internally, works on [] or {}
jado.reduce    = function (d,f,i)   {var k, r=i;  if(_il(_v(d))) for (k in d) {r = f(d[k],r);} else {r = f(d,r);}  return r;}; 

// reducex(), used internally, works on [] or {}, allows access to index or key for each element, 
// requires requires f to take 3 params: for arrays f(index,value,aggregation), for  dicts f(key,value,aggregation)
jado.reducex   = function (d,f,i)   {var k, r=i;  if(_il(_v(d))) for (k in d) {r = f(k,d[k],r);} else {r = f(d,r);} return r;}; 

//object to array --> useful for converting dictionaries to arrays of k/v pairs --> {1:'a',2,:'2'} --> [[1,'a'],[2,'2']]
//used internally for some operations
jado.o2a       = function (d)       {return (_il(d)) ? _rx(d,function(k,v,i){i.push([k,v]); return i;},[]): [0,d]}

// Jado internal helpers continued -- typeOf, cloneType, deepClone 
// clones an empty type of same type as x.  only use for core types
//jado.cloneType = function (x)       {var r = {"string":"","number":0,"object":{},"array":[], "function":function (x){return x;}, "date": new Date() }; return r[_to(x)];};
jado.cloneType = function (x)       {return new x.constructor()};

// returns true if x is an iterable container (e.g. array, dictionary, uintarray).  For purposes of JADO internal usage, isList(string) returns false by design.  while it
// is technically true that strings are a list of characters, most string related tasks are not character based but pattern based (eg. regex, tokenized, parsed etc).  To treat a string
// as an array of characters, in a JADO sense, use the supplied jado.s2a() and jado.a2s() functions (string2array, array2string)
//jado.isList    = function (x)       {var v=_v(x); if ("array"==_to(v)) return true;  if ("string"==_to(v)) return false; if (Object.keys(v).length > 0) return true; return false} //fails on Date()
jado.isList    = function (x)       {return _ch(_to(x),{"array":true,"object":true},false)}; //{var t=_to(x); if ((t=="array") | (t=="object") )return true; return false;} //fails on Date() //
                                    
//pass a test value x, a dictionary of choices c, and a default value def ==> returns c[x] if x in choices else default_value, works on arrays or dicts, for arrays pass index 
jado.choice    = function (x,c,def) {return (x in c) ? c[x] : def;}   

// crude deep copy by value of an object as long as no js dates or functions
//jado.deepClone = function (x)       {return JSON.parse(JSON.stringify(x));};
/*
function extend(from, to)
{
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from)
    {
        to[name] = typeof to[name] == "undefined" ? extend(from[name], null) : to[name];
    }

    return to;
}
*/
//based on stack overflow not working... correctly
jado.deepClone = function(from, to){

    if (from == null || _to(from) != "object" || _il(from)==false) return from;
    if (from.constructor in [Date,RegExp,Function,String,Number,Boolean])
        return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from)
        to[name] = _to(to[name]) == "undefined" ? jado.deepClone(from[name], null) : to[name];

    return to;
}  

//return the length of an object in a jado sense (returns 1 if object is atomic in a Jado sense meaning strings are length 1)
jado.len       = function (x)       {if (_il(x)==false) {return 1;} return (_to(x) != "object") ? x.length : Object.keys(x).length;} 

//len-deep
//return the total number of nodes in the object (recurses over all iterable items)  key-value pairs count as 1 item
//optional second param c, if true counts intermediate nodes else only counts leaf nodes. works on all types: atomic, {},[],  strings treated as 1 regardless of length
jado.lend      = function (x,c)     {var cc=(c==true)?1:0; var f=function(a,i){return _il(a) ? _r(a,f,i+cc) : i+1}; return f(x,0);} 

//A useable typeof operator.  See this fantastic reference: 
//https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
jado.typeOf    = function (x, baseTypeOnly)       {
/** 
bw.typeOf(x, baseTypeOnly) returns a useful typeOf the object.

bw.typeOf(2) // "number"
bw.typeof( function(){}) // "function"

function Car(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
}

x = new Car("Ford", "Escape", 2009);

bw.typeOf(Car)      // "function"
bw.typeOf(x)        // "Car"        ---> returns correct object type
bw.typeOf(x,true)   // "object"     ---> returns base object type 

 */

//A useable typeof operator.  See this fantastic reference for a starter 
//https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/

    if (x === null)
        return "null";

    var y = (typeof x == "undefined") ? "undefined" : (({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLocaleLowerCase()) 
    if ((y != "object") && (y != "function"))
        return y;
    if (baseTypeOnly == true) // so if undefind or anything but true
       return y; 

    var r = y;
    try {
        r =  (x.constructor.name.toLocaleLowerCase() == y.toLocaleLowerCase()) ?  y : x.constructor.name;  // return object's name e.g.
    }
    catch (e) { } /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
    return r;
};

//applyd a function to every item in an object or array (including deep leaf nodes). **Modifies** the passed object e.g. d=jado.apply(d,function(x){return "touched:"+x});
jado.applyd    = function (d,f)     {var _f = function(a,fa){ var i; if(_il(a)) {for (i in a){ a[i]=_f(a[i],fa);} return a;} return fa(a);};  return _f(d,f);}

//returns value of x, useful for when x is a regular function instead of a data type e.g. foo:function(){...}  --> data of proper form should be IIFE foo:(function(){....}) 
//jado.getValue  = function (x)       {return (_to(x) == "function") ? x():x;}; //working version
jado.getValue  = function (x,def)   {if (_to(x) == "function") return x(); return (_to(x) == "undefined")? def:x;}; //{return _ch(_to(x),{"function":x(),"undefined":def},x)}
jado.setValue  = function (x,def)   {return (_to(x) == "undefined")? def:x;};

//array to string, and string to array, sometimes useful to make string mutable, or iterable.  note that if an element of an array is a function eg [2,3,function()return{3+2}] a2s will evaluate
//the function by default. use a2s(myArray,false) to prevent this
jado.a2s       = function(a,e)      {return _r(a,function(v,i){ if (e!=false) return i+_v(v).toString(); return i+v.toString();},"")};
jado.s2a       = function(s)        {return _r(s,function(v,i){ i.push(v); return i;},[])};


//internally used syntactic sugar (short hand) but also availble for external use. Not all functions have an equivalent here
/* eslint-disable no-unused-vars */
var _f         = jado._f  = jado.filter;       //filter              
var _fx        = jado._fx = jado.filterx;      //filter with key,value
var _r         = jado._r  = jado.reduce;       //reduce
var _rx        = jado._rx = jado.reducex;      //reduce with key, value
var _m         = jado._m  = jado.map;          //map
var _mx        = jado._mx = jado.mapx;         //map with key, value
var _o2a                  = jado.o2a;          //object to array of [[k,v],...]
var _dc        = jado._dc = jado.deepClone;    //deep clone the value of an object
var _ct        = jado._ct = jado.cloneType;    //clone an empty type of the same type of object (works only for primitive objects eg not deep)
var _to        = jado._to = jado.typeOf;       //typeOf but produces useful output for sub types e.g. not just "object" for everything
var _v         = jado._v  = jado.getValue;     //not to be confused with JavaScript built-in valueOf(), allows lazy eval of functions which may be members of arrays or  dicts
var _sv        = jado._sv = jado.setValue;     // if x is undefined use this default value
var _il        = jado._il = jado.isList;       //returns true if an object is iterable in a "for x in y" sense.  But false for strings (see notes)
var _ch        = jado._ch = jado.choice;       //select from a dictionary or array of choices - extensible version of switch statement
/* eslint-enable no-unused-vars */

//runtime version & license info
jado.version  = function() {
    return {
            'version'   : "1.0.7", 
            'about'     : "Jado is a simple library operations where any variable can be treated as an iterable.  Also includes stats for counting lists (e.g. avg var med mode etc).", 
            'copy'      : "(c) M A Chatterjee.  email: deftio (at) deftio (dot) com",    
            'license'   : "BSD-2 Clause"};
}
    

/* jado.cset()  -- "counting" set
 A simple implementation of "set" used for ref counts, explosed externally as well.  
 Used internally in those functions that need circular reference counts (e.g. deep fns) 
 In general its a simple histogram counter.
 Since its a jado fn .. uses iterable thinking such as being able to add/del/cnt 
    iterables: 
    e.g. add([,,,,]) or del([,,,] or cnt([,,,] or get ([,,,])
    
 example usage:
 var mySet = new jado.cset()
 mySet.add("key");  // adds key to set, sets reference count to 1 returns 1
 mySet.add("key");  // since already in set, increases ref count to 2
 mySet.add("key");  // since already in set, increases ref count to 3
 mySet.cnt("key");  // returns 3  // this is the total time "key" has been added
 mySet.dec("key");  // returns 2  // this decrements the ref count
 mySet.add("bar");  // returns 1  // added key "bar" to set
 mySet.all();       // returns {"key":2, "bar":1"} // all counts in set
 mySet.del("bar");  // removes key "bar" from set returns 0;
 mySet.all();       // returns {"key":2}  //"bar" no longer in set
 mySet.clr();       // clears set. returns 0;
 mySet.add([1,2,3]) // adds each of 1,2,3 to the set
 mySet.ttl();       // returns 3 --> total counts of all the keys
 mySet.del([1,3])   // removes 1,3 from set
 mySet.add([1,3,3]) // adds counts to 1, 3   note that since 3 is repeated its counted twice
 mySet,dec([1,3])   // decrements counts on 1 and 3
 mySet.get(3)       // returns key-count --> {3:1}
 mySet.get([6,3])   // returns key-count --> {3:1,6:0}  //6 isn't in set so zero 
 */
jado.cset  =  function() {
    var c = {}; // closure for counts
    var  uniq    = function(x) {return Object.keys(_r(x,function(z,i){i[z]=1; return i;},{}));} //returns uniq keys in x
    //var  uniq    = function (x){return x.filter (function (v, i, arr) {return (arr.indexOf(v)==i);});};
    //these commented out versions are atomic-only and don't accept [] or {} as params
    //this.add = function(x) {c[x]=(x in c) ? c[x]+1 : 1; return c[x];} 
    //this.cnt = function(x) {return (x in c) ? c[x]:0;}                
    //this.del = function(x) {if (x in c) delete c[x]; return 0;}
    //this.dec     = function(x) {if (x in c) {c[x]-=1; if(c[x]<=0) this.del(x);} return this.cnt(x);}    
    this.add     = function(x) {_r(x,function(z,i){i[z]=(z in i) ? i[z]+1:1; return i;},c); return cnt(x);}
    this.dec     = function(x) {_m(uniq(x),function(z){if (z in c){c[z]-=1; if (c[z]<=0){delete c[z]}}}); return cnt(x)}
    this.del     = function(x) {_m(uniq(x),function(z){if (z in c) delete c[z]}); return 0;}
    this.cnt     = function(x) {return _r(uniq(x),function(z,i){return (z in c)?c[z]+i:i},0)}; //returns count of key or keys if iteratable
    this.cntk    = function()  {return Object.keys(c).length;} //total # distinct keys stored
    this.ttl     = function()  {return _r(c,function(x,i){i+=x; return i;},0)}; //total counts of all keys counted
    this.all     = function()  {return c;}
    this.clr     = function()  {c={}; return cnt();}
    this.keys    = function()  {return Object.keys(c);} //just an array of the keys
    this.get     = function(x) {var r={},i,u=uniq(x); for (i=0;i< u.length;i++) r[u[i]]=cnt(u[i]); return r;}
    this.set     = function(x) {if (_to(x) == "object"){for (var i in x){c[i]=x[i]}} return cnt(x);}; //directly set the count(s) for the given x of x's if array
    this.avg     = function()  {var a; return (cntk()<1)? a: this.ttl()/cntk();}
    this.min     = function(x) {var r= _o2a(c),y=_to(x)=="number"?x:1; r.sort(sf); return r.slice(0,y)}
    this.max     = function(x) {var r= _o2a(c),y=_to(x)=="number"?x:1; r.sort(sf); return r.slice(r.length-y)}
    this.med     = function()  {var r= _o2a(c),l=r.length; r.sort(sf); return ((l&0x1)==1)?r[l/2-0.5]:[r[l/2-1],r[l/2]];}
    this.vari    = function()  {var a=this.avg(); return _to(a)=="number" ?  _r(c,function(j,i){i+= (j-a)*(j-a); return i;},0)/this.cntk():a;}
    this.std     = function()  {var v = this.vari(); return (_to(v)=="number")?Math.sqrt(v):v;}
    this.clone   = function()  {var x = new jado.cset();  x.set(c); return x;} //creates duplicate
    this.ap2o    = function(p) {return _rx(p,function(k,v,i){i[k]=v; return i;},{});} //convert array pair list to object
    this.type    = "jado.cset"; //static type indentifier
    this.x2o     = function() {} //converts any obj to an 
    var cnt      = this.cnt;
    var cntk     = this.cntk;
    var sf       = function(a,b){return a[1]-b[1];} // used for sorts on counts
    this.u = uniq;
    /*
    init = arguments[0];
    if (typeof init != "undefined") {
        if (init.type == "jado.cset")
            {this.set(init.all()); console.log(init)}
        else
            this.add(init);
    }
    */
    return this ;  
}
/***********************
 * begin path operations 
 */
/* iterates over an object of any type.
   returns {path : value} pairs 
getkv(dataObject,function,path,results)
      

//final push: recursive fns: recRilter, recMap, recReduce and key-value versions, and 
//getvalue(deep-key), setvalue(deep-key) --> make "jsonxpath" compatible keys, 
// protect against circular references by making dict of keys
//jado.getkv = function(d,f,p,r) {
*/
jado.getkv = function(d,f,p) {
    //var r = _v(r,[]);
    p = (_to(p)=="undefined") ? "" : p+"/"; ////var p = _v(p,"")+'/';
    f = _to(f) == "function" ? f : function(x){jado.log(x)}; //hack for now
    /*return*/_rx(d,
        function(k,v){
            if (_il(v)) 
                v = jado.getkv(v,f,p+k); // jado.getkv(v,f,p+k,r);            
            //console.log(p+k,':',v);
            f(p.toString()+k.toString()+'-->'+v);
            return v;
        }
        ,p);
    return "";
}



/* jado path-->string-path  
   takes path of form ["path","to" ,"object" ,"can include /" ," and \ with proper escaping" ] ==> "path/to/object/can include \// and \\ with proper escaping"
 */
jado.pathToStr = function(p,delim,esc) { 
    delim = _to(delim)=="string"?delim[0]:"/"; 
    esc   = (_to(esc) == "string" )   ? esc  : '\\'; // default escape char is the backslash (eg C-Style strings)
    esc   = _ch(esc.length.toString(),{"0":"\\","1":esc},esc[0]); //allow only 1 char to be used as an escape char.  
    return _m(p,(function(x){return(x.toString().replace(esc,esc+esc)).replace(delim,esc+delim);})).join(delim)
};
    
/* jado string--->path
   
   takes path of form 
        "path/to/object/can include \// and \\ with proper escaping" //  "path" style form
   or
        ["path","to","object","can include /"," and  with proper escaping"]  //JSON.stringify form  TODO?
   converts to array form for internal use
        ["path","to" ,"object" ,"can include /" ," and \ with proper escaping" ]
   
   Note that regex not used becase Javascript regex doesn't support proper negative look behind.
   
   path delimiter defaults to forward slash "/" 
   pass a string in of delimiters to allow any set of delimiters subject to backslash escaping.
*/
jado.strToPath = function(s,delim, esc) {
    var p; // set to default return type.  currently an undefined var    
    delim = (_to(delim) == "string" ) ? delim: '/'; //default path delimiter is forward slash.   if the backslash is used as delim, then it will not be allowed as an escaped char
    esc   = (_to(esc) == "string" )   ? esc  : '\\'; // default escape char is the backslash (eg C-Style strings)
    esc   = _ch(esc.length.toString(),{"0":"\\","1":esc},esc[0]); //allow only 1 char to be used as an escape char.  
   
    if (_to(s) == "string") {
        var pc="",i,k="";
        try { pc = JSON.parse(s);}catch(e){} //not a parseable JSON obj but that's OK
        
        if (_to(pc) == "array") {
            for (i=0; i < pc.length; i++)
                if (_to(pc[i])!="string" && _to(pc[i])!="number")
                    return p;
            return pc;
            // this way also works and allows compound structures (e.g treat as an unsafe array [ ,,,,]) 
            //   in the indeces but this may be confusing or dangerous design.
            //p=[];
            //return _r(pc,function(x,i){i.push(x.toString()); return i;},[]);             
        }
        
        //treat path as "path-style" representation
        p=[];
        for (i=0; i< s.length; i++) {
            if (s[i]==esc){
                if ((s[i+1] == esc) || (delim.indexOf(s[i+1]) != -1 )) { //allowed escaped chars
                    k+=s[i+1];
                    i++;
                }
                else
                    k+=s[i];
            }
            else if (delim.indexOf(s[i]) != -1){ //its not escaped an escaped path delimiter
                p.push(k);
                k="";
            }
            else
                k+=s[i]
        }
        p.push(k);
        return p;
    }
    return p; 
}


/* pathNorm takes any valid path construct and returns a path of form [ , , , ,] for use by p2v
*/
jado.pathNorm   = function(p,delim,esc) { var t = _to(p); return _ch(t,{"array":p,"string":jado.strToPath(p,delim,esc),"number":[p.toString()]},[]); }
    
/* ==========================================
 jado.p2v(d,p)
 given a data object d and a path p find the value d[p].
 
 for example
 jado.p2v({"this":"that","test":[1,2,3,4,[4,5]]},"this")     -->"that"
 jado.p2v({"this":"that","test":[1,2,3,4,[4,5]]},"test")     -->[1,2,3,4,[4,5]]
 jado.p2v({"this":"that","test":[1,2,3,4,[4,5]]},"test/3")   -->4
 jado.p2v({"this":"that","test":[1,2,3,4,[4,5]]},"test/5/1") -->5
 
 Note: if d is an atomic and path is "" its value is returned.
 eg
 jado.p2v(34,"")     --> 34;
 jado.p2v("this","") --> "this"
 
 if the path doesn't resolve, then an undefined object is returned
 eg
 jado.p2v([2,4],"55") --> undefined
 also
    typeof jado.p2v([2,4],"55") == "undefined"   //this is a true statement
   
 TODO: add default return value if object not found, like _ch
 p2v(obj,path,default) --> if obj[path] == 'undefined' --> return default
 */

jado.p2v        = function(d,p,delim,esc) {
    var val; // will return undefined if nothing found
    p = (_to(p)=="undefined") ? []: jado.pathNorm(p,delim,esc);
    if (_il(d) == false) {//its an atomic var like a number or date
        return (p.length==0)?d:val; 
    }
    try {
        var i,x=d;       
        for (i=0; i< p.length; i++) {            
            if (p[i] in x)
                x=x[p[i]];
            else
                return val;            
        }
        return x;
    }
    catch (e) {
        jado.log("jado.p2v: bad path");
    }
    return val;
}


//generic pretty print a json object with html formatted output.  returns a string containing HTML
jado.prettyPrintJSON=function (json) {
	function f(json) {
		json = JSON.stringify(json, undefined, 2);
		if (typeof json != 'string') { json = JSON.stringify(json, undefined, 2);}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
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
//not working yet, use jado.choice() where approrpr
//helper function replaces non valid HTML with HTML escaped equivalents.   
jado.htmlSafeStr = function (str) {
       return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
    // return module
    export default jado;
export { jado };
