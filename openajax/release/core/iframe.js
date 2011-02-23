if(typeof OpenAjax==="undefined"){
window.OpenAjax={};
}
if(typeof OpenAjax.hub==="undefined"){
window.OpenAjax.hub={};
}
(function(){
OpenAjax.hub.IframeContainer=function(_1,_2,_3){
if(!_1||!_2||!_3||!_3.Container||!_3.Container.onSecurityAlert||!_3.IframeContainer||!_3.IframeContainer.parent||!_3.IframeContainer.uri||!_3.IframeContainer.tunnelURI){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _4=this;
var _5=_3.Container.scope||window;
var _6=false,_7=false,_8=false;
var _9={};
var _a;
var _b;
var _c;
var _d;
var _e=_3.IframeContainer.timeout||15000;
var _f;
if(_3.Container.log){
var log=function(msg){
try{
_3.Container.log.call(_5,"IframeContainer::"+_2+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._init=function(){
_1.addContainer(this);
_d=_61();
_c=_10(_2,this);
_b=_72(_3,_5,log,_d.type==="FIM"?6:null);
var _11={receiver:this,receiverId:_c,securityToken:_b,uri:_3.IframeContainer.uri,tunnelURI:_3.IframeContainer.tunnelURI,log:log};
if(_2!==_c){
_11.name=_2;
}
_d.addReceiver(_11);
_12();
_d.postAdd(_c,document.getElementById(_c));
_13();
};
this.sendToClient=function(_14,_15,_16){
_17("pub",{t:_14,d:_15,s:_16});
};
this.remove=function(){
_18();
_d.removeReceiver(_c);
clearTimeout(_f);
_19(_c);
};
this.isConnected=function(){
return _6;
};
this.getClientID=function(){
return _2;
};
this.getPartnerOrigin=function(){
if(_6){
return _a;
}
return null;
};
this.getParameters=function(){
return _3;
};
this.getHub=function(){
return _1;
};
this.getIframe=function(){
return document.getElementById(_c);
};
this.transportReady=function(_1a,_1b,_1c,_1d){
if(!_1c){
if(_1d.securityAlert){
_1e(_1d.securityAlert);
}
return;
}
_a=_1d.partnerOrigin;
};
this.receiveMsg=function(msg){
switch(msg.m){
case "pub":
_1.publishForClient(this,msg.p.t,msg.p.d);
break;
case "sub":
var _1f="";
try{
_9[msg.p.s]=_1.subscribeForClient(this,msg.p.t,msg.p.s);
}
catch(e){
_1f=e.message;
}
_17("sub_ack",{s:msg.p.s,e:_1f});
break;
case "uns":
var _20=_9[msg.p.s];
_1.unsubscribeForClient(this,_20);
delete _9[msg.p.s];
_17("uns_ack",{s:msg.p.s});
break;
case "con":
_7=true;
_21();
break;
case "dis":
_13();
_18();
_17("dis_ack",null);
if(_3.Container.onDisconnect){
try{
_3.Container.onDisconnect.call(_5,this);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
break;
}
};
this.securityAlert=function(_22){
_1e(_22);
};
function _12(){
var _23=document.createElement("iframe");
_23.id=_c;
_23.name=_c;
var _24=_3.IframeContainer.iframeAttrs;
if(_24){
for(var _25 in _24){
switch(_25){
case "id":
case "name":
log("Ignoring 'id' or 'name' property in 'iframeAttrs' -- "+"these attributes on the iframe are used for "+"internal purposes.");
break;
case "style":
for(var _26 in _24.style){
_23.style[_26]=_24.style[_26];
}
break;
default:
_23[_25]=_24[_25];
}
}
}
_23.style.visibility="hidden";
_23.src="javascript:\"<html></html>\"";
_3.IframeContainer.parent.appendChild(_23);
_23.src=_d.getURI();
_3.IframeContainer.parent=null;
};
var _19=function(){
if(navigator.appName==="Microsoft Internet Explorer"){
return function(id){
var _27=document.getElementById(id);
_27.onreadystatechange=function(){
if(_27.readyState=="complete"){
_27.onreadystatechange=null;
_27.outerHTML="";
_27=null;
}
};
_27.src="";
};
}else{
return function(id){
var _28=document.getElementById(id);
_28.parentNode.removeChild(_28);
_28=null;
};
}
}();
function _17(_29,_2a){
var _2b={m:_29,i:_c,r:"..",t:_b,p:_2a};
_d.sendMsg(_c,_2b);
};
function _21(){
if(!_8||!_7){
return;
}
_6=true;
clearTimeout(_f);
document.getElementById(_c).style.visibility="visible";
_17("con_ack",null);
if(_3.Container.onConnect){
try{
_3.Container.onConnect.call(_5,_4);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onConnect callback to constructor: "+e.message);
}
}
};
function _18(){
if(_6){
_6=false;
document.getElementById(_c).style.visibility="hidden";
for(var s in _9){
_1.unsubscribeForClient(_4,_9[s]);
}
_9={};
}
};
function _10(id,_2c){
while(OpenAjax.hub.IframeContainer._containers[id]){
id+="_"+((32767*Math.random())|0).toString(16);
}
OpenAjax.hub.IframeContainer._containers[id]=_2c;
return id;
};
this._tunnelLoaded=function(_2d){
_2d.onunload=_2e;
_8=true;
_68();
_21();
};
function _2e(){
if(_6&&!_66){
_1e(OpenAjax.hub.SecurityAlert.FramePhish);
}
};
function _1e(_2f){
try{
_3.Container.onSecurityAlert.call(_5,_4,_2f);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
function _13(){
_f=setTimeout(function(){
_1e(OpenAjax.hub.SecurityAlert.LoadTimeout);
_4.receiveMsg=function(){
};
},_e);
};
this._init();
};
OpenAjax.hub.IframeHubClient=function(_30){
if(!_30||!_30.HubClient||!_30.HubClient.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _31=this;
var _32=_30.HubClient.scope||window;
var _33=false;
var _34=false;
var _35={};
var _36=0;
var _37,_38,_39;
var _3a;
if(_30.HubClient.log){
var log=function(msg){
try{
_30.HubClient.log.call(_32,"IframeHubClient::"+_37+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
var _3b;
this._init=function(){
_3b=_61();
_39=_72(_30,_32,log,_3b.type==="FIM"?6:null);
_37=_3b.addReceiver({receiver:this,receiverId:"..",securityToken:_39,log:log});
if(!_37){
throw new Error(OpenAjax.hub.Error.WrongProtocol);
}
};
this.connect=function(_3c,_3d){
_3d=_3d||window;
if(_34){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
if(_3c){
this._connectCallback={func:_3c,scope:_3d};
}
if(_33){
_3e("con",null);
}else{
this._connectPending=true;
}
};
this.disconnect=function(_3f,_40){
_40=_40||window;
if(!_34){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
_34=false;
if(_3f){
this._disconnectCallback={func:_3f,scope:_40};
}
_3e("dis",null);
};
this.getPartnerOrigin=function(){
if(_34){
return _3a;
}
return null;
};
this.getClientID=function(){
return _37;
};
this.subscribe=function(_41,_42,_43,_44,_45){
_46();
_47(_41);
if(!_42){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
_43=_43||window;
var _48=""+_36++;
_35[_48]={cb:_42,sc:_43,d:_45,oc:_44};
_3e("sub",{t:_41,s:_48});
return _48;
};
this.publish=function(_49,_4a){
_46();
_4b(_49);
_3e("pub",{t:_49,d:_4a});
};
this.unsubscribe=function(_4c,_4d,_4e){
_46();
if(!_4c){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!_35[_4c]||_35[_4c].uns){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
_4e=_4e||window;
_35[_4c].uns={cb:_4d,sc:_4e};
_3e("uns",{s:_4c});
};
this.isConnected=function(){
return _34;
};
this.getScope=function(){
return _32;
};
this.getSubscriberData=function(_4f){
_46();
if(_35[_4f]){
return _35[_4f].d;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getSubscriberScope=function(_50){
_46();
if(_35[_50]){
return _35[_50].sc;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getParameters=function(){
return _30;
};
this.transportReady=function(_51,_52,_53,_54){
if(!_53){
if(_54.securityAlert){
_55(_54.securityAlert);
}
return;
}
_38=_51;
_3a=_54.partnerOrigin;
_33=true;
if(this._connectPending){
delete this._connectPending;
_3e("con",null);
}
};
this.receiveMsg=function(msg){
var _56,_57;
switch(msg.m){
case "pub":
_56=msg.p.s;
if(_35[_56]&&!_35[_56].uns){
try{
_35[_56].cb.call(_35[_56].sc,msg.p.t,msg.p.d,_35[_56].d);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onData callback to subscribe(): "+e.message);
}
}
break;
case "sub_ack":
_56=msg.p.s;
_57=_35[_56].oc;
if(_57){
try{
delete _35[_56].oc;
_57.call(_35[_56].sc,_56,msg.p.e==="",msg.p.e);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to subscribe(): "+e.message);
}
}
break;
case "uns_ack":
_56=msg.p.s;
if(_35[_56]){
_57=_35[_56].uns.cb;
if(_57){
try{
_57.call(_35[_56].uns.sc,_56,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to unsubscribe(): "+e.message);
}
}
delete _35[_56];
}
break;
case "con_ack":
_34=true;
if(this._connectCallback){
try{
this._connectCallback.func.call(this._connectCallback.scope,this,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to connect(): "+e.message);
}
delete this._connectCallback;
}
break;
case "dis_ack":
if(this._disconnectCallback){
try{
this._disconnectCallback.func.call(this._disconnectCallback.scope,this,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to disconnect(): "+e.message);
}
delete this._disconnectCallback;
}
break;
}
};
this.securityAlert=function(_58){
_55(_58);
};
function _46(){
if(!_34){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
function _47(_59){
if(!_59){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _5a=_59.split(".");
var len=_5a.length;
for(var i=0;i<len;i++){
var p=_5a[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
function _4b(_5b){
if(!_5b||_5b===""||(_5b.indexOf("*")!=-1)||(_5b.indexOf("..")!=-1)||(_5b.charAt(0)==".")||(_5b.charAt(_5b.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
function _3e(_5c,_5d){
var _5e={m:_5c,i:_38,t:_39,p:_5d};
_3b.sendMsg("..",_5e);
};
function _55(_5f){
try{
_30.HubClient.onSecurityAlert.call(_32,_31,_5f);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
this._init();
};
OpenAjax.hub.IframeContainer._containers={};
OpenAjax.hub.IframeContainer._tunnelLoaded=function(){
var _60=_61();
var id=_60.tunnelLoaded();
window.parent.parent.OpenAjax.hub.IframeContainer._containers[id]._tunnelLoaded(window);
};
OpenAjax.hub.IframeContainer._queryURLParam=function(_62){
var _63=new RegExp("[\\?&]"+_62+"=([^&#]*)").exec(window.location.search);
if(_63){
return decodeURIComponent(_63[1].replace(/\+/g,"%20"));
}
return null;
};
OpenAjax.hub.IframeContainer._createTunnelIframe=function(uri){
var _64=document.createElement("iframe");
_64.src=uri;
document.body.appendChild(_64);
_64.style.position="absolute";
_64.style.left=_64.style.top="-10px";
_64.style.height=_64.style.width="1px";
_64.style.visibility="hidden";
};
OpenAjax.hub.IframeContainer._getTargetWin=function(id){
if(typeof id==="undefined"||id===".."){
return window.parent;
}
id=String(id);
var _65=window.frames[id];
if(_65){
return _65;
}
_65=document.getElementById(id);
if(_65&&_65.contentWindow){
return _65.contentWindow;
}
return null;
};
var _66=false,_67=false;
function _68(){
if(_67){
return;
}
_69("unload",function(){
_66=true;
},false);
_67=true;
};
function _69(_6a,_6b,_6c){
if(window.addEventListener){
window.addEventListener(_6a,_6b,_6c);
}else{
if(window.attachEvent){
window.attachEvent("on"+_6a,_6b);
}
}
};
function _6d(_6e,_6f,_70){
if(window.removeEventListener){
window.removeEventListener(_6e,_6f,_70);
}else{
window.detachEvent("on"+_6e,_6f);
}
};
var _71;
function _61(){
if(!_71){
var t=window.postMessage?"PM":window.ActiveXObject?"NIX":"FIM";
_71=new OpenAjax.hub.IframeContainer["_"+t]();
_71.type=t;
}
return _71;
};
function _72(_73,_74,log,_75){
if(!OpenAjax.hub.IframeContainer._prng){
var _76=new Date().getTime()+Math.random()+document.cookie;
OpenAjax.hub.IframeContainer._prng=OpenAjax._smash.crypto.newPRNG(_76);
}
var p=_73.IframeContainer||_73.IframeHubClient;
if(p&&p.seed){
try{
var _77=p.seed.call(_74);
OpenAjax.hub.IframeContainer._prng.addSeed(_77);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from 'seed' callback: "+e.message);
}
}
var _78=_75||(p&&p.tokenLength)||6;
return OpenAjax.hub.IframeContainer._prng.nextRandomB64Str(_78);
};
OpenAjax.hub.IframeContainer._PM=function(){
var _79="openajax-2.0.2";
var _7a={};
var _7b,_7c;
var uri;
_69("message",_7d,false);
this.addReceiver=function(_7e){
var _7f;
_7a[_7e.receiverId]={r:_7e.receiver};
if(_7e.receiverId===".."){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_79){
return null;
}
var _80=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
var _81=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _82=OpenAjax.hub.IframeContainer._queryURLParam("oahn");
var _83=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
if(!_81||!_83||!_80){
return null;
}
_7b=OpenAjax.hub.IframeContainer._queryURLParam("oahpm");
_84();
var _85=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_80)[1];
_7a[".."].o=_85;
_7a[".."].m=_86(_85);
var _87="oahi="+encodeURIComponent(_81)+"&oaht="+_83;
var _88=_80.split("#");
_88[0]=_88[0]+((_88[0].indexOf("?")!=-1)?"&":"?")+_87;
_80=_88.length===1?_88[0]:_88[0]+"#"+_88[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(_80);
_7f={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_85)[1],securityToken:_83};
setTimeout(function(){
_7e.receiver.transportReady(_81,_82,true,_7f);
},0);
return _82||_81;
}
if(typeof _7b==="undefined"){
_8f();
_84();
}
_85=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_7e.uri)[1];
_7a[_7e.receiverId].o=_85;
_7a[_7e.receiverId].m=_86(_85);
_7f={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_85)[1]};
setTimeout(function(){
_7e.receiver.transportReady(_7e.receiverId,_7e.name,true,_7f);
},0);
_87="oahpv="+encodeURIComponent(_79)+"&oahi="+encodeURIComponent(_7e.receiverId)+(_7e.name?"&oahn="+encodeURIComponent(_7e.name):"")+"&oaht="+_7e.securityToken+"&oahu="+encodeURIComponent(_7e.tunnelURI)+"&oahpm="+_7b;
_88=_7e.uri.split("#");
_88[0]=_88[0]+((_88[0].indexOf("?")!=-1)?"&":"?")+_87;
uri=_88.length===1?_88[0]:_88[0]+"#"+_88[1];
return null;
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_89,_8a){
};
this.sendMsg=function(_8b,_8c){
if(_7a[_8b]){
var _8d=OpenAjax.hub.IframeContainer._getTargetWin(_8b);
_7c(_8d,JSON.stringify(_8c),_7a[_8b].o);
}
return true;
};
this.tunnelLoaded=function(){
return OpenAjax.hub.IframeContainer._queryURLParam("oahi");
};
this.removeReceiver=function(_8e){
delete _7a[_8e];
};
function _8f(){
_7b="";
var hit=false;
function _7d(_90){
if(_90.data=="postmessage.test"){
hit=true;
if(typeof _90.origin==="undefined"){
_7b+="d";
}
}
};
_69("message",_7d,false);
window.postMessage("postmessage.test","*");
if(hit){
_7b+="s";
}
_6d("message",_7d,false);
};
function _84(){
if(_7b.indexOf("s")===-1){
_7c=function(win,msg,_91){
win.postMessage(msg,_91);
};
}else{
_7c=function(win,msg,_92){
setTimeout(function(){
win.postMessage(msg,_92);
},0);
};
}
};
function _86(_93){
if(_7b.indexOf("d")!==-1){
return (/^.+:\/\/([^:]+).*/.exec(_93)[1]);
}
return _93;
};
function _7d(_94){
try{
var _95=JSON.parse(_94.data);
var id=_95.r||_95.i;
if(typeof id==="undefined"){
return;
}
if(!_7a[id]){
if(typeof _95.m!=="undefined"&&typeof _95.p!=="undefined"){
_7a[".."].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
}
return;
}
if(_7a[id].m!==(_94.origin||_94.domain)){
_7a[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_7a[id].r.receiveMsg(_95);
}
catch(e){
return;
}
};
};
})();

