/*!
 * @pixi/picture - v4.0.0
 * Compiled Mon, 24 Apr 2023 18:33:21 UTC
 *
 * @pixi/picture is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2023, Ivan Popelyshev, All Rights Reserved
 */this.PIXI=this.PIXI||{},this.PIXI.picture=function(a,u,z,W,M){"use strict";class A extends u.Filter{constructor(){super(...arguments),this.backdropUniformName=null,this._backdropActive=!1,this.clearColor=null}}const $=`
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uBackdrop;
uniform vec2 uBackdrop_flipY;

%UNIFORM_CODE%

void main(void)
{
   vec2 backdropCoord = vec2(vTextureCoord.x, uBackdrop_flipY.x + uBackdrop_flipY.y * vTextureCoord.y);
   vec4 b_src = texture2D(uSampler, vTextureCoord);
   vec4 b_dest = texture2D(uBackdrop, backdropCoord);
   vec4 b_res = b_dest;
   
   %BLEND_CODE%

   gl_FragColor = b_res;
}`;class E extends A{constructor(e){let i=$;i=i.replace("%UNIFORM_CODE%",e.uniformCode||""),i=i.replace("%BLEND_CODE%",e.blendCode||""),super(void 0,i,e.uniforms),this.backdropUniformName="uBackdrop"}}const q=`
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec2 flipY;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vTextureCoord.y = flipY.x + flipY.y * vTextureCoord.y;
}

`;class S extends u.Filter{constructor(e,i){const s=i||{};s.flipY||(s.flipY=new Float32Array([0,1])),super(q,e,s)}}var N=(t=>(t[t.RED=0]="RED",t[t.GREEN=1]="GREEN",t[t.BLUE=2]="BLUE",t[t.ALPHA=3]="ALPHA",t))(N||{});class P{constructor(e=!1,i=3){this.maskBefore=e,this.uniformCode="uniform vec4 uChannel;",this.uniforms={uChannel:new Float32Array([0,0,0,0])},this.blendCode="b_res = dot(b_src, uChannel) * b_dest;",this.safeFlipY=!1,this.uniforms.uChannel[i]=1}}const K=new Float32Array([0,1]),C=class extends E{constructor(e,i=new P){super(i),this.baseFilter=e,this.config=i,this.padding=e.padding,this.safeFlipY=i.safeFlipY}apply(e,i,s,o){const r=e.getFilterTexture(i);if(this.config.maskBefore){const{blendMode:n}=this.state;this.state.blendMode=u.BLEND_MODES.NONE,e.applyFilter(this,i,r,u.CLEAR_MODES.YES),this.baseFilter.blendMode=n,this.baseFilter.apply(e,r,s,o),this.state.blendMode=n}else{const{uBackdrop:n,uBackdrop_flipY:c}=this.uniforms;if(c[1]>0||this.safeFlipY)this.baseFilter.apply(e,n,r,u.CLEAR_MODES.YES);else{const p=e.getFilterTexture(i);C._flipYFilter||(C._flipYFilter=new S),C._flipYFilter.uniforms.flipY[0]=c[0],C._flipYFilter.uniforms.flipY[1]=c[1],C._flipYFilter.apply(e,n,p,u.CLEAR_MODES.YES),this.baseFilter.apply(e,p,r,u.CLEAR_MODES.YES),e.returnFilterTexture(p),this.uniforms.uBackdrop_flipY=K}this.uniforms.uBackdrop=r,e.applyFilter(this,i,s,o),this.uniforms.uBackdrop=n,this.uniforms.uBackdrop_flipY=c}e.returnFilterTexture(r)}};let R=C;R._flipYFilter=null;const _=`if (b_src.a == 0.0) {
  gl_FragColor = vec4(0, 0, 0, 0);
  return;
}
if (b_dest.a == 0.0) {
  gl_FragColor = b_src;
  return;
}
vec3 Cb = b_dest.rgb / b_dest.a;
vec3 Cs = b_src.rgb / b_src.a;
%NPM_BLEND%
// SWAP SRC WITH NPM BLEND
vec3 new_src = (1.0 - b_dest.a) * Cs + b_dest.a * B;
// PORTER DUFF PMA COMPOSITION MODE
b_res.a = b_src.a + b_dest.a * (1.0-b_src.a);
b_res.rgb = b_src.a * new_src + (1.0 - b_src.a) * b_dest.rgb;
`,Y=`vec3 multiply = Cb * Cs * 2.0;
vec3 Cb2 = Cb * 2.0 - 1.0;
vec3 screen = Cb2 + Cs - Cb2 * Cs;
vec3 B;
if (Cb.r <= 0.5) {
  B.r = multiply.r;
} else {
  B.r = screen.r;
}
if (Cb.g <= 0.5) {
  B.g = multiply.g;
} else {
  B.g = screen.g;
}
if (Cb.b <= 0.5) {
  B.b = multiply.b;
} else {
  B.b = screen.b;
}
`,k=`vec3 multiply = Cb * Cs * 2.0;
vec3 Cs2 = Cs * 2.0 - 1.0;
vec3 screen = Cb + Cs2 - Cb * Cs2;
vec3 B;
if (Cs.r <= 0.5) {
  B.r = multiply.r;
} else {
  B.r = screen.r;
}
if (Cs.g <= 0.5) {
  B.g = multiply.g;
} else {
  B.g = screen.g;
}
if (Cs.b <= 0.5) {
  B.b = multiply.b;
} else {
  B.b = screen.b;
}
`,O=`vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);
vec3 B;
vec3 D;
if (Cs.r <= 0.5)
{
  B.r = first.r;
}
else
{
  if (Cb.r <= 0.25)
  {
    D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    
  }
  else
  {
    D.r = sqrt(Cb.r);
  }
  B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);
}
if (Cs.g <= 0.5)
{
  B.g = first.g;
}
else
{
  if (Cb.g <= 0.25)
  {
    D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    
  }
  else
  {
    D.g = sqrt(Cb.g);
  }
  B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);
}
if (Cs.b <= 0.5)
{
  B.b = first.b;
}
else
{
  if (Cb.b <= 0.25)
  {
    D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    
  }
  else
  {
    D.b = sqrt(Cb.b);
  }
  B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);
}
`,I=`vec3 B = Cs * Cb;
`,w=_.replace("%NPM_BLEND%",Y),U=_.replace("%NPM_BLEND%",k),H=_.replace("%NPM_BLEND%",O),G=_.replace("%NPM_BLEND%",I),g=[];g[u.BLEND_MODES.MULTIPLY]=G,g[u.BLEND_MODES.OVERLAY]=w,g[u.BLEND_MODES.HARD_LIGHT]=U,g[u.BLEND_MODES.SOFT_LIGHT]=H;const x=[],v=[];function j(t){return g[t]?(x[t]||(x[t]=new E({blendCode:g[t]})),x[t]):null}function D(t){return g[t]?(v[t]||(v[t]=[j(t)]),v[t]):null}class J extends z.Sprite{_render(e){const i=this._texture;if(!i||!i.valid)return;const s=D(this.blendMode),o=this.blendMode;if(s){if(e.batch.flush(),!e.filter.pushWithCheck(this,s))return;this.blendMode=u.BLEND_MODES.NORMAL}this.calculateVertices(),e.batch.setObjectRenderer(e.plugins[this.pluginName]),e.plugins[this.pluginName].render(this),s&&(e.batch.flush(),e.filter.pop(),this.blendMode=o)}}class Q extends W.TilingSprite{_render(e){const i=this._texture;if(!i||!i.valid)return;const s=D(this.blendMode);s&&(e.batch.flush(),!e.filter.pushWithCheck(this,s))||(this.tileTransform.updateLocalTransform(),this.uvMatrix.update(),e.batch.setObjectRenderer(e.plugins[this.pluginName]),e.plugins[this.pluginName].render(this),s&&(e.batch.flush(),e.filter.pop()))}}function Z(t,e){const i=e.x+e.width,s=e.y+e.height,o=t.x+t.width,r=t.y+t.height;return e.x>=t.x&&e.x<=o&&e.y>=t.y&&e.y<=r&&i>=t.x&&i<=o&&s>=t.y&&s<=r}function ee(t,e=0){const{gl:i}=this;this.currentLocation!==e&&(this.currentLocation=e,i.activeTexture(i.TEXTURE0+e)),this.bind(t,e)}const re=new M.Matrix;function te(t,e,i=!0){const s=this.renderer,o=this.defaultFilterStack,r=this.statePool.pop()||new u.FilterState,n=this.renderer.renderTexture;let c=e[0].resolution,p=e[0].padding,l=e[0].autoFit,d=e[0].legacy;for(let h=1;h<e.length;h++){const F=e[h];c=Math.min(c,F.resolution),p=this.useMaxPadding?Math.max(p,F.padding):p+F.padding,l=l&&F.autoFit,d=d||F.legacy}o.length===1&&(this.defaultFilterStack[0].renderTexture=n.current),o.push(r),r.resolution=c,r.legacy=d,r.target=t,r.sourceFrame.copyFrom(t.filterArea||t.getBounds(!0)),r.sourceFrame.pad(p);let f=!0;if(l){const h=this.tempRect.copyFrom(n.sourceFrame);s.projection.transform&&this.transformAABB(re.copyFrom(s.projection.transform).invert(),h),r.sourceFrame.fit(h)}else f=Z(this.renderer.renderTexture.sourceFrame,r.sourceFrame);if(i&&r.sourceFrame.width<=1&&r.sourceFrame.height<=1)return o.pop(),r.clear(),this.statePool.push(r),!1;if(this.roundFrame(r.sourceFrame,n.current?n.current.resolution:s.resolution,n.sourceFrame,n.destinationFrame,s.projection.transform),r.sourceFrame.ceil(c),f){let h=null,F=null;for(let T=0;T<e.length;T++){const L=e[T].backdropUniformName;if(L){const{uniforms:y}=e[T];y[`${L}_flipY`]||(y[`${L}_flipY`]=new Float32Array([0,1]));const B=y[`${L}_flipY`];h===null?(h=this.prepareBackdrop(r.sourceFrame,B),F=B):(B[0]=F[0],B[1]=F[1]),y[L]=h,h&&(e[T]._backdropActive=!0)}}h&&(c=r.resolution=h.resolution)}r.renderTexture=this.getOptimalFilterTexture(r.sourceFrame.width,r.sourceFrame.height,c),r.filters=e,r.destinationFrame.width=r.renderTexture.width,r.destinationFrame.height=r.renderTexture.height;const m=this.tempRect;m.x=0,m.y=0,m.width=r.sourceFrame.width,m.height=r.sourceFrame.height,r.renderTexture.filterFrame=r.sourceFrame,r.bindingSourceFrame.copyFrom(n.sourceFrame),r.bindingDestinationFrame.copyFrom(n.destinationFrame),r.transform=s.projection.transform,s.projection.transform=null,n.bind(r.renderTexture,r.sourceFrame,m);const b=e[e.length-1].clearColor;return b?s.framebuffer.clear(b[0],b[1],b[2],b[3]):s.framebuffer.clear(0,0,0,0),!0}function ie(t,e){return this.pushWithCheck(t,e,!1)}function se(){const t=this.defaultFilterStack,e=t.pop(),i=e.filters;this.activeState=e;const s=this.globalUniforms.uniforms;s.outputFrame=e.sourceFrame,s.resolution=e.resolution;const o=s.inputSize,r=s.inputPixel,n=s.inputClamp;if(o[0]=e.destinationFrame.width,o[1]=e.destinationFrame.height,o[2]=1/o[0],o[3]=1/o[1],r[0]=o[0]*e.resolution,r[1]=o[1]*e.resolution,r[2]=1/r[0],r[3]=1/r[1],n[0]=.5*r[2],n[1]=.5*r[3],n[2]=e.sourceFrame.width*o[2]-.5*r[2],n[3]=e.sourceFrame.height*o[3]-.5*r[3],e.legacy){const l=s.filterArea;l[0]=e.destinationFrame.width,l[1]=e.destinationFrame.height,l[2]=e.sourceFrame.x,l[3]=e.sourceFrame.y,s.filterClamp=s.inputClamp}this.globalUniforms.update();const c=t[t.length-1];if(e.renderTexture.framebuffer.multisample>1&&this.renderer.framebuffer.blit(),i.length===1)i[0].apply(this,e.renderTexture,c.renderTexture,u.CLEAR_MODES.BLEND,e),this.returnFilterTexture(e.renderTexture);else{let l=e.renderTexture,d=this.getOptimalFilterTexture(l.width,l.height,e.resolution);d.filterFrame=l.filterFrame;let f=0;for(f=0;f<i.length-1;++f){i[f].apply(this,l,d,u.CLEAR_MODES.CLEAR,e);const m=l;l=d,d=m}i[f].apply(this,l,c.renderTexture,u.CLEAR_MODES.BLEND,e),this.returnFilterTexture(l),this.returnFilterTexture(d)}let p=!1;for(let l=0;l<i.length;l++)if(i[l]._backdropActive){const d=i[l].backdropUniformName;p||(this.returnFilterTexture(i[l].uniforms[d]),p=!0),i[l].uniforms[d]=null,i[l]._backdropActive=!1}e.clear(),this.statePool.push(e)}let V=!1;function ne(t,e){const i=this.renderer,s=i.renderTexture.current,o=this.renderer.renderTexture.sourceFrame,r=i.projection.transform||M.Matrix.IDENTITY;let n=1;if(s)n=s.baseTexture.resolution,e[1]=1;else{if(this.renderer.background.alpha>=1)return V||(V=!0,console.warn("pixi-picture: you are trying to use Blend Filter on main framebuffer!"),console.warn("pixi-picture: please set backgroundAlpha=0 in renderer creation params")),null;n=i.resolution,e[1]=-1}const c=Math.round((t.x-o.x+r.tx)*n),p=t.y-o.y+r.ty,l=Math.round((e[1]<0?o.height-(p+t.height):p)*n),d=Math.round(t.width*n),f=Math.round(t.height*n),m=i.gl,b=this.getOptimalFilterTexture(d,f,1);return e[1]<0&&(e[0]=f/b.height),b.filterFrame=o,b.setResolution(n),i.texture.bindForceLocation(b.baseTexture,0),m.copyTexSubImage2D(m.TEXTURE_2D,0,0,0,c,l,d,f),b}function X(){u.TextureSystem.prototype.bindForceLocation=ee,u.FilterSystem.prototype.push=ie,u.FilterSystem.prototype.pushWithCheck=te,u.FilterSystem.prototype.pop=se,u.FilterSystem.prototype.prepareBackdrop=ne}return X(),a.BackdropFilter=A,a.BlendFilter=E,a.FlipYFilter=S,a.HARDLIGHT_FULL=U,a.HARDLIGHT_PART=k,a.MASK_CHANNEL=N,a.MULTIPLY_FULL=G,a.MULTIPLY_PART=I,a.MaskConfig=P,a.MaskFilter=R,a.NPM_BLEND=_,a.OVERLAY_FULL=w,a.OVERLAY_PART=Y,a.SOFTLIGHT_FULL=H,a.SOFTLIGHT_PART=O,a.Sprite=J,a.TilingSprite=Q,a.applyMixins=X,a.blendFullArray=g,a.getBlendFilter=j,a.getBlendFilterArray=D,a}({},PIXI,PIXI,PIXI,PIXI);
//# sourceMappingURL=pixi-picture.js.map
