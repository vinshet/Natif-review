/*! BootstrapMsg v1.0.8 | Copyright (c) 2016-present Duc Doan (ducdhm@gmail.com) */
!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n(require("jquery")):"function"==typeof define&&define.amd?define("Msg",["jquery"],n):"object"==typeof exports?exports.Msg=n(require("jquery")):e.Msg=n(e.$)}("undefined"!=typeof self?self:this,(function(e){return function(e){var n={};function t(i){if(n[i])return n[i].exports;var o=n[i]={i:i,l:!1,exports:{}};return e[i].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=n,t.d=function(e,n,i){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:i})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(t.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(i,o,function(n){return e[n]}.bind(null,o));return i},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=2)}([function(n,t){n.exports=e},function(e,n,t){},function(e,n,t){"use strict";t.r(n);var i=t(0),o=t.n(i),r={info:"fa fa-info-circle",success:"fa fa-check-circle",warning:"fa fa-exclamation-circle",danger:"fa fa-times-circle"},s={ICONS:{BOOTSTRAP:{info:"glyphicon glyphicon-info-sign",success:"glyphicon glyphicon-ok-sign",warning:"glyphicon glyphicon-exclamation-sign",danger:"glyphicon glyphicon-remove-sign"},FONTAWESOME:r},icon:r,iconEnabled:!0,timeout:{info:5e3,success:5e3,warning:5e3,danger:5e3},version:"1.0.8",timer:null,extraClass:"",init:function(){var e=this,n=o()('\n<div id="msg" style="display:none;">\n<a href="#" data-dismiss="msg" class="close">&times;</a>\n<i></i>\n<span></span>\n<div class="msg-progress"></div>\n</div>\n');return n.find('[data-dismiss="msg"]').on("click",(function(n){n.preventDefault(),e.hideMsg()})),n.appendTo(document.body),e},showMsg:function(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.timeout[e],i=this,r=o()("#msg"),s=r.find("div");r.find("span").html(n),r.find("i").attr("class",i.icon[e]),r.attr("class","alert alert-".concat(e," showed ").concat(i.extraClass," ").concat(i.iconEnabled?"":"alert-no-icon")),s.attr("class","alert alert-".concat(e," msg-progress")).css("width",0),clearTimeout(this.timer),t>0&&(s.stop().animate({width:"100%"},t),this.timer=setTimeout((function(){i.hideMsg()}),t))},info:function(e,n){this.showMsg("info",e,n)},success:function(e,n){this.showMsg("success",e,n)},warning:function(e,n){this.showMsg("warning",e,n)},error:function(e,n){this.danger(e,n)},danger:function(e,n){this.showMsg("danger",e,n)},hideMsg:function(){o()("#msg").removeClass("showed")}}.init();t.d(n,"default",(function(){return s})),t(1)}]).default}));
//# sourceMappingURL=bootstrap-msg.js.map