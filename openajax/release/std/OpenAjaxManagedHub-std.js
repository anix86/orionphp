if(!window["OpenAjax"]){
OpenAjax=new function(){
this.hub={};
var h=this.hub;
h.implementer="http://openajax.org";
h.implVersion="2.0.3";
h.specVersion="2.0";
h.implExtraData={};
var _1={};
h.libraries=_1;
var _2="org.openajax.hub.";
h.registerLibrary=function(_3,_4,_5,_6){
_1[_3]={prefix:_3,namespaceURI:_4,version:_5,extraData:_6};
this.publish(_2+"registerLibrary",_1[_3]);
};
h.unregisterLibrary=function(_7){
this.publish(_2+"unregisterLibrary",_1[_7]);
delete _1[_7];
};
};
OpenAjax.hub.Error={BadParameters:"OpenAjax.hub.Error.BadParameters",Disconnected:"OpenAjax.hub.Error.Disconnected",Duplicate:"OpenAjax.hub.Error.Duplicate",NoContainer:"OpenAjax.hub.Error.NoContainer",NoSubscription:"OpenAjax.hub.Error.NoSubscription",NotAllowed:"OpenAjax.hub.Error.NotAllowed",WrongProtocol:"OpenAjax.hub.Error.WrongProtocol"};
OpenAjax.hub.SecurityAlert={LoadTimeout:"OpenAjax.hub.SecurityAlert.LoadTimeout",FramePhish:"OpenAjax.hub.SecurityAlert.FramePhish",ForgedMsg:"OpenAjax.hub.SecurityAlert.ForgedMsg"};
OpenAjax.hub._debugger=function(){
};
OpenAjax.hub.ManagedHub=function(_8){
if(!_8||!_8.onPublish||!_8.onSubscribe){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._p=_8;
this._onUnsubscribe=_8.onUnsubscribe?_8.onUnsubscribe:null;
this._scope=_8.scope||window;
if(_8.log){
var _9=this;
this._log=function(_a){
try{
_8.log.call(_9._scope,"ManagedHub: "+_a);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._subscriptions={c:{},s:null};
this._containers={};
this._seq=0;
this._active=true;
this._isPublishing=false;
this._pubQ=[];
};
OpenAjax.hub.ManagedHub.prototype.subscribeForClient=function(_b,_c,_d){
this._assertConn();
if(this._invokeOnSubscribe(_c,_b)){
return this._subscribe(_c,this._sendToClient,this,{c:_b,sid:_d});
}
throw new Error(OpenAjax.hub.Error.NotAllowed);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribeForClient=function(_e,_f){
this._unsubscribe(_f);
this._invokeOnUnsubscribe(_e,_f);
};
OpenAjax.hub.ManagedHub.prototype.publishForClient=function(_10,_11,_12){
this._assertConn();
this._publish(_11,_12,_10);
};
OpenAjax.hub.ManagedHub.prototype.disconnect=function(){
this._active=false;
for(var c in this._containers){
this.removeContainer(this._containers[c]);
}
};
OpenAjax.hub.ManagedHub.prototype.getContainer=function(_13){
var _14=this._containers[_13];
return _14?_14:null;
};
OpenAjax.hub.ManagedHub.prototype.listContainers=function(){
var res=[];
for(var c in this._containers){
res.push(this._containers[c]);
}
return res;
};
OpenAjax.hub.ManagedHub.prototype.addContainer=function(_15){
this._assertConn();
var _16=_15.getClientID();
if(this._containers[_16]){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._containers[_16]=_15;
};
OpenAjax.hub.ManagedHub.prototype.removeContainer=function(_17){
var _18=_17.getClientID();
if(!this._containers[_18]){
throw new Error(OpenAjax.hub.Error.NoContainer);
}
_17.remove();
delete this._containers[_18];
};
OpenAjax.hub.ManagedHub.prototype.subscribe=function(_19,_1a,_1b,_1c,_1d){
this._assertConn();
this._assertSubTopic(_19);
if(!_1a){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!this._invokeOnSubscribe(_19,null)){
this._invokeOnComplete(_1c,_1b,null,false,OpenAjax.hub.Error.NotAllowed);
return;
}
_1b=_1b||window;
var _1e=this;
function _1f(_20,_21,sd,_22){
if(_1e._invokeOnPublish(_20,_21,_22,null)){
try{
_1a.call(_1b,_20,_21,_1d);
}
catch(e){
OpenAjax.hub._debugger();
_1e._log("caught error from onData callback to Hub.subscribe(): "+e.message);
}
}
};
var _23=this._subscribe(_19,_1f,_1b,_1d);
this._invokeOnComplete(_1c,_1b,_23,true);
return _23;
};
OpenAjax.hub.ManagedHub.prototype.publish=function(_24,_25){
this._assertConn();
this._assertPubTopic(_24);
this._publish(_24,_25,null);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribe=function(_26,_27,_28){
this._assertConn();
if(!_26){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._unsubscribe(_26);
this._invokeOnUnsubscribe(null,_26);
this._invokeOnComplete(_27,_28,_26,true);
};
OpenAjax.hub.ManagedHub.prototype.isConnected=function(){
return this._active;
};
OpenAjax.hub.ManagedHub.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberData=function(_29){
this._assertConn();
var _2a=_29.split(".");
var sid=_2a.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2a,0,sid);
if(sub){
return sub.data;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberScope=function(_2b){
this._assertConn();
var _2c=_2b.split(".");
var sid=_2c.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2c,0,sid);
if(sub){
return sub.scope;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getParameters=function(){
return this._p;
};
OpenAjax.hub.ManagedHub.prototype._sendToClient=function(_2d,_2e,sd,_2f){
if(!this.isConnected()){
return;
}
if(this._invokeOnPublish(_2d,_2e,_2f,sd.c)){
sd.c.sendToClient(_2d,_2e,sd.sid);
}
};
OpenAjax.hub.ManagedHub.prototype._assertConn=function(){
if(!this.isConnected()){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.ManagedHub.prototype._assertPubTopic=function(_30){
if(!_30||_30===""||(_30.indexOf("*")!=-1)||(_30.indexOf("..")!=-1)||(_30.charAt(0)==".")||(_30.charAt(_30.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.ManagedHub.prototype._assertSubTopic=function(_31){
if(!_31){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _32=_31.split(".");
var len=_32.length;
for(var i=0;i<len;i++){
var p=_32[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnComplete=function(_33,_34,_35,_36,_37){
if(_33){
try{
_34=_34||window;
_33.call(_34,_35,_36,_37);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnPublish=function(_38,_39,_3a,_3b){
try{
return this._p.onPublish.call(this._scope,_38,_39,_3a,_3b);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onPublish callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnSubscribe=function(_3c,_3d){
try{
return this._p.onSubscribe.call(this._scope,_3c,_3d);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onSubscribe callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnUnsubscribe=function(_3e,_3f){
if(this._onUnsubscribe){
var _40=_3f.slice(0,_3f.lastIndexOf("."));
try{
this._onUnsubscribe.call(this._scope,_40,_3e);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onUnsubscribe callback to constructor: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._subscribe=function(_41,_42,_43,_44){
var _45=_41+"."+this._seq;
var sub={scope:_43,cb:_42,data:_44,sid:this._seq++};
var _46=_41.split(".");
this._recursiveSubscribe(this._subscriptions,_46,0,sub);
return _45;
};
OpenAjax.hub.ManagedHub.prototype._recursiveSubscribe=function(_47,_48,_49,sub){
var _4a=_48[_49];
if(_49==_48.length){
sub.next=_47.s;
_47.s=sub;
}else{
if(typeof _47.c=="undefined"){
_47.c={};
}
if(typeof _47.c[_4a]=="undefined"){
_47.c[_4a]={c:{},s:null};
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}else{
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}
}
};
OpenAjax.hub.ManagedHub.prototype._publish=function(_4b,_4c,_4d){
if(this._isPublishing){
this._pubQ.push({t:_4b,d:_4c,p:_4d});
return;
}
this._safePublish(_4b,_4c,_4d);
while(this._pubQ.length>0){
var pub=this._pubQ.shift();
this._safePublish(pub.t,pub.d,pub.p);
}
};
OpenAjax.hub.ManagedHub.prototype._safePublish=function(_4e,_4f,_50){
this._isPublishing=true;
var _51=_4e.split(".");
this._recursivePublish(this._subscriptions,_51,0,_4e,_4f,_50);
this._isPublishing=false;
};
OpenAjax.hub.ManagedHub.prototype._recursivePublish=function(_52,_53,_54,_55,msg,_56){
if(typeof _52!="undefined"){
var _57;
if(_54==_53.length){
_57=_52;
}else{
this._recursivePublish(_52.c[_53[_54]],_53,_54+1,_55,msg,_56);
this._recursivePublish(_52.c["*"],_53,_54+1,_55,msg,_56);
_57=_52.c["**"];
}
if(typeof _57!="undefined"){
var sub=_57.s;
while(sub){
var sc=sub.scope;
var cb=sub.cb;
var d=sub.data;
var sid=sub.sid;
if(typeof cb=="string"){
cb=sc[cb];
}
cb.call(sc,_55,msg,d,_56);
sub=sub.next;
}
}
}
};
OpenAjax.hub.ManagedHub.prototype._unsubscribe=function(_58){
var _59=_58.split(".");
var sid=_59.pop();
if(!this._recursiveUnsubscribe(this._subscriptions,_59,0,sid)){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
};
OpenAjax.hub.ManagedHub.prototype._recursiveUnsubscribe=function(_5a,_5b,_5c,sid){
if(typeof _5a=="undefined"){
return false;
}
if(_5c<_5b.length){
var _5d=_5a.c[_5b[_5c]];
if(!_5d){
return false;
}
this._recursiveUnsubscribe(_5d,_5b,_5c+1,sid);
if(!_5d.s){
for(var x in _5d.c){
return true;
}
delete _5a.c[_5b[_5c]];
}
}else{
var sub=_5a.s;
var _5e=null;
var _5f=false;
while(sub){
if(sid==sub.sid){
_5f=true;
if(sub==_5a.s){
_5a.s=sub.next;
}else{
_5e.next=sub.next;
}
break;
}
_5e=sub;
sub=sub.next;
}
if(!_5f){
return false;
}
}
return true;
};
OpenAjax.hub.ManagedHub.prototype._getSubscriptionObject=function(_60,_61,_62,sid){
if(typeof _60!="undefined"){
if(_62<_61.length){
var _63=_60.c[_61[_62]];
return this._getSubscriptionObject(_63,_61,_62+1,sid);
}
var sub=_60.s;
while(sub){
if(sid==sub.sid){
return sub;
}
sub=sub.next;
}
}
return null;
};
OpenAjax.hub._hub=new OpenAjax.hub.ManagedHub({onSubscribe:function(_64,_65){
return true;
},onPublish:function(_66,_67,_68,_69){
return true;
}});
OpenAjax.hub.subscribe=function(_6a,_6b,_6c,_6d){
if(typeof _6b==="string"){
_6c=_6c||window;
_6b=_6c[_6b]||null;
}
return OpenAjax.hub._hub.subscribe(_6a,_6b,_6c,null,_6d);
};
OpenAjax.hub.unsubscribe=function(_6e){
return OpenAjax.hub._hub.unsubscribe(_6e);
};
OpenAjax.hub.publish=function(_6f,_70){
OpenAjax.hub._hub.publish(_6f,_70);
};
OpenAjax.hub.registerLibrary("OpenAjax","http://openajax.org/hub","2.0",{});
}
if(typeof OpenAjax==="undefined"){
window.OpenAjax={};
}
if(typeof OpenAjax.hub==="undefined"){
window.OpenAjax.hub={};
}
(function(){
OpenAjax.hub.IframeContainer=function(hub,_71,_72){
if(!hub||!_71||!_72||!_72.Container||!_72.Container.onSecurityAlert||!_72.IframeContainer||!_72.IframeContainer.parent||!_72.IframeContainer.uri||!_72.IframeContainer.tunnelURI){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _73=this;
var _74=_72.Container.scope||window;
var _75=false,_76=false,_77=false;
var _78={};
var _79;
var _7a;
var _7b;
var _7c;
var _7d=_72.IframeContainer.timeout||15000;
var _7e;
if(_72.Container.log){
var log=function(msg){
try{
_72.Container.log.call(_74,"IframeContainer::"+_71+": "+msg);
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
hub.addContainer(this);
_7c=_d0();
_7b=_7f(_71,this);
_7a=_e1(_72,_74,log,_7c.type==="FIM"?6:null);
var _80={receiver:this,receiverId:_7b,securityToken:_7a,uri:_72.IframeContainer.uri,tunnelURI:_72.IframeContainer.tunnelURI,log:log};
if(_71!==_7b){
_80.name=_71;
}
_7c.addReceiver(_80);
_81();
_7c.postAdd(_7b,document.getElementById(_7b));
_82();
};
this.sendToClient=function(_83,_84,_85){
_86("pub",{t:_83,d:_84,s:_85});
};
this.remove=function(){
_87();
_7c.removeReceiver(_7b);
clearTimeout(_7e);
_88(_7b);
};
this.isConnected=function(){
return _75;
};
this.getClientID=function(){
return _71;
};
this.getPartnerOrigin=function(){
if(_75){
return _79;
}
return null;
};
this.getParameters=function(){
return _72;
};
this.getHub=function(){
return hub;
};
this.getIframe=function(){
return document.getElementById(_7b);
};
this.transportReady=function(_89,_8a,_8b,_8c){
if(!_8b){
if(_8c.securityAlert){
_8d(_8c.securityAlert);
}
return;
}
_79=_8c.partnerOrigin;
};
this.receiveMsg=function(msg){
switch(msg.m){
case "pub":
hub.publishForClient(this,msg.p.t,msg.p.d);
break;
case "sub":
var _8e="";
try{
_78[msg.p.s]=hub.subscribeForClient(this,msg.p.t,msg.p.s);
}
catch(e){
_8e=e.message;
}
_86("sub_ack",{s:msg.p.s,e:_8e});
break;
case "uns":
var _8f=_78[msg.p.s];
hub.unsubscribeForClient(this,_8f);
delete _78[msg.p.s];
_86("uns_ack",{s:msg.p.s});
break;
case "con":
_76=true;
_90();
break;
case "dis":
_82();
_87();
_86("dis_ack",null);
if(_72.Container.onDisconnect){
try{
_72.Container.onDisconnect.call(_74,this);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
break;
}
};
this.securityAlert=function(_91){
_8d(_91);
};
function _81(){
var _92=document.createElement("iframe");
_92.id=_7b;
_92.name=_7b;
var _93=_72.IframeContainer.iframeAttrs;
if(_93){
for(var _94 in _93){
switch(_94){
case "id":
case "name":
log("Ignoring 'id' or 'name' property in 'iframeAttrs' -- "+"these attributes on the iframe are used for "+"internal purposes.");
break;
case "style":
for(var _95 in _93.style){
_92.style[_95]=_93.style[_95];
}
break;
default:
_92[_94]=_93[_94];
}
}
}
_92.style.visibility="hidden";
_92.src="javascript:\"<html></html>\"";
_72.IframeContainer.parent.appendChild(_92);
_92.src=_7c.getURI();
_72.IframeContainer.parent=null;
};
var _88=function(){
if(navigator.appName==="Microsoft Internet Explorer"){
return function(id){
var _96=document.getElementById(id);
_96.onreadystatechange=function(){
if(_96.readyState=="complete"){
_96.onreadystatechange=null;
_96.outerHTML="";
_96=null;
}
};
_96.src="";
};
}else{
return function(id){
var _97=document.getElementById(id);
_97.parentNode.removeChild(_97);
_97=null;
};
}
}();
function _86(_98,_99){
var _9a={m:_98,i:_7b,r:"..",t:_7a,p:_99};
_7c.sendMsg(_7b,_9a);
};
function _90(){
if(!_77||!_76){
return;
}
_75=true;
clearTimeout(_7e);
document.getElementById(_7b).style.visibility="visible";
_86("con_ack",null);
if(_72.Container.onConnect){
try{
_72.Container.onConnect.call(_74,_73);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onConnect callback to constructor: "+e.message);
}
}
};
function _87(){
if(_75){
_75=false;
document.getElementById(_7b).style.visibility="hidden";
for(var s in _78){
hub.unsubscribeForClient(_73,_78[s]);
}
_78={};
}
};
function _7f(id,_9b){
while(OpenAjax.hub.IframeContainer._containers[id]){
id+="_"+((32767*Math.random())|0).toString(16);
}
OpenAjax.hub.IframeContainer._containers[id]=_9b;
return id;
};
this._tunnelLoaded=function(_9c){
_9c.onunload=_9d;
_77=true;
_d7();
_90();
};
function _9d(){
if(_75&&!_d5){
_8d(OpenAjax.hub.SecurityAlert.FramePhish);
}
};
function _8d(_9e){
try{
_72.Container.onSecurityAlert.call(_74,_73,_9e);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
function _82(){
_7e=setTimeout(function(){
_8d(OpenAjax.hub.SecurityAlert.LoadTimeout);
_73.receiveMsg=function(){
};
},_7d);
};
this._init();
};
OpenAjax.hub.IframeHubClient=function(_9f){
if(!_9f||!_9f.HubClient||!_9f.HubClient.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _a0=this;
var _a1=_9f.HubClient.scope||window;
var _a2=false;
var _a3=false;
var _a4={};
var _a5=0;
var _a6,_a7,_a8;
var _a9;
if(_9f.HubClient.log){
var log=function(msg){
try{
_9f.HubClient.log.call(_a1,"IframeHubClient::"+_a6+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
var _aa;
this._init=function(){
_aa=_d0();
_a8=_e1(_9f,_a1,log,_aa.type==="FIM"?6:null);
_a6=_aa.addReceiver({receiver:this,receiverId:"..",securityToken:_a8,log:log});
if(!_a6){
throw new Error(OpenAjax.hub.Error.WrongProtocol);
}
};
this.connect=function(_ab,_ac){
_ac=_ac||window;
if(_a3){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
if(_ab){
this._connectCallback={func:_ab,scope:_ac};
}
if(_a2){
_ad("con",null);
}else{
this._connectPending=true;
}
};
this.disconnect=function(_ae,_af){
_af=_af||window;
if(!_a3){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
_a3=false;
if(_ae){
this._disconnectCallback={func:_ae,scope:_af};
}
_ad("dis",null);
};
this.getPartnerOrigin=function(){
if(_a3){
return _a9;
}
return null;
};
this.getClientID=function(){
return _a6;
};
this.subscribe=function(_b0,_b1,_b2,_b3,_b4){
_b5();
_b6(_b0);
if(!_b1){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
_b2=_b2||window;
var _b7=""+_a5++;
_a4[_b7]={cb:_b1,sc:_b2,d:_b4,oc:_b3};
_ad("sub",{t:_b0,s:_b7});
return _b7;
};
this.publish=function(_b8,_b9){
_b5();
_ba(_b8);
_ad("pub",{t:_b8,d:_b9});
};
this.unsubscribe=function(_bb,_bc,_bd){
_b5();
if(!_bb){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!_a4[_bb]||_a4[_bb].uns){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
_bd=_bd||window;
_a4[_bb].uns={cb:_bc,sc:_bd};
_ad("uns",{s:_bb});
};
this.isConnected=function(){
return _a3;
};
this.getScope=function(){
return _a1;
};
this.getSubscriberData=function(_be){
_b5();
if(_a4[_be]){
return _a4[_be].d;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getSubscriberScope=function(_bf){
_b5();
if(_a4[_bf]){
return _a4[_bf].sc;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getParameters=function(){
return _9f;
};
this.transportReady=function(_c0,_c1,_c2,_c3){
if(!_c2){
if(_c3.securityAlert){
_c4(_c3.securityAlert);
}
return;
}
_a7=_c0;
_a9=_c3.partnerOrigin;
_a2=true;
if(this._connectPending){
delete this._connectPending;
_ad("con",null);
}
};
this.receiveMsg=function(msg){
var _c5,_c6;
switch(msg.m){
case "pub":
_c5=msg.p.s;
if(_a4[_c5]&&!_a4[_c5].uns){
try{
_a4[_c5].cb.call(_a4[_c5].sc,msg.p.t,msg.p.d,_a4[_c5].d);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onData callback to subscribe(): "+e.message);
}
}
break;
case "sub_ack":
_c5=msg.p.s;
_c6=_a4[_c5].oc;
if(_c6){
try{
delete _a4[_c5].oc;
_c6.call(_a4[_c5].sc,_c5,msg.p.e==="",msg.p.e);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to subscribe(): "+e.message);
}
}
break;
case "uns_ack":
_c5=msg.p.s;
if(_a4[_c5]){
_c6=_a4[_c5].uns.cb;
if(_c6){
try{
_c6.call(_a4[_c5].uns.sc,_c5,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to unsubscribe(): "+e.message);
}
}
delete _a4[_c5];
}
break;
case "con_ack":
_a3=true;
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
this.securityAlert=function(_c7){
_c4(_c7);
};
function _b5(){
if(!_a3){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
function _b6(_c8){
if(!_c8){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _c9=_c8.split(".");
var len=_c9.length;
for(var i=0;i<len;i++){
var p=_c9[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
function _ba(_ca){
if(!_ca||_ca===""||(_ca.indexOf("*")!=-1)||(_ca.indexOf("..")!=-1)||(_ca.charAt(0)==".")||(_ca.charAt(_ca.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
function _ad(_cb,_cc){
var _cd={m:_cb,i:_a7,t:_a8,p:_cc};
_aa.sendMsg("..",_cd);
};
function _c4(_ce){
try{
_9f.HubClient.onSecurityAlert.call(_a1,_a0,_ce);
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
var _cf=_d0();
var id=_cf.tunnelLoaded();
window.parent.parent.OpenAjax.hub.IframeContainer._containers[id]._tunnelLoaded(window);
};
OpenAjax.hub.IframeContainer._queryURLParam=function(_d1){
var _d2=new RegExp("[\\?&]"+_d1+"=([^&#]*)").exec(window.location.search);
if(_d2){
return decodeURIComponent(_d2[1].replace(/\+/g,"%20"));
}
return null;
};
OpenAjax.hub.IframeContainer._createTunnelIframe=function(uri){
var _d3=document.createElement("iframe");
_d3.src=uri;
document.body.appendChild(_d3);
_d3.style.position="absolute";
_d3.style.left=_d3.style.top="-10px";
_d3.style.height=_d3.style.width="1px";
_d3.style.visibility="hidden";
};
OpenAjax.hub.IframeContainer._getTargetWin=function(id){
if(typeof id==="undefined"||id===".."){
return window.parent;
}
id=String(id);
var _d4=window.frames[id];
if(_d4){
return _d4;
}
_d4=document.getElementById(id);
if(_d4&&_d4.contentWindow){
return _d4.contentWindow;
}
return null;
};
var _d5=false,_d6=false;
function _d7(){
if(_d6){
return;
}
_d8("unload",function(){
_d5=true;
},false);
_d6=true;
};
function _d8(_d9,_da,_db){
if(window.addEventListener){
window.addEventListener(_d9,_da,_db);
}else{
if(window.attachEvent){
window.attachEvent("on"+_d9,_da);
}
}
};
function _dc(_dd,_de,_df){
if(window.removeEventListener){
window.removeEventListener(_dd,_de,_df);
}else{
window.detachEvent("on"+_dd,_de);
}
};
var _e0;
function _d0(){
if(!_e0){
var t=window.postMessage?"PM":window.ActiveXObject?"NIX":"FIM";
_e0=new OpenAjax.hub.IframeContainer["_"+t]();
_e0.type=t;
}
return _e0;
};
function _e1(_e2,_e3,log,_e4){
if(!OpenAjax.hub.IframeContainer._prng){
var _e5=new Date().getTime()+Math.random()+document.cookie;
OpenAjax.hub.IframeContainer._prng=OpenAjax._smash.crypto.newPRNG(_e5);
}
var p=_e2.IframeContainer||_e2.IframeHubClient;
if(p&&p.seed){
try{
var _e6=p.seed.call(_e3);
OpenAjax.hub.IframeContainer._prng.addSeed(_e6);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from 'seed' callback: "+e.message);
}
}
var _e7=_e4||(p&&p.tokenLength)||6;
return OpenAjax.hub.IframeContainer._prng.nextRandomB64Str(_e7);
};
OpenAjax.hub.IframeContainer._PM=function(){
var _e8="openajax-2.0.2";
var _e9={};
var _ea,_eb;
var uri;
_d8("message",_ec,false);
this.addReceiver=function(_ed){
var _ee;
_e9[_ed.receiverId]={r:_ed.receiver};
if(_ed.receiverId===".."){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_e8){
return null;
}
var _ef=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
var _f0=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _f1=OpenAjax.hub.IframeContainer._queryURLParam("oahn");
var _f2=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
if(!_f0||!_f2||!_ef){
return null;
}
_ea=OpenAjax.hub.IframeContainer._queryURLParam("oahpm");
_f3();
var _f4=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_ef)[1];
_e9[".."].o=_f4;
_e9[".."].m=_f5(_f4);
var _f6="oahi="+encodeURIComponent(_f0)+"&oaht="+_f2;
var _f7=_ef.split("#");
_f7[0]=_f7[0]+((_f7[0].indexOf("?")!=-1)?"&":"?")+_f6;
_ef=_f7.length===1?_f7[0]:_f7[0]+"#"+_f7[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(_ef);
_ee={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_f4)[1],securityToken:_f2};
setTimeout(function(){
_ed.receiver.transportReady(_f0,_f1,true,_ee);
},0);
return _f1||_f0;
}
if(typeof _ea==="undefined"){
_fe();
_f3();
}
_f4=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_ed.uri)[1];
_e9[_ed.receiverId].o=_f4;
_e9[_ed.receiverId].m=_f5(_f4);
_ee={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_f4)[1]};
setTimeout(function(){
_ed.receiver.transportReady(_ed.receiverId,_ed.name,true,_ee);
},0);
_f6="oahpv="+encodeURIComponent(_e8)+"&oahi="+encodeURIComponent(_ed.receiverId)+(_ed.name?"&oahn="+encodeURIComponent(_ed.name):"")+"&oaht="+_ed.securityToken+"&oahu="+encodeURIComponent(_ed.tunnelURI)+"&oahpm="+_ea;
_f7=_ed.uri.split("#");
_f7[0]=_f7[0]+((_f7[0].indexOf("?")!=-1)?"&":"?")+_f6;
uri=_f7.length===1?_f7[0]:_f7[0]+"#"+_f7[1];
return null;
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_f8,_f9){
};
this.sendMsg=function(_fa,_fb){
if(_e9[_fa]){
var _fc=OpenAjax.hub.IframeContainer._getTargetWin(_fa);
_eb(_fc,JSON.stringify(_fb),_e9[_fa].o);
}
return true;
};
this.tunnelLoaded=function(){
return OpenAjax.hub.IframeContainer._queryURLParam("oahi");
};
this.removeReceiver=function(_fd){
delete _e9[_fd];
};
function _fe(){
_ea="";
var hit=false;
function _ec(_ff){
if(_ff.data=="postmessage.test"){
hit=true;
if(typeof _ff.origin==="undefined"){
_ea+="d";
}
}
};
_d8("message",_ec,false);
window.postMessage("postmessage.test","*");
if(hit){
_ea+="s";
}
_dc("message",_ec,false);
};
function _f3(){
if(_ea.indexOf("s")===-1){
_eb=function(win,msg,_100){
win.postMessage(msg,_100);
};
}else{
_eb=function(win,msg,_101){
setTimeout(function(){
win.postMessage(msg,_101);
},0);
};
}
};
function _f5(_102){
if(_ea.indexOf("d")!==-1){
return (/^.+:\/\/([^:]+).*/.exec(_102)[1]);
}
return _102;
};
function _ec(_103){
try{
var data=JSON.parse(_103.data);
var id=data.r||data.i;
if(typeof id==="undefined"){
return;
}
if(!_e9[id]){
if(typeof data.m!=="undefined"&&typeof data.p!=="undefined"){
_e9[".."].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
}
return;
}
if(_e9[id].m!==(_103.origin||_103.domain)){
_e9[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_e9[id].r.receiveMsg(data);
}
catch(e){
return;
}
};
};
})();
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
OpenAjax._smash.crypto={"strToWA":function(str,_104){
var bin=Array();
var mask=(1<<_104)-1;
for(var i=0;i<str.length*_104;i+=_104){
bin[i>>5]|=(str.charCodeAt(i/_104)&mask)<<(32-_104-i%32);
}
return bin;
},"hmac_sha1":function(_105,_106,_107){
var ipad=Array(16),opad=Array(16);
for(var i=0;i<16;i++){
ipad[i]=_105[i]^909522486;
opad[i]=_105[i]^1549556828;
}
var hash=this.sha1(ipad.concat(this.strToWA(_106,_107)),512+_106.length*_107);
return this.sha1(opad.concat(hash),512+160);
},"newPRNG":function(_108){
var that=this;
if((typeof _108!="string")||(_108.length<12)){
alert("WARNING: Seed length too short ...");
}
var _109=[43417,15926,18182,33130,9585,30800,49772,40144,47678,55453,4659,38181,65340,6787,54417,65301];
var _10a=[];
var _10b=0;
function _10c(_10d){
return that.hmac_sha1(_109,_10d,8);
};
function _10e(_10f){
var _110=_10c(_10f);
for(var i=0;i<5;i++){
_10a[i]^=_110[i];
}
};
_10e(_108);
return {"addSeed":function(seed){
_10e(seed);
},"nextRandomOctets":function(len){
var _111=[];
while(len>0){
_10b+=1;
var _112=that.hmac_sha1(_10a,(_10b).toString(16),8);
for(i=0;(i<20)&(len>0);i++,len--){
_111.push((_112[i>>2]>>(i%4))%256);
}
}
return _111;
},"nextRandomB64Str":function(len){
var _113="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var _114=this.nextRandomOctets(len);
var _115="";
for(var i=0;i<len;i++){
_115+=_113.charAt(_114[i]&63);
}
return _115;
}};
},"sha1":function(){
var _116=function(x,y){
var lsw=(x&65535)+(y&65535);
var msw=(x>>16)+(y>>16)+(lsw>>16);
return (msw<<16)|(lsw&65535);
};
var rol=function(num,cnt){
return (num<<cnt)|(num>>>(32-cnt));
};
function _117(t,b,c,d){
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
function _118(t){
return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;
};
return function(_119,_11a){
_119[_11a>>5]|=128<<(24-_11a%32);
_119[((_11a+64>>9)<<4)+15]=_11a;
var W=Array(80);
var H0=1732584193;
var H1=-271733879;
var H2=-1732584194;
var H3=271733878;
var H4=-1009589776;
for(var i=0;i<_119.length;i+=16){
var a=H0;
var b=H1;
var c=H2;
var d=H3;
var e=H4;
for(var j=0;j<80;j++){
W[j]=((j<16)?_119[i+j]:rol(W[j-3]^W[j-8]^W[j-14]^W[j-16],1));
var T=_116(_116(rol(a,5),_117(j,b,c,d)),_116(_116(e,W[j]),_118(j)));
e=d;
d=c;
c=rol(b,30);
b=a;
a=T;
}
H0=_116(a,H0);
H1=_116(b,H1);
H2=_116(c,H2);
H3=_116(d,H3);
H4=_116(e,H4);
}
return Array(H0,H1,H2,H3,H4);
};
}()};
if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?"0"+n:n;
};
if(typeof Date.prototype.toJSON!=="function"){
Date.prototype.toJSON=function(key){
return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){
return this.valueOf();
};
}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,_11b=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,_11c,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},rep;
function _11d(_11e){
_11b.lastIndex=0;
return _11b.test(_11e)?"\""+_11e.replace(_11b,function(a){
var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
})+"\"":"\""+_11e+"\"";
};
function str(key,_11f){
var i,k,v,_120,mind=gap,_121,_122=_11f[key];
if(_122&&typeof _122==="object"&&typeof _122.toJSON==="function"){
_122=_122.toJSON(key);
}
if(typeof rep==="function"){
_122=rep.call(_11f,key,_122);
}
switch(typeof _122){
case "string":
return _11d(_122);
case "number":
return isFinite(_122)?String(_122):"null";
case "boolean":
case "null":
return String(_122);
case "object":
if(!_122){
return "null";
}
gap+=_11c;
_121=[];
if(Object.prototype.toString.apply(_122)==="[object Array]"){
_120=_122.length;
for(i=0;i<_120;i+=1){
_121[i]=str(i,_122)||"null";
}
v=_121.length===0?"[]":gap?"[\n"+gap+_121.join(",\n"+gap)+"\n"+mind+"]":"["+_121.join(",")+"]";
gap=mind;
return v;
}
if(rep&&typeof rep==="object"){
_120=rep.length;
for(i=0;i<_120;i+=1){
k=rep[i];
if(typeof k==="string"){
v=str(k,_122);
if(v){
_121.push(_11d(k)+(gap?": ":":")+v);
}
}
}
}else{
for(k in _122){
if(Object.hasOwnProperty.call(_122,k)){
v=str(k,_122);
if(v){
_121.push(_11d(k)+(gap?": ":":")+v);
}
}
}
}
v=_121.length===0?"{}":gap?"{\n"+gap+_121.join(",\n"+gap)+"\n"+mind+"}":"{"+_121.join(",")+"}";
gap=mind;
return v;
}
};
if(typeof JSON.stringify!=="function"){
JSON.stringify=function(_123,_124,_125){
var i;
gap="";
_11c="";
if(typeof _125==="number"){
for(i=0;i<_125;i+=1){
_11c+=" ";
}
}else{
if(typeof _125==="string"){
_11c=_125;
}
}
rep=_124;
if(_124&&typeof _124!=="function"&&(typeof _124!=="object"||typeof _124.length!=="number")){
throw new Error("JSON.stringify");
}
return str("",{"":_123});
};
}
if(typeof JSON.parse!=="function"){
JSON.parse=function(text,_126){
var j;
function walk(_127,key){
var k,v,_128=_127[key];
if(_128&&typeof _128==="object"){
for(k in _128){
if(Object.hasOwnProperty.call(_128,k)){
v=walk(_128,k);
if(v!==undefined){
_128[k]=v;
}else{
delete _128[k];
}
}
}
}
return _126.call(_127,key,_128);
};
cx.lastIndex=0;
if(cx.test(text)){
text=text.replace(cx,function(a){
return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){
j=eval("("+text+")");
return typeof _126==="function"?walk({"":j},""):j;
}
throw new SyntaxError("JSON.parse");
};
}
})();
OpenAjax.hub.InlineContainer=function(hub,_129,_12a){
if(!hub||!_129||!_12a||!_12a.Container||!_12a.Container.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_12a;
this._hub=hub;
this._id=_129;
this._onSecurityAlert=_12a.Container.onSecurityAlert;
this._onConnect=_12a.Container.onConnect?_12a.Container.onConnect:null;
this._onDisconnect=_12a.Container.onDisconnect?_12a.Container.onDisconnect:null;
this._scope=_12a.Container.scope||window;
if(_12a.Container.log){
var that=this;
this._log=function(msg){
try{
_12a.Container.log.call(that._scope,"InlineContainer::"+_129+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._connected=false;
this._subs=[];
this._subIndex=0;
hub.addContainer(this);
};
OpenAjax.hub.InlineContainer.prototype.getHub=function(){
return this._hub;
};
OpenAjax.hub.InlineContainer.prototype.sendToClient=function(_12b,data,_12c){
if(this.isConnected()){
var sub=this._subs[_12c];
try{
sub.cb.call(sub.sc,_12b,data,sub.d);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onData callback to HubClient.subscribe(): "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype.remove=function(){
if(this.isConnected()){
this._disconnect();
}
};
OpenAjax.hub.InlineContainer.prototype.isConnected=function(){
return this._connected;
};
OpenAjax.hub.InlineContainer.prototype.getClientID=function(){
return this._id;
};
OpenAjax.hub.InlineContainer.prototype.getPartnerOrigin=function(){
if(this._connected){
return window.location.protocol+"//"+window.location.hostname;
}
return null;
};
OpenAjax.hub.InlineContainer.prototype.getParameters=function(){
return this._params;
};
OpenAjax.hub.InlineContainer.prototype.connect=function(_12d,_12e,_12f){
if(this._connected){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._connected=true;
this._client=_12d;
if(this._onConnect){
try{
this._onConnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onConnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_12e,_12f,_12d,true);
};
OpenAjax.hub.InlineContainer.prototype.disconnect=function(_130,_131,_132){
if(!this._connected){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
this._disconnect();
if(this._onDisconnect){
try{
this._onDisconnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_131,_132,_130,true);
};
OpenAjax.hub.InlineContainer.prototype.subscribe=function(_133,_134,_135,_136,_137){
this._assertConn();
this._assertSubTopic(_133);
if(!_134){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _138=""+this._subIndex++;
var _139=false;
var msg=null;
try{
var _13a=this._hub.subscribeForClient(this,_133,_138);
_139=true;
}
catch(e){
_138=null;
msg=e.message;
}
_135=_135||window;
if(_139){
this._subs[_138]={h:_13a,cb:_134,sc:_135,d:_137};
}
this._invokeOnComplete(_136,_135,_138,_139,msg);
return _138;
};
OpenAjax.hub.InlineContainer.prototype.publish=function(_13b,data){
this._assertConn();
this._assertPubTopic(_13b);
this._hub.publishForClient(this,_13b,data);
};
OpenAjax.hub.InlineContainer.prototype.unsubscribe=function(_13c,_13d,_13e){
this._assertConn();
if(typeof _13c==="undefined"||_13c==null){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var sub=this._subs[_13c];
if(!sub){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
this._hub.unsubscribeForClient(this,sub.h);
delete this._subs[_13c];
this._invokeOnComplete(_13d,_13e,_13c,true);
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberData=function(_13f){
this._assertConn();
return this._getSubscription(_13f).d;
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberScope=function(_140){
this._assertConn();
return this._getSubscription(_140).sc;
};
OpenAjax.hub.InlineContainer.prototype._invokeOnComplete=function(func,_141,item,_142,_143){
if(func){
try{
_141=_141||window;
func.call(_141,item,_142,_143);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype._disconnect=function(){
for(var _144 in this._subs){
this._hub.unsubscribeForClient(this,this._subs[_144].h);
}
this._subs=[];
this._subIndex=0;
this._connected=false;
};
OpenAjax.hub.InlineContainer.prototype._assertConn=function(){
if(!this._connected){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.InlineContainer.prototype._assertPubTopic=function(_145){
if((_145==null)||(_145=="")||(_145.indexOf("*")!=-1)||(_145.indexOf("..")!=-1)||(_145.charAt(0)==".")||(_145.charAt(_145.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.InlineContainer.prototype._assertSubTopic=function(_146){
if(!_146){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var path=_146.split(".");
var len=path.length;
for(var i=0;i<len;i++){
var p=path[i];
if((p=="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.InlineContainer.prototype._getSubscription=function(_147){
var sub=this._subs[_147];
if(sub){
return sub;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.InlineHubClient=function(_148){
if(!_148||!_148.HubClient||!_148.HubClient.onSecurityAlert||!_148.InlineHubClient||!_148.InlineHubClient.container){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_148;
this._onSecurityAlert=_148.HubClient.onSecurityAlert;
this._scope=_148.HubClient.scope||window;
this._container=_148.InlineHubClient.container;
if(_148.HubClient.log){
var that=this;
this._log=function(msg){
try{
_148.HubClient.log.call(that._scope,"InlineHubClient::"+that._container.getClientID()+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
};
OpenAjax.hub.InlineHubClient.prototype.connect=function(_149,_14a){
this._container.connect(this,_149,_14a);
};
OpenAjax.hub.InlineHubClient.prototype.disconnect=function(_14b,_14c){
this._container.disconnect(this,_14b,_14c);
};
OpenAjax.hub.InlineHubClient.prototype.getPartnerOrigin=function(){
return this._container.getPartnerOrigin();
};
OpenAjax.hub.InlineHubClient.prototype.getClientID=function(){
return this._container.getClientID();
};
OpenAjax.hub.InlineHubClient.prototype.subscribe=function(_14d,_14e,_14f,_150,_151){
return this._container.subscribe(_14d,_14e,_14f,_150,_151);
};
OpenAjax.hub.InlineHubClient.prototype.publish=function(_152,data){
this._container.publish(_152,data);
};
OpenAjax.hub.InlineHubClient.prototype.unsubscribe=function(_153,_154,_155){
this._container.unsubscribe(_153,_154,_155);
};
OpenAjax.hub.InlineHubClient.prototype.isConnected=function(){
return this._container.isConnected();
};
OpenAjax.hub.InlineHubClient.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberData=function(_156){
return this._container.getSubscriberData(_156);
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberScope=function(_157){
return this._container.getSubscriberScope(_157);
};
OpenAjax.hub.InlineHubClient.prototype.getParameters=function(){
return this._params;
};

