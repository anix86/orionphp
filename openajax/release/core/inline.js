OpenAjax.hub.InlineContainer=function(_1,_2,_3){
if(!_1||!_2||!_3||!_3.Container||!_3.Container.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_3;
this._hub=_1;
this._id=_2;
this._onSecurityAlert=_3.Container.onSecurityAlert;
this._onConnect=_3.Container.onConnect?_3.Container.onConnect:null;
this._onDisconnect=_3.Container.onDisconnect?_3.Container.onDisconnect:null;
this._scope=_3.Container.scope||window;
if(_3.Container.log){
var _4=this;
this._log=function(_5){
try{
_3.Container.log.call(_4._scope,"InlineContainer::"+_2+": "+_5);
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
_1.addContainer(this);
};
OpenAjax.hub.InlineContainer.prototype.getHub=function(){
return this._hub;
};
OpenAjax.hub.InlineContainer.prototype.sendToClient=function(_6,_7,_8){
if(this.isConnected()){
var _9=this._subs[_8];
try{
_9.cb.call(_9.sc,_6,_7,_9.d);
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
OpenAjax.hub.InlineContainer.prototype.connect=function(_a,_b,_c){
if(this._connected){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._connected=true;
this._client=_a;
if(this._onConnect){
try{
this._onConnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onConnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_b,_c,_a,true);
};
OpenAjax.hub.InlineContainer.prototype.disconnect=function(_d,_e,_f){
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
this._invokeOnComplete(_e,_f,_d,true);
};
OpenAjax.hub.InlineContainer.prototype.subscribe=function(_10,_11,_12,_13,_14){
this._assertConn();
this._assertSubTopic(_10);
if(!_11){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _15=""+this._subIndex++;
var _16=false;
var msg=null;
try{
var _17=this._hub.subscribeForClient(this,_10,_15);
_16=true;
}
catch(e){
_15=null;
msg=e.message;
}
_12=_12||window;
if(_16){
this._subs[_15]={h:_17,cb:_11,sc:_12,d:_14};
}
this._invokeOnComplete(_13,_12,_15,_16,msg);
return _15;
};
OpenAjax.hub.InlineContainer.prototype.publish=function(_18,_19){
this._assertConn();
this._assertPubTopic(_18);
this._hub.publishForClient(this,_18,_19);
};
OpenAjax.hub.InlineContainer.prototype.unsubscribe=function(_1a,_1b,_1c){
this._assertConn();
if(typeof _1a==="undefined"||_1a==null){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var sub=this._subs[_1a];
if(!sub){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
this._hub.unsubscribeForClient(this,sub.h);
delete this._subs[_1a];
this._invokeOnComplete(_1b,_1c,_1a,true);
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberData=function(_1d){
this._assertConn();
return this._getSubscription(_1d).d;
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberScope=function(_1e){
this._assertConn();
return this._getSubscription(_1e).sc;
};
OpenAjax.hub.InlineContainer.prototype._invokeOnComplete=function(_1f,_20,_21,_22,_23){
if(_1f){
try{
_20=_20||window;
_1f.call(_20,_21,_22,_23);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype._disconnect=function(){
for(var _24 in this._subs){
this._hub.unsubscribeForClient(this,this._subs[_24].h);
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
OpenAjax.hub.InlineContainer.prototype._assertPubTopic=function(_25){
if((_25==null)||(_25=="")||(_25.indexOf("*")!=-1)||(_25.indexOf("..")!=-1)||(_25.charAt(0)==".")||(_25.charAt(_25.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.InlineContainer.prototype._assertSubTopic=function(_26){
if(!_26){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _27=_26.split(".");
var len=_27.length;
for(var i=0;i<len;i++){
var p=_27[i];
if((p=="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.InlineContainer.prototype._getSubscription=function(_28){
var sub=this._subs[_28];
if(sub){
return sub;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.InlineHubClient=function(_29){
if(!_29||!_29.HubClient||!_29.HubClient.onSecurityAlert||!_29.InlineHubClient||!_29.InlineHubClient.container){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_29;
this._onSecurityAlert=_29.HubClient.onSecurityAlert;
this._scope=_29.HubClient.scope||window;
this._container=_29.InlineHubClient.container;
if(_29.HubClient.log){
var _2a=this;
this._log=function(msg){
try{
_29.HubClient.log.call(_2a._scope,"InlineHubClient::"+_2a._container.getClientID()+": "+msg);
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
OpenAjax.hub.InlineHubClient.prototype.connect=function(_2b,_2c){
this._container.connect(this,_2b,_2c);
};
OpenAjax.hub.InlineHubClient.prototype.disconnect=function(_2d,_2e){
this._container.disconnect(this,_2d,_2e);
};
OpenAjax.hub.InlineHubClient.prototype.getPartnerOrigin=function(){
return this._container.getPartnerOrigin();
};
OpenAjax.hub.InlineHubClient.prototype.getClientID=function(){
return this._container.getClientID();
};
OpenAjax.hub.InlineHubClient.prototype.subscribe=function(_2f,_30,_31,_32,_33){
return this._container.subscribe(_2f,_30,_31,_32,_33);
};
OpenAjax.hub.InlineHubClient.prototype.publish=function(_34,_35){
this._container.publish(_34,_35);
};
OpenAjax.hub.InlineHubClient.prototype.unsubscribe=function(_36,_37,_38){
this._container.unsubscribe(_36,_37,_38);
};
OpenAjax.hub.InlineHubClient.prototype.isConnected=function(){
return this._container.isConnected();
};
OpenAjax.hub.InlineHubClient.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberData=function(_39){
return this._container.getSubscriberData(_39);
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberScope=function(_3a){
return this._container.getSubscriberScope(_3a);
};
OpenAjax.hub.InlineHubClient.prototype.getParameters=function(){
return this._params;
};

