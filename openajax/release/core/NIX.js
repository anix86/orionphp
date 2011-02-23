OpenAjax.hub.IframeContainer._NIX=function(){
var _1="openajax-2.0.2";
var _2="GRPC____NIXVBS_wrapper";
var _3="GRPC____NIXVBS_get_wrapper";
var _4="GRPC____NIXVBS_handle_message";
var _5="GRPC____NIXVBS_create_channel";
var _6=10;
var _7=500;
var _8={};
var _9=0;
var _a;
if(typeof window[_3]!=="unknown"){
window[_4]=function(_b){
window.setTimeout(function(){
_c(JSON.parse(_b));
},0);
};
window[_5]=function(_d,_e,_f){
if(_10(_d)===_f){
_8[_d].nix_channel=_e;
_11(_d,true,"nix");
}
};
var _12="Class "+_2+"\n "+"Private m_Intended\n"+"Private m_Auth\n"+"Public Sub SetIntendedName(name)\n "+"If isEmpty(m_Intended) Then\n"+"m_Intended = name\n"+"End If\n"+"End Sub\n"+"Public Sub SetAuth(auth)\n "+"If isEmpty(m_Auth) Then\n"+"m_Auth = auth\n"+"End If\n"+"End Sub\n"+"Public Sub SendMessage(data)\n "+_4+"(data)\n"+"End Sub\n"+"Public Function GetAuthToken()\n "+"GetAuthToken = m_Auth\n"+"End Function\n"+"Public Sub CreateChannel(channel, auth)\n "+"Call "+_5+"(m_Intended, channel, auth)\n"+"End Sub\n"+"End Class\n"+"Function "+_3+"(name, auth)\n"+"Dim wrap\n"+"Set wrap = New "+_2+"\n"+"wrap.SetIntendedName name\n"+"wrap.SetAuth auth\n"+"Set "+_3+" = wrap\n"+"End Function";
try{
window.execScript(_12,"vbscript");
}
catch(e){
throw new Error("Failed to create NIX VBScript object");
}
}
this.addReceiver=function(_13){
_8[_13.receiverId]={r:_13.receiver};
if(_13.receiverId===".."){
return _14.call(this,_13);
}
return _15.call(this,_13);
};
this.getURI=function(){
return _a;
};
this.postAdd=function(_16,_17){
try{
var _18=window[_3](_16,_8[_16].authToken);
OpenAjax.hub.IframeContainer._getTargetWin(_16).opener=_18;
}
catch(e){
return false;
}
return true;
};
this.sendMsg=function(_19,_1a){
if(_19===".."){
_1a.t=_8[_19].authToken;
}
try{
if(_8[_19]){
_8[_19].nix_channel.SendMessage(JSON.stringify(_1a));
}
}
catch(e){
return false;
}
return true;
};
this.tunnelLoaded=function(){
var id=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _1b=OpenAjax.hub.IframeContainer._queryURLParam("oaht1");
var _1c=OpenAjax.hub.IframeContainer._queryURLParam("oaht2");
var _1d=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
window.parent.parent.OpenAjax.hub.IframeContainer._NIX._receiveTunnelMsg(id,_1b,_1c,_1d);
return id;
};
this.removeReceiver=function(_1e){
delete _8[_1e];
if(_1e===".."){
if(_1f){
clearInterval(_1f);
_1f=null;
}
}
};
function _20(){
var _21=_8[".."].nix_channel;
if(_21){
return;
}
if(++_9>_6){
_11("..",false,"nix");
return;
}
if(!_21&&window.opener&&"GetAuthToken" in window.opener){
_21=window.opener;
var _22=_10("..");
if(_21.GetAuthToken()==_22){
_21.CreateChannel(window[_3]("..",_22),_22);
_8[".."].nix_channel=_21;
window.opener=null;
_11("..",true,"nix");
return;
}
}
window.setTimeout(function(){
_20();
},_7);
};
function _10(_23){
if(!_8[_23].authToken&&_23===".."){
_8[".."].authToken=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
}
return _8[_23].authToken;
};
function _11(_24,_25,_26,_27){
if(!_8[_24]){
return;
}
var rec=_8[_24];
var _28=_24===".."?OpenAjax.hub.IframeContainer._queryURLParam("oahi"):_24;
if(!_25){
var _29;
if(_27){
_29={securityAlert:_27};
}
rec.r.transportReady(_28,null,false,_29);
return;
}
rec["ready_"+_26]=true;
if(rec.ready_nix&&rec.ready_fim){
_29={partnerOrigin:_8[_24].partnerOrigin};
rec.r.transportReady(_28,null,true,_29);
}
};
function _c(_2a){
var id=_2a.r||_2a.i;
if(!_8[id]){
return;
}
if(_10(id)!==_2a.t){
_8[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_8[id].r.receiveMsg(_2a);
};
function _15(_2b){
_8[_2b.receiverId].authToken=_2b.securityToken;
var _2c="oahpv="+encodeURIComponent(_1)+"&oahi="+encodeURIComponent(_2b.receiverId)+(_2b.name?"&oahn="+encodeURIComponent(_2b.name):"")+"&oaht="+_2b.securityToken+"&oahu="+encodeURIComponent(_2b.tunnelURI);
var _2d=_2b.uri.split("#");
_2d[0]=_2d[0]+((_2d[0].indexOf("?")!=-1)?"&":"?")+_2c;
_a=_2d.length===1?_2d[0]:_2d[0]+"#"+_2d[1];
return null;
};
function _14(_2e){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_1){
return null;
}
_20();
var id=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _2f=OpenAjax.hub.IframeContainer._queryURLParam("oahn");
var _30=_10("..");
var _31=_2e.securityToken;
var _32=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
if(!id||!_30||!_32){
return null;
}
_8[".."].childAuthToken=_31;
_8[".."].partnerOrigin=/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_32)[1];
var _33="oahi="+encodeURIComponent(id)+"&oaht1="+_30+"&oaht2="+_31+"&oahu="+encodeURIComponent(window.location.href);
var _34=_32.split("#");
_34[0]=_34[0]+((_34[0].indexOf("?")!=-1)?"&":"?")+_33;
var uri=_34.length===1?_34[0]:_34[0]+"#"+_34[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(uri);
_1f=setInterval(_35,100);
return _2f||id;
};
OpenAjax.hub.IframeContainer._NIX._receiveTunnelMsg=function(_36,_37,_38,_39){
if(_8[_36].authToken!==_37){
_11(_36,false,"fim","OpenAjax.hub.SecurityAlert.FramePhish");
return;
}
document.getElementById(_36).src=_39+"#"+_38;
_8[_36].partnerOrigin=/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_39)[1];
_11(_36,true,"fim");
};
var _1f;
function _35(){
var _3a=window.location.href.split("#");
if(_3a.length===2){
clearInterval(_1f);
_1f=null;
if(_3a[1]===_8[".."].childAuthToken){
_11("..",true,"fim");
return;
}
_11("..",false,"fim","OpenAjax.hub.SecurityAlert.FramePhish");
}
};
};

