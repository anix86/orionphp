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

