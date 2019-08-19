import * as THREE from 'three'
var THREE_Text = /******/ function(t){function e(s){if(i[s])return i[s].exports;var n=i[s]={exports:{},id:s,loaded:!1};return t[s].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var i={};return e.m=t,e.c=i,e.p="",e(0)}([function(t,e,i){"use strict";var s=i(1);e.SpriteText2D=s.SpriteText2D;var n=i(6);e.MeshText2D=n.MeshText2D;var r=i(4);e.textAlign=r.textAlign},function(t,e,i){"use strict";var s=this&&this.__extends||function(t,e){function i(){this.constructor=t}for(var s in e)e.hasOwnProperty(s)&&(t[s]=e[s]);t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)},n=i(2),r=i(3),h=function(t){function e(){t.apply(this,arguments)}return s(e,t),e.prototype.raycast=function(){return this.sprite.raycast.apply(this.sprite,arguments)},e.prototype.updateText=function(){this.canvas.drawText(this._text,{font:this._font,fillStyle:this._fillStyle}),this.cleanUp(),this.texture=new n.Texture(this.canvas.canvas),this.texture.needsUpdate=!0,this.applyAntiAlias(),this.material?this.material.map=this.texture:this.material=new n.SpriteMaterial({map:this.texture}),this.sprite||(this.sprite=new n.Sprite(this.material),this.geometry=this.sprite.geometry,this.add(this.sprite)),this.sprite.scale.set(this.canvas.width,this.canvas.height,1),this.sprite.position.x=this.canvas.width/2-this.canvas.textWidth/2+this.canvas.textWidth/2*this.align.x,this.sprite.position.y=-this.canvas.height/2+this.canvas.textHeight/2*this.align.y},e}(r.Text2D);e.SpriteText2D=h},function(t,e){t.exports=THREE},function(t,e,i){"use strict";var s=this&&this.__extends||function(t,e){function i(){this.constructor=t}for(var s in e)e.hasOwnProperty(s)&&(t[s]=e[s]);t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)},n=i(2),r=i(4),h=i(5),a=function(t){function e(e,i){void 0===e&&(e=""),void 0===i&&(i={}),t.call(this),this._font=i.font||"30px Arial",this._fillStyle=i.fillStyle||"#FFFFFF",this.canvas=new h.CanvasText,this.align=i.align||r.textAlign.center,this.side=i.side||n.DoubleSide,this.antialias="undefined"==typeof i.antialias||i.antialias,this.text=e}return s(e,t),Object.defineProperty(e.prototype,"width",{get:function(){return this.canvas.textWidth},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"height",{get:function(){return this.canvas.textHeight},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return this._text},set:function(t){this._text!==t&&(this._text=t,this.updateText())},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"font",{get:function(){return this._font},set:function(t){this._font!==t&&(this._font=t,this.updateText())},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"fillStyle",{get:function(){return this._fillStyle},set:function(t){this._fillStyle!==t&&(this._fillStyle=t,this.updateText())},enumerable:!0,configurable:!0}),e.prototype.cleanUp=function(){this.texture&&this.texture.dispose()},e.prototype.applyAntiAlias=function(){this.antialias===!1&&(this.texture.magFilter=n.NearestFilter,this.texture.minFilter=n.LinearMipMapLinearFilter)},e}(n.Object3D);e.Text2D=a},function(t,e,i){"use strict";function s(t){var e=r[t];if(!e){var i=document.getElementsByTagName("body")[0],s=document.createElement("div"),n=document.createTextNode("MEq");s.appendChild(n),s.setAttribute("style","font:"+t+";position:absolute;top:0;left:0"),i.appendChild(s),e=s.offsetHeight,r[t]=e,i.removeChild(s)}return e}var n=i(2);e.textAlign={center:new n.Vector2(0,0),left:new n.Vector2(1,0),topLeft:new n.Vector2(1,(-1)),topRight:new n.Vector2((-1),(-1)),right:new n.Vector2((-1),0),bottomLeft:new n.Vector2(1,1),bottomRight:new n.Vector2((-1),1)};var r={};e.getFontHeight=s},function(t,e,i){"use strict";var s=i(2),n=i(4),r=function(){function t(){this.textWidth=null,this.textHeight=null,this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d")}return Object.defineProperty(t.prototype,"width",{get:function(){return this.canvas.width},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"height",{get:function(){return this.canvas.height},enumerable:!0,configurable:!0}),t.prototype.drawText=function(t,e){return this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.font=e.font,this.textWidth=Math.ceil(this.ctx.measureText(t).width),this.textHeight=n.getFontHeight(this.ctx.font),this.canvas.width=s.Math.ceilPowerOfTwo(this.textWidth),this.canvas.height=s.Math.ceilPowerOfTwo(this.textHeight),this.ctx.font=e.font,this.ctx.fillStyle=e.fillStyle,this.ctx.textAlign="left",this.ctx.textBaseline="top",this.ctx.fillText(t,0,0),this.canvas},t}();e.CanvasText=r},function(t,e,i){"use strict";var s=this&&this.__extends||function(t,e){function i(){this.constructor=t}for(var s in e)e.hasOwnProperty(s)&&(t[s]=e[s]);t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)},n=i(2),r=i(3),h=function(t){function e(e,i){void 0===e&&(e=""),void 0===i&&(i={}),t.call(this,e,i)}return s(e,t),e.prototype.raycast=function(){this.mesh.raycast.apply(this.mesh,arguments)},e.prototype.updateText=function(){this.cleanUp(),this.canvas.drawText(this._text,{font:this._font,fillStyle:this._fillStyle}),this.texture=new n.Texture(this.canvas.canvas),this.texture.needsUpdate=!0,this.applyAntiAlias(),this.material?this.material.map=this.texture:(this.material=new n.MeshBasicMaterial({map:this.texture,side:this.side}),this.material.transparent=!0),this.mesh||(this.geometry=new n.PlaneGeometry(this.canvas.width,this.canvas.height),this.mesh=new n.Mesh(this.geometry,this.material),this.add(this.mesh)),this.mesh.position.x=this.canvas.width/2-this.canvas.textWidth/2+this.canvas.textWidth/2*this.align.x,this.mesh.position.y=-this.canvas.height/2+this.canvas.textHeight/2*this.align.y,this.geometry.vertices[0].x=this.geometry.vertices[2].x=-this.canvas.width/2,this.geometry.vertices[1].x=this.geometry.vertices[3].x=this.canvas.width/2,this.geometry.vertices[0].y=this.geometry.vertices[1].y=this.canvas.height/2,this.geometry.vertices[2].y=this.geometry.vertices[3].y=-this.canvas.height/2,this.geometry.verticesNeedUpdate=!0},e}(r.Text2D);e.MeshText2D=h}]);

export default THREE_Text;