OpenAjax.hub.IframeContainer._FIM=function(){
var _1={},_2={},_3={};
var _4;
OpenAjax.hub.IframeContainer._FIM.instances=_2;
this.addReceiver=function(_5){
_1[_5.receiverId]={r:_5.receiver};
_3[_5.receiverId]={initialized:false,queueOut:[],lib:null};
if(_5.receiverId===".."){
return _6.call(this,_5);
}
return _7.call(this,_5);
};
this.getURI=function(){
return _4;
};
this.postAdd=function(_8,_9){
return true;
};
this.sendMsg=function(_a,_b){
var _c=new _d.SECommMessage();
switch(_b.m){
case "con":
_c.type=_d.SECommMessage.CONNECT;
_c.payload=window.location.href.split("#")[0];
break;
case "con_ack":
_c.type=_d.SECommMessage.CONNECT_ACK;
break;
case "dis":
_c.type=_d.SECommMessage.DISCONNECT;
break;
case "dis_ack":
_c.type=_d.SECommMessage.DISCONNECT_ACK;
break;
case "pub":
if(_b.p.s){
_c.type=_d.SECommMessage.DISTRIBUTE;
_c.additionalHeader={s:_b.p.s};
}else{
_c.type=_d.SECommMessage.PUBLISH;
_c.additionalHeader={};
}
_c.topic=_b.p.t;
if(typeof _b.p.d==="string"){
_c.additionalHeader.f="S";
_c.payload=_b.p.d;
}else{
_c.additionalHeader.f="J";
_c.payload=JSON.stringify(_b.p.d);
}
break;
case "sub":
_c.type=_d.SECommMessage.SUBSCRIBE;
_c.topic=_b.p.t;
_c.additionalHeader={subId:_b.p.s};
break;
case "sub_ack":
_c.type=_d.SECommMessage.SUBSCRIBE_ACK;
_c.additionalHeader={subId:_b.p.s,isOk:(_b.p.e===""),err:_b.p.e};
break;
case "uns":
_c.type=_d.SECommMessage.UNSUBSCRIBE;
_c.additionalHeader={subId:_b.p.s};
break;
case "uns_ack":
_c.type=_d.SECommMessage.UNSUBSCRIBE_ACK;
_c.additionalHeader={subId:_b.p.s};
break;
}
var c=_3[_a];
if(c.initialized){
c.lib.send(_c.serialize());
}else{
c.queueOut.push(_c.serialize());
}
return true;
};
this.tunnelLoaded=function(){
new _d.CommLib(false,window.parent.parent.OpenAjax.hub.IframeContainer._FIM.instances);
var _e=window.location.href.split("#")[1];
return decodeURIComponent(_e.substring(_d._securityTokenOverhead+6).split(":")[0]);
};
this.removeReceiver=function(_f){
delete _1[_f];
delete _3[_f];
delete _2[_f];
};
function _7(_10){
_2[_10.receiverId]=new _11(_10.receiverId,_10.log);
_1[_10.receiverId].tok=_10.securityToken;
_1[_10.receiverId].uri=_10.uri;
var _12=_10.name||_10.receiverId;
_4=_10.uri+"#"+_d._protocolID+":100"+_10.securityToken+_10.securityToken+"000"+encodeURIComponent(_10.receiverId)+":"+encodeURIComponent(_12)+":"+encodeURIComponent(_10.tunnelURI);
return null;
};
function _6(_13){
var _14=window.location.href.split("#");
if(!_14[1]){
return null;
}
var _15=_14[1].split(":",3);
var _16=_15[0];
if(_16!==_d._protocolID){
return null;
}
var _17=_14[0]+"#"+_14[1].substring(_16.length+1);
window.location.replace(_17);
_d._clientSecurityToken=_13.securityToken;
_2[".."]=new _11("..",_13.log);
_3[".."].lib=new _d.CommLib(true,_2);
return decodeURIComponent(_15[2]);
};
function _11(_18,_19){
this.messageReceived=function(_1a){
var _1b={i:_18};
var msg=new _d.SECommMessage();
msg.deserialize(_1a);
switch(msg.type){
case _d.SECommMessage.PUBLISH:
case _d.SECommMessage.DISTRIBUTE:
_1b.m="pub";
if(msg.additionalHeader){
_1b.p={t:msg.topic,d:msg.payload};
if(msg.additionalHeader.f==="J"){
_1b.p.d=JSON.parse(msg.payload);
}
if(msg.type===_d.SECommMessage.DISTRIBUTE){
_1b.p.s=msg.additionalHeader.s;
}
}
break;
case _d.SECommMessage.SUBSCRIBE:
_1b.m="sub";
if(msg.additionalHeader){
_1b.p={t:msg.topic,s:msg.additionalHeader.subId};
}
break;
case _d.SECommMessage.SUBSCRIBE_ACK:
_1b.m="sub_ack";
if(msg.additionalHeader){
_1b.p={s:msg.additionalHeader.subId,e:msg.additionalHeader.isOk?"":msg.additionalHeader.err};
}
break;
case _d.SECommMessage.UNSUBSCRIBE:
_1b.m="uns";
if(msg.additionalHeader){
_1b.p={s:msg.additionalHeader.subId};
}
break;
case _d.SECommMessage.UNSUBSCRIBE_ACK:
_1b.m="uns_ack";
if(msg.additionalHeader){
_1b.p={s:msg.additionalHeader.subId};
}
break;
case _d.SECommMessage.CONNECT:
_1b.m="con";
break;
case _d.SECommMessage.CONNECT_ACK:
_1b.m="con_ack";
break;
case _d.SECommMessage.DISCONNECT:
_1b.m="dis";
break;
case _d.SECommMessage.DISCONNECT_ACK:
_1b.m="dis_ack";
break;
}
_1[_18].r.receiveMsg(_1b);
};
this.initializationFinished=function(_1c,_1d,_1e,_1f,_20,_21,_22){
var c=_3[_18];
var rec=_1[_18];
var _23={partnerOrigin:/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_1e)[1]};
if(_18===".."){
_23.debug=_22;
}else{
if(_1f!==rec.tok||_1e!==rec.uri){
this.handleSecurityError(_d.SecurityErrors.TOKEN_VERIFICATION_FAILED);
return false;
}
_19("Tunnel commLib initialization finished. Processing outgoing queue. Security token: "+_1f);
c.lib=_21;
}
c.initialized=true;
while(c.queueOut.length>0){
c.lib.send(c.queueOut.shift());
}
rec.r.transportReady(_1c,_1d,true,_23);
return true;
};
this.handleSecurityError=function(_24){
_1[_18].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
};
this.log=function(msg){
_19(msg);
};
};
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
var _d=OpenAjax._smash;
_d._protocolID="openajax-2.0.2";
_d._securityTokenLength=6;
_d._securityTokenOverhead=null;
_d._computeOtherTokenConstants=function(){
_d._securityTokenOverhead=2*_d._securityTokenLength;
};
_d._computeOtherTokenConstants();
_d.SecurityErrors={INVALID_TOKEN:0,TOKEN_VERIFICATION_FAILED:1,TUNNEL_UNLOAD:2,COMPONENT_LOAD:3};
_d.SECommMessage=function(){
this.type=null;
this.topic=null;
this.additionalHeader=null;
this.payload=null;
var _25="y";
var _26="t";
var _27="h";
var _28="p";
this.serialize=function(){
var _29=_25+"="+this.type;
if(this.topic!=null){
var _2a=encodeURIComponent(this.topic);
var _2b="&"+_26+"="+_2a;
_29+=_2b;
}
if(this.additionalHeader!=null){
var _2c=encodeURIComponent(JSON.stringify(this.additionalHeader));
var _2d="&"+_27+"="+_2c;
_29+=_2d;
}
if(this.payload!=null){
var _2e=encodeURIComponent(this.payload);
var _2f="&"+_28+"="+_2e;
_29+=_2f;
}
return _29;
};
this.deserialize=function(_30){
var _31=_30.split("&");
for(var i=0;i<_31.length;i++){
var _32=_31[i].split("=");
switch(_32[0]){
case _25:
this.type=_32[1];
break;
case _26:
this.topic=decodeURIComponent(_32[1]);
break;
case _27:
var _33=decodeURIComponent(_32[1]);
this.additionalHeader=JSON.parse(_33);
break;
case _28:
this.payload=decodeURIComponent(_32[1]);
break;
}
}
};
};
_d.SECommMessage.CONNECT="con";
_d.SECommMessage.CONNECT_ACK="cac";
_d.SECommMessage.DISCONNECT="xcon";
_d.SECommMessage.DISCONNECT_ACK="xac";
_d.SECommMessage.PUBLISH="pub";
_d.SECommMessage.DISTRIBUTE="dis";
_d.SECommMessage.SUBSCRIBE="sub";
_d.SECommMessage.UNSUBSCRIBE="uns";
_d.SECommMessage.SUBSCRIBE_ACK="sac";
_d.SECommMessage.UNSUBSCRIBE_ACK="uac";
_d.SECommMessage.ERROR="err";
_d.CommLib=function(_34,_35){
var _36="1";
var ACK="2";
var _37="3";
var END="4";
var _38=this;
var _39=100;
var _3a=4000;
var _3b=6;
var ack=0;
var _3c=null;
var _3d=null;
var _3e=null;
var _3f=null;
var _40=null;
var _41=null;
var _42=null;
var _43=[];
var msn=0;
var _44="";
var _45=null;
var _46=null;
var _47=null;
var _48=null;
var _49=null;
var _4a=null;
var _4b=[];
var _4c=false;
this.send=function(_4d){
if(_41==null){
log("Trying to send without proper initialization. Message will be discarded. "+_4d);
return;
}
log("Sending: "+_4d);
var _4e=_4d;
var _4f=_3a-_3b-_d._securityTokenOverhead-_41.length;
var _50=_4e;
while(_50.length>0){
var _51=_50.substr(0,_4f);
_50=_50.substr(_4f);
if(_50==0){
_43.push({type:END,payload:_51});
}else{
_43.push({type:_37,payload:_51});
}
}
};
function _52(){
if(_53()){
if(_54()){
if(_55()){
_56();
}
}
}
if(_57()){
_58();
}
};
function _57(){
if(_40.type==ACK){
return true;
}
if((_40.msn==_3d.ackMsn)&&(_3d.ack==1)){
return true;
}
log("Waiting for ACK : "+_40.msn);
return false;
};
function _59(){
msn++;
if(msn==100){
msn=0;
}
if(msn<10){
return "0"+msn;
}
return ""+msn;
};
function _53(){
var _5a=window.location.href.split("#");
if(_5a.length==2){
var _5b=_5a[1];
if(_5b!=""&&_5b!=_3c){
_3c=_5b;
return true;
}
}
return false;
};
function _54(){
var _5c=_3c.substr(0,1);
var msn=_3c.substr(1,2);
var _5d=3;
var _5e=_3c.substr(_5d,_d._securityTokenLength);
_5d+=_d._securityTokenLength;
var _5f=_3c.substr(_5d,_d._securityTokenLength);
_5d+=_d._securityTokenLength;
var ack=_3c.substr(_5d,1);
_5d+=1;
var _60=_3c.substr(_5d,2);
_5d+=2;
var _61=_3c.substr(_5d);
log("In : Type: "+_5c+" msn: "+msn+" tokenParent: "+_5e+" tokenChild: "+_5f+" ack: "+ack+" msn: "+_60+" payload: "+_61);
_3d={type:_5c,msn:msn,tokenParent:_5e,tokenChild:_5f,ack:ack,ackMsn:_60,payload:_61};
return true;
};
function _55(){
if(_3d.type!=_36&&(_3d.tokenParent!=_46||_3d.tokenChild!=_47)){
log("Security token error: Invalid security token received. The message will be discarded.");
_62(_d.SecurityErrors.INVALID_TOKEN);
return false;
}
return true;
};
function _56(){
ack=1;
if(_3d.type!=_36&&_34&&_40.type==_36&&_3d.ack=="1"&&_40.msn==_3d.ackMsn){
_4a.initializationFinished(_48,_49,_41,_46,_47,null,_4c);
}
switch(_3d.type){
case _36:
_63();
break;
case ACK:
_64();
break;
case _37:
_65();
break;
case END:
_66();
break;
}
_3e=_3d;
};
function _63(){
var _67=_3d.payload.split(":");
_48=decodeURIComponent(_67[0]);
_49=decodeURIComponent(_67[1]);
_41=decodeURIComponent(_67[2]);
_46=_3d.tokenParent;
_47=_3d.tokenChild;
if(_34){
_47=_d._clientSecurityToken;
var _68="3827816c-f3b1-11db-8314-0800200c9a66";
var _69=document.createElement("iframe");
var _6a=encodeURIComponent(window.location.href.split("#")[0]);
var _6b=encodeURIComponent(_48)+":"+encodeURIComponent(_49)+":"+_6a;
_69.src=_41+"#100"+_46+_47+"100"+_6b;
_69.name=_68;
_69.id=_68;
document.body.appendChild(_69);
_69.style.position="absolute";
_69.style.left=_69.style.top="-10px";
_69.style.height=_69.style.width="1px";
_69.style.visibility="hidden";
ack=0;
_42=window.frames[_68];
_40={type:_36,msn:"00",tokenParent:_46,tokenChild:_47,ack:"0",ackMsn:"00",payload:_6b};
_4a=_35[".."];
_4c=_67[3]&&_67[3]==="debug";
}else{
_42=window.parent;
_4a=_35[_48];
var _6c=_4a.initializationFinished(_48,_49,_41,_46,_47,_38);
if(!_6c){
ack=0;
}
_40={type:_36,msn:"00",tokenParent:_46,tokenChild:_47,ack:"0",ackMsn:"00",payload:(encodeURIComponent(_48)+":"+encodeURIComponent(_49)+":"+encodeURIComponent(window.location.href.split("#")[0]))};
}
if(_42==null){
log("Init failed.");
}
};
function _64(){
ack=0;
};
function _65(){
_44+=_3d.payload;
};
function _66(){
_44+=_3d.payload;
log("Received: "+_44);
_4a.messageReceived(_44);
_44="";
};
function _58(){
if(_43.length==0&&ack==1){
_43.push({type:ACK,payload:""});
}
if(_43.length!=0){
_3f=_43.shift();
_3f.tokenParent=_46;
_3f.tokenChild=_47;
_3f.msn=_59();
_3f.ack="1";
_3f.ackMsn=_3e.msn;
ack=0;
_6d();
}
};
function _6d(){
var url=_41+"#"+_3f.type+_3f.msn+_3f.tokenParent+_3f.tokenChild+_3f.ack+_3f.ackMsn+_3f.payload;
_42.location.replace(url);
_40=_3f;
log("Out: Type: "+_3f.type+" msn: "+_3f.msn+" tokenParent: "+_3f.tokenParent+" tokenChild: "+_3f.tokenChild+" ack: "+_3f.ack+" msn: "+_3f.ackMsn+" payload: "+_3f.payload);
};
function _62(_6e){
clearInterval(_45);
_4a.handleSecurityError(_6e);
};
function log(msg){
if(_4a){
while(_4b.length>0){
_4a.log(_4b.shift());
}
_4a.log(msg);
}else{
_4b.push(msg);
}
};
_45=setInterval(_52,_39);
};
};

