/* eslint-disable */
 
/*!
 * @pixi/picture - v3.0.0
 * Compiled Mon, 31 May 2021 15:17:43 UTC
 *
 * @pixi/picture is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2017-2021, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.picture = this.PIXI.picture || {};
(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/core'), require('@pixi/constants'), require('@pixi/sprite'), require('@pixi/sprite-tiling'), require('@pixi/math')) :
   typeof define === 'function' && define.amd ? define(['exports', '@pixi/core', '@pixi/constants', '@pixi/sprite', '@pixi/sprite-tiling', '@pixi/math'], factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global._pixi_picture = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI));
}(this, (function (exports, core, constants, sprite, spriteTiling, math) { 'use strict';

   class BackdropFilter extends core.Filter {
       constructor() {
           super(...arguments);
           this.backdropUniformName = null;
           this._backdropActive = false;
           this.clearColor = null;
       }
   }
   const filterFrag = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uBackdrop;

%UNIFORM_CODE%

void main(void)
{
   vec4 b_src = texture2D(uSampler, vTextureCoord);
   vec4 b_dest = texture2D(uBackdrop, vTextureCoord);
   vec4 b_res = b_dest;
   
   %BLEND_CODE%

   gl_FragColor = b_res;
}`;
   class BlendFilter extends BackdropFilter {
       constructor(shaderParts) {
           let fragCode = filterFrag;
           fragCode = fragCode.replace('%UNIFORM_CODE%', shaderParts.uniformCode || "");
           fragCode = fragCode.replace('%BLEND_CODE%', shaderParts.blendCode || "");
           super(undefined, fragCode, shaderParts.uniforms);
           this.backdropUniformName = 'uBackdrop';
       }
   }

   exports.MASK_CHANNEL = void 0;
   (function (MASK_CHANNEL) {
       MASK_CHANNEL[MASK_CHANNEL["RED"] = 0] = "RED";
       MASK_CHANNEL[MASK_CHANNEL["GREEN"] = 1] = "GREEN";
       MASK_CHANNEL[MASK_CHANNEL["BLUE"] = 2] = "BLUE";
       MASK_CHANNEL[MASK_CHANNEL["ALPHA"] = 3] = "ALPHA";
   })(exports.MASK_CHANNEL || (exports.MASK_CHANNEL = {}));
   class MaskConfig {
       constructor(maskBefore = false, channel = exports.MASK_CHANNEL.ALPHA) {
           this.maskBefore = maskBefore;
           this.uniformCode = 'uniform vec4 uChannel;';
           this.uniforms = {
               uChannel: new Float32Array([0, 0, 0, 0]),
           };
           this.blendCode = `b_res = dot(b_src, uChannel) * b_dest;`;
           this.uniforms.uChannel[channel] = 1.0;
       }
   }
   class MaskFilter extends BlendFilter {
       constructor(baseFilter, config = new MaskConfig()) {
           super(config);
           this.baseFilter = baseFilter;
           this.config = config;
           this.padding = baseFilter.padding;
       }
       apply(filterManager, input, output, clearMode) {
           const target = filterManager.getFilterTexture(input);
           if (this.config.maskBefore) {
               const { blendMode } = this.state;
               this.state.blendMode = constants.BLEND_MODES.NONE;
               filterManager.applyFilter(this, input, target, constants.CLEAR_MODES.YES);
               this.baseFilter.blendMode = blendMode;
               this.baseFilter.apply(filterManager, target, output, clearMode);
               this.state.blendMode = blendMode;
           }
           else {
               const { uBackdrop } = this.uniforms;
               this.baseFilter.apply(filterManager, uBackdrop, target, constants.CLEAR_MODES.YES);
               this.uniforms.uBackdrop = target;
               filterManager.applyFilter(this, input, output, clearMode);
               this.uniforms.uBackdrop = uBackdrop;
           }
           filterManager.returnFilterTexture(target);
       }
   }

   const NPM_BLEND = `if (b_src.a == 0.0) {
gl_FragColor = vec4(0, 0, 0, 0);
return;
}
vec3 Cb = b_src.rgb / b_src.a, Cs;
if (b_dest.a > 0.0) {
Cs = b_dest.rgb / b_dest.a;
}
%NPM_BLEND%
b_res.a = b_src.a + b_dest.a * (1.0-b_src.a);
b_res.rgb = (1.0 - b_src.a) * Cs + b_src.a * B;
b_res.rgb *= b_res.a;
`;
   const OVERLAY_PART = `vec3 multiply = Cb * Cs * 2.0;
vec3 Cb2 = Cb * 2.0 - 1.0;
vec3 screen = Cb2 + Cs - Cb2 * Cs;
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
`;
   const HARDLIGHT_PART = `vec3 multiply = Cb * Cs * 2.0;
vec3 Cs2 = Cs * 2.0 - 1.0;
vec3 screen = Cb + Cs2 - Cb * Cs2;
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
`;
   const SOFTLIGHT_PART = `vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);
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
`;
   const MULTIPLY_FULL = `if (dest.a > 0.0) {
b_res.rgb = (dest.rgb / dest.a) * ((1.0 - src.a) + src.rgb);
b_res.a = min(src.a + dest.a - src.a * dest.a, 1.0);
b_res.rgb *= mult.a;
}
`;
   const OVERLAY_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, OVERLAY_PART);
   const HARDLIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, HARDLIGHT_PART);
   const SOFTLIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, SOFTLIGHT_PART);
   const blendFullArray = [];
   blendFullArray[constants.BLEND_MODES.MULTIPLY] = MULTIPLY_FULL;
   blendFullArray[constants.BLEND_MODES.OVERLAY] = OVERLAY_FULL;
   blendFullArray[constants.BLEND_MODES.HARD_LIGHT] = HARDLIGHT_FULL;
   blendFullArray[constants.BLEND_MODES.SOFT_LIGHT] = SOFTLIGHT_FULL;
   let filterCache = [];
   let filterCacheArray = [];
   function getBlendFilter(blendMode) {
       if (!blendFullArray[blendMode]) {
           return null;
       }
       if (!filterCache[blendMode]) {
           filterCache[blendMode] = new BlendFilter({ blendCode: blendFullArray[blendMode] });
       }
       return filterCache[blendMode];
   }
   function getBlendFilterArray(blendMode) {
       if (!blendFullArray[blendMode]) {
           return null;
       }
       if (!filterCacheArray[blendMode]) {
           filterCacheArray[blendMode] = [getBlendFilter(blendMode)];
       }
       return filterCacheArray[blendMode];
   }

   class Sprite extends sprite.Sprite {
       _render(renderer) {
           const texture = this._texture;
           if (!texture || !texture.valid) {
               return;
           }
           const blendFilterArray = getBlendFilterArray(this.blendMode);
           if (blendFilterArray) {
               renderer.batch.flush();
               if (!renderer.filter.pushWithCheck(this, blendFilterArray)) {
                   return;
               }
           }
           this.calculateVertices();
           renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
           renderer.plugins[this.pluginName].render(this);
           if (blendFilterArray) {
               renderer.batch.flush();
               renderer.filter.pop();
           }
       }
   }

   class TilingSprite extends spriteTiling.TilingSprite {
       _render(renderer) {
           const texture = this._texture;
           if (!texture || !texture.valid) {
               return;
           }
           const blendFilterArray = getBlendFilterArray(this.blendMode);
           if (blendFilterArray) {
               renderer.batch.flush();
               if (!renderer.filter.pushWithCheck(this, blendFilterArray)) {
                   return;
               }
           }
           this.tileTransform.updateLocalTransform();
           this.uvMatrix.update();
           renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
           renderer.plugins[this.pluginName].render(this);
           if (blendFilterArray) {
               renderer.batch.flush();
               renderer.filter.pop();
           }
       }
   }

   function containsRect(rectOut, rectIn) {
       let r1 = rectIn.x + rectIn.width;
       let b1 = rectIn.y + rectIn.height;
       let r2 = rectOut.x + rectOut.width;
       let b2 = rectOut.y + rectOut.height;
       return (rectIn.x >= rectOut.x) &&
           (rectIn.x <= r2) &&
           (rectIn.y >= rectOut.y) &&
           (rectIn.y <= b2) &&
           (r1 >= rectOut.x) &&
           (r1 <= r2) &&
           (b1 >= rectOut.y) &&
           (b1 <= b2);
   }
   function bindForceLocation(texture, location = 0) {
       const { gl } = this;
       if (this.currentLocation !== location) {
           this.currentLocation = location;
           gl.activeTexture(gl.TEXTURE0 + location);
       }
       this.bind(texture, location);
   }
   const tempMatrix = new math.Matrix();
   function pushWithCheck(target, filters, checkEmptyBounds = true) {
       const renderer = this.renderer;
       const filterStack = this.defaultFilterStack;
       const state = this.statePool.pop() || new core.FilterState();
       const renderTextureSystem = this.renderer.renderTexture;
       let resolution = filters[0].resolution;
       let padding = filters[0].padding;
       let autoFit = filters[0].autoFit;
       let legacy = filters[0].legacy;
       for (let i = 1; i < filters.length; i++) {
           const filter = filters[i];
           resolution = Math.min(resolution, filter.resolution);
           padding = this.useMaxPadding
               ? Math.max(padding, filter.padding)
               : padding + filter.padding;
           autoFit = autoFit && filter.autoFit;
           legacy = legacy || filter.legacy;
       }
       if (filterStack.length === 1) {
           this.defaultFilterStack[0].renderTexture = renderTextureSystem.current;
       }
       filterStack.push(state);
       state.resolution = resolution;
       state.legacy = legacy;
       state.target = target;
       state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));
       state.sourceFrame.pad(padding);
       let canUseBackdrop = true;
       if (autoFit) {
           const sourceFrameProjected = this.tempRect.copyFrom(renderTextureSystem.sourceFrame);
           if (renderer.projection.transform) {
               this.transformAABB(tempMatrix.copyFrom(renderer.projection.transform).invert(), sourceFrameProjected);
           }
           state.sourceFrame.fit(sourceFrameProjected);
       }
       else {
           canUseBackdrop = containsRect(this.renderer.renderTexture.sourceFrame, state.sourceFrame);
       }
       if (checkEmptyBounds && state.sourceFrame.width <= 1 && state.sourceFrame.height <= 1) {
           filterStack.pop();
           state.clear();
           this.statePool.push(state);
           return false;
       }
       this.roundFrame(state.sourceFrame, renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame, renderer.projection.transform);
       state.sourceFrame.ceil(resolution);
       if (canUseBackdrop) {
           let backdrop = null;
           for (let i = 0; i < filters.length; i++) {
               const bName = filters[i].backdropUniformName;
               if (bName) {
                   if (backdrop === null) {
                       backdrop = this.prepareBackdrop(state.sourceFrame);
                   }
                   filters[i].uniforms[bName] = backdrop;
                   if (backdrop) {
                       filters[i]._backdropActive = true;
                   }
               }
           }
       }
       state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution);
       state.filters = filters;
       state.destinationFrame.width = state.renderTexture.width;
       state.destinationFrame.height = state.renderTexture.height;
       const destinationFrame = this.tempRect;
       destinationFrame.x = 0;
       destinationFrame.y = 0;
       destinationFrame.width = state.sourceFrame.width;
       destinationFrame.height = state.sourceFrame.height;
       state.renderTexture.filterFrame = state.sourceFrame;
       state.bindingSourceFrame.copyFrom(renderTextureSystem.sourceFrame);
       state.bindingDestinationFrame.copyFrom(renderTextureSystem.destinationFrame);
       state.transform = renderer.projection.transform;
       renderer.projection.transform = null;
       renderTextureSystem.bind(state.renderTexture, state.sourceFrame, destinationFrame);
       const cc = filters[filters.length - 1].clearColor;
       if (cc) {
           renderer.framebuffer.clear(cc[0], cc[1], cc[2], cc[3]);
       }
       else {
           renderer.framebuffer.clear(0, 0, 0, 0);
       }
       return true;
   }
   function push(target, filters) {
       return this.pushWithCheck(target, filters, false);
   }
   function pop() {
       const filterStack = this.defaultFilterStack;
       const state = filterStack.pop();
       const filters = state.filters;
       this.activeState = state;
       const globalUniforms = this.globalUniforms.uniforms;
       globalUniforms.outputFrame = state.sourceFrame;
       globalUniforms.resolution = state.resolution;
       const inputSize = globalUniforms.inputSize;
       const inputPixel = globalUniforms.inputPixel;
       const inputClamp = globalUniforms.inputClamp;
       inputSize[0] = state.destinationFrame.width;
       inputSize[1] = state.destinationFrame.height;
       inputSize[2] = 1.0 / inputSize[0];
       inputSize[3] = 1.0 / inputSize[1];
       inputPixel[0] = inputSize[0] * state.resolution;
       inputPixel[1] = inputSize[1] * state.resolution;
       inputPixel[2] = 1.0 / inputPixel[0];
       inputPixel[3] = 1.0 / inputPixel[1];
       inputClamp[0] = 0.5 * inputPixel[2];
       inputClamp[1] = 0.5 * inputPixel[3];
       inputClamp[2] = (state.sourceFrame.width * inputSize[2]) - (0.5 * inputPixel[2]);
       inputClamp[3] = (state.sourceFrame.height * inputSize[3]) - (0.5 * inputPixel[3]);
       if (state.legacy) {
           const filterArea = globalUniforms.filterArea;
           filterArea[0] = state.destinationFrame.width;
           filterArea[1] = state.destinationFrame.height;
           filterArea[2] = state.sourceFrame.x;
           filterArea[3] = state.sourceFrame.y;
           globalUniforms.filterClamp = globalUniforms.inputClamp;
       }
       this.globalUniforms.update();
       const lastState = filterStack[filterStack.length - 1];
       if (state.renderTexture.framebuffer.multisample > 1) {
           this.renderer.framebuffer.blit();
       }
       if (filters.length === 1) {
           filters[0].apply(this, state.renderTexture, lastState.renderTexture, constants.CLEAR_MODES.BLEND, state);
           this.returnFilterTexture(state.renderTexture);
       }
       else {
           let flip = state.renderTexture;
           let flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
           flop.filterFrame = flip.filterFrame;
           let i = 0;
           for (i = 0; i < filters.length - 1; ++i) {
               filters[i].apply(this, flip, flop, constants.CLEAR_MODES.CLEAR, state);
               const t = flip;
               flip = flop;
               flop = t;
           }
           filters[i].apply(this, flip, lastState.renderTexture, constants.CLEAR_MODES.BLEND, state);
           this.returnFilterTexture(flip);
           this.returnFilterTexture(flop);
       }
       let backdropFree = false;
       for (let i = 0; i < filters.length; i++) {
           if (filters[i]._backdropActive) {
               const bName = filters[i].backdropUniformName;
               if (!backdropFree) {
                   this.returnFilterTexture(filters[i].uniforms[bName]);
                   backdropFree = true;
               }
               filters[i].uniforms[bName] = null;
               filters[i]._backdropActive = false;
           }
       }
       state.clear();
       this.statePool.push(state);
   }
   let hadBackbufferError = false;
   function prepareBackdrop(bounds) {
       const renderer = this.renderer;
       const renderTarget = renderer.renderTexture.current;
       const fr = this.renderer.renderTexture.sourceFrame;
       if (!renderTarget) {
           if (!hadBackbufferError) {
               hadBackbufferError = true;
               console.warn('pixi-picture: you are trying to use Blend Filter on main framebuffer! That wont work.');
           }
           return null;
       }
       const resolution = renderTarget.baseTexture.resolution;
       const x = (bounds.x - fr.x) * resolution;
       const y = (bounds.y - fr.y) * resolution;
       const w = (bounds.width) * resolution;
       const h = (bounds.height) * resolution;
       const gl = renderer.gl;
       const rt = this.getOptimalFilterTexture(w, h, 1);
       rt.filterFrame = fr;
       renderer.texture.bindForceLocation(rt.baseTexture, 0);
       gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x, y, w, h);
       return rt;
   }
   function applyMixins() {
       core.TextureSystem.prototype.bindForceLocation = bindForceLocation;
       core.FilterSystem.prototype.push = push;
       core.FilterSystem.prototype.pushWithCheck = pushWithCheck;
       core.FilterSystem.prototype.pop = pop;
       core.FilterSystem.prototype.prepareBackdrop = prepareBackdrop;
   }

   applyMixins();

   exports.BackdropFilter = BackdropFilter;
   exports.BlendFilter = BlendFilter;
   exports.HARDLIGHT_FULL = HARDLIGHT_FULL;
   exports.HARDLIGHT_PART = HARDLIGHT_PART;
   exports.MULTIPLY_FULL = MULTIPLY_FULL;
   exports.MaskConfig = MaskConfig;
   exports.MaskFilter = MaskFilter;
   exports.NPM_BLEND = NPM_BLEND;
   exports.OVERLAY_FULL = OVERLAY_FULL;
   exports.OVERLAY_PART = OVERLAY_PART;
   exports.SOFTLIGHT_FULL = SOFTLIGHT_FULL;
   exports.SOFTLIGHT_PART = SOFTLIGHT_PART;
   exports.Sprite = Sprite;
   exports.TilingSprite = TilingSprite;
   exports.applyMixins = applyMixins;
   exports.blendFullArray = blendFullArray;
   exports.getBlendFilter = getBlendFilter;
   exports.getBlendFilterArray = getBlendFilterArray;

   Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof _pixi_picture !== 'undefined') { Object.assign(this.PIXI.picture, _pixi_picture); }
//# sourceMappingURL=pixi-picture.umd.js.map
