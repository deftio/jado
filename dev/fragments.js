//=============================================================================
// old code that has been removed but might be useful .. or not :)


//jado.dispatch(event,thisobj,fnamesig){_ch(jado.dispatch.ftable(fnamesig). jado.dispatch.fname(event,thisobj);

//used for html functions such as "onclick" : function() 
jado.dispatch    = function(e,t,f) { 
    var dtable = {};
    jado.log('dispatch: ' +e+':'+t); 
    
    /* f(e)*/
} //need to add table to store the f's somewhere

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
    
    if (_to(obj) != "object") {
        jado.log(obj);
        jado.log("jado.checkNodeForm: data is not jado node");
        return false;
    }
        
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
//note needs to be isAttrDictHTML  as to disingguish from CSS  eg isAttrDictCSS
jado.isAttrDict = function (d) {
    if (_to(d) == "object") {
        for (var a in d) { //could use _rx() and make this a one liner, but loop allows simple early break out
            if ((_to(a) != "string")||(["string","number","function"].indexOf(_to(d[a])) < 0)) {
                jado.log("jado.isAttrDict:false");
                return false;
            }
        }
    }
    else {
        jado.log("jado.isAttrDict:false");
        return false;
    }
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
    var xc = [];
    if (_to(content)=="array")  
        xc=_r(content,function(x,i){if(_to(x)=="array") {i.push(makeNode(x.t,x.a,x.c))} else {i.push(x)}; return i;},[]);
    else
        xc= [JSON.stringify(content)]; //not an array then it _should_ be an atomic in which case convert it to string. bare node, or string, or number   
    return {"t":tag.toString(), "a":jado.isAttrDict(attrib)?attrib:{}, "c":xc}
}
/*jado.makeNodeA
 
make a new proper node from an array makeNodeA[tag,attrib,content]
*/
jado.makeNodeA = function(a) {
    if (_to(a) == "array") {
        if (a.length == 3)
            return jado.makeNode(a[0],a[1],a[2]);            
    }
    jado.log("jado.makeNodeA:requires array of 3 args");
    return {};
}


jado.emitHTMLStr=function(d) {
    var html = "";
    /*
    if (jado.checkNodeForm(d) != true) {
        jado.log("jado.emitHTMLStr error in input format");
        return html;
    }
    */    
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
//sortable?
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
//=============================================================================
//pretty print a jado node with html formatted output.  returns a string containing HTML for debugging / code viewing
jado.prettyPrintHTML = function(d,t) {
    var html = "";
    var sts = "<span style='color:blue'>", sas = "<span style='color:red'>", scs = "<span style='color:green'>";
    var se  = "</span>", tab="&nbsp;&nbsp;&nbsp;&nbsp;"; //default 'tab' stops
    var h = jado.htmlSafeStr; 
    t = (typeof t == "undefined") ? 0 : t; 
    var ts = function(t) { var s=""; for (c=0; c< t; c++) s+=tab; return s;};
    jado.log(ts(t).length);
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
/* iterates over all the leaf nodes of an object recursively,
   passes path,value --> to function
   TODO: 
   key-value vs path-value  --> add as boolean param? (e.g. provide full path to f or just local key
   checkR --> check circular ref
 */
jado.mapxd       = function(d,f,pk,checkR) {
    var r=[];
    
    return r;
}
//jado.applyd    = function (d,f)     {var _f = function(a,fa){ var i; if(_il(a)) {for (i in a){ a[i]=_f(a[i],fa);} return a;} return fa(a);};  return _f(d,f);}
//jado.mapx      = function (d,f)     {var k, r=_ct(d); if(_il(_v(d))) for (k in d) {r[k]=f(k,_v(d[k]));} else r=f(_v(d)); return r; }; 
