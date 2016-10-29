//move map,filter, reduce to standardized form?  --> alows removals of x function mapx reducex filterx, if k == undefined then doon't use it 
map(f(v,k))
filter(f(v,k))
reduce(f(v,i,k),i)


//because JADO treats all types as first class citizens (e.g numbers and other objects are lists of dimension 1) JADO can be used on datastructures recusrivley unlike
// lodash _.map() for example because it does these things that common js containers don't:
// treat non container objects as lists of length 1:  e.g. jado.map(3,function(v){return v*2;}) <<-- returns 6 in JADO
// evalutes in-built functions  eg.g  (jado.map([3,function(){return 5}],function(v){return v*2}) <<-- returns [6,10]
//    -->note should make this optional so one can write a function which passes each member parameters
// allows function to take key and value (lodash, others do this as well).  
//these minor extensions allow jado to operate recursively  e.g. one can call jado.map([data],function(v){return jado.map(v,function(v2){...})})  <<-- useful in recursive decent
//jado treats strings as singleton objects not arrays of chars (though supplied s2a a2s allow conversions from string to array and back) because in parsing this is much more common

idea: remove _v(x)  ??? //the user of the library can always call like this:
jado.map(data,function(a){return logic(jado._v(a))}  ; // permits user control whether to evaluate functions on the fly
    
note on recursion -- you need to wrap a recursive call to map in a function so the that the *second* level actually recurses!  Try function(a){console.log(a)} to see what is happening.

//examples
//reverse map
//reverse map with duplicate keys
//find a value in a deep object
//operate on paths:value  --> need to decide if jado.mapDeepX(d,f(p,v)) --> the p here is path but should it be the whole path or just the local (last) key?  both?

//deep equality by value

Examples
//search for something in a complex object
//complex object to string.


JADO --> a "list-functional" data library .. for me ;)  --> rename LADO?

//x suffix means key-value pairs are provided to function.  Use reverse order --> value,key?  this would make it possible to use same input function to either map or mapx (etc)
map
mapx

reduce     
reducex

filter
filterx     

choice      --> safe switch statement  
safe        --> jado version of argSafe  --> rethink this: var foo = foo | default_value  // seems to be accepted way
typeOf      --> usable typeOf : used extensively inside JADO so exposed for external use as well
cloneType   --> make an empty type of the same object as passed : used extensively inside JADO, so exposed for external use as well //needs checks for all types dates, arraybuffer etc

zip  --> combine 2 arrays like python does  (TBD)

//and finally:  deep operations on objects/arrays which allow them to be treated as lists (recursively) or make any object in to an {key-path:value} object --> Xpath like thinking but with map/filter/reduce and
//allows "subtyping" experiments
object --> paths
object --> path : value pairs  (and reverse function)

//?paths can be [,,,,,,,] or stringified "['','',..]"
jado.pv(d)--> given a path return object reference if it exists.  

//need function [,,,,,] -- a/b/d/  and a/v//dv--> [,,,,]  (e.g. convert string paths <----> [,,,,] paths)

//examples
search (conditions) return matches as array of [[path: value]] // note this is just an example of using jado.mapd or mapdx 
len  (retuns length of object.  For arrays returns array.length, for objects returns Object.keys().length, for atomics returns 1, for strings or ArrayBuffers returns 1 as these are treated atomically
lendeep (or lend) -- recursive length --> returns total number of nodes

reverse a map (with multiple values)  e.g. {a:1, b:2, c:2} <--> {1:a, 2: [b,c]}

unit test framework --> Mocha

thats IT

//final push: recursive fns: recRilter, recMap, recReduce and key-value versions, and getvalue(deep-key), setvalue(deep-key) --> make "jsonxpath" compatible keys, 
//protect against circular references by making dict of keys


/// MEANWHILE  MOVE all non data primitive items out of jado and in to companion project jadoux 

jadoux (Jado user xperience) (uses JADO)  // all {t / a / c} operations should be moved to jadoux  OpenSSR is "Just a template" in jaodoux perhaps the default one
build HTML stuff
pretty print json
pretty print html
deal with "live" report objects  //make call back an attribute with a framework to call server sider eg onclick="jadouxDispatch(event) {,..} "  then have aflexible dispatch as dict of callbacks

"live" reports


//move map,filter, reduce to standardized form?  --> alows removals of x function mapx reducex filterx, if k == undefined then doon't use it 
map(f(v,k))
filter(f(v,k))
reduce(f(v,i,k),i)


//because JADO treats all types as first class citizens (e.g numbers and other objects are lists of dimension 1) JADO can be used on datastructures recusrivley unlike
// lodash _.map() for example because it does these things that common js containers don't:
// treat non container objects as lists of length 1:  e.g. jado.map(3,function(v){return v*2;}) <<-- returns 6 in JADO
// evalutes in-built functions  eg.g  (jado.map([3,function(){return 5}],function(v){return v*2}) <<-- returns [6,10]
//    -->note should make this optional, note that a function which passes each member parameters can be accomplished by wrapping that fn in closure so that it requires no args from jsdo 
// allows function to take key and value (lodash, others do this as well).  
//these minor extensions allow jado to operate recursively  e.g. one can call jado.map([data],function(v){return jado.map(v,function(v2){...})})  <<-- useful in recursive decent
//jado treats strings as singleton objects not arrays of chars (though supplied s2a a2s allow conversions from string to array and back) because in parsing this is much more common

idea: remove _v(x)  ??? //the user of the library can always call like this:
jado.map(data,function(a){return logic(jado._v(a))}  ; // permits user control whether to evaluate functions on the fly
    
note on recursion -- you need to wrap a recursive call to map in a function so the that the *second* level actually recurses!  Try function(a){console.log(a)} to see what is happening.

//examples
//reverse map
//reverse map with duplicate keys
//find a value in a deep object
//operate on paths:value  --> need to decide if jado.mapDeepX(d,f(p,v)) --> the p here is path but should it be the whole path or just the local (last) key?  both?

//deep equality by value

Examples
//search for something in a complex object
//complex object to string.


JADO --> a "list-functional" data library .. for me ;)  --> rename LADO? 

Or JIDO --> Javascript Iteratable Data Objects  ;0


//x suffix means key-value pairs are provided to function.  Use reverse order --> value,key?  this would make it possible to use same input function to either map or mapx (etc)
//use mapkv  reducekv  filterkv  ?? then for path based mappv reducepv filter pv  --> e.g. consistent naming convetion
map
mapx

reduce     
reducex

filter
filterx     

choice      --> safe switch statement  
safe        --> jado version of argSafe  --> rethink this: var foo = foo | default_value  // seems to be accepted way
set         --> jado implementation of a "set" (allows iterables as arguments) implemented and working 20160423  
            // note that different than get/set value may want to name cset (counting set) 

typeOf      --> usable typeOf : used extensively inside JADO so exposed for external use as well
cloneType   --> make an empty type of the same object as passed : used extensively inside JADO, so exposed for external use as well //needs checks for all types dates, arraybuffer etc

len  (retuns length of object.  For arrays returns array.length, for objects returns Object.keys().length, for atomics returns 1, for strings or ArrayBuffers returns 1 as these are treated atomically
lendeep (or lend) -- recursive length --> returns total number of nodes // protect against circular refs?  with extra param?  


?zip  --> combine 2 arrays like python does  (TBD) //lodash provides this too

//and finally:  deep operations on objects/arrays which allow them to be treated as lists (recursively) or make any object in to an {key-path:value} object --> Xpath like thinking but with map/filter/reduce and
//allows "subtyping" experiments
object --> paths
object --> path : value pairs  (and reverse function)

//?paths can be [,,,,,,,] or stringified "['','',..]"
jado.p2v(d,p)--> given a path return object reference if it exists.  

//need function [,,,,,] -- a/b/d/  and a/v//dv--> [,,,,]  (e.g. convert string paths <----> [,,,,] paths)

//examples
search (conditions) return matches as array of [[path: value]] // note this is just an example of using jado.mapd or mapdx 



reverse a map (with multiple values)  e.g. {a:1, b:2, c:2} <--> {1:a, 2: [b,c]}

unit test framework --> Mocha
move current jado unit test _unit... --> to new project or make part of useful Junk

thats IT

//final push: recursive fns: recRilter, recMap, recReduce and key-value versions, and getvalue(deep-key), setvalue(deep-key) --> make "jsonxpath" compatible keys, 
//protect against circular references by making dict of keys


/// MEANWHILE  MOVE all non data primitive items out of jado and in to companion project jadoux 

jadoux (Jado user xperience) (uses JADO)  // all {t / a / c} operations should be moved to jadoux  OpenSSR is "Just a template" in jaodoux perhaps the default one
build HTML stuff
pretty print json
pretty print html
deal with "live" report objects  //make call back an attribute with a framework to call server sider eg onclick="jadouxDispatch(event) {,..} "  then have aflexible dispatch as dict of callbacks
example of category filter eg _m(obj) --> bins , also histogram examples 
"live" reports --> call back functions, use class mechanism developed in spannit as starter


fix:list=========
fix: deepClone
for _deep functions add circular reference detection (?)
jado.log //bug, does not accept arrays [] properly
pathNorm // empty paths need consistency
pathNorm // make passed arrays safe like str2path does?  If so borrow norming code from str2path?
p2v // define behavor for no path
tabilify --> takes an (deep) object { .. } returns
[[ key, key, key, value], ...... ] 
reverse tabilify
allow save/load from CSV or JSON --> e.g. toString() either actual filesave can be in usefuljunk()

for core _r, _m, _mx etc replace for(i in a) with for(var i=0; i<a.length; a++) for js arrays because of this discussion:     
 --> http://stackoverflow.com/questions/500504/why-is-using-for-in-with-array-iteration-such-a-bad-idea
 --> probably best way is use native array.map/filter/reduce when array, for..in for {}, 
 --> for functions eg o=function(){} ...  --> used as input to jado --> jado.map(o,..) evaluate the function with no params.
    (continued from previous discussion).  reasoning is this.  If the user wants jado to iterate over the function's members they can
    supply a wrapper function such as: f2owrap(){var wrap={}; for (let i in o) {wrap[i]=o[i]} return wrap;})

jado:cset --> add common math ops  max(optional n), min(optional n), avg() med(optional n), std(), var(), --> optional n is top N or bottom n or middle n for max,min,med respectively
jado:set --> clone, union, intersect, add(cset), dec(cset), del(cset)
all cset as one of the input parameters to all cset functions where it makes sense (e.g add, del, dec, set).  if add,del,dec only uses cset.keys() if set uses keys:counts 

fix jado.map/filter/replace to mimic calling order of array.map/filter/replace eg
   (intiial,value,key,array-object)
   this eliminates need for "x" functions filterx, mapx reducex.
   for old map,filter,reduce map to new suffix and leave as mapv filterv reducev  (value only)
   

  
