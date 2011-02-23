if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
OpenAjax._smash.crypto={"strToWA":function(_1,_2){
var _3=Array();
var _4=(1<<_2)-1;
for(var i=0;i<_1.length*_2;i+=_2){
_3[i>>5]|=(_1.charCodeAt(i/_2)&_4)<<(32-_2-i%32);
}
return _3;
},"hmac_sha1":function(_5,_6,_7){
var _8=Array(16),_9=Array(16);
for(var i=0;i<16;i++){
_8[i]=_5[i]^909522486;
_9[i]=_5[i]^1549556828;
}
var _a=this.sha1(_8.concat(this.strToWA(_6,_7)),512+_6.length*_7);
return this.sha1(_9.concat(_a),512+160);
},"newPRNG":function(_b){
var _c=this;
if((typeof _b!="string")||(_b.length<12)){
alert("WARNING: Seed length too short ...");
}
var _d=[43417,15926,18182,33130,9585,30800,49772,40144,47678,55453,4659,38181,65340,6787,54417,65301];
var _e=[];
var _f=0;
function _10(_11){
return _c.hmac_sha1(_d,_11,8);
};
function _12(_13){
var _14=_10(_13);
for(var i=0;i<5;i++){
_e[i]^=_14[i];
}
};
_12(_b);
return {"addSeed":function(_15){
_12(_15);
},"nextRandomOctets":function(len){
var _16=[];
while(len>0){
_f+=1;
var _17=_c.hmac_sha1(_e,(_f).toString(16),8);
for(i=0;(i<20)&(len>0);i++,len--){
_16.push((_17[i>>2]>>(i%4))%256);
}
}
return _16;
},"nextRandomB64Str":function(len){
var _18="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var _19=this.nextRandomOctets(len);
var _1a="";
for(var i=0;i<len;i++){
_1a+=_18.charAt(_19[i]&63);
}
return _1a;
}};
},"sha1":function(){
var _1b=function(x,y){
var lsw=(x&65535)+(y&65535);
var msw=(x>>16)+(y>>16)+(lsw>>16);
return (msw<<16)|(lsw&65535);
};
var rol=function(num,cnt){
return (num<<cnt)|(num>>>(32-cnt));
};
function _1c(t,b,c,d){
if(t<20){
return (b&c)|((~b)&d);
}
if(t<40){
return b^c^d;
}
if(t<60){
return (b&c)|(b&d)|(c&d);
}
return b^c^d;
};
function _1d(t){
return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;
};
return function(_1e,_1f){
_1e[_1f>>5]|=128<<(24-_1f%32);
_1e[((_1f+64>>9)<<4)+15]=_1f;
var W=Array(80);
var H0=1732584193;
var H1=-271733879;
var H2=-1732584194;
var H3=271733878;
var H4=-1009589776;
for(var i=0;i<_1e.length;i+=16){
var a=H0;
var b=H1;
var c=H2;
var d=H3;
var e=H4;
for(var j=0;j<80;j++){
W[j]=((j<16)?_1e[i+j]:rol(W[j-3]^W[j-8]^W[j-14]^W[j-16],1));
var T=_1b(_1b(rol(a,5),_1c(j,b,c,d)),_1b(_1b(e,W[j]),_1d(j)));
e=d;
d=c;
c=rol(b,30);
b=a;
a=T;
}
H0=_1b(a,H0);
H1=_1b(b,H1);
H2=_1b(c,H2);
H3=_1b(d,H3);
H4=_1b(e,H4);
}
return Array(H0,H1,H2,H3,H4);
};
}()};

