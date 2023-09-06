/* eslint-disable */
 
/*!
 * pixi-heaven - v0.3.0
 * Compiled Thu, 08 Jul 2021 13:42:06 UTC
 *
 * pixi-heaven is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.heaven = this.PIXI.heaven || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/spritesheet'), require('@pixi/math'), require('@pixi/core'), require('@pixi/ticker'), require('@pixi/utils'), require('@pixi/constants'), require('@pixi/mesh'), require('@pixi/display'), require('@pixi/sprite'), require('@pixi/text-bitmap'), require('@pixi/graphics')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/spritesheet', '@pixi/math', '@pixi/core', '@pixi/ticker', '@pixi/utils', '@pixi/constants', '@pixi/mesh', '@pixi/display', '@pixi/sprite', '@pixi/text-bitmap', '@pixi/graphics'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_heaven = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI.utils, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI));
}(this, (function (exports, spritesheet, math, core, ticker, utils, constants, mesh, display, sprite, textBitmap, graphics) { 'use strict';

    class TexturePolygon {
        constructor( vertices,  uvs,  indices) {;this.vertices = vertices;this.uvs = uvs;this.indices = indices;
        }
    }

    function applySpritesheetMixin()
    {
        (spritesheet.Spritesheet.prototype )._processFrames = function (initialFrameIndex) {
            const meta = this.data.meta;

            let frameIndex = initialFrameIndex;
            const maxFrames = spritesheet.Spritesheet.BATCH_SIZE;

            while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length)
            {
                const i = this._frameKeys[frameIndex];
                const data = this._frames[i];
                const rect = data.frame;

                if (rect)
                {
                    let frame = null;
                    let trim = null;
                    const sourceSize = data.trimmed !== false && data.sourceSize
                        ? data.sourceSize : data.frame;

                    const orig = new math.Rectangle(
                        0,
                        0,
                        Math.floor(sourceSize.w) / this.resolution,
                        Math.floor(sourceSize.h) / this.resolution
                    );

                    if (data.rotated)
                    {
                        frame = new math.Rectangle(
                            Math.floor(rect.x) / this.resolution,
                            Math.floor(rect.y) / this.resolution,
                            Math.floor(rect.h) / this.resolution,
                            Math.floor(rect.w) / this.resolution
                        );
                    }
                    else
                    {
                        frame = new math.Rectangle(
                            Math.floor(rect.x) / this.resolution,
                            Math.floor(rect.y) / this.resolution,
                            Math.floor(rect.w) / this.resolution,
                            Math.floor(rect.h) / this.resolution
                        );
                    }

                    //  Check to see if the sprite is trimmed
                    if (data.trimmed !== false && data.spriteSourceSize)
                    {
                        trim = new math.Rectangle(
                            Math.floor(data.spriteSourceSize.x) / this.resolution,
                            Math.floor(data.spriteSourceSize.y) / this.resolution,
                            Math.floor(rect.w) / this.resolution,
                            Math.floor(rect.h) / this.resolution
                        );
                    }

                    this.textures[i] = new core.Texture(
                        this.baseTexture,
                        frame,
                        orig,
                        trim,
                        data.rotated ? 2 : 0,
                        data.anchor
                    );

                    if (data.vertices) {
                        const vertices = new Float32Array(data.vertices.length * 2);

                        for (let i = 0; i < data.vertices.length; i++) {
                            vertices[i * 2] = Math.floor(data.vertices[i][0] ) / this.resolution;
                            vertices[i * 2 + 1] = Math.floor(data.vertices[i][1] ) / this.resolution;
                        }

                        const uvs = new Float32Array(data.verticesUV.length * 2);

                        for (let i = 0; i < data.verticesUV.length; i++) {
                            uvs[i * 2] = data.verticesUV[i][0] / meta.size.w;
                            uvs[i * 2 + 1] = data.verticesUV[i][1] / meta.size.h;
                        }

                        const indices = new Uint16Array(data.triangles.length * 3);
                        for (let i = 0; i < data.triangles.length; i++) {
                            indices[i * 3] = data.triangles[i][0];
                            indices[i * 3 + 1] = data.triangles[i][1];
                            indices[i * 3 + 2] = data.triangles[i][2];
                        }

                        (this.textures[i] ).polygon = new TexturePolygon(vertices, uvs, indices);
                    }

                    // lets also add the frame to pixi's global cache for 'from' and 'fromLoader' functions
                    core.Texture.addToCache(this.textures[i], i);
                }

                frameIndex++;
            }
        };
    }

    class AnimationState {
        

        __init() {this._textures = null;}
        __init2() {this._durations = null;}
        
        __init3() {this.animationSpeed = 1;}
        
        __init4() {this.loop = true;}
        
        
        
        __init5() {this._currentTime = 0;}
        __init6() {this.playing = false;}

        constructor(textures, autoUpdate) {;AnimationState.prototype.__init.call(this);AnimationState.prototype.__init2.call(this);AnimationState.prototype.__init3.call(this);AnimationState.prototype.__init4.call(this);AnimationState.prototype.__init5.call(this);AnimationState.prototype.__init6.call(this);
            this.texture = textures[0] instanceof core.Texture ? textures[0]  : (textures[0] ).texture;

            this.textures = textures ;

            this._autoUpdate = autoUpdate !== false;
        }

        /**
         * Stops the AnimatedSprite
         *
         */
        stop() {
            if (!this.playing) {
                return;
            }

            this.playing = false;
            if (this._autoUpdate) {
                ticker.Ticker.shared.remove(this.update, this);
            }
        }

        /**
         * Plays the AnimatedSprite
         *
         */
        play() {
            if (this.playing) {
                return;
            }

            this.playing = true;
            if (this._autoUpdate) {
                ticker.Ticker.shared.add(this.update, this, ticker.UPDATE_PRIORITY.HIGH);
            }
        }

        /**
         * Stops the AnimatedSprite and goes to a specific frame
         *
         * @param {number} frameNumber - frame index to stop at
         */
        gotoAndStop(frameNumber) {
            this.stop();

            const previousFrame = this.currentFrame;

            this._currentTime = frameNumber;

            if (previousFrame !== this.currentFrame) {
                this.updateTexture();
            }
        }

        /**
         * Goes to a specific frame and begins playing the AnimatedSprite
         *
         * @param {number} frameNumber - frame index to start at
         */
        gotoAndPlay(frameNumber) {
            const previousFrame = this.currentFrame;

            this._currentTime = frameNumber;

            if (previousFrame !== this.currentFrame) {
                this.updateTexture();
            }

            this.play();
        }

        /**
         * Updates the object transform for rendering.
         *
         * @private
         * @param {number} deltaTime - Time since last tick.
         */
        update(deltaTime) {
            const elapsed = this.animationSpeed * deltaTime;
            const previousFrame = this.currentFrame;

            if (this._durations !== null) {
                let lag = this._currentTime % 1 * this._durations[this.currentFrame];

                lag += elapsed / 60 * 1000;

                while (lag < 0) {
                    this._currentTime--;
                    lag += this._durations[this.currentFrame];
                }

                let sign = this.animationSpeed * deltaTime;

                if (sign < 0) sign = -1;
                else if (sign > 0) sign = 1;

                this._currentTime = Math.floor(this._currentTime);

                while (lag >= this._durations[this.currentFrame]) {
                    lag -= this._durations[this.currentFrame] * sign;
                    this._currentTime += sign;
                }

                this._currentTime += lag / this._durations[this.currentFrame];
            }
            else {
                this._currentTime += elapsed;
            }

            if (this._currentTime < 0 && !this.loop) {
                this.gotoAndStop(0);

                if (this.onComplete) {
                    this.onComplete();
                }
            }
            else if (this._currentTime >= this._textures.length && !this.loop) {
                this.gotoAndStop(this._textures.length - 1);

                if (this.onComplete) {
                    this.onComplete();
                }
            }
            else if (previousFrame !== this.currentFrame) {
                if (this.loop && this.onLoop) {
                    if (this.animationSpeed > 0 && this.currentFrame < previousFrame) {
                        this.onLoop();
                    }
                    else if (this.animationSpeed < 0 && this.currentFrame > previousFrame) {
                        this.onLoop();
                    }
                }

                this.updateTexture();
            }
        }

        /**
         * Updates the displayed texture to match the current frame index
         *
         * @private
         */
        updateTexture() {
            this.texture = this._textures[this.currentFrame];
            if (this._target) {
                this._target.texture = this.texture;
            }
            if (this.onFrameChange) {
                this.onFrameChange(this.currentFrame);
            }
        }

        bind(target) {
            this._target = target;
            target.animState = this;
        }

        /**
         * A short hand way of creating a movieclip from an array of frame ids
         *
         * @static
         * @param {string[]} frames - The array of frames ids the movieclip will use as its texture frames
         * @return {AnimatedSprite} The new animated sprite with the specified frames.
         */
        static fromFrames(frames) {
            const textures = [];

            for (let i = 0; i < frames.length; ++i) {
                textures.push(core.Texture.from(frames[i]));
            }

            return new AnimationState(textures);
        }

        /**
         * A short hand way of creating a movieclip from an array of image ids
         *
         * @static
         * @param {string[]} images - the array of image urls the movieclip will use as its texture frames
         * @return {AnimatedSprite} The new animate sprite with the specified images as frames.
         */
        static fromImages(images) {
            const textures = [];

            for (let i = 0; i < images.length; ++i) {
                textures.push(core.Texture.from(images[i]));
            }

            return new AnimationState(textures);
        }

        /**
         * totalFrames is the total number of frames in the AnimatedSprite. This is the same as number of textures
         * assigned to the AnimatedSprite.
         *
         * @readonly
         * @member {number}
         * @default 0
         */
        get totalFrames() {
            return this._textures.length;
        }

        /**
         * The array of textures used for this AnimatedSprite
         *
         * @member {Texture[]}
         */
        get textures()
        {
            return this._textures;
        }

        set textures(value)
        {
            if (value[0] instanceof core.Texture) {
                this._textures = value ;
                this._durations = null;
            }
            else {
                this._textures = [];
                this._durations = [];

                for (let i = 0; i < value.length; i++) {
                    const val = (value )[i];
                    this._textures.push(val.texture);
                    this._durations.push(val.time);
                }
            }
            this.gotoAndStop(0);
            this.updateTexture();
        }

        get currentFrame()
        {
            let currentFrame = Math.floor(this._currentTime) % this._textures.length;

            if (currentFrame < 0)
            {
                currentFrame += this._textures.length;
            }

            return currentFrame;
        }
    }

    class LoopShaderGenerator {
        __init() {this.programCache = {};}
        __init2() {this.defaultGroupCache = {};}

        constructor( vertexSrc,  fragTemplate,  loops) {;this.vertexSrc = vertexSrc;this.fragTemplate = fragTemplate;this.loops = loops;LoopShaderGenerator.prototype.__init.call(this);LoopShaderGenerator.prototype.__init2.call(this);
            if (fragTemplate.indexOf('%count%') < 0) {
                throw new Error('Fragment template must contain "%count%".');
            }
            for (let i=0;i<loops.length;i++) {
                if (fragTemplate.indexOf(loops[i].loopLabel) < 0) {
                    throw new Error(`Fragment template must contain "${loops[i].loopLabel}".`);
                }
            }
        }

        generateShader(maxTextures) {
            if (!this.programCache[maxTextures]) {
                const sampleValues = new Int32Array(maxTextures);
                const { loops } = this;

                for (let i = 0; i < maxTextures; i++) {
                    sampleValues[i] = i;
                }

                this.defaultGroupCache[maxTextures] = new core.UniformGroup({uSamplers: sampleValues}, true);

                let fragmentSrc = this.fragTemplate;

                for (let i=0;i<loops.length;i++) {
                    fragmentSrc = fragmentSrc.replace(/%count%/gi, `${maxTextures}`);
                    fragmentSrc = fragmentSrc.replace(new RegExp(loops[i].loopLabel, 'gi'), this.generateSampleSrc(maxTextures, loops[i]));
                }

                this.programCache[maxTextures] = new core.Program(this.vertexSrc, fragmentSrc);
            }

            // TODO: move this to generator parameters
            const uniforms = {
                tint: new Float32Array([1, 1, 1, 1]),
                translationMatrix: new math.Matrix(),
                default: this.defaultGroupCache[maxTextures],
            };

            return new core.Shader(this.programCache[maxTextures], uniforms);
        }

        generateSampleSrc(maxTextures, loop) {
            let src = '';

            src += '\n';
            src += '\n';

            for (let i = 0; i < maxTextures; i++) {
                if (i > 0) {
                    src += '\nelse ';
                }

                if (i < maxTextures - 1) {
                    src += `if(${loop.inTex} < ${i}.5)`;
                }

                src += '\n{';
                src += `\n\t${loop.outColor} = texture2D(uSamplers[${i}], ${loop.inCoord});`;
                src += '\n}';
            }

            src += '\n';
            src += '\n';

            return src;
        }
    }

    const WHITE = core.Texture.WHITE.baseTexture;

    const shaderVert$1 =
        `precision highp float;
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
`;
    const shaderFrag$1 = `
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
}`;
    const tempArray = new Float32Array([0, 0, 0, 0]);

    class MaskedGeometry extends core.Geometry {
        
        

        constructor(_static = false) {
            super();

            this._buffer = new core.Buffer(null, _static, false);

            this._indexBuffer = new core.Buffer(null, _static, true);

            this.addAttribute('aVertexPosition', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aTextureCoord', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aLight', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aDark', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', this._buffer, 1, true, constants.TYPES.FLOAT)
                .addAttribute('aMaskCoord', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aMaskClamp', this._buffer, 4, false, constants.TYPES.FLOAT)
                .addIndex(this._indexBuffer);
        }
    }

    const elemTex = [null, null];

    class MaskedPluginFactory {
        static __initStatic() {this.MAX_TEXTURES = 8;}

        static create(options) {
            const {vertex, fragment, vertexSize, geometryClass} = (Object ).assign({
                vertex: shaderVert$1,
                fragment: shaderFrag$1,
                geometryClass: MaskedGeometry,
                vertexSize: 13,
            }, options);

            return class BatchPlugin extends core.AbstractBatchRenderer {
                constructor(renderer) {
                    super(renderer);

                    this.shaderGenerator = new LoopShaderGenerator(vertex, fragment,
                        [{
                            loopLabel: '%loopTex%',
                            inCoord: 'vTextureCoord',
                            outColor: 'texColor',
                            inTex: 'textureId',
                        }, {
                            loopLabel: '%loopMask%',
                            inCoord: 'vMaskCoord',
                            outColor: 'maskColor',
                            inTex: 'maskId',
                        }]) ;
                    this.geometryClass = geometryClass;
                    this.vertexSize = vertexSize;
                }

                

                contextChange() {
                    const thisAny = this ;
                    const batchMAX_TEXTURES = thisAny.renderer.plugins['batch'].MAX_TEXTURES * 2;

                    thisAny.MAX_TEXTURES = Math.max(2, Math.min(MaskedPluginFactory.MAX_TEXTURES, batchMAX_TEXTURES));
                    this._shader = thisAny.shaderGenerator.generateShader(this.MAX_TEXTURES);

                    // we use the second shader as the first one depending on your browser
                    // may omit aTextureId as it is not used by the shader so is optimized out.
                    for (let i = 0; i < thisAny._packedGeometryPoolSize; i++) {
                        /* eslint-disable max-len */
                        thisAny._packedGeometries[i] = new (this.geometryClass)();
                    }

                    this.initFlushBuffers();
                }

                buildTexturesAndDrawCalls() {
                    const textures = (this )._bufferedTextures;
                    const elements = (this )._bufferedElements;
                    const _bufferSize = (this )._bufferSize;
                    const {
                        MAX_TEXTURES
                    } = this;
                    const textureArrays = core.AbstractBatchRenderer._textureArrayPool;
                    const batch = this.renderer.batch;
                    const boundTextures = (this )._tempBoundTextures;
                    const touch = this.renderer.textureGC.count;

                    let TICK = ++core.BaseTexture._globalBatch;
                    let countTexArrays = 0;
                    let texArray = textureArrays[0];
                    let start = 0;

                    batch.copyBoundTextures(boundTextures, MAX_TEXTURES);

                    for (let i = 0; i < _bufferSize; ++i) {
                        // here are my changes, use two textures instead of one
                        // use WHITE as default mask
                        const maskTexNull = elements[i].maskSprite ? elements[i].maskSprite.texture.baseTexture : null;
                        elemTex[0] = maskTexNull && maskTexNull.valid ? maskTexNull : WHITE;
                        elemTex[1] = textures[i];
                        textures[i] = null;

                        const cnt = (elemTex[0]._batchEnabled !== TICK ? 1 : 0) +
                            (elemTex[1]._batchEnabled !== TICK ? 1 : 0);

                        if (texArray.count + cnt > MAX_TEXTURES) {
                            batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
                            this.buildDrawCalls(texArray, start, i);
                            start = i;
                            texArray = textureArrays[++countTexArrays];
                            ++TICK;
                        }

                        for (let j = 0; j < 2; j++) {
                            const tex = elemTex[j];

                            if (tex._batchEnabled !== TICK) {
                                tex._batchEnabled = TICK;
                                (tex ).touched = touch;
                                texArray.elements[texArray.count++] = tex;
                            }
                        }
                    }

                    if (texArray.count > 0) {
                        batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
                        this.buildDrawCalls(texArray, start, _bufferSize);
                        ++countTexArrays;
                        ++TICK;
                    }

                    // Clean-up

                    for (let i = 0; i < boundTextures.length; i++) {
                        boundTextures[i] = null;
                    }
                    core.BaseTexture._globalBatch = TICK;
                }

                packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
                    const {
                        uint32View,
                        float32View,
                    } = attributeBuffer;

                    let lightRgba = -1;
                    let darkRgba = 0;

                    if (element.color) {
                        lightRgba = element.color.lightRgba;
                        darkRgba = element.color.darkRgba;
                    } else {
                        const alpha = Math.min(element.worldAlpha, 1.0);
                        lightRgba = (alpha < 1.0
                            && element._texture.baseTexture.premultiplyAlpha)
                            ? utils.premultiplyTint(element._tintRGB, alpha)
                            : element._tintRGB + (alpha * 255 << 24);
                    }

                    const p = aIndex / this.vertexSize;
                    const uvs = element.uvs;
                    const indices = element.indices;
                    const vertexData = element.vertexData;
                    const textureId = element._texture.baseTexture._batchLocation;
                    let maskTex = WHITE;

                    const mask = element.maskSprite;
                    let clamp = tempArray;
                    let maskVertexData = tempArray;
                    let maskBit = 0;

                    if (mask) {
                        //TODO: exclude from batcher, move it to element render()
                        element.calculateMaskVertices();
                        clamp = mask._texture.uvMatrix.uClampFrame;
                        maskVertexData = element.maskVertexData;
                        if (mask.texture.valid) {
                            maskTex = mask.texture.baseTexture;
                            maskBit = 1;
                        }
                    }

                    for (let i = 0; i < vertexData.length; i += 2) {
                        float32View[aIndex++] = vertexData[i];
                        float32View[aIndex++] = vertexData[i + 1];
                        float32View[aIndex++] = uvs[i];
                        float32View[aIndex++] = uvs[i + 1];
                        uint32View[aIndex++] = lightRgba;
                        uint32View[aIndex++] = darkRgba;
                        float32View[aIndex++] = ((maskTex._batchLocation * 16.0 + maskBit) * 64.0) + textureId;

                        float32View[aIndex++] = maskVertexData[i];
                        float32View[aIndex++] = maskVertexData[i + 1];
                        float32View[aIndex++] = clamp[0];
                        float32View[aIndex++] = clamp[1];
                        float32View[aIndex++] = clamp[2];
                        float32View[aIndex++] = clamp[3];
                    }

                    for (let i = 0; i < indices.length; i++) {
                        indexBuffer[iIndex++] = p + indices[i];
                    }
                }
            };
        }
    } MaskedPluginFactory.__initStatic();

    const whiteRgba = [1.0, 1.0, 1.0, 1.0];
    const blackRgba = [0.0, 0.0, 0.0, 1.0];

    class ColorTransform {constructor() { ColorTransform.prototype.__init.call(this);ColorTransform.prototype.__init2.call(this);ColorTransform.prototype.__init3.call(this);ColorTransform.prototype.__init4.call(this);ColorTransform.prototype.__init5.call(this);ColorTransform.prototype.__init6.call(this);ColorTransform.prototype.__init7.call(this); }
        __init() {this.dark = new Float32Array(blackRgba);}
        __init2() {this.light = new Float32Array(whiteRgba);}

        __init3() {this._updateID = 0;}
        __init4() {this._currentUpdateID = -1;}

        __init5() {this.darkRgba = 0;}
        __init6() {this.lightRgba = -1;}
        __init7() {this.hasNoTint = true;}

        get darkR() {
            return this.dark[0];
        }

        set darkR(value) {
            if (this.dark[0] === value) return;
            this.dark[0] = value;
            this._updateID++;
        }

        get darkG() {
            return this.dark[1];
        }

        set darkG(value) {
            if (this.dark[1] === value) return;
            this.dark[1] = value;
            this._updateID++;
        }

        get darkB() {
            return this.dark[2];
        }

        set darkB(value) {
            if (this.dark[2] === value) return;
            this.dark[2] = value;
            this._updateID++;
        }

        get lightR() {
            return this.light[0];
        }

        set lightR(value) {
            if (this.light[0] === value) return;
            this.light[0] = value;
            this._updateID++;
        }

        get lightG() {
            return this.light[1];
        }

        set lightG(value) {
            if (this.light[1] === value) return;
            this.light[1] = value;
            this._updateID++;
        }

        get lightB() {
            return this.light[2];
        }

        set lightB(value) {
            if (this.light[2] === value) return;
            this.light[2] = value;
            this._updateID++;
        }

        get alpha() {
            return this.light[3];
        }

        set alpha(value) {
            if (this.light[3] === value) return;
            this.light[3] = value;
            this._updateID++;
        }

        get pma() {
            return this.dark[3] !== 0.0;
        }

        set pma(value) {
            if ((this.dark[3] !== 0.0) !== value) return;
            this.dark[3] = value ? 1.0 : 0.0;
            this._updateID++;
        }

        get tintBGR() {
            const light = this.light;
            return ((light[0] * 255) << 16) + ((light[1] * 255) << 8) + (light[2] * 255 | 0);
        }

        set tintBGR(value) {
            this.setLight(
                ((value >> 16) & 0xff) / 255.0,
                ((value >> 8) & 0xff) / 255.0,
                (value & 0xff) / 255.0
            );
        }

        setLight(R, G, B) {
            const color = this.light;

            if (color[0] === R && color[1] === G && color[2] === B) {
                return;
            }
            color[0] = R;
            color[1] = G;
            color[2] = B;
            this._updateID++;
        }

        setDark(R, G, B) {
            const color = this.dark;

            if (color[0] === R && color[1] === G && color[2] === B) {
                return;
            }
            color[0] = R;
            color[1] = G;
            color[2] = B;
            this._updateID++;
        }

        clear() {
            this.dark[0] = 0.0;
            this.dark[1] = 0.0;
            this.dark[2] = 0.0;
            this.light[0] = 1.0;
            this.light[1] = 1.0;
            this.light[2] = 1.0;
        }

        invalidate() {
            this._updateID++;
        }

        updateTransformLocal() {
            const dark = this.dark, light = this.light;
            const la = 255 * (1.0 + (light[3] - 1.0) * dark[3]);
            this.hasNoTint = dark[0] === 0.0 && dark[1] === 0.0 && dark[2] === 0.0
                && light[0] === 1.0 && light[1] === 1.0 && light[2] === 1.0;
            this.darkRgba = (dark[0] * la | 0) + ((dark[1] * la) << 8)
                + ((dark[2] * la) << 16) + ((dark[3] * 255) << 24);
            this.lightRgba = (light[0] * la | 0) + ((light[1] * la) << 8)
                + ((light[2] * la) << 16) + ((light[3] * 255) << 24);
            this._currentUpdateID = this._updateID;
        }

        updateTransform() {
            if (this._currentUpdateID === this._updateID) {
                return;
            }
            this.updateTransformLocal();
        }
    }

    exports.CLAMP_OPTIONS = void 0; (function (CLAMP_OPTIONS) {
        const NEVER = 0; CLAMP_OPTIONS[CLAMP_OPTIONS["NEVER"] = NEVER] = "NEVER";
        const AUTO = 1; CLAMP_OPTIONS[CLAMP_OPTIONS["AUTO"] = AUTO] = "AUTO";
        const ALWAYS = 2; CLAMP_OPTIONS[CLAMP_OPTIONS["ALWAYS"] = ALWAYS] = "ALWAYS";
    })(exports.CLAMP_OPTIONS || (exports.CLAMP_OPTIONS = {}));






    const settings$1 = {
        MESH_CLAMP: exports.CLAMP_OPTIONS.AUTO,
        BLEND_ADD_UNITY: false,
    };

    const vertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTextureMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
}`;

    const fragment = `varying vec2 vTextureCoord;
uniform vec4 uLight, uDark;

uniform sampler2D uSampler;

void main(void)
{
vec4 texColor = texture2D(uSampler, vTextureCoord);
gl_FragColor.a = texColor.a * uLight.a;
gl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;
}
`;

    const fragTrim = `
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
`;

    class DoubleTintMeshMaterial extends core.Shader {
        
        
        
        
        
        

        constructor(uSampler, options) {
            const uniforms = {
                uSampler,
                uTextureMatrix: math.Matrix.IDENTITY,
                uDark: new Float32Array([0, 0, 0, 1]),
                uLight: new Float32Array([1, 1, 1, 1]),
            };

            // Set defaults
            options = (Object ).assign({
                pluginName: 'batchHeaven',
            }, options);

            let allowTrim = options.allowTrim;

            if (!allowTrim) {
                if (settings$1.MESH_CLAMP === exports.CLAMP_OPTIONS.AUTO) {
                    allowTrim = uSampler.trim && (uSampler.trim.width < uSampler.orig.width || uSampler.trim.height < uSampler.orig.height);
                } else if (settings$1.MESH_CLAMP === exports.CLAMP_OPTIONS.ALWAYS) {
                    allowTrim = true;
                }
            }

            if (options.uniforms) {
                (Object ).assign(uniforms, options.uniforms);
            }

            super(options.program || core.Program.from(vertex, allowTrim ? fragTrim: fragment), uniforms);

            this.allowTrim = allowTrim;

            /**
             * TextureMatrix instance for this Mesh, used to track Texture changes
             *
             * @member {TextureMatrix}
             * @readonly
             */
            this.uvMatrix = new core.TextureMatrix(uSampler);

            /**
             * `true` if shader can be batch with the renderer's batch system.
             * @member {boolean}
             * @default true
             */
            this.batchable = options.program === undefined && !this.allowTrim;

            /**
             * Renderer plugin for batching
             *
             * @member {string}
             * @default 'batch'
             */
            this.pluginName = options.pluginName;

            this.color = options.color || new ColorTransform();

            this._colorId = -1;
        }

        /**
         * Reference to the texture being rendered.
         * @member {Texture}
         */
        get texture() {
            return this.uniforms.uSampler;
        }

        set texture(value) {
            if (this.uniforms.uSampler !== value) {
                this.uniforms.uSampler = value;
                this.uvMatrix.texture = value;
                this.color.pma = value.baseTexture.premultiplyAlpha;
            }
        }

        /**
         * This gets automatically set by the object using this.
         *
         * @default 1
         * @member {number}
         */
        set alpha(value) {
            this.color.alpha = value;
        }

        get alpha() {
            return this.color.alpha;
        }

        /**
         * Multiply tint for the material.
         * @member {number}
         * @default 0xFFFFFF
         */
        set tint(value) {
            this.color.tintBGR = value;
        }

        get tint() {
            return this.color.tintBGR;
        }

        /**
         * Gets called automatically by the Mesh. Intended to be overridden for custom
         * MeshMaterial objects.
         */
        update() {
            this.color.updateTransform();
            if (this._colorId !== this.color._updateID) {
                this._colorId = this.color._updateID;
                const { color, uniforms } = this;
                utils.premultiplyRgba(color.light, color.light[3], uniforms.uLight, color.dark[3] > 0.0);
                utils.premultiplyRgba(color.dark, color.light[3], uniforms.uDark, color.dark[3] > 0.0);
                uniforms.uDark[3] = color.dark[3];
            }

            if (this.uvMatrix.update()) {
                this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
                if (this.allowTrim) {
                    this.uniforms.uClampFrame = this.uvMatrix.uClampFrame;
                }
            }
        }
    }

    class MeshH extends mesh.Mesh {
        __init() {this.color = null;}
        __init2() {this.maskSprite = null;}
        __init3() {this.useSpriteMask = false;}

        constructor(geometry, shader, state, drawMode) {
            super(geometry, shader , state, drawMode);MeshH.prototype.__init.call(this);MeshH.prototype.__init2.call(this);MeshH.prototype.__init3.call(this);;
            this.color = shader.color;
        }

        _renderDefault(renderer) {
            const shader = this.shader ;

            shader.color.alpha = this.worldAlpha;
            if (shader.update) {
                shader.update();
            }

            renderer.batch.flush();

            shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

            // bind and sync uniforms..
            renderer.shader.bind(shader, false);

            // set state..
            renderer.state.set(this.state);

            // bind the geometry...
            renderer.geometry.bind(this.geometry, shader);

            // then render it
            renderer.geometry.draw(this.drawMode, this.size, this.start, (this.geometry ).instanceCount);
        }

        _render(renderer) {
            // part of SimpleMesh
            if (this.maskSprite) {
                this.useSpriteMask = true;
            }
            if (this.useSpriteMask) {
                (this.material ).pluginName = 'batchMasked';
                this._renderToBatch(renderer);
            } else {
                super._renderDefault(renderer);
            }
        }

        _renderToBatch(renderer)
        {
            this.color.updateTransform();
            super._renderToBatch(renderer);
        }
    }


    class SimpleMeshH extends MeshH {
        constructor(texture, vertices, uvs,
                    indices, drawMode) {
            super(new mesh.MeshGeometry(vertices, uvs, indices),
                new DoubleTintMeshMaterial(texture),
                null,
                drawMode);SimpleMeshH.prototype.__init4.call(this);;

            (this.geometry.getBuffer('aVertexPosition') ).static = false;
        }

        __init4() {this.autoUpdate = true;}

        get vertices() {
            return this.geometry.getBuffer('aVertexPosition').data ;
        }

        set vertices(value) {
            this.geometry.getBuffer('aVertexPosition').data = value;
        }

        _render(renderer) {
            if (this.autoUpdate) {
                this.geometry.getBuffer('aVertexPosition').update();
            }

            (super._render )(renderer);
        }
    }

    var appleIphone = /iPhone/i;
    var appleIpod = /iPod/i;
    var appleTablet = /iPad/i;
    var appleUniversal = /\biOS-universal(?:.+)Mac\b/i;
    var androidPhone = /\bAndroid(?:.+)Mobile\b/i;
    var androidTablet = /Android/i;
    var amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i;
    var amazonTablet = /Silk/i;
    var windowsPhone = /Windows Phone/i;
    var windowsTablet = /\bWindows(?:.+)ARM\b/i;
    var otherBlackBerry = /BlackBerry/i;
    var otherBlackBerry10 = /BB10/i;
    var otherOpera = /Opera Mini/i;
    var otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
    var otherFirefox = /Mobile(?:.+)Firefox\b/i;
    var isAppleTabletOnIos13 = function (navigator) {
        return (typeof navigator !== 'undefined' &&
            navigator.platform === 'MacIntel' &&
            typeof navigator.maxTouchPoints === 'number' &&
            navigator.maxTouchPoints > 1 &&
            typeof MSStream === 'undefined');
    };
    function createMatch(userAgent) {
        return function (regex) { return regex.test(userAgent); };
    }
    function isMobile$1(param) {
        var nav = {
            userAgent: '',
            platform: '',
            maxTouchPoints: 0
        };
        if (!param && typeof navigator !== 'undefined') {
            nav = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                maxTouchPoints: navigator.maxTouchPoints || 0
            };
        }
        else if (typeof param === 'string') {
            nav.userAgent = param;
        }
        else if (param && param.userAgent) {
            nav = {
                userAgent: param.userAgent,
                platform: param.platform,
                maxTouchPoints: param.maxTouchPoints || 0
            };
        }
        var userAgent = nav.userAgent;
        var tmp = userAgent.split('[FBAN');
        if (typeof tmp[1] !== 'undefined') {
            userAgent = tmp[0];
        }
        tmp = userAgent.split('Twitter');
        if (typeof tmp[1] !== 'undefined') {
            userAgent = tmp[0];
        }
        var match = createMatch(userAgent);
        var result = {
            apple: {
                phone: match(appleIphone) && !match(windowsPhone),
                ipod: match(appleIpod),
                tablet: !match(appleIphone) &&
                    (match(appleTablet) || isAppleTabletOnIos13(nav)) &&
                    !match(windowsPhone),
                universal: match(appleUniversal),
                device: (match(appleIphone) ||
                    match(appleIpod) ||
                    match(appleTablet) ||
                    match(appleUniversal) ||
                    isAppleTabletOnIos13(nav)) &&
                    !match(windowsPhone)
            },
            amazon: {
                phone: match(amazonPhone),
                tablet: !match(amazonPhone) && match(amazonTablet),
                device: match(amazonPhone) || match(amazonTablet)
            },
            android: {
                phone: (!match(windowsPhone) && match(amazonPhone)) ||
                    (!match(windowsPhone) && match(androidPhone)),
                tablet: !match(windowsPhone) &&
                    !match(amazonPhone) &&
                    !match(androidPhone) &&
                    (match(amazonTablet) || match(androidTablet)),
                device: (!match(windowsPhone) &&
                    (match(amazonPhone) ||
                        match(amazonTablet) ||
                        match(androidPhone) ||
                        match(androidTablet))) ||
                    match(/\bokhttp\b/i)
            },
            windows: {
                phone: match(windowsPhone),
                tablet: match(windowsTablet),
                device: match(windowsPhone) || match(windowsTablet)
            },
            other: {
                blackberry: match(otherBlackBerry),
                blackberry10: match(otherBlackBerry10),
                opera: match(otherOpera),
                firefox: match(otherFirefox),
                chrome: match(otherChrome),
                device: match(otherBlackBerry) ||
                    match(otherBlackBerry10) ||
                    match(otherOpera) ||
                    match(otherFirefox) ||
                    match(otherChrome)
            },
            any: false,
            phone: false,
            tablet: false
        };
        result.any =
            result.apple.device ||
                result.android.device ||
                result.windows.device ||
                result.other.device;
        result.phone =
            result.apple.phone || result.android.phone || result.windows.phone;
        result.tablet =
            result.apple.tablet || result.android.tablet || result.windows.tablet;
        return result;
    }

    /*!
     * @pixi/settings - v6.0.4
     * Compiled Tue, 11 May 2021 18:00:23 UTC
     *
     * @pixi/settings is licensed under the MIT License.
     * http://www.opensource.org/licenses/mit-license
     */

    // The ESM/CJS versions of ismobilejs only
    var isMobile = isMobile$1(self.navigator);

    /**
     * The maximum recommended texture units to use.
     * In theory the bigger the better, and for desktop we'll use as many as we can.
     * But some mobile devices slow down if there is to many branches in the shader.
     * So in practice there seems to be a sweet spot size that varies depending on the device.
     *
     * In v4, all mobile devices were limited to 4 texture units because for this.
     * In v5, we allow all texture units to be used on modern Apple or Android devices.
     *
     * @private
     * @param {number} max
     * @returns {number}
     */
    function maxRecommendedTextures(max) {
        var allowMax = true;
        if (isMobile.tablet || isMobile.phone) {
            if (isMobile.apple.device) {
                var match = (navigator.userAgent).match(/OS (\d+)_(\d+)?/);
                if (match) {
                    var majorVersion = parseInt(match[1], 10);
                    // Limit texture units on devices below iOS 11, which will be older hardware
                    if (majorVersion < 11) {
                        allowMax = false;
                    }
                }
            }
            if (isMobile.android.device) {
                var match = (navigator.userAgent).match(/Android\s([0-9.]*)/);
                if (match) {
                    var majorVersion = parseInt(match[1], 10);
                    // Limit texture units on devices below Android 7 (Nougat), which will be older hardware
                    if (majorVersion < 7) {
                        allowMax = false;
                    }
                }
            }
        }
        return allowMax ? max : 4;
    }

    /**
     * Uploading the same buffer multiple times in a single frame can cause performance issues.
     * Apparent on iOS so only check for that at the moment
     * This check may become more complex if this issue pops up elsewhere.
     *
     * @private
     * @returns {boolean}
     */
    function canUploadSameBuffer() {
        return !isMobile.apple.device;
    }

    /**
     * Different types of environments for WebGL.
     *
     * @static
     * @memberof PIXI
     * @name ENV
     * @enum {number}
     * @property {number} WEBGL_LEGACY - Used for older v1 WebGL devices. PixiJS will aim to ensure compatibility
     *  with older / less advanced devices. If you experience unexplained flickering prefer this environment.
     * @property {number} WEBGL - Version 1 of WebGL
     * @property {number} WEBGL2 - Version 2 of WebGL
     */
    var ENV;
    (function (ENV) {
        ENV[ENV["WEBGL_LEGACY"] = 0] = "WEBGL_LEGACY";
        ENV[ENV["WEBGL"] = 1] = "WEBGL";
        ENV[ENV["WEBGL2"] = 2] = "WEBGL2";
    })(ENV || (ENV = {}));
    /**
     * Constant to identify the Renderer Type.
     *
     * @static
     * @memberof PIXI
     * @name RENDERER_TYPE
     * @enum {number}
     * @property {number} UNKNOWN - Unknown render type.
     * @property {number} WEBGL - WebGL render type.
     * @property {number} CANVAS - Canvas render type.
     */
    var RENDERER_TYPE;
    (function (RENDERER_TYPE) {
        RENDERER_TYPE[RENDERER_TYPE["UNKNOWN"] = 0] = "UNKNOWN";
        RENDERER_TYPE[RENDERER_TYPE["WEBGL"] = 1] = "WEBGL";
        RENDERER_TYPE[RENDERER_TYPE["CANVAS"] = 2] = "CANVAS";
    })(RENDERER_TYPE || (RENDERER_TYPE = {}));
    /**
     * Bitwise OR of masks that indicate the buffers to be cleared.
     *
     * @static
     * @memberof PIXI
     * @name BUFFER_BITS
     * @enum {number}
     * @property {number} COLOR - Indicates the buffers currently enabled for color writing.
     * @property {number} DEPTH - Indicates the depth buffer.
     * @property {number} STENCIL - Indicates the stencil buffer.
     */
    var BUFFER_BITS;
    (function (BUFFER_BITS) {
        BUFFER_BITS[BUFFER_BITS["COLOR"] = 16384] = "COLOR";
        BUFFER_BITS[BUFFER_BITS["DEPTH"] = 256] = "DEPTH";
        BUFFER_BITS[BUFFER_BITS["STENCIL"] = 1024] = "STENCIL";
    })(BUFFER_BITS || (BUFFER_BITS = {}));
    /**
     * Various blend modes supported by PIXI.
     *
     * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
     * Anything else will silently act like NORMAL.
     *
     * @memberof PIXI
     * @name BLEND_MODES
     * @enum {number}
     * @property {number} NORMAL
     * @property {number} ADD
     * @property {number} MULTIPLY
     * @property {number} SCREEN
     * @property {number} OVERLAY
     * @property {number} DARKEN
     * @property {number} LIGHTEN
     * @property {number} COLOR_DODGE
     * @property {number} COLOR_BURN
     * @property {number} HARD_LIGHT
     * @property {number} SOFT_LIGHT
     * @property {number} DIFFERENCE
     * @property {number} EXCLUSION
     * @property {number} HUE
     * @property {number} SATURATION
     * @property {number} COLOR
     * @property {number} LUMINOSITY
     * @property {number} NORMAL_NPM
     * @property {number} ADD_NPM
     * @property {number} SCREEN_NPM
     * @property {number} NONE
     * @property {number} SRC_IN
     * @property {number} SRC_OUT
     * @property {number} SRC_ATOP
     * @property {number} DST_OVER
     * @property {number} DST_IN
     * @property {number} DST_OUT
     * @property {number} DST_ATOP
     * @property {number} SUBTRACT
     * @property {number} SRC_OVER
     * @property {number} ERASE
     * @property {number} XOR
     */
    var BLEND_MODES;
    (function (BLEND_MODES) {
        BLEND_MODES[BLEND_MODES["NORMAL"] = 0] = "NORMAL";
        BLEND_MODES[BLEND_MODES["ADD"] = 1] = "ADD";
        BLEND_MODES[BLEND_MODES["MULTIPLY"] = 2] = "MULTIPLY";
        BLEND_MODES[BLEND_MODES["SCREEN"] = 3] = "SCREEN";
        BLEND_MODES[BLEND_MODES["OVERLAY"] = 4] = "OVERLAY";
        BLEND_MODES[BLEND_MODES["DARKEN"] = 5] = "DARKEN";
        BLEND_MODES[BLEND_MODES["LIGHTEN"] = 6] = "LIGHTEN";
        BLEND_MODES[BLEND_MODES["COLOR_DODGE"] = 7] = "COLOR_DODGE";
        BLEND_MODES[BLEND_MODES["COLOR_BURN"] = 8] = "COLOR_BURN";
        BLEND_MODES[BLEND_MODES["HARD_LIGHT"] = 9] = "HARD_LIGHT";
        BLEND_MODES[BLEND_MODES["SOFT_LIGHT"] = 10] = "SOFT_LIGHT";
        BLEND_MODES[BLEND_MODES["DIFFERENCE"] = 11] = "DIFFERENCE";
        BLEND_MODES[BLEND_MODES["EXCLUSION"] = 12] = "EXCLUSION";
        BLEND_MODES[BLEND_MODES["HUE"] = 13] = "HUE";
        BLEND_MODES[BLEND_MODES["SATURATION"] = 14] = "SATURATION";
        BLEND_MODES[BLEND_MODES["COLOR"] = 15] = "COLOR";
        BLEND_MODES[BLEND_MODES["LUMINOSITY"] = 16] = "LUMINOSITY";
        BLEND_MODES[BLEND_MODES["NORMAL_NPM"] = 17] = "NORMAL_NPM";
        BLEND_MODES[BLEND_MODES["ADD_NPM"] = 18] = "ADD_NPM";
        BLEND_MODES[BLEND_MODES["SCREEN_NPM"] = 19] = "SCREEN_NPM";
        BLEND_MODES[BLEND_MODES["NONE"] = 20] = "NONE";
        BLEND_MODES[BLEND_MODES["SRC_OVER"] = 0] = "SRC_OVER";
        BLEND_MODES[BLEND_MODES["SRC_IN"] = 21] = "SRC_IN";
        BLEND_MODES[BLEND_MODES["SRC_OUT"] = 22] = "SRC_OUT";
        BLEND_MODES[BLEND_MODES["SRC_ATOP"] = 23] = "SRC_ATOP";
        BLEND_MODES[BLEND_MODES["DST_OVER"] = 24] = "DST_OVER";
        BLEND_MODES[BLEND_MODES["DST_IN"] = 25] = "DST_IN";
        BLEND_MODES[BLEND_MODES["DST_OUT"] = 26] = "DST_OUT";
        BLEND_MODES[BLEND_MODES["DST_ATOP"] = 27] = "DST_ATOP";
        BLEND_MODES[BLEND_MODES["ERASE"] = 26] = "ERASE";
        BLEND_MODES[BLEND_MODES["SUBTRACT"] = 28] = "SUBTRACT";
        BLEND_MODES[BLEND_MODES["XOR"] = 29] = "XOR";
    })(BLEND_MODES || (BLEND_MODES = {}));
    /**
     * Various webgl draw modes. These can be used to specify which GL drawMode to use
     * under certain situations and renderers.
     *
     * @memberof PIXI
     * @static
     * @name DRAW_MODES
     * @enum {number}
     * @property {number} POINTS
     * @property {number} LINES
     * @property {number} LINE_LOOP
     * @property {number} LINE_STRIP
     * @property {number} TRIANGLES
     * @property {number} TRIANGLE_STRIP
     * @property {number} TRIANGLE_FAN
     */
    var DRAW_MODES;
    (function (DRAW_MODES) {
        DRAW_MODES[DRAW_MODES["POINTS"] = 0] = "POINTS";
        DRAW_MODES[DRAW_MODES["LINES"] = 1] = "LINES";
        DRAW_MODES[DRAW_MODES["LINE_LOOP"] = 2] = "LINE_LOOP";
        DRAW_MODES[DRAW_MODES["LINE_STRIP"] = 3] = "LINE_STRIP";
        DRAW_MODES[DRAW_MODES["TRIANGLES"] = 4] = "TRIANGLES";
        DRAW_MODES[DRAW_MODES["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
        DRAW_MODES[DRAW_MODES["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
    })(DRAW_MODES || (DRAW_MODES = {}));
    /**
     * Various GL texture/resources formats.
     *
     * @memberof PIXI
     * @static
     * @name FORMATS
     * @enum {number}
     * @property {number} RGBA=6408
     * @property {number} RGB=6407
     * @property {number} RED=6403
     * @property {number} ALPHA=6406
     * @property {number} LUMINANCE=6409
     * @property {number} LUMINANCE_ALPHA=6410
     * @property {number} DEPTH_COMPONENT=6402
     * @property {number} DEPTH_STENCIL=34041
     */
    var FORMATS;
    (function (FORMATS) {
        FORMATS[FORMATS["RGBA"] = 6408] = "RGBA";
        FORMATS[FORMATS["RGB"] = 6407] = "RGB";
        FORMATS[FORMATS["ALPHA"] = 6406] = "ALPHA";
        FORMATS[FORMATS["LUMINANCE"] = 6409] = "LUMINANCE";
        FORMATS[FORMATS["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
        FORMATS[FORMATS["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
        FORMATS[FORMATS["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
    })(FORMATS || (FORMATS = {}));
    /**
     * Various GL target types.
     *
     * @memberof PIXI
     * @static
     * @name TARGETS
     * @enum {number}
     * @property {number} TEXTURE_2D=3553
     * @property {number} TEXTURE_CUBE_MAP=34067
     * @property {number} TEXTURE_2D_ARRAY=35866
     * @property {number} TEXTURE_CUBE_MAP_POSITIVE_X=34069
     * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_X=34070
     * @property {number} TEXTURE_CUBE_MAP_POSITIVE_Y=34071
     * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_Y=34072
     * @property {number} TEXTURE_CUBE_MAP_POSITIVE_Z=34073
     * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_Z=34074
     */
    var TARGETS;
    (function (TARGETS) {
        TARGETS[TARGETS["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
        TARGETS[TARGETS["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
        TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
    })(TARGETS || (TARGETS = {}));
    /**
     * Various GL data format types.
     *
     * @memberof PIXI
     * @static
     * @name TYPES
     * @enum {number}
     * @property {number} UNSIGNED_BYTE=5121
     * @property {number} UNSIGNED_SHORT=5123
     * @property {number} UNSIGNED_SHORT_5_6_5=33635
     * @property {number} UNSIGNED_SHORT_4_4_4_4=32819
     * @property {number} UNSIGNED_SHORT_5_5_5_1=32820
     * @property {number} FLOAT=5126
     * @property {number} HALF_FLOAT=36193
     */
    var TYPES;
    (function (TYPES) {
        TYPES[TYPES["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
        TYPES[TYPES["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
        TYPES[TYPES["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
        TYPES[TYPES["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
        TYPES[TYPES["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
        TYPES[TYPES["FLOAT"] = 5126] = "FLOAT";
        TYPES[TYPES["HALF_FLOAT"] = 36193] = "HALF_FLOAT";
    })(TYPES || (TYPES = {}));
    /**
     * Various sampler types. Correspond to `sampler`, `isampler`, `usampler` GLSL types respectively.
     * WebGL1 works only with FLOAT.
     *
     * @memberof PIXI
     * @static
     * @name SAMPLER_TYPES
     * @enum {number}
     * @property {number} FLOAT=0
     * @property {number} INT=1
     * @property {number} UINT=2
     */
    var SAMPLER_TYPES;
    (function (SAMPLER_TYPES) {
        SAMPLER_TYPES[SAMPLER_TYPES["FLOAT"] = 0] = "FLOAT";
        SAMPLER_TYPES[SAMPLER_TYPES["INT"] = 1] = "INT";
        SAMPLER_TYPES[SAMPLER_TYPES["UINT"] = 2] = "UINT";
    })(SAMPLER_TYPES || (SAMPLER_TYPES = {}));
    /**
     * The scale modes that are supported by pixi.
     *
     * The {@link PIXI.settings.SCALE_MODE} scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @memberof PIXI
     * @static
     * @name SCALE_MODES
     * @enum {number}
     * @property {number} LINEAR Smooth scaling
     * @property {number} NEAREST Pixelating scaling
     */
    var SCALE_MODES;
    (function (SCALE_MODES) {
        SCALE_MODES[SCALE_MODES["NEAREST"] = 0] = "NEAREST";
        SCALE_MODES[SCALE_MODES["LINEAR"] = 1] = "LINEAR";
    })(SCALE_MODES || (SCALE_MODES = {}));
    /**
     * The wrap modes that are supported by pixi.
     *
     * The {@link PIXI.settings.WRAP_MODE} wrap mode affects the default wrapping mode of future operations.
     * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
     * If the texture is non power of two then clamp will be used regardless as WebGL can
     * only use REPEAT if the texture is po2.
     *
     * This property only affects WebGL.
     *
     * @name WRAP_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} CLAMP - The textures uvs are clamped
     * @property {number} REPEAT - The texture uvs tile and repeat
     * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
     */
    var WRAP_MODES;
    (function (WRAP_MODES) {
        WRAP_MODES[WRAP_MODES["CLAMP"] = 33071] = "CLAMP";
        WRAP_MODES[WRAP_MODES["REPEAT"] = 10497] = "REPEAT";
        WRAP_MODES[WRAP_MODES["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
    })(WRAP_MODES || (WRAP_MODES = {}));
    /**
     * Mipmap filtering modes that are supported by pixi.
     *
     * The {@link PIXI.settings.MIPMAP_TEXTURES} affects default texture filtering.
     * Mipmaps are generated for a baseTexture if its `mipmap` field is `ON`,
     * or its `POW2` and texture dimensions are powers of 2.
     * Due to platform restriction, `ON` option will work like `POW2` for webgl-1.
     *
     * This property only affects WebGL.
     *
     * @name MIPMAP_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} OFF - No mipmaps
     * @property {number} POW2 - Generate mipmaps if texture dimensions are pow2
     * @property {number} ON - Always generate mipmaps
     * @property {number} ON_MANUAL - Use mipmaps, but do not auto-generate them; this is used with a resource
     *   that supports buffering each level-of-detail.
     */
    var MIPMAP_MODES;
    (function (MIPMAP_MODES) {
        MIPMAP_MODES[MIPMAP_MODES["OFF"] = 0] = "OFF";
        MIPMAP_MODES[MIPMAP_MODES["POW2"] = 1] = "POW2";
        MIPMAP_MODES[MIPMAP_MODES["ON"] = 2] = "ON";
        MIPMAP_MODES[MIPMAP_MODES["ON_MANUAL"] = 3] = "ON_MANUAL";
    })(MIPMAP_MODES || (MIPMAP_MODES = {}));
    /**
     * How to treat textures with premultiplied alpha
     *
     * @name ALPHA_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} NO_PREMULTIPLIED_ALPHA - Source is not premultiplied, leave it like that.
     *  Option for compressed and data textures that are created from typed arrays.
     * @property {number} PREMULTIPLY_ON_UPLOAD - Source is not premultiplied, premultiply on upload.
     *  Default option, used for all loaded images.
     * @property {number} PREMULTIPLIED_ALPHA - Source is already premultiplied
     *  Example: spine atlases with `_pma` suffix.
     * @property {number} NPM - Alias for NO_PREMULTIPLIED_ALPHA.
     * @property {number} UNPACK - Default option, alias for PREMULTIPLY_ON_UPLOAD.
     * @property {number} PMA - Alias for PREMULTIPLIED_ALPHA.
     */
    var ALPHA_MODES;
    (function (ALPHA_MODES) {
        ALPHA_MODES[ALPHA_MODES["NPM"] = 0] = "NPM";
        ALPHA_MODES[ALPHA_MODES["UNPACK"] = 1] = "UNPACK";
        ALPHA_MODES[ALPHA_MODES["PMA"] = 2] = "PMA";
        ALPHA_MODES[ALPHA_MODES["NO_PREMULTIPLIED_ALPHA"] = 0] = "NO_PREMULTIPLIED_ALPHA";
        ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ON_UPLOAD"] = 1] = "PREMULTIPLY_ON_UPLOAD";
        ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ALPHA"] = 2] = "PREMULTIPLY_ALPHA";
    })(ALPHA_MODES || (ALPHA_MODES = {}));
    /**
     * Configure whether filter textures are cleared after binding.
     *
     * Filter textures need not be cleared if the filter does not use pixel blending. {@link CLEAR_MODES.BLIT} will detect
     * this and skip clearing as an optimization.
     *
     * @name CLEAR_MODES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} BLEND - Do not clear the filter texture. The filter's output will blend on top of the output texture.
     * @property {number} CLEAR - Always clear the filter texture.
     * @property {number} BLIT - Clear only if {@link FilterSystem.forceClear} is set or if the filter uses pixel blending.
     * @property {number} NO - Alias for BLEND, same as `false` in earlier versions
     * @property {number} YES - Alias for CLEAR, same as `true` in earlier versions
     * @property {number} AUTO - Alias for BLIT
     */
    var CLEAR_MODES;
    (function (CLEAR_MODES) {
        CLEAR_MODES[CLEAR_MODES["NO"] = 0] = "NO";
        CLEAR_MODES[CLEAR_MODES["YES"] = 1] = "YES";
        CLEAR_MODES[CLEAR_MODES["AUTO"] = 2] = "AUTO";
        CLEAR_MODES[CLEAR_MODES["BLEND"] = 0] = "BLEND";
        CLEAR_MODES[CLEAR_MODES["CLEAR"] = 1] = "CLEAR";
        CLEAR_MODES[CLEAR_MODES["BLIT"] = 2] = "BLIT";
    })(CLEAR_MODES || (CLEAR_MODES = {}));
    /**
     * The gc modes that are supported by pixi.
     *
     * The {@link PIXI.settings.GC_MODE} Garbage Collection mode for PixiJS textures is AUTO
     * If set to GC_MODE, the renderer will occasionally check textures usage. If they are not
     * used for a specified period of time they will be removed from the GPU. They will of course
     * be uploaded again when they are required. This is a silent behind the scenes process that
     * should ensure that the GPU does not  get filled up.
     *
     * Handy for mobile devices!
     * This property only affects WebGL.
     *
     * @name GC_MODES
     * @enum {number}
     * @static
     * @memberof PIXI
     * @property {number} AUTO - Garbage collection will happen periodically automatically
     * @property {number} MANUAL - Garbage collection will need to be called manually
     */
    var GC_MODES;
    (function (GC_MODES) {
        GC_MODES[GC_MODES["AUTO"] = 0] = "AUTO";
        GC_MODES[GC_MODES["MANUAL"] = 1] = "MANUAL";
    })(GC_MODES || (GC_MODES = {}));
    /**
     * Constants that specify float precision in shaders.
     *
     * @name PRECISION
     * @memberof PIXI
     * @constant
     * @static
     * @enum {string}
     * @property {string} LOW='lowp'
     * @property {string} MEDIUM='mediump'
     * @property {string} HIGH='highp'
     */
    var PRECISION;
    (function (PRECISION) {
        PRECISION["LOW"] = "lowp";
        PRECISION["MEDIUM"] = "mediump";
        PRECISION["HIGH"] = "highp";
    })(PRECISION || (PRECISION = {}));
    /**
     * Constants for mask implementations.
     * We use `type` suffix because it leads to very different behaviours
     *
     * @name MASK_TYPES
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} NONE - Mask is ignored
     * @property {number} SCISSOR - Scissor mask, rectangle on screen, cheap
     * @property {number} STENCIL - Stencil mask, 1-bit, medium, works only if renderer supports stencil
     * @property {number} SPRITE - Mask that uses SpriteMaskFilter, uses temporary RenderTexture
     */
    var MASK_TYPES;
    (function (MASK_TYPES) {
        MASK_TYPES[MASK_TYPES["NONE"] = 0] = "NONE";
        MASK_TYPES[MASK_TYPES["SCISSOR"] = 1] = "SCISSOR";
        MASK_TYPES[MASK_TYPES["STENCIL"] = 2] = "STENCIL";
        MASK_TYPES[MASK_TYPES["SPRITE"] = 3] = "SPRITE";
    })(MASK_TYPES || (MASK_TYPES = {}));
    /**
     * Constants for multi-sampling antialiasing.
     *
     * @see PIXI.Framebuffer#multisample
     *
     * @name MSAA_QUALITY
     * @memberof PIXI
     * @static
     * @enum {number}
     * @property {number} NONE - No multisampling for this renderTexture
     * @property {number} LOW - Try 2 samples
     * @property {number} MEDIUM - Try 4 samples
     * @property {number} HIGH - Try 8 samples
     */
    var MSAA_QUALITY;
    (function (MSAA_QUALITY) {
        MSAA_QUALITY[MSAA_QUALITY["NONE"] = 0] = "NONE";
        MSAA_QUALITY[MSAA_QUALITY["LOW"] = 2] = "LOW";
        MSAA_QUALITY[MSAA_QUALITY["MEDIUM"] = 4] = "MEDIUM";
        MSAA_QUALITY[MSAA_QUALITY["HIGH"] = 8] = "HIGH";
    })(MSAA_QUALITY || (MSAA_QUALITY = {}));

    /**
     * User's customizable globals for overriding the default PIXI settings, such
     * as a renderer's default resolution, framerate, float precision, etc.
     * @example
     * // Use the native window resolution as the default resolution
     * // will support high-density displays when rendering
     * PIXI.settings.RESOLUTION = window.devicePixelRatio;
     *
     * // Disable interpolation when scaling, will make texture be pixelated
     * PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
     * @namespace PIXI.settings
     */
    var settings = {
        /**
         * If set to true WebGL will attempt make textures mimpaped by default.
         * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
         *
         * @static
         * @name MIPMAP_TEXTURES
         * @memberof PIXI.settings
         * @type {PIXI.MIPMAP_MODES}
         * @default PIXI.MIPMAP_MODES.POW2
         */
        MIPMAP_TEXTURES: MIPMAP_MODES.POW2,
        /**
         * Default anisotropic filtering level of textures.
         * Usually from 0 to 16
         *
         * @static
         * @name ANISOTROPIC_LEVEL
         * @memberof PIXI.settings
         * @type {number}
         * @default 0
         */
        ANISOTROPIC_LEVEL: 0,
        /**
         * Default resolution / device pixel ratio of the renderer.
         *
         * @static
         * @name RESOLUTION
         * @memberof PIXI.settings
         * @type {number}
         * @default 1
         */
        RESOLUTION: 1,
        /**
         * Default filter resolution.
         *
         * @static
         * @name FILTER_RESOLUTION
         * @memberof PIXI.settings
         * @type {number}
         * @default 1
         */
        FILTER_RESOLUTION: 1,
        /**
         * The maximum textures that this device supports.
         *
         * @static
         * @name SPRITE_MAX_TEXTURES
         * @memberof PIXI.settings
         * @type {number}
         * @default 32
         */
        SPRITE_MAX_TEXTURES: maxRecommendedTextures(32),
        // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
        // TODO: maybe add PARTICLE.BATCH_SIZE: 15000
        /**
         * The default sprite batch size.
         *
         * The default aims to balance desktop and mobile devices.
         *
         * @static
         * @name SPRITE_BATCH_SIZE
         * @memberof PIXI.settings
         * @type {number}
         * @default 4096
         */
        SPRITE_BATCH_SIZE: 4096,
        /**
         * The default render options if none are supplied to {@link PIXI.Renderer}
         * or {@link PIXI.CanvasRenderer}.
         *
         * @static
         * @name RENDER_OPTIONS
         * @memberof PIXI.settings
         * @type {object}
         * @property {HTMLCanvasElement} view=null
         * @property {boolean} antialias=false
         * @property {boolean} autoDensity=false
         * @property {boolean} useContextAlpha=true
         * @property {number} backgroundColor=0x000000
         * @property {number} backgroundAlpha=1
         * @property {boolean} clearBeforeRender=true
         * @property {boolean} preserveDrawingBuffer=false
         * @property {number} width=800
         * @property {number} height=600
         * @property {boolean} legacy=false
         */
        RENDER_OPTIONS: {
            view: null,
            antialias: false,
            autoDensity: false,
            backgroundColor: 0x000000,
            backgroundAlpha: 1,
            useContextAlpha: true,
            clearBeforeRender: true,
            preserveDrawingBuffer: false,
            width: 800,
            height: 600,
            legacy: false,
        },
        /**
         * Default Garbage Collection mode.
         *
         * @static
         * @name GC_MODE
         * @memberof PIXI.settings
         * @type {PIXI.GC_MODES}
         * @default PIXI.GC_MODES.AUTO
         */
        GC_MODE: GC_MODES.AUTO,
        /**
         * Default Garbage Collection max idle.
         *
         * @static
         * @name GC_MAX_IDLE
         * @memberof PIXI.settings
         * @type {number}
         * @default 3600
         */
        GC_MAX_IDLE: 60 * 60,
        /**
         * Default Garbage Collection maximum check count.
         *
         * @static
         * @name GC_MAX_CHECK_COUNT
         * @memberof PIXI.settings
         * @type {number}
         * @default 600
         */
        GC_MAX_CHECK_COUNT: 60 * 10,
        /**
         * Default wrap modes that are supported by pixi.
         *
         * @static
         * @name WRAP_MODE
         * @memberof PIXI.settings
         * @type {PIXI.WRAP_MODES}
         * @default PIXI.WRAP_MODES.CLAMP
         */
        WRAP_MODE: WRAP_MODES.CLAMP,
        /**
         * Default scale mode for textures.
         *
         * @static
         * @name SCALE_MODE
         * @memberof PIXI.settings
         * @type {PIXI.SCALE_MODES}
         * @default PIXI.SCALE_MODES.LINEAR
         */
        SCALE_MODE: SCALE_MODES.LINEAR,
        /**
         * Default specify float precision in vertex shader.
         *
         * @static
         * @name PRECISION_VERTEX
         * @memberof PIXI.settings
         * @type {PIXI.PRECISION}
         * @default PIXI.PRECISION.HIGH
         */
        PRECISION_VERTEX: PRECISION.HIGH,
        /**
         * Default specify float precision in fragment shader.
         * iOS is best set at highp due to https://github.com/pixijs/pixi.js/issues/3742
         *
         * @static
         * @name PRECISION_FRAGMENT
         * @memberof PIXI.settings
         * @type {PIXI.PRECISION}
         * @default PIXI.PRECISION.MEDIUM
         */
        PRECISION_FRAGMENT: isMobile.apple.device ? PRECISION.HIGH : PRECISION.MEDIUM,
        /**
         * Can we upload the same buffer in a single frame?
         *
         * @static
         * @name CAN_UPLOAD_SAME_BUFFER
         * @memberof PIXI.settings
         * @type {boolean}
         */
        CAN_UPLOAD_SAME_BUFFER: canUploadSameBuffer(),
        /**
         * Enables bitmap creation before image load. This feature is experimental.
         *
         * @static
         * @name CREATE_IMAGE_BITMAP
         * @memberof PIXI.settings
         * @type {boolean}
         * @default false
         */
        CREATE_IMAGE_BITMAP: false,
        /**
         * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Advantages can include sharper image quality (like text) and faster rendering on canvas.
         * The main disadvantage is movement of objects may appear less smooth.
         *
         * @static
         * @constant
         * @memberof PIXI.settings
         * @type {boolean}
         * @default false
         */
        ROUND_PIXELS: false,
    };

    /*!
     * @pixi/sprite - v6.0.4
     * Compiled Tue, 11 May 2021 18:00:23 UTC
     *
     * @pixi/sprite is licensed under the MIT License.
     * http://www.opensource.org/licenses/mit-license
     */

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var tempPoint = new math.Point();
    var indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    /**
     * The Sprite object is the base for all textured objects that are rendered to the screen
    *
     * A sprite can be created directly from an image like this:
     *
     * ```js
     * let sprite = PIXI.Sprite.from('assets/image.png');
     * ```
     *
     * The more efficient way to create sprites is using a {@link PIXI.Spritesheet},
     * as swapping base textures when rendering to the screen is inefficient.
     *
     * ```js
     * PIXI.Loader.shared.add("assets/spritesheet.json").load(setup);
     *
     * function setup() {
     *   let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
     *   let sprite = new PIXI.Sprite(sheet.textures["image.png"]);
     *   ...
     * }
     * ```
     *
     * @class
     * @extends PIXI.Container
     * @memberof PIXI
     */
    var Sprite = /** @class */ (function (_super) {
        __extends(Sprite, _super);
        /**
         * @param {PIXI.Texture} [texture] - The texture for this sprite.
         */
        function Sprite(texture) {
            var _this = _super.call(this) || this;
            /**
             * The anchor point defines the normalized coordinates
             * in the texture that map to the position of this
             * sprite.
             *
             * By default, this is `(0,0)` (or `texture.defaultAnchor`
             * if you have modified that), which means the position
             * `(x,y)` of this `Sprite` will be the top-left corner.
             *
             * Note: Updating `texture.defaultAnchor` after
             * constructing a `Sprite` does _not_ update its anchor.
             *
             * {@link https://docs.cocos2d-x.org/cocos2d-x/en/sprites/manipulation.html}
             *
             * @default `texture.defaultAnchor`
             * @member {PIXI.ObservablePoint}
             * @private
             */
            _this._anchor = new math.ObservablePoint(_this._onAnchorUpdate, _this, (texture ? texture.defaultAnchor.x : 0), (texture ? texture.defaultAnchor.y : 0));
            /**
             * The texture that the sprite is using
             *
             * @private
             * @member {PIXI.Texture}
             */
            _this._texture = null;
            /**
             * The width of the sprite (this is initially set by the texture)
             *
             * @protected
             * @member {number}
             */
            _this._width = 0;
            /**
             * The height of the sprite (this is initially set by the texture)
             *
             * @protected
             * @member {number}
             */
            _this._height = 0;
            /**
             * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
             *
             * @private
             * @member {number}
             * @default 0xFFFFFF
             */
            _this._tint = null;
            /**
             * The tint applied to the sprite. This is a RGB value. A value of 0xFFFFFF will remove any tint effect.
             *
             * @private
             * @member {number}
             * @default 16777215
             */
            _this._tintRGB = null;
            _this.tint = 0xFFFFFF;
            /**
             * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
             *
             * @member {number}
             * @default PIXI.BLEND_MODES.NORMAL
             * @see PIXI.BLEND_MODES
             */
            _this.blendMode = constants.BLEND_MODES.NORMAL;
            /**
             * Cached tint value so we can tell when the tint is changed.
             * Value is used for 2d CanvasRenderer.
             *
             * @protected
             * @member {number}
             * @default 0xFFFFFF
             */
            _this._cachedTint = 0xFFFFFF;
            /**
             * this is used to store the uvs data of the sprite, assigned at the same time
             * as the vertexData in calculateVertices()
             *
             * @private
             * @member {Float32Array}
             */
            _this.uvs = null;
            // call texture setter
            _this.texture = texture || core.Texture.EMPTY;
            /**
             * this is used to store the vertex data of the sprite (basically a quad)
             *
             * @private
             * @member {Float32Array}
             */
            _this.vertexData = new Float32Array(8);
            /**
             * This is used to calculate the bounds of the object IF it is a trimmed sprite
             *
             * @private
             * @member {Float32Array}
             */
            _this.vertexTrimmedData = null;
            _this._transformID = -1;
            _this._textureID = -1;
            _this._transformTrimmedID = -1;
            _this._textureTrimmedID = -1;
            // Batchable stuff..
            // TODO could make this a mixin?
            _this.indices = indices;
            /**
             * Plugin that is responsible for rendering this element.
             * Allows to customize the rendering process without overriding '_render' & '_renderCanvas' methods.
             *
             * @member {string}
             * @default 'batch'
             */
            _this.pluginName = 'batch';
            /**
             * used to fast check if a sprite is.. a sprite!
             * @member {boolean}
             */
            _this.isSprite = true;
            /**
             * Internal roundPixels field
             *
             * @member {boolean}
             * @private
             */
            _this._roundPixels = settings.ROUND_PIXELS;
            return _this;
        }
        /**
         * When the texture is updated, this event will fire to update the scale and frame
         *
         * @protected
         */
        Sprite.prototype._onTextureUpdate = function () {
            this._textureID = -1;
            this._textureTrimmedID = -1;
            this._cachedTint = 0xFFFFFF;
            // so if _width is 0 then width was not set..
            if (this._width) {
                this.scale.x = utils.sign(this.scale.x) * this._width / this._texture.orig.width;
            }
            if (this._height) {
                this.scale.y = utils.sign(this.scale.y) * this._height / this._texture.orig.height;
            }
        };
        /**
         * Called when the anchor position updates.
         *
         * @private
         */
        Sprite.prototype._onAnchorUpdate = function () {
            this._transformID = -1;
            this._transformTrimmedID = -1;
        };
        /**
         * calculates worldTransform * vertices, store it in vertexData
         */
        Sprite.prototype.calculateVertices = function () {
            var texture = this._texture;
            if (this._transformID === this.transform._worldID && this._textureID === texture._updateID) {
                return;
            }
            // update texture UV here, because base texture can be changed without calling `_onTextureUpdate`
            if (this._textureID !== texture._updateID) {
                this.uvs = this._texture._uvs.uvsFloat32;
            }
            this._transformID = this.transform._worldID;
            this._textureID = texture._updateID;
            // set the vertex data
            var wt = this.transform.worldTransform;
            var a = wt.a;
            var b = wt.b;
            var c = wt.c;
            var d = wt.d;
            var tx = wt.tx;
            var ty = wt.ty;
            var vertexData = this.vertexData;
            var trim = texture.trim;
            var orig = texture.orig;
            var anchor = this._anchor;
            var w0 = 0;
            var w1 = 0;
            var h0 = 0;
            var h1 = 0;
            if (trim) {
                // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
                // space before transforming the sprite coords.
                w1 = trim.x - (anchor._x * orig.width);
                w0 = w1 + trim.width;
                h1 = trim.y - (anchor._y * orig.height);
                h0 = h1 + trim.height;
            }
            else {
                w1 = -anchor._x * orig.width;
                w0 = w1 + orig.width;
                h1 = -anchor._y * orig.height;
                h0 = h1 + orig.height;
            }
            // xy
            vertexData[0] = (a * w1) + (c * h1) + tx;
            vertexData[1] = (d * h1) + (b * w1) + ty;
            // xy
            vertexData[2] = (a * w0) + (c * h1) + tx;
            vertexData[3] = (d * h1) + (b * w0) + ty;
            // xy
            vertexData[4] = (a * w0) + (c * h0) + tx;
            vertexData[5] = (d * h0) + (b * w0) + ty;
            // xy
            vertexData[6] = (a * w1) + (c * h0) + tx;
            vertexData[7] = (d * h0) + (b * w1) + ty;
            if (this._roundPixels) {
                var resolution = settings.RESOLUTION;
                for (var i = 0; i < vertexData.length; ++i) {
                    vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
                }
            }
        };
        /**
         * calculates worldTransform * vertices for a non texture with a trim. store it in vertexTrimmedData
         * This is used to ensure that the true width and height of a trimmed texture is respected
         */
        Sprite.prototype.calculateTrimmedVertices = function () {
            if (!this.vertexTrimmedData) {
                this.vertexTrimmedData = new Float32Array(8);
            }
            else if (this._transformTrimmedID === this.transform._worldID && this._textureTrimmedID === this._texture._updateID) {
                return;
            }
            this._transformTrimmedID = this.transform._worldID;
            this._textureTrimmedID = this._texture._updateID;
            // lets do some special trim code!
            var texture = this._texture;
            var vertexData = this.vertexTrimmedData;
            var orig = texture.orig;
            var anchor = this._anchor;
            // lets calculate the new untrimmed bounds..
            var wt = this.transform.worldTransform;
            var a = wt.a;
            var b = wt.b;
            var c = wt.c;
            var d = wt.d;
            var tx = wt.tx;
            var ty = wt.ty;
            var w1 = -anchor._x * orig.width;
            var w0 = w1 + orig.width;
            var h1 = -anchor._y * orig.height;
            var h0 = h1 + orig.height;
            // xy
            vertexData[0] = (a * w1) + (c * h1) + tx;
            vertexData[1] = (d * h1) + (b * w1) + ty;
            // xy
            vertexData[2] = (a * w0) + (c * h1) + tx;
            vertexData[3] = (d * h1) + (b * w0) + ty;
            // xy
            vertexData[4] = (a * w0) + (c * h0) + tx;
            vertexData[5] = (d * h0) + (b * w0) + ty;
            // xy
            vertexData[6] = (a * w1) + (c * h0) + tx;
            vertexData[7] = (d * h0) + (b * w1) + ty;
        };
        /**
        *
        * Renders the object using the WebGL renderer
        *
        * @protected
        * @param {PIXI.Renderer} renderer - The webgl renderer to use.
        */
        Sprite.prototype._render = function (renderer) {
            this.calculateVertices();
            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);
        };
        /**
         * Updates the bounds of the sprite.
         *
         * @protected
         */
        Sprite.prototype._calculateBounds = function () {
            var trim = this._texture.trim;
            var orig = this._texture.orig;
            // First lets check to see if the current texture has a trim..
            if (!trim || (trim.width === orig.width && trim.height === orig.height)) {
                // no trim! lets use the usual calculations..
                this.calculateVertices();
                this._bounds.addQuad(this.vertexData);
            }
            else {
                // lets calculate a special trimmed bounds...
                this.calculateTrimmedVertices();
                this._bounds.addQuad(this.vertexTrimmedData);
            }
        };
        /**
         * Gets the local bounds of the sprite object.
         *
         * @param {PIXI.Rectangle} [rect] - Optional output rectangle.
         * @return {PIXI.Rectangle} The bounds.
         */
        Sprite.prototype.getLocalBounds = function (rect) {
            // we can do a fast local bounds if the sprite has no children!
            if (this.children.length === 0) {
                this._bounds.minX = this._texture.orig.width * -this._anchor._x;
                this._bounds.minY = this._texture.orig.height * -this._anchor._y;
                this._bounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
                this._bounds.maxY = this._texture.orig.height * (1 - this._anchor._y);
                if (!rect) {
                    if (!this._localBoundsRect) {
                        this._localBoundsRect = new math.Rectangle();
                    }
                    rect = this._localBoundsRect;
                }
                return this._bounds.getRectangle(rect);
            }
            return _super.prototype.getLocalBounds.call(this, rect);
        };
        /**
         * Tests if a point is inside this sprite
         *
         * @param {PIXI.IPointData} point - the point to test
         * @return {boolean} the result of the test
         */
        Sprite.prototype.containsPoint = function (point) {
            this.worldTransform.applyInverse(point, tempPoint);
            var width = this._texture.orig.width;
            var height = this._texture.orig.height;
            var x1 = -width * this.anchor.x;
            var y1 = 0;
            if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
                y1 = -height * this.anchor.y;
                if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Destroys this sprite and optionally its texture and children
         *
         * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
         *  have been set to that value
         * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
         *      method called as well. 'options' will be passed on to those calls.
         * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
         * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
         */
        Sprite.prototype.destroy = function (options) {
            _super.prototype.destroy.call(this, options);
            this._texture.off('update', this._onTextureUpdate, this);
            this._anchor = null;
            var destroyTexture = typeof options === 'boolean' ? options : options && options.texture;
            if (destroyTexture) {
                var destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;
                this._texture.destroy(!!destroyBaseTexture);
            }
            this._texture = null;
        };
        // some helper functions..
        /**
         * Helper function that creates a new sprite based on the source you provide.
         * The source can be - frame id, image url, video url, canvas element, video element, base texture
         *
         * @static
         * @param {string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Source to create texture from
         * @param {object} [options] - See {@link PIXI.BaseTexture}'s constructor for options.
         * @return {PIXI.Sprite} The newly created sprite
         */
        Sprite.from = function (source, options) {
            var texture = (source instanceof core.Texture)
                ? source
                : core.Texture.from(source, options);
            return new Sprite(texture);
        };
        Object.defineProperty(Sprite.prototype, "roundPixels", {
            get: function () {
                return this._roundPixels;
            },
            /**
             * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
             * Advantages can include sharper image quality (like text) and faster rendering on canvas.
             * The main disadvantage is movement of objects may appear less smooth.
             * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
             *
             * @member {boolean}
             * @default false
             */
            set: function (value) {
                if (this._roundPixels !== value) {
                    this._transformID = -1;
                }
                this._roundPixels = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "width", {
            /**
             * The width of the sprite, setting this will actually modify the scale to achieve the value set
             *
             * @member {number}
             */
            get: function () {
                return Math.abs(this.scale.x) * this._texture.orig.width;
            },
            set: function (value) {
                var s = utils.sign(this.scale.x) || 1;
                this.scale.x = s * value / this._texture.orig.width;
                this._width = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "height", {
            /**
             * The height of the sprite, setting this will actually modify the scale to achieve the value set
             *
             * @member {number}
             */
            get: function () {
                return Math.abs(this.scale.y) * this._texture.orig.height;
            },
            set: function (value) {
                var s = utils.sign(this.scale.y) || 1;
                this.scale.y = s * value / this._texture.orig.height;
                this._height = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "anchor", {
            /**
             * The anchor sets the origin point of the sprite. The default value is taken from the {@link PIXI.Texture|Texture}
             * and passed to the constructor.
             *
             * The default is `(0,0)`, this means the sprite's origin is the top left.
             *
             * Setting the anchor to `(0.5,0.5)` means the sprite's origin is centered.
             *
             * Setting the anchor to `(1,1)` would mean the sprite's origin point will be the bottom right corner.
             *
             * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
             *
             * @example
             * const sprite = new PIXI.Sprite(texture);
             * sprite.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
             *
             * @member {PIXI.ObservablePoint}
             */
            get: function () {
                return this._anchor;
            },
            set: function (value) {
                this._anchor.copyFrom(value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "tint", {
            /**
             * The tint applied to the sprite. This is a hex value.
             * A value of 0xFFFFFF will remove any tint effect.
             *
             * @member {number}
             * @default 0xFFFFFF
             */
            get: function () {
                return this._tint;
            },
            set: function (value) {
                this._tint = value;
                this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "texture", {
            /**
             * The texture that the sprite is using
             *
             * @member {PIXI.Texture}
             */
            get: function () {
                return this._texture;
            },
            set: function (value) {
                if (this._texture === value) {
                    return;
                }
                if (this._texture) {
                    this._texture.off('update', this._onTextureUpdate, this);
                }
                this._texture = value || core.Texture.EMPTY;
                this._cachedTint = 0xFFFFFF;
                this._textureID = -1;
                this._textureTrimmedID = -1;
                if (value) {
                    // wait for the texture to load
                    if (value.baseTexture.valid) {
                        this._onTextureUpdate();
                    }
                    else {
                        value.once('update', this._onTextureUpdate, this);
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        return Sprite;
    }(display.Container));

    const tempMat = new math.Matrix();

    const defIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    class SpriteH extends Sprite  {
        __init() {this.color = new ColorTransform();}
        __init2() {this.maskSprite = null;}
        __init3() {this.maskVertexData = null;}
        __init4() {this.uvs = null;}
        __init5() {this.indices = defIndices;}
        __init6() {this.animState = null;}
        // modified by renderer
        __init7() {this.blendAddUnity = false;}

        constructor(texture) {
            super(texture);SpriteH.prototype.__init.call(this);SpriteH.prototype.__init2.call(this);SpriteH.prototype.__init3.call(this);SpriteH.prototype.__init4.call(this);SpriteH.prototype.__init5.call(this);SpriteH.prototype.__init6.call(this);SpriteH.prototype.__init7.call(this);;
            this.pluginName = 'batchHeaven';
            if (this.texture.valid) this._onTextureUpdate();
        }

        get _tintRGB() {
            this.color.updateTransform();
            return this.color.lightRgba & 0xffffff;
        }

        set _tintRGB(value) {
            //nothing
        }

        get tint() {
            return this.color ? this.color.tintBGR : 0xffffff;
        }

        set tint(value) {
            this.color && (this.color.tintBGR = value);
        }

        _onTextureUpdate() {
            const thisAny = this ;
            thisAny._textureID = -1;
            thisAny._textureTrimmedID = -1;

            const texture = thisAny._texture;
            if (texture.polygon) {
                this.uvs = texture.polygon.uvs;
                this.indices = texture.polygon.indices;
            } else {
                this.uvs = texture._uvs.uvsFloat32;
                this.indices = defIndices;
            }

            this._cachedTint = 0xFFFFFF;
            if (this.color) {
                this.color.pma = thisAny._texture.baseTexture.premultipliedAlpha;
            }

            // so if _width is 0 then width was not set..
            if (thisAny._width) {
                this.scale.x = utils.sign(this.scale.x) * thisAny._width / thisAny._texture.orig.width;
            }

            if (thisAny._height) {
                this.scale.y = utils.sign(this.scale.y) * thisAny._height / thisAny._texture.orig.height;
            }
        }

        _render(renderer) {
            this.color.alpha = this.worldAlpha;
            this.color.updateTransform();
            super._render(renderer);
        }

        _calculateBounds() {
            const thisAny = this ;
            const polygon = (thisAny ).polygon;
            const trim = thisAny.trim;
            const orig = thisAny.orig;

            // F irst lets check to see if the current texture has a trim..
            if (!polygon && (!trim || (trim.width === orig.width && trim.height === orig.height))) {
                // no trim! lets use the usual calculations..
                this.calculateVertices();
                this._bounds.addQuad(thisAny.vertexData );
            } else {
                // lets calculate a special trimmed bounds...
                this.calculateTrimmedVertices();
                this._bounds.addQuad(thisAny.vertexTrimmedData );
            }
        }

        calculateVertices() {
            const thisAny = this ;
            const transform = this.transform ;
            const texture = thisAny._texture ;

            if (thisAny._transformID === transform._worldID && thisAny._textureID === texture._updateID) {
                return;
            }

            thisAny._transformID = transform._worldID;
            thisAny._textureID = texture._updateID;

            // set the vertex data

            const wt = this.transform.worldTransform;
            const a = wt.a;
            const b = wt.b;
            const c = wt.c;
            const d = wt.d;
            const tx = wt.tx;
            const ty = wt.ty;
            const anchor = thisAny._anchor ;
            const orig = texture.orig;

            if (texture.polygon) {
                const vertices = texture.polygon.vertices;
                const n = vertices.length;

                if (thisAny.vertexData.length !== n) {
                    thisAny.vertexData = new Float32Array(n);
                }

                const vertexData = thisAny.vertexData;

                const dx = -(anchor._x * orig.width);
                const dy = -(anchor._y * orig.height);

                for (let i = 0; i < n; i += 2) {
                    const x = vertices[i] + dx;
                    const y = vertices[i + 1] + dy;

                    vertexData[i] = x * a + y * c + tx;
                    vertexData[i + 1] = x * b + y * d + ty;
                }
            } else {
                const vertexData = thisAny.vertexData;
                const trim = texture.trim;

                let w0 = 0;
                let w1 = 0;
                let h0 = 0;
                let h1 = 0;

                if (trim) {
                    // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
                    // space before transforming the sprite coords.
                    w1 = trim.x - (anchor._x * orig.width);
                    w0 = w1 + trim.width;

                    h1 = trim.y - (anchor._y * orig.height);
                    h0 = h1 + trim.height;
                } else {
                    w1 = -anchor._x * orig.width;
                    w0 = w1 + orig.width;

                    h1 = -anchor._y * orig.height;
                    h0 = h1 + orig.height;
                }

                // xy
                vertexData[0] = (a * w1) + (c * h1) + tx;
                vertexData[1] = (d * h1) + (b * w1) + ty;

                // xy
                vertexData[2] = (a * w0) + (c * h1) + tx;
                vertexData[3] = (d * h1) + (b * w0) + ty;

                // xy
                vertexData[4] = (a * w0) + (c * h0) + tx;
                vertexData[5] = (d * h0) + (b * w0) + ty;

                // xy
                vertexData[6] = (a * w1) + (c * h0) + tx;
                vertexData[7] = (d * h0) + (b * w1) + ty;
            }
        }

        calculateMaskVertices() {
            //WE HAVE A MASK
            const maskSprite = this.maskSprite;
            const tex = maskSprite.texture;
            const orig = tex.orig;
            const anchor = maskSprite.anchor;

            if (!tex.valid) {
                return;
            }
            if (!tex.uvMatrix) {
                // margin = 0.0, let it bleed a bit, shader code becomes easier
                // assuming that atlas textures were made with 1-pixel padding
                tex.uvMatrix = new core.TextureMatrix(tex, 0.0);
            }
            tex.uvMatrix.update();

            //same operations as in SpriteMaskFilter
            maskSprite.transform.worldTransform.copyTo(tempMat);
            tempMat.invert();
            tempMat.scale(1.0 / orig.width, 1.0 / orig.height);
            tempMat.translate(anchor.x, anchor.y);
            tempMat.prepend(tex.uvMatrix.mapCoord);

            const vertexData = (this ).vertexData;
            const n = vertexData.length;

            if (!this.maskVertexData || this.maskVertexData.length !== n) {
                this.maskVertexData = new Float32Array(n);
            }

            const maskVertexData = this.maskVertexData;

            for (let i = 0; i < n; i += 2) {
                maskVertexData[i] = vertexData[i] * tempMat.a + vertexData[i + 1] * tempMat.c + tempMat.tx;
                maskVertexData[i + 1] = vertexData[i] * tempMat.b + vertexData[i + 1] * tempMat.d + tempMat.ty;
            }
        }

        destroy(options) {
            if (this.animState) {
                this.animState.stop();
                this.animState = null;
            }
            super.destroy(options);
        }
    }

    function applyConvertMixins() {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        display.Container.prototype.convertToHeaven = function () {
        };

        function tintGet() {
            return this.color.tintBGR;
        }

        function tintSet(value) {
            this.color.tintBGR = value;
        }

        function tintRGBGet() {
            this.color.updateTransform();
            return this.color.lightRgba & 0xffffff;
        }

        const SpriteProto = SpriteH.prototype ;

        sprite.Sprite.prototype.convertToHeaven = function () {
            if (this.color) {
                return;
            }

            Object.defineProperty(this, "tint", {
                get: tintGet,
                set: tintSet,
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(this, "_tintRGB", {
                get: tintRGBGet,
                enumerable: true,
                configurable: true
            });
            this._onTextureUpdate = SpriteProto._onTextureUpdate;
            this._render = SpriteProto._render;
            this._calculateBounds = SpriteProto._calculateBounds;
            this.calculateVertices = SpriteProto.calculateVertices;
            this._onTextureUpdate = SpriteProto._onTextureUpdate;
            this.calculateMaskVertices = SpriteProto.calculateMaskVertices;
            this.destroy = SpriteH.prototype.destroy;
            this.color = new ColorTransform();
            this.pluginName = 'batchHeaven';

            if (this._texture.valid) {
                this._onTextureUpdate();
            } else {
                this._texture.off('update', this._onTextureUpdate);
                this._texture.on('update', this._onTextureUpdate, this);
            }
            return this;
        };

        display.Container.prototype.convertSubtreeToHeaven = function () {
            if (this.convertToHeaven) {
                this.convertToHeaven();
            }
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].convertSubtreeToHeaven();
            }
        };
    }

    const shaderVert =
`precision highp float;
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
`    ;
    const shaderFrag = `
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
}`;

    class DarkLightGeometry extends core.Geometry
    {
        
        

        constructor(_static = false)
        {
            super();

            this._buffer = new core.Buffer(null, _static, false);

            this._indexBuffer = new core.Buffer(null, _static, true);

            this.addAttribute('aVertexPosition', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aTextureCoord', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aLight', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aDark', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', this._buffer, 1, true, constants.TYPES.FLOAT)
                .addIndex(this._indexBuffer);
        }
    }

    class DarkLightPluginFactory {
        static create(options)
        {
            const { vertex, fragment, vertexSize, geometryClass } = (Object ).assign({
                vertex: shaderVert,
                fragment: shaderFrag,
                geometryClass: DarkLightGeometry,
                vertexSize: 7,
            }, options);

            return class BatchPlugin extends core.AbstractBatchRenderer
            {
                constructor(renderer)
                {
                    super(renderer);

                    this.shaderGenerator = new core.BatchShaderGenerator(vertex, fragment);
                    this.geometryClass = geometryClass;
                    this.vertexSize = vertexSize;
                }

                

                packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
                    const {
                        uint32View,
                        float32View,
                    } = attributeBuffer;

                    let lightRgba = -1;
                    let darkRgba = 0;

                    if (element.color) {
                        lightRgba = element.color.lightRgba;
                        darkRgba = element.color.darkRgba;
                    } else {
                        const alpha = Math.min(element.worldAlpha, 1.0);
                        lightRgba = (alpha < 1.0
                            && element._texture.baseTexture.premultiplyAlpha)
                            ? utils.premultiplyTint(element._tintRGB, alpha)
                            : element._tintRGB + (alpha * 255 << 24);
                    }

                    if (settings$1.BLEND_ADD_UNITY && element.blendAddUnity) {
                        lightRgba = lightRgba & 0xffffff;
                    }

                    const p = aIndex / this.vertexSize;
                    const uvs = element.uvs;
                    const indices = element.indices;
                    const vertexData = element.vertexData;
                    const textureId = element._texture.baseTexture._batchLocation;

                    for (let i = 0; i < vertexData.length; i += 2)
                    {
                        float32View[aIndex++] = vertexData[i];
                        float32View[aIndex++] = vertexData[i + 1];
                        float32View[aIndex++] = uvs[i];
                        float32View[aIndex++] = uvs[i + 1];
                        uint32View[aIndex++] = lightRgba;
                        uint32View[aIndex++] = darkRgba;
                        float32View[aIndex++] = textureId;
                    }

                    for (let i = 0; i < indices.length; i++)
                    {
                        indexBuffer[iIndex++] = p + indices[i];
                    }
                }

                /**
                 * I override this method because of special alpha case that can be batched and work with any masks
                 * @param texArray
                 * @param start
                 * @param finish
                 */
                buildDrawCalls(texArray, start, finish)
                {
                    const thisAny = this ;
                    const {
                        _bufferedElements: elements,
                        _attributeBuffer,
                        _indexBuffer,
                        vertexSize,
                    } = thisAny;
                    const drawCalls = core.AbstractBatchRenderer._drawCallPool;

                    let dcIndex = thisAny._dcIndex;
                    let aIndex = thisAny._aIndex;
                    let iIndex = thisAny._iIndex;

                    let drawCall = drawCalls[dcIndex] ;

                    drawCall.start = thisAny._iIndex;
                    drawCall.texArray = texArray;

                    for (let i = start; i < finish; ++i)
                    {
                        const sprite = elements[i];
                        const tex = sprite._texture.baseTexture;
                        let spriteBlendMode = utils.premultiplyBlendMode[
                            tex.alphaMode ? 1 : 0][sprite.blendMode];

                        if (settings$1.BLEND_ADD_UNITY) {
                            sprite.blendAddUnity = (spriteBlendMode === constants.BLEND_MODES.ADD && tex.alphaMode);
                            if (sprite.blendAddUnity) {
                                spriteBlendMode = constants.BLEND_MODES.NORMAL;
                            }
                        }

                        elements[i] = null;

                        if (start < i && drawCall.blend !== spriteBlendMode)
                        {
                            drawCall.size = iIndex - drawCall.start;
                            start = i;
                            drawCall = drawCalls[++dcIndex];
                            drawCall.texArray = texArray;
                            drawCall.start = iIndex;
                        }

                        this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
                        aIndex += sprite.vertexData.length / 2 * vertexSize;
                        iIndex += sprite.indices.length;

                        drawCall.blend = spriteBlendMode;
                    }

                    if (start < finish)
                    {
                        drawCall.size = iIndex - drawCall.start;
                        ++dcIndex;
                    }

                    thisAny._dcIndex = dcIndex;
                    thisAny._aIndex = aIndex;
                    thisAny._iIndex = iIndex;
                }
            };
        }
    }

    class BitmapTextH extends textBitmap.BitmapText {
        constructor(text, style) {
            super(text, style);
            if (!this.color) {
                this.color = new ColorTransform();
            }
        }

        

        get tint() {
            return this.color ? this.color.tintBGR : 0xffffff;
        }

        set tint(value) {
            this.color && (this.color.tintBGR = value);
        }

        addChild(...additionalChildren) {
            const child = additionalChildren[0] ;
            if (!child.color && child.geometry) {
                if (!this.color) {
                    this.color = new ColorTransform();
                }
                child.color = this.color;
                (child ).material = new DoubleTintMeshMaterial(child.material.texture, { color: this.color });
            }
            return super.addChild(child, ...additionalChildren);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _render(renderer) {
            this.color.alpha = this.worldAlpha;
            this.color.updateTransform();
        }
    }

    core.Renderer.registerPlugin('batchHeaven', DarkLightPluginFactory.create({}));
    core.Renderer.registerPlugin('batchMasked', MaskedPluginFactory.create({}));

    applyConvertMixins();

    class SpineSprite extends SpriteH {
        

        constructor(tex, spine) {
            super(tex);
            this.spine = spine;
        }

        _render(renderer) {
            if (this.maskSprite) {
                (this.spine ).hasSpriteMask = true;
            }
            if ((this.spine ).hasSpriteMask) {
                this.pluginName = 'batchMasked';
            }
            super._render(renderer);
        }
    }

    class SpineMesh extends SimpleMeshH {
        

        constructor(texture, vertices, uvs, indices, drawMode,
                    spine = null) {
            super(texture, vertices, uvs, indices, drawMode);
            this.spine = spine;
        }

        _render(renderer) {
            // part of SimpleMesh
            if (this.autoUpdate)
            {
                this.geometry.getBuffer('aVertexPosition').update();
            }
            if (this.maskSprite) {
                (this.spine ).hasSpriteMask = true;
            }
            if ((this.spine ).hasSpriteMask) {
                (this.material ).pluginName = 'batchMasked';
                this._renderToBatch(renderer);
            } else {
                super._renderDefault(renderer);
            }
        }
    }

    function applySpineMixin(spineClassPrototype)
    {
        spineClassPrototype.newMesh = function newMesh(texture, vertices,
            uvs, indices, drawMode)
        {
            return new SimpleMeshH(texture, vertices, uvs, indices, drawMode) ;
        };
        spineClassPrototype.newContainer = function newMesh()
        {
            if (!this.color)
            {
                this.hasSpriteMask = false;
                this.color = new ColorTransform();
            }
            return new display.Container();
        };
        spineClassPrototype.newSprite = function newSprite(texture)
        {
            return new SpriteH(texture);
        };
        spineClassPrototype.newGraphics = function newMesh()
        {
            return new graphics.Graphics();
        };
        spineClassPrototype.transformHack = function transformHack()
        {
            return 2;
        };
    }

    // eslint-disable-next-line @typescript-eslint/triple-slash-reference,spaced-comment

    applySpritesheetMixin();

    exports.AnimationState = AnimationState;
    exports.BitmapTextH = BitmapTextH;
    exports.ColorTransform = ColorTransform;
    exports.DarkLightGeometry = DarkLightGeometry;
    exports.DarkLightPluginFactory = DarkLightPluginFactory;
    exports.DoubleTintMeshMaterial = DoubleTintMeshMaterial;
    exports.LoopShaderGenerator = LoopShaderGenerator;
    exports.MaskedGeometry = MaskedGeometry;
    exports.MaskedPluginFactory = MaskedPluginFactory;
    exports.MeshH = MeshH;
    exports.SimpleMeshH = SimpleMeshH;
    exports.SpineMesh = SpineMesh;
    exports.SpineSprite = SpineSprite;
    exports.SpriteH = SpriteH;
    exports.TexturePolygon = TexturePolygon;
    exports.applyConvertMixins = applyConvertMixins;
    exports.applySpineMixin = applySpineMixin;
    exports.applySpritesheetMixin = applySpritesheetMixin;
    exports.settings = settings$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof pixi_heaven !== 'undefined') { Object.assign(this.PIXI.heaven, pixi_heaven); }
//# sourceMappingURL=pixi-heaven.umd.js.map
