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


