/*!
 * pixi-heaven - v0.4.0
 * Compiled Tue, 25 Apr 2023 12:56:26 UTC
 *
 * pixi-heaven is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2023, Ivan Popelyshev, All Rights Reserved
 */this.PIXI=this.PIXI||{},this.PIXI.heaven=function(_,B,c,A,z,L,M,V,j,et,rt){"use strict";class ${constructor(e,r,i){this.vertices=e,this.uvs=r,this.indices=i}}function Z(){B.Spritesheet.prototype._processFrames=function(t){const e=this.data.meta;let r=t;const i=B.Spritesheet.BATCH_SIZE;for(;r-t<i&&r<this._frameKeys.length;){const a=this._frameKeys[r],s=this._frames[a],o=s.frame;if(o){let g=null,d=null;const f=s.trimmed!==!1&&s.sourceSize?s.sourceSize:s.frame,p=new c.Rectangle(0,0,Math.floor(f.w)/this.resolution,Math.floor(f.h)/this.resolution);if(s.rotated?g=new c.Rectangle(Math.floor(o.x)/this.resolution,Math.floor(o.y)/this.resolution,Math.floor(o.h)/this.resolution,Math.floor(o.w)/this.resolution):g=new c.Rectangle(Math.floor(o.x)/this.resolution,Math.floor(o.y)/this.resolution,Math.floor(o.w)/this.resolution,Math.floor(o.h)/this.resolution),s.trimmed!==!1&&s.spriteSourceSize&&(d=new c.Rectangle(Math.floor(s.spriteSourceSize.x)/this.resolution,Math.floor(s.spriteSourceSize.y)/this.resolution,Math.floor(o.w)/this.resolution,Math.floor(o.h)/this.resolution)),this.textures[a]=new c.Texture(this.baseTexture,g,p,d,s.rotated?2:0,s.anchor,s.borders),s.vertices){const m=new Float32Array(s.vertices.length*2);for(let n=0;n<s.vertices.length;n++)m[n*2]=Math.floor(s.vertices[n][0])/this.resolution,m[n*2+1]=Math.floor(s.vertices[n][1])/this.resolution;const h=new Float32Array(s.verticesUV.length*2);for(let n=0;n<s.verticesUV.length;n++)h[n*2]=s.verticesUV[n][0]/e.size.w,h[n*2+1]=s.verticesUV[n][1]/e.size.h;const l=new Uint16Array(s.triangles.length*3);for(let n=0;n<s.triangles.length;n++)l[n*3]=s.triangles[n][0],l[n*3+1]=s.triangles[n][1],l[n*3+2]=s.triangles[n][2];this.textures[a].polygon=new $(m,h,l)}c.Texture.addToCache(this.textures[a],a)}r++}}}class R{constructor(e,r){this._textures=null,this._durations=null,this.animationSpeed=1,this.loop=!0,this._currentTime=0,this.playing=!1,this.texture=e[0]instanceof c.Texture?e[0]:e[0].texture,this.textures=e,this._autoUpdate=r!==!1}stop(){this.playing&&(this.playing=!1,this._autoUpdate&&A.Ticker.shared.remove(this.update,this))}play(){this.playing||(this.playing=!0,this._autoUpdate&&A.Ticker.shared.add(this.update,this,A.UPDATE_PRIORITY.HIGH))}gotoAndStop(e){this.stop();const r=this.currentFrame;this._currentTime=e,r!==this.currentFrame&&this.updateTexture()}gotoAndPlay(e){const r=this.currentFrame;this._currentTime=e,r!==this.currentFrame&&this.updateTexture(),this.play()}update(e){const r=this.animationSpeed*e,i=this.currentFrame;if(this._durations!==null){let a=this._currentTime%1*this._durations[this.currentFrame];for(a+=r/60*1e3;a<0;)this._currentTime--,a+=this._durations[this.currentFrame];let s=this.animationSpeed*e;for(s<0?s=-1:s>0&&(s=1),this._currentTime=Math.floor(this._currentTime);a>=this._durations[this.currentFrame];)a-=this._durations[this.currentFrame]*s,this._currentTime+=s;this._currentTime+=a/this._durations[this.currentFrame]}else this._currentTime+=r;this._currentTime<0&&!this.loop?(this.gotoAndStop(0),this.onComplete&&this.onComplete()):this._currentTime>=this._textures.length&&!this.loop?(this.gotoAndStop(this._textures.length-1),this.onComplete&&this.onComplete()):i!==this.currentFrame&&(this.loop&&this.onLoop&&(this.animationSpeed>0&&this.currentFrame<i?this.onLoop():this.animationSpeed<0&&this.currentFrame>i&&this.onLoop()),this.updateTexture())}updateTexture(){this.texture=this._textures[this.currentFrame],this._target&&(this._target.texture=this.texture),this.onFrameChange&&this.onFrameChange(this.currentFrame)}bind(e){this._target=e,e.animState=this}static fromFrames(e){const r=[];for(let i=0;i<e.length;++i)r.push(c.Texture.from(e[i]));return new R(r)}static fromImages(e){const r=[];for(let i=0;i<e.length;++i)r.push(c.Texture.from(e[i]));return new R(r)}get totalFrames(){return this._textures.length}get textures(){return this._textures}set textures(e){if(e[0]instanceof c.Texture)this._textures=e,this._durations=null;else{this._textures=[],this._durations=[];for(let r=0;r<e.length;r++){const i=e[r];this._textures.push(i.texture),this._durations.push(i.time)}}this.gotoAndStop(0),this.updateTexture()}get currentFrame(){let e=Math.floor(this._currentTime)%this._textures.length;return e<0&&(e+=this._textures.length),e}}const it=[1,1,1,1],at=[0,0,0,1];class N{constructor(){this.dark=new Float32Array(at),this.light=new Float32Array(it),this._updateID=0,this._currentUpdateID=-1,this.darkRgba=0,this.lightRgba=-1,this.hasNoTint=!0}get darkR(){return this.dark[0]}set darkR(e){this.dark[0]!==e&&(this.dark[0]=e,this._updateID++)}get darkG(){return this.dark[1]}set darkG(e){this.dark[1]!==e&&(this.dark[1]=e,this._updateID++)}get darkB(){return this.dark[2]}set darkB(e){this.dark[2]!==e&&(this.dark[2]=e,this._updateID++)}get lightR(){return this.light[0]}set lightR(e){this.light[0]!==e&&(this.light[0]=e,this._updateID++)}get lightG(){return this.light[1]}set lightG(e){this.light[1]!==e&&(this.light[1]=e,this._updateID++)}get lightB(){return this.light[2]}set lightB(e){this.light[2]!==e&&(this.light[2]=e,this._updateID++)}get alpha(){return this.light[3]}set alpha(e){this.light[3]!==e&&(this.light[3]=e,this._updateID++)}get pma(){return this.dark[3]!==0}set pma(e){this.dark[3]!==0===e&&(this.dark[3]=e?1:0,this._updateID++)}get tintBGR(){const e=this.light;return(e[0]*255<<16)+(e[1]*255<<8)+(e[2]*255|0)}set tintBGR(e){this.setLight((e>>16&255)/255,(e>>8&255)/255,(e&255)/255)}setLight(e,r,i){const a=this.light;a[0]===e&&a[1]===r&&a[2]===i||(a[0]=e,a[1]=r,a[2]=i,this._updateID++)}setDark(e,r,i){const a=this.dark;a[0]===e&&a[1]===r&&a[2]===i||(a[0]=e,a[1]=r,a[2]=i,this._updateID++)}clear(){this.dark[0]=0,this.dark[1]=0,this.dark[2]=0,this.light[0]=1,this.light[1]=1,this.light[2]=1}invalidate(){this._updateID++}updateTransformLocal(){const e=this.dark,r=this.light,i=255*(1+(r[3]-1)*e[3]);this.hasNoTint=e[0]===0&&e[1]===0&&e[2]===0&&r[0]===1&&r[1]===1&&r[2]===1,this.darkRgba=(e[0]*i|0)+(e[1]*i<<8)+(e[2]*i<<16)+(e[3]*255<<24),this.lightRgba=(r[0]*i|0)+(r[1]*i<<8)+(r[2]*i<<16)+(r[3]*255<<24),this._currentUpdateID=this._updateID}updateTransform(){this._currentUpdateID!==this._updateID&&this.updateTransformLocal()}}const b=new L.Matrix,W=new Uint16Array([0,1,2,0,2,3]);class k extends M.Sprite{constructor(e){super(e),this.color=new N,this.maskSprite=null,this.maskVertexData=null,this.uvs=null,this.indices=W,this.animState=null,this.blendAddUnity=!1,this.pluginName="batchHeaven",this.texture.valid&&this._onTextureUpdate()}get tint(){return this.color?this.color.tintBGR:16777215}set tint(e){this.color&&(this.color.tintBGR=e)}_onTextureUpdate(){const e=this;e._textureID=-1,e._textureTrimmedID=-1;const r=e._texture;r.polygon?(this.uvs=r.polygon.uvs,this.indices=r.polygon.indices):(this.uvs=r._uvs.uvsFloat32,this.indices=W),this._cachedTint=16777215,this.color&&(this.color.pma=e._texture.baseTexture.premultipliedAlpha),e._width&&(this.scale.x=V.sign(this.scale.x)*e._width/e._texture.orig.width),e._height&&(this.scale.y=V.sign(this.scale.y)*e._height/e._texture.orig.height)}_render(e){this.color.alpha=this.worldAlpha,this.color.updateTransform(),super._render(e)}_calculateBounds(){const e=this,r=e.polygon,i=e.trim,a=e.orig;!r&&(!i||i.width===a.width&&i.height===a.height)?(this.calculateVertices(),this._bounds.addQuad(e.vertexData)):(this.calculateTrimmedVertices(),this._bounds.addQuad(e.vertexTrimmedData))}calculateVertices(){const e=this,r=this.transform,i=e._texture;if(e._transformID===r._worldID&&e._textureID===i._updateID)return;e._transformID=r._worldID,e._textureID=i._updateID;const a=this.transform.worldTransform,s=a.a,o=a.b,g=a.c,d=a.d,f=a.tx,p=a.ty,m=e._anchor,h=i.orig;if(i.polygon){const l=i.polygon.vertices,n=l.length;e.vertexData.length!==n&&(e.vertexData=new Float32Array(n));const u=e.vertexData,x=-(m._x*h.width),T=-(m._y*h.height);for(let v=0;v<n;v+=2){const I=l[v]+x,tt=l[v+1]+T;u[v]=I*s+tt*g+f,u[v+1]=I*o+tt*d+p}}else{const l=e.vertexData,n=i.trim;let u=0,x=0,T=0,v=0;n?(x=n.x-m._x*h.width,u=x+n.width,v=n.y-m._y*h.height,T=v+n.height):(x=-m._x*h.width,u=x+h.width,v=-m._y*h.height,T=v+h.height),l[0]=s*x+g*v+f,l[1]=d*v+o*x+p,l[2]=s*u+g*v+f,l[3]=d*v+o*u+p,l[4]=s*u+g*T+f,l[5]=d*T+o*u+p,l[6]=s*x+g*T+f,l[7]=d*T+o*x+p}}calculateMaskVertices(){const e=this.maskSprite,r=e.texture,i=r.orig,a=e.anchor;if(!r.valid)return;r.uvMatrix||(r.uvMatrix=new c.TextureMatrix(r,0)),r.uvMatrix.update(),e.transform.worldTransform.copyTo(b),b.invert(),b.scale(1/i.width,1/i.height),b.translate(a.x,a.y),b.prepend(r.uvMatrix.mapCoord);const s=this.vertexData,o=s.length;(!this.maskVertexData||this.maskVertexData.length!==o)&&(this.maskVertexData=new Float32Array(o));const g=this.maskVertexData;for(let d=0;d<o;d+=2)g[d]=s[d]*b.a+s[d+1]*b.c+b.tx,g[d+1]=s[d]*b.b+s[d+1]*b.d+b.ty}destroy(e){this.animState&&(this.animState.stop(),this.animState=null),super.destroy(e)}}Object.defineProperty(k.prototype,"_tintRGB",{get(){return this.color.updateTransform(),this.color.lightRgba&16777215},set(){}});var G=(t=>(t[t.NEVER=0]="NEVER",t[t.AUTO=1]="AUTO",t[t.ALWAYS=2]="ALWAYS",t))(G||{});const y={MESH_CLAMP:1,BLEND_ADD_UNITY:!1},st=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTextureMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
}`,ot=`varying vec2 vTextureCoord;
uniform vec4 uLight, uDark;

uniform sampler2D uSampler;

void main(void)
{
vec4 texColor = texture2D(uSampler, vTextureCoord);
gl_FragColor.a = texColor.a * uLight.a;
gl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;
}
`,nt=`
varying vec2 vTextureCoord;
uniform vec4 uLight, uDark;
uniform vec4 uClampFrame;

uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;
    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z
        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)
            discard;
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.a = texColor.a * uLight.a;
    gl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;
}
`,q=new c.Color;class H extends c.Shader{constructor(e,r){const i={uSampler:e,uTextureMatrix:L.Matrix.IDENTITY,uDark:new Float32Array([0,0,0,1]),uLight:new Float32Array([1,1,1,1])};r=Object.assign({pluginName:"batchHeaven"},r);let a=r.allowTrim;a||(y.MESH_CLAMP===G.AUTO?a=e.trim&&(e.trim.width<e.orig.width||e.trim.height<e.orig.height):y.MESH_CLAMP===G.ALWAYS&&(a=!0)),r.uniforms&&Object.assign(i,r.uniforms),super(r.program||c.Program.from(st,a?nt:ot),i),this.allowTrim=a,this.uvMatrix=new c.TextureMatrix(e),this.batchable=r.program===void 0&&!this.allowTrim,this.pluginName=r.pluginName,this.color=r.color||new N,this._colorId=-1}get texture(){return this.uniforms.uSampler}set texture(e){this.uniforms.uSampler!==e&&(this.uniforms.uSampler=e,this.uvMatrix.texture=e,this.color.pma=e.baseTexture.premultiplyAlpha)}set alpha(e){this.color.alpha=e}get alpha(){return this.color.alpha}set tint(e){this.color.tintBGR=e}get tint(){return this.color.tintBGR}update(){if(this.color.updateTransform(),this._colorId!==this.color._updateID){this._colorId=this.color._updateID;const{color:e,uniforms:r}=this;q.setValue(e.light).premultiply(e.light[3],e.dark[3]>0).toArray(r.uLight),q.setValue(e.dark).premultiply(e.light[3],e.dark[3]>0).toArray(r.uDark)}this.uvMatrix.update()&&(this.uniforms.uTextureMatrix=this.uvMatrix.mapCoord,this.allowTrim&&(this.uniforms.uClampFrame=this.uvMatrix.uClampFrame))}}class J extends z.Mesh{constructor(e,r,i,a){super(e,r,i,a),this.color=null,this.maskSprite=null,this.maskVertexData=null,this.useSpriteMask=!1,this.color=r.color}_renderDefault(e){const r=this.shader;r.color.alpha=this.worldAlpha,r.update&&r.update(),e.batch.flush(),r.uniforms.translationMatrix=this.worldTransform.toArray(!0),e.shader.bind(r,!1),e.state.set(this.state),e.geometry.bind(this.geometry,r),e.geometry.draw(this.drawMode,this.size,this.start,this.geometry.instanceCount)}_render(e){this.maskSprite&&(this.useSpriteMask=!0),this.useSpriteMask?(this.material.pluginName="batchMasked",this._renderToBatch(e)):super._render(e)}_renderToBatch(e){this.color.updateTransform(),super._renderToBatch(e)}calculateMaskVertices(){k.prototype.calculateMaskVertices.call(this)}}class F extends J{constructor(e,r,i,a,s){super(new z.MeshGeometry(r,i,a),new H(e),null,s),this.autoUpdate=!0,this.geometry.getBuffer("aVertexPosition").static=!1}get vertices(){return this.geometry.getBuffer("aVertexPosition").data}set vertices(e){this.geometry.getBuffer("aVertexPosition").data=e}_render(e){this.autoUpdate&&this.geometry.getBuffer("aVertexPosition").update(),super._render(e)}}function E(){function t(){return this.color.tintBGR}function e(a){this.color.tintBGR=a}function r(){return this.color.updateTransform(),this.color.lightRgba&16777215}const i=k.prototype;M.Sprite.prototype.convertToHeaven=function(){return this.color?this:(Object.defineProperty(this,"tint",{get:t,set:e,enumerable:!0,configurable:!0}),Object.defineProperty(this,"_tintRGB",{get:r,enumerable:!0,configurable:!0}),this._onTextureUpdate=i._onTextureUpdate,this._render=i._render,this._calculateBounds=i._calculateBounds,this.calculateVertices=i.calculateVertices,this._onTextureUpdate=i._onTextureUpdate,this.calculateMaskVertices=i.calculateMaskVertices,this.destroy=k.prototype.destroy,this.color=new N,this.pluginName="batchHeaven",this._texture.valid?this._onTextureUpdate():(this._texture.off("update",this._onTextureUpdate),this._texture.on("update",this._onTextureUpdate,this)),this)},j.Container.prototype.convertSubtreeToHeaven=function(){this.convertToHeaven&&this.convertToHeaven();for(let a=0;a<this.children.length;a++)this.children[a].convertSubtreeToHeaven()}}var ht=(t=>(t[t.WEBGL_LEGACY=0]="WEBGL_LEGACY",t[t.WEBGL=1]="WEBGL",t[t.WEBGL2=2]="WEBGL2",t))(ht||{}),lt=(t=>(t[t.UNKNOWN=0]="UNKNOWN",t[t.WEBGL=1]="WEBGL",t[t.CANVAS=2]="CANVAS",t))(lt||{}),ut=(t=>(t[t.COLOR=16384]="COLOR",t[t.DEPTH=256]="DEPTH",t[t.STENCIL=1024]="STENCIL",t))(ut||{}),P=(t=>(t[t.NORMAL=0]="NORMAL",t[t.ADD=1]="ADD",t[t.MULTIPLY=2]="MULTIPLY",t[t.SCREEN=3]="SCREEN",t[t.OVERLAY=4]="OVERLAY",t[t.DARKEN=5]="DARKEN",t[t.LIGHTEN=6]="LIGHTEN",t[t.COLOR_DODGE=7]="COLOR_DODGE",t[t.COLOR_BURN=8]="COLOR_BURN",t[t.HARD_LIGHT=9]="HARD_LIGHT",t[t.SOFT_LIGHT=10]="SOFT_LIGHT",t[t.DIFFERENCE=11]="DIFFERENCE",t[t.EXCLUSION=12]="EXCLUSION",t[t.HUE=13]="HUE",t[t.SATURATION=14]="SATURATION",t[t.COLOR=15]="COLOR",t[t.LUMINOSITY=16]="LUMINOSITY",t[t.NORMAL_NPM=17]="NORMAL_NPM",t[t.ADD_NPM=18]="ADD_NPM",t[t.SCREEN_NPM=19]="SCREEN_NPM",t[t.NONE=20]="NONE",t[t.SRC_OVER=0]="SRC_OVER",t[t.SRC_IN=21]="SRC_IN",t[t.SRC_OUT=22]="SRC_OUT",t[t.SRC_ATOP=23]="SRC_ATOP",t[t.DST_OVER=24]="DST_OVER",t[t.DST_IN=25]="DST_IN",t[t.DST_OUT=26]="DST_OUT",t[t.DST_ATOP=27]="DST_ATOP",t[t.ERASE=26]="ERASE",t[t.SUBTRACT=28]="SUBTRACT",t[t.XOR=29]="XOR",t))(P||{}),dt=(t=>(t[t.POINTS=0]="POINTS",t[t.LINES=1]="LINES",t[t.LINE_LOOP=2]="LINE_LOOP",t[t.LINE_STRIP=3]="LINE_STRIP",t[t.TRIANGLES=4]="TRIANGLES",t[t.TRIANGLE_STRIP=5]="TRIANGLE_STRIP",t[t.TRIANGLE_FAN=6]="TRIANGLE_FAN",t))(dt||{}),ct=(t=>(t[t.RGBA=6408]="RGBA",t[t.RGB=6407]="RGB",t[t.RG=33319]="RG",t[t.RED=6403]="RED",t[t.RGBA_INTEGER=36249]="RGBA_INTEGER",t[t.RGB_INTEGER=36248]="RGB_INTEGER",t[t.RG_INTEGER=33320]="RG_INTEGER",t[t.RED_INTEGER=36244]="RED_INTEGER",t[t.ALPHA=6406]="ALPHA",t[t.LUMINANCE=6409]="LUMINANCE",t[t.LUMINANCE_ALPHA=6410]="LUMINANCE_ALPHA",t[t.DEPTH_COMPONENT=6402]="DEPTH_COMPONENT",t[t.DEPTH_STENCIL=34041]="DEPTH_STENCIL",t))(ct||{}),pt=(t=>(t[t.TEXTURE_2D=3553]="TEXTURE_2D",t[t.TEXTURE_CUBE_MAP=34067]="TEXTURE_CUBE_MAP",t[t.TEXTURE_2D_ARRAY=35866]="TEXTURE_2D_ARRAY",t[t.TEXTURE_CUBE_MAP_POSITIVE_X=34069]="TEXTURE_CUBE_MAP_POSITIVE_X",t[t.TEXTURE_CUBE_MAP_NEGATIVE_X=34070]="TEXTURE_CUBE_MAP_NEGATIVE_X",t[t.TEXTURE_CUBE_MAP_POSITIVE_Y=34071]="TEXTURE_CUBE_MAP_POSITIVE_Y",t[t.TEXTURE_CUBE_MAP_NEGATIVE_Y=34072]="TEXTURE_CUBE_MAP_NEGATIVE_Y",t[t.TEXTURE_CUBE_MAP_POSITIVE_Z=34073]="TEXTURE_CUBE_MAP_POSITIVE_Z",t[t.TEXTURE_CUBE_MAP_NEGATIVE_Z=34074]="TEXTURE_CUBE_MAP_NEGATIVE_Z",t))(pt||{}),C=(t=>(t[t.UNSIGNED_BYTE=5121]="UNSIGNED_BYTE",t[t.UNSIGNED_SHORT=5123]="UNSIGNED_SHORT",t[t.UNSIGNED_SHORT_5_6_5=33635]="UNSIGNED_SHORT_5_6_5",t[t.UNSIGNED_SHORT_4_4_4_4=32819]="UNSIGNED_SHORT_4_4_4_4",t[t.UNSIGNED_SHORT_5_5_5_1=32820]="UNSIGNED_SHORT_5_5_5_1",t[t.UNSIGNED_INT=5125]="UNSIGNED_INT",t[t.UNSIGNED_INT_10F_11F_11F_REV=35899]="UNSIGNED_INT_10F_11F_11F_REV",t[t.UNSIGNED_INT_2_10_10_10_REV=33640]="UNSIGNED_INT_2_10_10_10_REV",t[t.UNSIGNED_INT_24_8=34042]="UNSIGNED_INT_24_8",t[t.UNSIGNED_INT_5_9_9_9_REV=35902]="UNSIGNED_INT_5_9_9_9_REV",t[t.BYTE=5120]="BYTE",t[t.SHORT=5122]="SHORT",t[t.INT=5124]="INT",t[t.FLOAT=5126]="FLOAT",t[t.FLOAT_32_UNSIGNED_INT_24_8_REV=36269]="FLOAT_32_UNSIGNED_INT_24_8_REV",t[t.HALF_FLOAT=36193]="HALF_FLOAT",t))(C||{}),gt=(t=>(t[t.FLOAT=0]="FLOAT",t[t.INT=1]="INT",t[t.UINT=2]="UINT",t))(gt||{}),mt=(t=>(t[t.NEAREST=0]="NEAREST",t[t.LINEAR=1]="LINEAR",t))(mt||{}),xt=(t=>(t[t.CLAMP=33071]="CLAMP",t[t.REPEAT=10497]="REPEAT",t[t.MIRRORED_REPEAT=33648]="MIRRORED_REPEAT",t))(xt||{}),_t=(t=>(t[t.OFF=0]="OFF",t[t.POW2=1]="POW2",t[t.ON=2]="ON",t[t.ON_MANUAL=3]="ON_MANUAL",t))(_t||{}),ft=(t=>(t[t.NPM=0]="NPM",t[t.UNPACK=1]="UNPACK",t[t.PMA=2]="PMA",t[t.NO_PREMULTIPLIED_ALPHA=0]="NO_PREMULTIPLIED_ALPHA",t[t.PREMULTIPLY_ON_UPLOAD=1]="PREMULTIPLY_ON_UPLOAD",t[t.PREMULTIPLIED_ALPHA=2]="PREMULTIPLIED_ALPHA",t))(ft||{}),vt=(t=>(t[t.NO=0]="NO",t[t.YES=1]="YES",t[t.AUTO=2]="AUTO",t[t.BLEND=0]="BLEND",t[t.CLEAR=1]="CLEAR",t[t.BLIT=2]="BLIT",t))(vt||{}),Tt=(t=>(t[t.AUTO=0]="AUTO",t[t.MANUAL=1]="MANUAL",t))(Tt||{}),It=(t=>(t.LOW="lowp",t.MEDIUM="mediump",t.HIGH="highp",t))(It||{}),Ct=(t=>(t[t.NONE=0]="NONE",t[t.SCISSOR=1]="SCISSOR",t[t.STENCIL=2]="STENCIL",t[t.SPRITE=3]="SPRITE",t[t.COLOR=4]="COLOR",t))(Ct||{}),bt=(t=>(t[t.RED=1]="RED",t[t.GREEN=2]="GREEN",t[t.BLUE=4]="BLUE",t[t.ALPHA=8]="ALPHA",t))(bt||{}),Nt=(t=>(t[t.NONE=0]="NONE",t[t.LOW=2]="LOW",t[t.MEDIUM=4]="MEDIUM",t[t.HIGH=8]="HIGH",t))(Nt||{}),kt=(t=>(t[t.ELEMENT_ARRAY_BUFFER=34963]="ELEMENT_ARRAY_BUFFER",t[t.ARRAY_BUFFER=34962]="ARRAY_BUFFER",t[t.UNIFORM_BUFFER=35345]="UNIFORM_BUFFER",t))(kt||{});const yt=`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;

void main(void){
gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

vTextureCoord = aTextureCoord;
vTextureId = aTextureId;
vLight = aLight * tint;
vDark = vec4(aDark.rgb * tint.rgb, aDark.a);
}
`,Ut=`
varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void) {
vec4 color;
float textureId = floor(vTextureId+0.5);
%forloop%
gl_FragColor.a = color.a * vLight.a;
gl_FragColor.rgb = ((color.a - 1.0) * vDark.a + 1.0 - color.rgb) * vDark.rgb + color.rgb * vLight.rgb;
}`;class Q extends c.Geometry{constructor(e=!1){super(),this._buffer=new c.Buffer(null,e,!1),this._indexBuffer=new c.Buffer(null,e,!0),this.addAttribute("aVertexPosition",this._buffer,2,!1,C.FLOAT).addAttribute("aTextureCoord",this._buffer,2,!1,C.FLOAT).addAttribute("aLight",this._buffer,4,!0,C.UNSIGNED_BYTE).addAttribute("aDark",this._buffer,4,!0,C.UNSIGNED_BYTE).addAttribute("aTextureId",this._buffer,1,!0,C.FLOAT).addIndex(this._indexBuffer)}}class X extends c.BatchRenderer{constructor(e){super(e),this.geometryClass=Q,this.vertexSize=7}setShaderGenerator({vertex:e=yt,fragment:r=Ut}={}){super.setShaderGenerator({vertex:e,fragment:r})}packInterleavedGeometry(e,r,i,a,s){const{uint32View:o,float32View:g}=r;let d=-1,f=0;if(e.color)d=e.color.lightRgba,f=e.color.darkRgba;else{const u=Math.min(e.worldAlpha,1);d=c.Color.shared.setValue(e._tintRGB).toPremultiplied(u,e._texture.baseTexture.alphaMode>0)}y.BLEND_ADD_UNITY&&e.blendAddUnity&&(d=d&16777215);const p=a/this.vertexSize,m=e.uvs,h=e.indices,l=e.vertexData,n=e._texture.baseTexture._batchLocation;for(let u=0;u<l.length;u+=2)g[a++]=l[u],g[a++]=l[u+1],g[a++]=m[u],g[a++]=m[u+1],o[a++]=d,o[a++]=f,g[a++]=n;for(let u=0;u<h.length;u++)i[s++]=p+h[u]}buildDrawCalls(e,r,i){const a=this,{_bufferedElements:s,_attributeBuffer:o,_indexBuffer:g,vertexSize:d}=a,f=c.BatchRenderer._drawCallPool;let p=a._dcIndex,m=a._aIndex,h=a._iIndex,l=f[p];l.start=a._iIndex,l.texArray=e;for(let n=r;n<i;++n){const u=s[n],x=u._texture.baseTexture;let T=V.premultiplyBlendMode[x.alphaMode?1:0][u.blendMode];y.BLEND_ADD_UNITY&&(u.blendAddUnity=T===P.ADD&&x.alphaMode,u.blendAddUnity&&(T=P.NORMAL)),s[n]=null,r<n&&l.blend!==T&&(l.size=h-l.start,r=n,l=f[++p],l.texArray=e,l.start=h),this.packInterleavedGeometry(u,o,g,m,h),m+=u.vertexData.length/2*d,h+=u.indices.length,l.blend=T}r<i&&(l.size=h-l.start,++p),a._dcIndex=p,a._aIndex=m,a._iIndex=h}}X.extension={name:"batchHeaven",type:c.ExtensionType.RendererPlugin};class K{constructor(e,r,i){if(this.vertexSrc=e,this.fragTemplate=r,this.loops=i,this.programCache={},this.defaultGroupCache={},r.indexOf("%count%")<0)throw new Error('Fragment template must contain "%count%".');for(let a=0;a<i.length;a++)if(r.indexOf(i[a].loopLabel)<0)throw new Error(`Fragment template must contain "${i[a].loopLabel}".`)}generateShader(e){if(!this.programCache[e]){const i=new Int32Array(e),{loops:a}=this;for(let o=0;o<e;o++)i[o]=o;this.defaultGroupCache[e]=new c.UniformGroup({uSamplers:i},!0);let s=this.fragTemplate;for(let o=0;o<a.length;o++)s=s.replace(/%count%/gi,`${e}`),s=s.replace(new RegExp(a[o].loopLabel,"gi"),this.generateSampleSrc(e,a[o]));this.programCache[e]=new c.Program(this.vertexSrc,s)}const r={tint:new Float32Array([1,1,1,1]),translationMatrix:new L.Matrix,default:this.defaultGroupCache[e]};return new c.Shader(this.programCache[e],r)}generateSampleSrc(e,r){let i="";i+=`
`,i+=`
`;for(let a=0;a<e;a++)a>0&&(i+=`
else `),a<e-1&&(i+=`if(${r.inTex} < ${a}.5)`),i+=`
{`,i+=`
	${r.outColor} = texture2D(uSamplers[${a}], ${r.inCoord});`,i+=`
}`;return i+=`
`,i+=`
`,i}}const O=c.Texture.WHITE.baseTexture,Rt=`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;
attribute vec2 aMaskCoord;
attribute vec4 aMaskClamp;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;

void main(void){
gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

vTextureCoord = aTextureCoord;
vTextureId = aTextureId;
vLight = aLight * tint;
vDark = vec4(aDark.rgb * tint.rgb, aDark.a);
vMaskCoord = aMaskCoord;
vMaskClamp = aMaskClamp;
}
`,Gt=`
varying vec2 vTextureCoord;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;
varying vec4 vLight, vDark;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void) {
vec4 texColor, maskColor, fragColor;

float maskBits = floor((vTextureId + 0.5) / 64.0);
float textureId = floor(0.5 + vTextureId - maskBits * 64.0);
float maskId = floor((maskBits + 0.5) / 16.0);
maskBits = maskBits - maskId * 16.0;

float clipEnable = step(0.5, maskBits);

float clip = step(3.5,
    step(vMaskClamp.x, vMaskCoord.x) +
    step(vMaskClamp.y, vMaskCoord.y) +
    step(vMaskCoord.x, vMaskClamp.z) +
    step(vMaskCoord.y, vMaskClamp.w));
%loopTex%
%loopMask%
fragColor.a = texColor.a * vLight.a;
fragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
gl_FragColor = fragColor * maskColor.r * (clipEnable * clip + 1.0 - clipEnable);
}`,D=new Float32Array([0,0,0,0]);class Y extends c.Geometry{constructor(e=!1){super(),this._buffer=new c.Buffer(null,e,!1),this._indexBuffer=new c.Buffer(null,e,!0),this.addAttribute("aVertexPosition",this._buffer,2,!1,C.FLOAT).addAttribute("aTextureCoord",this._buffer,2,!1,C.FLOAT).addAttribute("aLight",this._buffer,4,!0,C.UNSIGNED_BYTE).addAttribute("aDark",this._buffer,4,!0,C.UNSIGNED_BYTE).addAttribute("aTextureId",this._buffer,1,!0,C.FLOAT).addAttribute("aMaskCoord",this._buffer,2,!1,C.FLOAT).addAttribute("aMaskClamp",this._buffer,4,!1,C.FLOAT).addIndex(this._indexBuffer)}}const U=[null,null],S=class extends c.BatchRenderer{constructor(t){super(t),this.geometryClass=Y,this.vertexSize=13,this.maxTextures=0}setShaderGenerator({vertex:t=Rt,fragment:e=Gt}={}){this.shaderGenerator=new K(t,e,[{loopLabel:"%loopTex%",inCoord:"vTextureCoord",outColor:"texColor",inTex:"textureId"},{loopLabel:"%loopMask%",inCoord:"vMaskCoord",outColor:"maskColor",inTex:"maskId"}])}contextChange(){const t=this,e=t.renderer.plugins.batch.maxTextures*2;t.maxTextures=Math.max(2,Math.min(S.MAX_TEXTURES,e)),this._shader=t.shaderGenerator.generateShader(this.maxTextures);for(let r=0;r<t._packedGeometryPoolSize;r++)t._packedGeometries[r]=new this.geometryClass;this.initFlushBuffers()}buildTexturesAndDrawCalls(){const t=this._bufferedTextures,e=this._bufferedElements,r=this._bufferSize,{maxTextures:i}=this,a=c.BatchRenderer._textureArrayPool,s=this.renderer.batch,o=this._tempBoundTextures,g=this.renderer.textureGC.count;let d=++c.BaseTexture._globalBatch,f=0,p=a[0],m=0;s.copyBoundTextures(o,i);for(let h=0;h<r;++h){const l=e[h].maskSprite?e[h].maskSprite.texture.baseTexture:null;U[0]=l&&l.valid?l:O,U[1]=t[h],t[h]=null;const n=(U[0]._batchEnabled!==d?1:0)+(U[1]._batchEnabled!==d?1:0);p.count+n>i&&(s.boundArray(p,o,d,i),this.buildDrawCalls(p,m,h),m=h,p=a[++f],++d);for(let u=0;u<2;u++){const x=U[u];x._batchEnabled!==d&&(x._batchEnabled=d,x.touched=g,p.elements[p.count++]=x)}}p.count>0&&(s.boundArray(p,o,d,i),this.buildDrawCalls(p,m,r),++f,++d);for(let h=0;h<o.length;h++)o[h]=null;c.BaseTexture._globalBatch=d}packInterleavedGeometry(t,e,r,i,a){const{uint32View:s,float32View:o}=e;let g=-1,d=0;if(t.color)g=t.color.lightRgba,d=t.color.darkRgba;else{const I=Math.min(t.worldAlpha,1);g=c.Color.shared.setValue(t._tintRGB).toPremultiplied(I,t._texture.baseTexture.alphaMode>0)}const f=i/this.vertexSize,p=t.uvs,m=t.indices,h=t.vertexData,l=t._texture.baseTexture._batchLocation;let n=O;const u=t.maskSprite;let x=D,T=D,v=0;u&&(t.calculateMaskVertices(),x=u._texture.uvMatrix.uClampFrame,T=t.maskVertexData,u.texture.valid&&(n=u.texture.baseTexture,v=1));for(let I=0;I<h.length;I+=2)o[i++]=h[I],o[i++]=h[I+1],o[i++]=p[I],o[i++]=p[I+1],s[i++]=g,s[i++]=d,o[i++]=(n._batchLocation*16+v)*64+l,o[i++]=T[I],o[i++]=T[I+1],o[i++]=x[0],o[i++]=x[1],o[i++]=x[2],o[i++]=x[3];for(let I=0;I<m.length;I++)r[a++]=f+m[I]}};let w=S;w.extension={name:"batchMasked",type:c.ExtensionType.RendererPlugin},w.MAX_TEXTURES=8;class wt extends et.BitmapText{constructor(e,r){super(e,r),this.color||(this.color=new N)}get tint(){return this.color?this.color.tintBGR:16777215}set tint(e){this.color&&(this.color.tintBGR=e)}addChild(...e){const r=e[0];return!r.color&&r.geometry&&(this.color||(this.color=new N),r.color=this.color,r.material=new H(r.material.texture,{color:this.color})),super.addChild(r,...e)}_render(e){this.color.alpha=this.worldAlpha,this.color.updateTransform(),super._render(e)}}c.extensions.add(X),c.extensions.add(w),E();class At extends k{constructor(e,r){super(e),this.spine=r}_render(e){this.maskSprite&&(this.spine.hasSpriteMask=!0),this.spine.hasSpriteMask&&(this.pluginName="batchMasked"),super._render(e)}}class Lt extends F{constructor(e,r,i,a,s,o=null){super(e,r,i,a,s),this.spine=o}_render(e){this.autoUpdate&&this.geometry.getBuffer("aVertexPosition").update(),this.maskSprite&&(this.spine.hasSpriteMask=!0),this.spine.hasSpriteMask?(this.material.pluginName="batchMasked",this._renderToBatch(e)):super._renderDefault(e)}}function Vt(t){t.newMesh=function(e,r,i,a,s){return new F(e,r,i,a,s)},t.newContainer=function(){return this.color||(this.hasSpriteMask=!1,this.color=new N),new j.Container},t.newSprite=function(e){return new k(e)},t.newGraphics=function(){return new rt.Graphics},t.transformHack=function(){return 2}}return Z(),_.AnimationState=R,_.BitmapTextH=wt,_.CLAMP_OPTIONS=G,_.ColorTransform=N,_.DarkLightGeometry=Q,_.DoubleTintMeshMaterial=H,_.HeavenBatchRenderer=X,_.LoopShaderGenerator=K,_.MaskedBatchRenderer=w,_.MaskedGeometry=Y,_.MeshH=J,_.SimpleMeshH=F,_.SpineMesh=Lt,_.SpineSprite=At,_.SpriteH=k,_.TexturePolygon=$,_.applyConvertMixins=E,_.applySpineMixin=Vt,_.applySpritesheetMixin=Z,_.settings=y,_}({},PIXI,PIXI,PIXI,PIXI,PIXI,PIXI,PIXI.utils,PIXI,PIXI,PIXI);
//# sourceMappingURL=pixi-heaven.js.map
