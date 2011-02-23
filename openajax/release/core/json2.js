if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?"0"+n:n;
};
if(typeof Date.prototype.toJSON!=="function"){
Date.prototype.toJSON=function(_1){
return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(_2){
return this.valueOf();
};
}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,_3=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,_4,_5,_6={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},_7;
function _8(_9){
_3.lastIndex=0;
return _3.test(_9)?"\""+_9.replace(_3,function(a){
var c=_6[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
})+"\"":"\""+_9+"\"";
};
function _a(_b,_c){
var i,k,v,_d,_e=_4,_f,_10=_c[_b];
if(_10&&typeof _10==="object"&&typeof _10.toJSON==="function"){
_10=_10.toJSON(_b);
}
if(typeof _7==="function"){
_10=_7.call(_c,_b,_10);
}
switch(typeof _10){
case "string":
return _8(_10);
case "number":
return isFinite(_10)?String(_10):"null";
case "boolean":
case "null":
return String(_10);
case "object":
if(!_10){
return "null";
}
_4+=_5;
_f=[];
if(Object.prototype.toString.apply(_10)==="[object Array]"){
_d=_10.length;
for(i=0;i<_d;i+=1){
_f[i]=_a(i,_10)||"null";
}
v=_f.length===0?"[]":_4?"[\n"+_4+_f.join(",\n"+_4)+"\n"+_e+"]":"["+_f.join(",")+"]";
_4=_e;
return v;
}
if(_7&&typeof _7==="object"){
_d=_7.length;
for(i=0;i<_d;i+=1){
k=_7[i];
if(typeof k==="string"){
v=_a(k,_10);
if(v){
_f.push(_8(k)+(_4?": ":":")+v);
}
}
}
}else{
for(k in _10){
if(Object.hasOwnProperty.call(_10,k)){
v=_a(k,_10);
if(v){
_f.push(_8(k)+(_4?": ":":")+v);
}
}
}
}
v=_f.length===0?"{}":_4?"{\n"+_4+_f.join(",\n"+_4)+"\n"+_e+"}":"{"+_f.join(",")+"}";
_4=_e;
return v;
}
};
if(typeof JSON.stringify!=="function"){
JSON.stringify=function(_11,_12,_13){
var i;
_4="";
_5="";
if(typeof _13==="number"){
for(i=0;i<_13;i+=1){
_5+=" ";
}
}else{
if(typeof _13==="string"){
_5=_13;
}
}
_7=_12;
if(_12&&typeof _12!=="function"&&(typeof _12!=="object"||typeof _12.length!=="number")){
throw new Error("JSON.stringify");
}
return _a("",{"":_11});
};
}
if(typeof JSON.parse!=="function"){
JSON.parse=function(_14,_15){
var j;
function _16(_17,key){
var k,v,_18=_17[key];
if(_18&&typeof _18==="object"){
for(k in _18){
if(Object.hasOwnProperty.call(_18,k)){
v=_16(_18,k);
if(v!==undefined){
_18[k]=v;
}else{
delete _18[k];
}
}
}
}
return _15.call(_17,key,_18);
};
cx.lastIndex=0;
if(cx.test(_14)){
_14=_14.replace(cx,function(a){
return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.test(_14.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){
j=eval("("+_14+")");
return typeof _15==="function"?_16({"":j},""):j;
}
throw new SyntaxError("JSON.parse");
};
}
})();

