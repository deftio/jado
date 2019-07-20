
/* jado path-->string-path  
   takes path of form ["path","to" ,"object" ,"can include /" ," and \ with proper escaping" ] ==> "path/to/object/can include \// and \\ with proper escaping"
 */
jado.pathToStr = function(p) {  return _m(p,(function(x){return(x.toString().replace("\\","\\\\")).replace("/","\\/");})).join("/")};
    
/* jado string--->path
   takes path of form 
        ["path","to" ,"object" ,"can include /" ," and \ with proper escaping" ]
   converts to 
        "path/to/object/can include \// and \\ with proper escaping"
*/
jado.strToPath = function(s) {
    var p=[],i=0k="";
    for (i=0; i< s.length; i++) {
        if (s[i]=="\\"){
            if ((s[i+1] == "\\") || (s[i+1] == "/")) { //allowed escaped chars
                k+=s[i+1];
                i++;
            }
            else
                k+=s[i];
        }
        else if (s[i] == "/"){ //its not escaped
            p.push(k);
            k="";
        }
        else
            k+=s[i]
    }
    p.push(k);
    return p;
}
jado.pathval = function(d,p) {
    var val; //will return "undefined" if nothing is found
    if (_to(p) != "string") 
        return val;
    if ((_il(d) == false) && (p=="/"))
        return d; //its an atomic var like a number or date
    try {
        var i,x=d,pathexp = p.split(/[\/](?![\/])/);
        console.log(pathexp);
        //pathexp = (pathexp[0] != "") ? pathexp: pathexp.slice(1);
       
        for (i=0; i< pathexp.length; i++) {
            if (pathexp[i] != "") {
                if (pathexp[i] in x)
                    x=x[pathexp[i]];
                else
                    return val;
            }
        }
        return x;
    }
    catch (e) {
        jado.log("jado.pathval: bad path");
    }
    return val;
}
