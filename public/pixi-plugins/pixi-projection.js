/* eslint-disable */
 
/*!
 * pixi-projection - v0.4.0
 * Compiled Sun, 04 Jul 2021 17:34:36 UTC
 *
 * pixi-projection is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.projection = this.PIXI.projection || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/core'), require('@pixi/constants'), require('@pixi/utils'), require('@pixi/math'), require('@pixi/display'), require('@pixi/sprite-tiling'), require('@pixi/mesh'), require('@pixi/mesh-extras'), require('@pixi/sprite'), require('@pixi/text'), require('@pixi/graphics')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/core', '@pixi/constants', '@pixi/utils', '@pixi/math', '@pixi/display', '@pixi/sprite-tiling', '@pixi/mesh', '@pixi/mesh-extras', '@pixi/sprite', '@pixi/text', '@pixi/graphics'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_projection = {}, global.PIXI, global.PIXI, global.PIXI.utils, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI));
}(this, (function (exports, core, constants, utils, math, display, spriteTiling, mesh, meshExtras, sprite, text, graphics) { 'use strict';

    const shaderVert$2
        = `precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
gl_Position.xyw = projectionMatrix * aVertexPosition;
gl_Position.z = 0.0;

vTextureCoord = aTextureCoord;
vTextureId = aTextureId;
vColor = aColor;
}
`;
    const shaderFrag$2 = `
varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void){
vec4 color;
%forloop%
gl_FragColor = color * vColor;
}`;

    class Batch3dGeometry extends core.Geometry
    {
        
        

        constructor(_static = false)
        {
            super();

            this._buffer = new core.Buffer(null, _static, false);

            this._indexBuffer = new core.Buffer(null, _static, true);

            this.addAttribute('aVertexPosition', this._buffer, 3, false, constants.TYPES.FLOAT)
                .addAttribute('aTextureCoord', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aColor', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', this._buffer, 1, true, constants.TYPES.FLOAT)
                .addIndex(this._indexBuffer);
        }
    }

    class Batch2dPluginFactory
    {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        static create(options)
        {
            const { vertex, fragment, vertexSize, geometryClass } = (Object ).assign({
                vertex: shaderVert$2,
                fragment: shaderFrag$2,
                geometryClass: Batch3dGeometry,
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

                

                // eslint-disable-next-line max-len
                packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex)
                {
                    const {
                        uint32View,
                        float32View,
                    } = attributeBuffer;

                    const p = aIndex / this.vertexSize;// float32View.length / 6 / 2;
                    const uvs = element.uvs;
                    const indices = element.indices;// geometry.getIndex().data;// indicies;
                    const vertexData = element.vertexData;
                    const vertexData2d = element.vertexData2d;
                    const textureId = element._texture.baseTexture._batchLocation;

                    const alpha = Math.min(element.worldAlpha, 1.0);

                    const argb = alpha < 1.0 && element._texture.baseTexture.alphaMode ? utils.premultiplyTint(element._tintRGB, alpha)
                        : element._tintRGB + (alpha * 255 << 24);

                    if (vertexData2d)
                    {
                        let j = 0;

                        for (let i = 0; i < vertexData2d.length; i += 3, j += 2)
                        {
                            float32View[aIndex++] = vertexData2d[i];
                            float32View[aIndex++] = vertexData2d[i + 1];
                            float32View[aIndex++] = vertexData2d[i + 2];
                            float32View[aIndex++] = uvs[j];
                            float32View[aIndex++] = uvs[j + 1];
                            uint32View[aIndex++] = argb;
                            float32View[aIndex++] = textureId;
                        }
                    }
                    else
                    {
                        for (let i = 0; i < vertexData.length; i += 2)
                        {
                            float32View[aIndex++] = vertexData[i];
                            float32View[aIndex++] = vertexData[i + 1];
                            float32View[aIndex++] = 1.0;
                            float32View[aIndex++] = uvs[i];
                            float32View[aIndex++] = uvs[i + 1];
                            uint32View[aIndex++] = argb;
                            float32View[aIndex++] = textureId;
                        }
                    }

                    for (let i = 0; i < indices.length; i++)
                    {
                        indexBuffer[iIndex++] = p + indices[i];
                    }
                }
            };
        }
    }

    class AbstractProjection
    {
        constructor(legacy, enable = true)
        {;AbstractProjection.prototype.__init.call(this);
            this.legacy = legacy;

            if (enable)
            {
                this.enabled = true;
            }

            // sorry for hidden class, it would be good to have special projection field in official pixi
            // TODO: pixi 6.1.0 global mixin
            (this.legacy ).proj = this;
        }

        

        __init() {this._enabled = false;}

        get enabled()
        {
            return this._enabled;
        }

        set enabled(value)
        {
            this._enabled = value;
        }

        clear()
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        {
        }
    }

    exports.TRANSFORM_STEP = void 0; (function (TRANSFORM_STEP) {
        const NONE = 0; TRANSFORM_STEP[TRANSFORM_STEP["NONE"] = NONE] = "NONE";
        // POS = 1,
        // ROT = 2,
        // SCALE = 3,
        // PIVOT = 4,
        const BEFORE_PROJ = 4; TRANSFORM_STEP[TRANSFORM_STEP["BEFORE_PROJ"] = BEFORE_PROJ] = "BEFORE_PROJ";
        const PROJ = 5; TRANSFORM_STEP[TRANSFORM_STEP["PROJ"] = PROJ] = "PROJ";
        // POS_2 = 6,
        // ROT_2 = 7,
        // SCALE_2 = 8,
        // PIVOT_2 = 9,
        const ALL = 9; TRANSFORM_STEP[TRANSFORM_STEP["ALL"] = ALL] = "ALL";
    })(exports.TRANSFORM_STEP || (exports.TRANSFORM_STEP = {}));

    exports.AFFINE = void 0; (function (AFFINE) {
        const NONE = 0; AFFINE[AFFINE["NONE"] = NONE] = "NONE";
        const FREE = 1; AFFINE[AFFINE["FREE"] = FREE] = "FREE";
        const AXIS_X = 2; AFFINE[AFFINE["AXIS_X"] = AXIS_X] = "AXIS_X";
        const AXIS_Y = 3; AFFINE[AFFINE["AXIS_Y"] = AXIS_Y] = "AXIS_Y";
        const POINT = 4; AFFINE[AFFINE["POINT"] = POINT] = "POINT";
        const AXIS_XR = 5; AFFINE[AFFINE["AXIS_XR"] = AXIS_XR] = "AXIS_XR";
    })(exports.AFFINE || (exports.AFFINE = {}));

    function transformHack$1( parentTransform)
    {
        // implementation here
        // TODO: pixi 6.1.0 global mixin
        const proj = (this ).proj ;
        const ta = this ;
        const pwid = (parentTransform )._worldID;

        const lt = ta.localTransform;
        const scaleAfterAffine = proj.scaleAfterAffine && proj.affine >= 2;

        // this part is copied from
        if (ta._localID !== ta._currentLocalID)
        {
            // get the matrix values of the displayobject based on its transform properties..
            if (scaleAfterAffine)
            {
                lt.a = ta._cx;
                lt.b = ta._sx;
                lt.c = ta._cy;
                lt.d = ta._sy;

                lt.tx = ta.position._x;
                lt.ty = ta.position._y;
            }
            else
            {
                lt.a = ta._cx * ta.scale._x;
                lt.b = ta._sx * ta.scale._x;
                lt.c = ta._cy * ta.scale._y;
                lt.d = ta._sy * ta.scale._y;

                lt.tx = ta.position._x - ((ta.pivot._x * lt.a) + (ta.pivot._y * lt.c));
                lt.ty = ta.position._y - ((ta.pivot._x * lt.b) + (ta.pivot._y * lt.d));
            }

            ta._currentLocalID = ta._localID;

            // force an update..
            proj._currentProjID = -1;
        }

        const _matrixID = proj._projID;

        if (proj._currentProjID !== _matrixID)
        {
            proj._currentProjID = _matrixID;
            proj.updateLocalTransform(lt);
            ta._parentID = -1;
        }

        if (ta._parentID !== pwid)
        {
            // TODO: pixi 6.1.0 global mixin
            const pp = (parentTransform ).proj ;

            if (pp && !pp._affine)
            {
                proj.world.setToMult(pp.world, proj.local);
            }
            else
            {
                proj.world.setToMultLegacy(parentTransform.worldTransform, proj.local);
            }

            const wa = ta.worldTransform;

            proj.world.copyTo(wa, proj._affine, proj.affinePreserveOrientation);

            if (scaleAfterAffine)
            {
                wa.a *= ta.scale._x;
                wa.b *= ta.scale._x;
                wa.c *= ta.scale._y;
                wa.d *= ta.scale._y;

                wa.tx -= ((ta.pivot._x * wa.a) + (ta.pivot._y * wa.c));
                wa.ty -= ((ta.pivot._x * wa.b) + (ta.pivot._y * wa.d));
            }
            ta._parentID = pwid;
            ta._worldID++;
        }
    }

    class LinearProjection extends AbstractProjection
    {constructor(...args) { super(...args); LinearProjection.prototype.__init.call(this);LinearProjection.prototype.__init2.call(this);LinearProjection.prototype.__init3.call(this);LinearProjection.prototype.__init4.call(this);LinearProjection.prototype.__init5.call(this); }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updateLocalTransform(lt)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        {
        }

        __init() {this._projID = 0;}
        __init2() {this._currentProjID = -1;}
        __init3() {this._affine = exports.AFFINE.NONE;}
        __init4() {this.affinePreserveOrientation = false;}
        __init5() {this.scaleAfterAffine = true;}

        set affine(value)
        {
            if (this._affine === value) return;
            this._affine = value;
            this._currentProjID = -1;
            // this is because scaleAfterAffine
            (this.legacy )._currentLocalID = -1;
        }

        get affine()
        {
            return this._affine;
        }

        
        

        // eslint-disable-next-line accessor-pairs
        set enabled(value)
        {
            if (value === this._enabled)
            {
                return;
            }
            this._enabled = value;
            if (value)
            {
                this.legacy.updateTransform = transformHack$1;
                (this.legacy )._parentID = -1;
            }
            else
            {
                this.legacy.updateTransform = math.Transform.prototype.updateTransform;
                (this.legacy )._parentID = -1;
            }
        }

        clear()
        {
            this._currentProjID = -1;
            this._projID = 0;
        }
    }

    class UniformBatchRenderer extends core.AbstractBatchRenderer
    {constructor(...args) { super(...args); UniformBatchRenderer.prototype.__init.call(this);UniformBatchRenderer.prototype.__init2.call(this); }
        
        
        
        
        
        
        
        __init() {this.forceMaxTextures = 0;}

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getUniforms(sprite)
        {
            return this.defUniforms;
        }

        syncUniforms(obj)
        {
            if (!obj) return;
            const sh = this._shader;

            for (const key in obj)
            {
                sh.uniforms[key] = obj[key];
            }
        }

        __init2() {this.defUniforms = {};}

        buildDrawCalls(texArray, start, finish)
        {
            const thisAny = this ;

            const {
                _bufferedElements: elements,
                _attributeBuffer,
                _indexBuffer,
                vertexSize,
            } = this;
            const drawCalls = core.AbstractBatchRenderer._drawCallPool;

            let dcIndex = this._dcIndex;
            let aIndex = this._aIndex;
            let iIndex = this._iIndex;

            let drawCall = drawCalls[dcIndex] ;

            drawCall.start = this._iIndex;
            drawCall.texArray = texArray;

            for (let i = start; i < finish; ++i)
            {
                const sprite = elements[i];
                const tex = sprite._texture.baseTexture;
                const spriteBlendMode = utils.premultiplyBlendMode[
                    tex.alphaMode ? 1 : 0][sprite.blendMode];
                const uniforms = this.getUniforms(sprite);

                elements[i] = null;

                // here is the difference
                if (start < i && (drawCall.blend !== spriteBlendMode || drawCall.uniforms !== uniforms))
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
                // here is the difference
                drawCall.uniforms = uniforms;
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

        drawBatches()
        {
            const dcCount = this._dcIndex;
            const { gl, state: stateSystem, shader: shaderSystem } = this.renderer;
            const drawCalls = core.AbstractBatchRenderer._drawCallPool;
            let curUniforms = null;
            let curTexArray = null;

            for (let i = 0; i < dcCount; i++)
            {
                const { texArray, type, size, start, blend, uniforms } = drawCalls[i] ;

                if (curTexArray !== texArray)
                {
                    curTexArray = texArray;
                    this.bindAndClearTexArray(texArray);
                }
                // here is the difference
                if (curUniforms !== uniforms)
                {
                    curUniforms = uniforms;
                    this.syncUniforms(uniforms);
                    (shaderSystem ).syncUniformGroup((this._shader ).uniformGroup);
                }

                this.state.blendMode = blend;
                stateSystem.set(this.state);
                gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
            }
        }

        contextChange()
        {
            if (!this.forceMaxTextures)
            {
                super.contextChange();
                this.syncUniforms(this.defUniforms);

                return;
            }

            // we can override MAX_TEXTURES with this hack

            const thisAny = this ;

            thisAny.MAX_TEXTURES = this.forceMaxTextures;
            this._shader = thisAny.shaderGenerator.generateShader(this.MAX_TEXTURES);
            this.syncUniforms(this.defUniforms);
            for (let i = 0; i < thisAny._packedGeometryPoolSize; i++)
            {
                /* eslint-disable max-len */
                thisAny._packedGeometries[i] = new (this.geometryClass)();
            }
            this.initFlushBuffers();
        }
    }

    core.Renderer.registerPlugin('batch2d', Batch2dPluginFactory.create({}));

    /* eslint-disable no-mixed-operators */

    // eslint-disable-next-line max-len
    function getIntersectionFactor(p1, p2, p3, p4, out)
    {
        const A1 = p2.x - p1.x; const B1 = p3.x - p4.x;
        const C1 = p3.x - p1.x;
        const A2 = p2.y - p1.y; const B2 = p3.y - p4.y;
        const C2 = p3.y - p1.y;
        const D = A1 * B2 - A2 * B1;

        if (Math.abs(D) < 1e-7)
        {
            out.x = A1;
            out.y = A2;

            return 0;
        }
        const T = C1 * B2 - C2 * B1;
        const U = A1 * C2 - A2 * C1;

        const t = T / D; const
            u = U / D;

        if (u < (1e-6) || u - 1 > -1e-6)
        {
            return -1;
        }

        out.x = p1.x + t * (p2.x - p1.x);
        out.y = p1.y + t * (p2.y - p1.y);

        return 1;
    }

    function getPositionFromQuad(p, anchor, out)
    {
        out = out || new math.Point();
        const a1 = 1.0 - anchor.x; const
            a2 = 1.0 - a1;
        const b1 = 1.0 - anchor.y; const
            b2 = 1.0 - b1;

        out.x = (p[0].x * a1 + p[1].x * a2) * b1 + (p[3].x * a1 + p[2].x * a2) * b2;
        out.y = (p[0].y * a1 + p[1].y * a2) * b1 + (p[3].y * a1 + p[2].y * a2) * b2;

        return out;
    }

    /* eslint-disable no-mixed-operators,max-statements-per-line */

    const mat3id = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    class Matrix2d
    {
        /**
         * A default (identity) matrix
         *
         * @static
         * @const
         */
        static  __initStatic() {this.IDENTITY = new Matrix2d();}

        /**
         * A temp matrix
         *
         * @static
         * @const
         */
        static  __initStatic2() {this.TEMP_MATRIX = new Matrix2d();}

        /**
         * mat3 implementation through array of 9 elements
         */
        

        __init() {this.floatArray = null;}

        constructor(backingArray)
        {;Matrix2d.prototype.__init.call(this);
            this.mat3 = new Float64Array(backingArray || mat3id);
        }

        get a()
        {
            return this.mat3[0] / this.mat3[8];
        }

        set a(value)
        {
            this.mat3[0] = value * this.mat3[8];
        }

        get b()
        {
            return this.mat3[1] / this.mat3[8];
        }

        set b(value)
        {
            this.mat3[1] = value * this.mat3[8];
        }

        get c()
        {
            return this.mat3[3] / this.mat3[8];
        }

        set c(value)
        {
            this.mat3[3] = value * this.mat3[8];
        }

        get d()
        {
            return this.mat3[4] / this.mat3[8];
        }

        set d(value)
        {
            this.mat3[4] = value * this.mat3[8];
        }

        get tx()
        {
            return this.mat3[6] / this.mat3[8];
        }

        set tx(value)
        {
            this.mat3[6] = value * this.mat3[8];
        }

        get ty()
        {
            return this.mat3[7] / this.mat3[8];
        }

        set ty(value)
        {
            this.mat3[7] = value * this.mat3[8];
        }

        set(a, b, c, d, tx, ty)
        {
            const mat3 = this.mat3;

            mat3[0] = a;
            mat3[1] = b;
            mat3[2] = 0;
            mat3[3] = c;
            mat3[4] = d;
            mat3[5] = 0;
            mat3[6] = tx;
            mat3[7] = ty;
            mat3[8] = 1;

            return this;
        }

        toArray(transpose, out)
        {
            if (!this.floatArray)
            {
                this.floatArray = new Float32Array(9);
            }

            const array = out || this.floatArray;
            const mat3 = this.mat3;

            if (transpose)
            {
                array[0] = mat3[0];
                array[1] = mat3[1];
                array[2] = mat3[2];
                array[3] = mat3[3];
                array[4] = mat3[4];
                array[5] = mat3[5];
                array[6] = mat3[6];
                array[7] = mat3[7];
                array[8] = mat3[8];
            }
            else
            {
                // this branch is NEVER USED in pixi
                array[0] = mat3[0];
                array[1] = mat3[3];
                array[2] = mat3[6];
                array[3] = mat3[1];
                array[4] = mat3[4];
                array[5] = mat3[7];
                array[6] = mat3[2];
                array[7] = mat3[5];
                array[8] = mat3[8];
            }

            return array;
        }

        // TODO: remove props
        apply(pos, newPos)
        {
            newPos = newPos || new math.Point();

            const mat3 = this.mat3;
            const x = pos.x;
            const y = pos.y;

            const z = 1.0 / (mat3[2] * x + mat3[5] * y + mat3[8]);

            newPos.x = z * (mat3[0] * x + mat3[3] * y + mat3[6]);
            newPos.y = z * (mat3[1] * x + mat3[4] * y + mat3[7]);

            return newPos;
        }

        translate(tx, ty)
        {
            const mat3 = this.mat3;

            mat3[0] += tx * mat3[2];
            mat3[1] += ty * mat3[2];
            mat3[3] += tx * mat3[5];
            mat3[4] += ty * mat3[5];
            mat3[6] += tx * mat3[8];
            mat3[7] += ty * mat3[8];

            return this;
        }

        scale(x, y)
        {
            const mat3 = this.mat3;

            mat3[0] *= x;
            mat3[1] *= y;
            mat3[3] *= x;
            mat3[4] *= y;
            mat3[6] *= x;
            mat3[7] *= y;

            return this;
        }

        scaleAndTranslate(scaleX, scaleY, tx, ty)
        {
            const mat3 = this.mat3;

            mat3[0] = scaleX * mat3[0] + tx * mat3[2];
            mat3[1] = scaleY * mat3[1] + ty * mat3[2];
            mat3[3] = scaleX * mat3[3] + tx * mat3[5];
            mat3[4] = scaleY * mat3[4] + ty * mat3[5];
            mat3[6] = scaleX * mat3[6] + tx * mat3[8];
            mat3[7] = scaleY * mat3[7] + ty * mat3[8];
        }

        // TODO: remove props
        applyInverse(pos, newPos)
        {
            newPos = newPos || new math.Point();

            const a = this.mat3;
            const x = pos.x;
            const y = pos.y;

            const a00 = a[0]; const a01 = a[3]; const a02 = a[6];
            const a10 = a[1]; const a11 = a[4]; const a12 = a[7];
            const a20 = a[2]; const a21 = a[5]; const
                a22 = a[8];

            const newX = (a22 * a11 - a12 * a21) * x + (-a22 * a01 + a02 * a21) * y + (a12 * a01 - a02 * a11);
            const newY = (-a22 * a10 + a12 * a20) * x + (a22 * a00 - a02 * a20) * y + (-a12 * a00 + a02 * a10);
            const newZ = (a21 * a10 - a11 * a20) * x + (-a21 * a00 + a01 * a20) * y + (a11 * a00 - a01 * a10);

            newPos.x = newX / newZ;
            newPos.y = newY / newZ;

            return newPos;
        }

        invert()
        {
            const a = this.mat3;

            const a00 = a[0]; const a01 = a[1]; const a02 = a[2];
            const a10 = a[3]; const a11 = a[4]; const a12 = a[5];
            const a20 = a[6]; const a21 = a[7]; const a22 = a[8];

            const b01 = a22 * a11 - a12 * a21;
            const b11 = -a22 * a10 + a12 * a20;
            const b21 = a21 * a10 - a11 * a20;

            // Calculate the determinant
            let det = a00 * b01 + a01 * b11 + a02 * b21;

            if (!det)
            {
                return this;
            }
            det = 1.0 / det;

            a[0] = b01 * det;
            a[1] = (-a22 * a01 + a02 * a21) * det;
            a[2] = (a12 * a01 - a02 * a11) * det;
            a[3] = b11 * det;
            a[4] = (a22 * a00 - a02 * a20) * det;
            a[5] = (-a12 * a00 + a02 * a10) * det;
            a[6] = b21 * det;
            a[7] = (-a21 * a00 + a01 * a20) * det;
            a[8] = (a11 * a00 - a01 * a10) * det;

            return this;
        }

        identity()
        {
            const mat3 = this.mat3;

            mat3[0] = 1;
            mat3[1] = 0;
            mat3[2] = 0;
            mat3[3] = 0;
            mat3[4] = 1;
            mat3[5] = 0;
            mat3[6] = 0;
            mat3[7] = 0;
            mat3[8] = 1;

            return this;
        }

        clone()
        {
            return new Matrix2d(this.mat3);
        }

        copyTo2dOr3d(matrix)
        {
            const mat3 = this.mat3;
            const ar2 = matrix.mat3;

            ar2[0] = mat3[0];
            ar2[1] = mat3[1];
            ar2[2] = mat3[2];
            ar2[3] = mat3[3];
            ar2[4] = mat3[4];
            ar2[5] = mat3[5];
            ar2[6] = mat3[6];
            ar2[7] = mat3[7];
            ar2[8] = mat3[8];

            return matrix;
        }

        /**
         * legacy method, change the values of given pixi matrix
         * @param matrix
         * @param affine
         * @param preserveOrientation
         * @return matrix
         */
        copyTo(matrix, affine, preserveOrientation)
        {
            const mat3 = this.mat3;
            const d = 1.0 / mat3[8];
            const tx = mat3[6] * d; const
                ty = mat3[7] * d;

            matrix.a = (mat3[0] - mat3[2] * tx) * d;
            matrix.b = (mat3[1] - mat3[2] * ty) * d;
            matrix.c = (mat3[3] - mat3[5] * tx) * d;
            matrix.d = (mat3[4] - mat3[5] * ty) * d;
            matrix.tx = tx;
            matrix.ty = ty;

            if (affine >= 2)
            {
                let D = matrix.a * matrix.d - matrix.b * matrix.c;

                if (!preserveOrientation)
                {
                    D = Math.abs(D);
                }
                if (affine === exports.AFFINE.POINT)
                {
                    if (D > 0)
                    {
                        D = 1;
                    }
                    else D = -1;
                    matrix.a = D;
                    matrix.b = 0;
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === exports.AFFINE.AXIS_X)
                {
                    D /= Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d);
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === exports.AFFINE.AXIS_Y)
                {
                    D /= Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c);
                    matrix.a = D;
                    matrix.c = 0;
                }
                else if (affine === exports.AFFINE.AXIS_XR)
                {
                    matrix.a = matrix.d * D;
                    matrix.c = -matrix.b * D;
                }
            }

            return matrix;
        }

        /**
         * legacy method, change the values of given pixi matrix
         * @param matrix
         * @return
         */
        copyFrom(matrix)
        {
            const mat3 = this.mat3;

            mat3[0] = matrix.a;
            mat3[1] = matrix.b;
            mat3[2] = 0;
            mat3[3] = matrix.c;
            mat3[4] = matrix.d;
            mat3[5] = 0;
            mat3[6] = matrix.tx;
            mat3[7] = matrix.ty;
            mat3[8] = 1.0;

            return this;
        }

        setToMultLegacy(pt, lt)
        {
            const out = this.mat3;
            const b = lt.mat3;

            const a00 = pt.a; const a01 = pt.b;
            const a10 = pt.c; const a11 = pt.d;
            const a20 = pt.tx; const a21 = pt.ty;

            const b00 = b[0]; const b01 = b[1]; const b02 = b[2];
            const b10 = b[3]; const b11 = b[4]; const b12 = b[5];
            const b20 = b[6]; const b21 = b[7]; const
                b22 = b[8];

            out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            out[2] = b02;

            out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            out[5] = b12;

            out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            out[8] = b22;

            return this;
        }

        setToMultLegacy2(pt, lt)
        {
            const out = this.mat3;
            const a = pt.mat3;

            const a00 = a[0]; const a01 = a[1]; const a02 = a[2];
            const a10 = a[3]; const a11 = a[4]; const a12 = a[5];
            const a20 = a[6]; const a21 = a[7]; const a22 = a[8];

            const b00 = lt.a; const b01 = lt.b;
            const b10 = lt.c; const b11 = lt.d;
            const b20 = lt.tx; const
                b21 = lt.ty;

            out[0] = b00 * a00 + b01 * a10;
            out[1] = b00 * a01 + b01 * a11;
            out[2] = b00 * a02 + b01 * a12;

            out[3] = b10 * a00 + b11 * a10;
            out[4] = b10 * a01 + b11 * a11;
            out[5] = b10 * a02 + b11 * a12;

            out[6] = b20 * a00 + b21 * a10 + a20;
            out[7] = b20 * a01 + b21 * a11 + a21;
            out[8] = b20 * a02 + b21 * a12 + a22;

            return this;
        }

        // that's transform multiplication we use
        setToMult(pt, lt)
        {
            const out = this.mat3;
            const a = pt.mat3; const
                b = lt.mat3;

            const a00 = a[0]; const a01 = a[1]; const a02 = a[2];
            const a10 = a[3]; const a11 = a[4]; const a12 = a[5];
            const a20 = a[6]; const a21 = a[7]; const a22 = a[8];

            const b00 = b[0]; const b01 = b[1]; const b02 = b[2];
            const b10 = b[3]; const b11 = b[4]; const b12 = b[5];
            const b20 = b[6]; const b21 = b[7]; const
                b22 = b[8];

            out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            out[2] = b00 * a02 + b01 * a12 + b02 * a22;

            out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            out[5] = b10 * a02 + b11 * a12 + b12 * a22;

            out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            out[8] = b20 * a02 + b21 * a12 + b22 * a22;

            return this;
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        prepend(lt)
        {
            if (lt.mat3)
            {
                return this.setToMult(lt, this);
            }

            return this.setToMultLegacy(lt, this);
        }
    } Matrix2d.__initStatic(); Matrix2d.__initStatic2();

    const shaderVert$1
        = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTransform;

varying vec3 vTextureCoord;

void main(void)
{
gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);

vTextureCoord = uTransform * vec3(aTextureCoord, 1.0);
}
`;
    const shaderFrag$1 = `
varying vec3 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform mat3 uMapCoord;
uniform vec4 uClampFrame;
uniform vec2 uClampOffset;

void main(void)
{
vec2 coord = mod(vTextureCoord.xy / vTextureCoord.z - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;
coord = (uMapCoord * vec3(coord, 1.0)).xy;
coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);

vec4 sample = texture2D(uSampler, coord);
gl_FragColor = sample * uColor;
}
`;
    const shaderSimpleFrag = `
varying vec3 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uColor;

void main(void)
{
vec4 sample = texture2D(uSampler, vTextureCoord.xy / vTextureCoord.z);
gl_FragColor = sample * uColor;
}
`;

    // changed
    const tempMat$4 = new Matrix2d();

    class TilingSprite2dRenderer extends core.ObjectRenderer
    {
        constructor(renderer)
        {
            super(renderer);TilingSprite2dRenderer.prototype.__init.call(this);;

            const uniforms = { globals: this.renderer.globalUniforms };

            this.shader = core.Shader.from(shaderVert$1, shaderFrag$1, uniforms);

            this.simpleShader = core.Shader.from(shaderVert$1, shaderSimpleFrag, uniforms);
        }

        
        
        __init() {this.quad = new core.QuadUv();}

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        render(ts)
        {
            const renderer = this.renderer;
            const quad = this.quad;

            let vertices = quad.vertices;

            vertices[0] = vertices[6] = (ts._width) * -ts.anchor.x;
            vertices[1] = vertices[3] = ts._height * -ts.anchor.y;

            vertices[2] = vertices[4] = (ts._width) * (1.0 - ts.anchor.x);
            vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);

            if (ts.uvRespectAnchor)
            {
                vertices = quad.uvs;

                vertices[0] = vertices[6] = -ts.anchor.x;
                vertices[1] = vertices[3] = -ts.anchor.y;

                vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
                vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
            }

            quad.invalidate();

            const tex = ts._texture;
            const baseTex = tex.baseTexture;
            const lt = ts.tileProj.world;
            const uv = ts.uvMatrix;
            let isSimple = baseTex.isPowerOfTwo
                && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

            // auto, force repeat wrapMode for big tiling textures
            if (isSimple)
            {
                if (!baseTex._glTextures[(renderer ).CONTEXT_UID])
                {
                    if (baseTex.wrapMode === constants.WRAP_MODES.CLAMP)
                    {
                        baseTex.wrapMode = constants.WRAP_MODES.REPEAT;
                    }
                }
                else
                {
                    isSimple = baseTex.wrapMode !== constants.WRAP_MODES.CLAMP;
                }
            }

            const shader = isSimple ? this.simpleShader : this.shader;

            // changed
            tempMat$4.identity();
            tempMat$4.scale(tex.width, tex.height);
            tempMat$4.prepend(lt);
            tempMat$4.scale(1.0 / ts._width, 1.0 / ts._height);

            tempMat$4.invert();
            if (isSimple)
            {
                tempMat$4.prepend(uv.mapCoord);
            }
            else
            {
                shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
                shader.uniforms.uClampFrame = uv.uClampFrame;
                shader.uniforms.uClampOffset = uv.uClampOffset;
            }

            shader.uniforms.uTransform = tempMat$4.toArray(true);
            shader.uniforms.uColor = utils.premultiplyTintToRgba(ts.tint, ts.worldAlpha,
                shader.uniforms.uColor, baseTex.premultiplyAlpha);
            shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
            shader.uniforms.uSampler = tex;

            renderer.shader.bind(shader, false);
            renderer.geometry.bind(quad , undefined);// , renderer.shader.getGLShader());

            renderer.state.setBlendMode(utils.correctBlendMode(ts.blendMode, baseTex.premultiplyAlpha));
            renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES, 6, 0);
        }
    }

    /* eslint-disable no-mixed-operators */

    const t0 = new math.Point();
    const tt = [new math.Point(), new math.Point(), new math.Point(), new math.Point()];
    const tempRect$1 = new math.Rectangle();
    const tempMat$3 = new Matrix2d();

    class Projection2d extends LinearProjection
    {
        constructor(legacy, enable)
        {
            super(legacy, enable);Projection2d.prototype.__init.call(this);Projection2d.prototype.__init2.call(this);Projection2d.prototype.__init3.call(this);;
            this.local = new Matrix2d();
            this.world = new Matrix2d();
        }

        __init() {this.matrix = new Matrix2d();}
        __init2() {this.pivot = new math.ObservablePoint(this.onChange, this, 0, 0);}

        __init3() {this.reverseLocalOrder = false;}

        onChange()
        {
            const pivot = this.pivot;
            const mat3 = this.matrix.mat3;

            mat3[6] = -(pivot._x * mat3[0] + pivot._y * mat3[3]);
            mat3[7] = -(pivot._x * mat3[1] + pivot._y * mat3[4]);

            this._projID++;
        }

        setAxisX(p, factor = 1)
        {
            const x = p.x; const
                y = p.y;
            const d = Math.sqrt(x * x + y * y);
            const mat3 = this.matrix.mat3;

            mat3[0] = x / d;
            mat3[1] = y / d;
            mat3[2] = factor / d;

            this.onChange();
        }

        setAxisY(p, factor = 1)
        {
            const x = p.x; const
                y = p.y;
            const d = Math.sqrt(x * x + y * y);
            const mat3 = this.matrix.mat3;

            mat3[3] = x / d;
            mat3[4] = y / d;
            mat3[5] = factor / d;
            this.onChange();
        }

        mapSprite(sprite, quad)
        {
            const tex = sprite.texture;

            tempRect$1.x = -sprite.anchor.x * tex.orig.width;
            tempRect$1.y = -sprite.anchor.y * tex.orig.height;
            tempRect$1.width = tex.orig.width;
            tempRect$1.height = tex.orig.height;

            this.mapQuad(tempRect$1, quad);
        }

        mapQuad(rect, p)
        {
            // utils.getPositionFromQuad(p, anchor, t0);
            tt[0].set(rect.x, rect.y);
            tt[1].set(rect.x + rect.width, rect.y);
            tt[2].set(rect.x + rect.width, rect.y + rect.height);
            tt[3].set(rect.x, rect.y + rect.height);

            let k1 = 1; let k2 = 2;
            let k3 = 3;
            const f = getIntersectionFactor(p[0], p[2], p[1], p[3], t0);

            if (f !== 0)
            {
                k1 = 1;
                k2 = 3;
                k3 = 2;
            }
            else
            {
                return;
                /* f = utils.getIntersectionFactor(p[0], p[1], p[2], p[3], t0);
                if (f > 0) {
                    k1 = 2;
                    k2 = 3;
                    k3 = 1;
                } else {
                    f = utils.getIntersectionFactor(p[0], p[3], p[1], p[2], t0);
                    if (f > 0) {
                        // cant find it :(
                        k1 = 1;
                        k2 = 2;
                        k3 = 3;
                    } else {
                        return;
                    }
                }*/
            }
            const d0 = Math.sqrt((p[0].x - t0.x) * (p[0].x - t0.x) + (p[0].y - t0.y) * (p[0].y - t0.y));
            const d1 = Math.sqrt((p[k1].x - t0.x) * (p[k1].x - t0.x) + (p[k1].y - t0.y) * (p[k1].y - t0.y));
            const d2 = Math.sqrt((p[k2].x - t0.x) * (p[k2].x - t0.x) + (p[k2].y - t0.y) * (p[k2].y - t0.y));
            const d3 = Math.sqrt((p[k3].x - t0.x) * (p[k3].x - t0.x) + (p[k3].y - t0.y) * (p[k3].y - t0.y));

            const q0 = (d0 + d3) / d3;
            const q1 = (d1 + d2) / d2;
            const q2 = (d1 + d2) / d1;

            let mat3 = this.matrix.mat3;

            mat3[0] = tt[0].x * q0;
            mat3[1] = tt[0].y * q0;
            mat3[2] = q0;
            mat3[3] = tt[k1].x * q1;
            mat3[4] = tt[k1].y * q1;
            mat3[5] = q1;
            mat3[6] = tt[k2].x * q2;
            mat3[7] = tt[k2].y * q2;
            mat3[8] = q2;
            this.matrix.invert();

            mat3 = tempMat$3.mat3;
            mat3[0] = p[0].x;
            mat3[1] = p[0].y;
            mat3[2] = 1;
            mat3[3] = p[k1].x;
            mat3[4] = p[k1].y;
            mat3[5] = 1;
            mat3[6] = p[k2].x;
            mat3[7] = p[k2].y;
            mat3[8] = 1;

            this.matrix.setToMult(tempMat$3, this.matrix);
            this._projID++;
        }

        updateLocalTransform(lt)
        {
            if (this._projID !== 0)
            {
                if (this.reverseLocalOrder)
                {
                    // tilingSprite inside order
                    this.local.setToMultLegacy2(this.matrix, lt);
                }
                else
                {
                    // good order
                    this.local.setToMultLegacy(lt, this.matrix);
                }
            }
            else
            {
                this.local.copyFrom(lt);
            }
        }

        clear()
        {
            super.clear();
            this.matrix.identity();
            this.pivot.set(0, 0);
        }
    }

    function container2dWorldTransform()
    {
        return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
    }

    class Container2d extends display.Container
    {
        constructor()
        {
            super();
            this.proj = new Projection2d(this.transform);
        }

        

        toLocal(position, from, point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            if (from)
            {
                position = from.toGlobal(position, point, skipUpdate);
            }

            if (!skipUpdate)
            {
                this._recursivePostUpdateTransform();
            }

            if (step >= exports.TRANSFORM_STEP.PROJ)
            {
                if (!skipUpdate)
                {
                    this.displayObjectUpdateTransform();
                }
                if (this.proj.affine)
                {
                    return this.transform.worldTransform.applyInverse(position, point) ;
                }

                return this.proj.world.applyInverse(position, point) ;
            }

            if (this.parent)
            {
                point = this.parent.worldTransform.applyInverse(position, point) ;
            }
            else
            {
                point.x = position.x;
                point.y = position.y;
            }
            if (step === exports.TRANSFORM_STEP.NONE)
            {
                return point;
            }

            return this.transform.localTransform.applyInverse(point, point) ;
        }

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }
    }

    const container2dToLocal = Container2d.prototype.toLocal;

    class Mesh2d extends mesh.Mesh
    {
        static __initStatic() {this.defaultVertexShader =
            `precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTextureMatrix;

varying vec2 vTextureCoord;

void main(void)
{
gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);
gl_Position.z = 0.0;

vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
}
`;}
        static __initStatic2() {this.defaultFragmentShader = `
varying vec2 vTextureCoord;
uniform vec4 uColor;

uniform sampler2D uSampler;

void main(void)
{
gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;
}`;}
        constructor(geometry, shader, state, drawMode)
        {
            super(geometry, shader, state, drawMode);Mesh2d.prototype.__init.call(this);;
            this.proj = new Projection2d(this.transform);
        }

        __init() {this.vertexData2d = null;}
        

        calculateVertices()
        {
            if (this.proj._affine)
            {
                this.vertexData2d = null;
                super.calculateVertices();

                return;
            }

            const geometry = this.geometry ;
            const vertices = geometry.buffers[0].data;
            const thisAny = this ;

            if (geometry.vertexDirtyId === thisAny.vertexDirty && thisAny._transformID === thisAny.transform._worldID)
            {
                return;
            }

            thisAny._transformID = thisAny.transform._worldID;

            if (thisAny.vertexData.length !== vertices.length)
            {
                thisAny.vertexData = new Float32Array(vertices.length);
            }

            if (!this.vertexData2d || this.vertexData2d.length !== vertices.length * 3 / 2)
            {
                this.vertexData2d = new Float32Array(vertices.length * 3);
            }

            const wt = this.proj.world.mat3;

            const vertexData2d = this.vertexData2d;
            const vertexData = thisAny.vertexData;

            for (let i = 0; i < vertexData.length / 2; i++)
            {
                const x = vertices[(i * 2)];
                const y = vertices[(i * 2) + 1];

                const xx = (wt[0] * x) + (wt[3] * y) + wt[6];
                const yy = (wt[1] * x) + (wt[4] * y) + wt[7];
                const ww = (wt[2] * x) + (wt[5] * y) + wt[8];

                vertexData2d[i * 3] = xx;
                vertexData2d[(i * 3) + 1] = yy;
                vertexData2d[(i * 3) + 2] = ww;

                vertexData[(i * 2)] = xx / ww;
                vertexData[(i * 2) + 1] = yy / ww;
            }

            thisAny.vertexDirty = geometry.vertexDirtyId;
        }

        _renderDefault(renderer)
        {
            const shader = this.shader ;

            shader.alpha = this.worldAlpha;
            if (shader.update)
            {
                shader.update();
            }

            renderer.batch.flush();

            if ((shader ).program.uniformData.translationMatrix)
            {
                shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
            }

            // bind and sync uniforms..
            renderer.shader.bind(shader, false);

            // set state..
            renderer.state.set(this.state);

            // bind the geometry...
            renderer.geometry.bind(this.geometry, shader);

            // then render it
            renderer.geometry.draw(this.drawMode, this.size, this.start, (this.geometry ).instanceCount);
        }

        toLocal(position, from,
            point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            return container2dToLocal.call(this, position, from, point, skipUpdate, step);
        }

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }
    } Mesh2d.__initStatic(); Mesh2d.__initStatic2();

    class SimpleMesh2d extends Mesh2d
    {
        constructor(texture, vertices, uvs,
            indices, drawMode)
        {
            super(new mesh.MeshGeometry(vertices, uvs, indices),
                new mesh.MeshMaterial(texture, {
                    program: core.Program.from(Mesh2d.defaultVertexShader, Mesh2d.defaultFragmentShader),
                    pluginName: 'batch2d'
                }),
                null,
                drawMode);SimpleMesh2d.prototype.__init2.call(this);;

            (this.geometry.getBuffer('aVertexPosition') ).static = false;
        }

        __init2() {this.autoUpdate = true;}

        get vertices()
        {
            return this.geometry.getBuffer('aVertexPosition').data ;
        }
        set vertices(value)
        {
            this.geometry.getBuffer('aVertexPosition').data = value;
        }

         _render(renderer)
        {
            if (this.autoUpdate)
            {
                this.geometry.getBuffer('aVertexPosition').update();
            }

            (super._render )(renderer);
        }
    }

    /* eslint-disable no-mixed-operators */

    class Sprite2d extends sprite.Sprite
    {
        constructor(texture)
        {
            super(texture);Sprite2d.prototype.__init.call(this);;
            this.proj = new Projection2d(this.transform);
            this.pluginName = 'batch2d';
        }

        __init() {this.vertexData2d = null;}
        

        _calculateBounds()
        {
            this.calculateTrimmedVertices();
            this._bounds.addQuad((this ).vertexTrimmedData);
        }

        calculateVertices()
        {
            const texture = this._texture;
            const thisAny = this ;

            if (this.proj._affine)
            {
                this.vertexData2d = null;
                super.calculateVertices();

                return;
            }
            if (!this.vertexData2d)
            {
                this.vertexData2d = new Float32Array(12);
            }

            const wid = (this.transform )._worldID;
            const tuid = (texture )._updateID;

            if (thisAny._transformID === wid && this._textureID === tuid)
            {
                return;
            }
            // update texture UV here, because base texture can be changed without calling `_onTextureUpdate`
            if (this._textureID !== tuid)
            {
                (this ).uvs = (texture )._uvs.uvsFloat32;
            }

            thisAny._transformID = wid;
            this._textureID = tuid;

            const wt = this.proj.world.mat3;
            const vertexData2d = this.vertexData2d;
            const vertexData = this.vertexData;
            const trim = texture.trim;
            const orig = texture.orig;
            const anchor = this._anchor;

            let w0;
            let w1;
            let h0;
            let h1;

            if (trim)
            {
                w1 = trim.x - (anchor._x * orig.width);
                w0 = w1 + trim.width;

                h1 = trim.y - (anchor._y * orig.height);
                h0 = h1 + trim.height;
            }
            else
            {
                w1 = -anchor._x * orig.width;
                w0 = w1 + orig.width;

                h1 = -anchor._y * orig.height;
                h0 = h1 + orig.height;
            }

            vertexData2d[0] = (wt[0] * w1) + (wt[3] * h1) + wt[6];
            vertexData2d[1] = (wt[1] * w1) + (wt[4] * h1) + wt[7];
            vertexData2d[2] = (wt[2] * w1) + (wt[5] * h1) + wt[8];

            vertexData2d[3] = (wt[0] * w0) + (wt[3] * h1) + wt[6];
            vertexData2d[4] = (wt[1] * w0) + (wt[4] * h1) + wt[7];
            vertexData2d[5] = (wt[2] * w0) + (wt[5] * h1) + wt[8];

            vertexData2d[6] = (wt[0] * w0) + (wt[3] * h0) + wt[6];
            vertexData2d[7] = (wt[1] * w0) + (wt[4] * h0) + wt[7];
            vertexData2d[8] = (wt[2] * w0) + (wt[5] * h0) + wt[8];

            vertexData2d[9] = (wt[0] * w1) + (wt[3] * h0) + wt[6];
            vertexData2d[10] = (wt[1] * w1) + (wt[4] * h0) + wt[7];
            vertexData2d[11] = (wt[2] * w1) + (wt[5] * h0) + wt[8];

            vertexData[0] = vertexData2d[0] / vertexData2d[2];
            vertexData[1] = vertexData2d[1] / vertexData2d[2];

            vertexData[2] = vertexData2d[3] / vertexData2d[5];
            vertexData[3] = vertexData2d[4] / vertexData2d[5];

            vertexData[4] = vertexData2d[6] / vertexData2d[8];
            vertexData[5] = vertexData2d[7] / vertexData2d[8];

            vertexData[6] = vertexData2d[9] / vertexData2d[11];
            vertexData[7] = vertexData2d[10] / vertexData2d[11];
        }

        calculateTrimmedVertices()
        {
            if (this.proj._affine)
            {
                super.calculateTrimmedVertices();

                return;
            }

            const wid = (this.transform )._worldID;
            const tuid = (this._texture )._updateID;
            const thisAny = this ;

            if (!thisAny.vertexTrimmedData)
            {
                thisAny.vertexTrimmedData = new Float32Array(8);
            }
            else if (thisAny._transformTrimmedID === wid && this._textureTrimmedID === tuid)
            {
                return;
            }

            thisAny._transformTrimmedID = wid;
            this._textureTrimmedID = tuid;

            // lets do some special trim code!
            const texture = this._texture;
            const vertexData = thisAny.vertexTrimmedData;
            const orig = texture.orig;
            const w = (this ).tileProj ? this._width : orig.width;
            const h = (this ).tileProj ? this._height : orig.height;
            const anchor = this._anchor;

            // lets calculate the new untrimmed bounds..
            const wt = this.proj.world.mat3;

            const w1 = -anchor._x * w;
            const w0 = w1 + w;

            const h1 = -anchor._y * h;
            const h0 = h1 + h;

            let z = 1.0 / (wt[2] * w1 + wt[5] * h1 + wt[8]);

            vertexData[0] = z * ((wt[0] * w1) + (wt[3] * h1) + wt[6]);
            vertexData[1] = z * ((wt[1] * w1) + (wt[4] * h1) + wt[7]);

            z = 1.0 / (wt[2] * w0 + wt[5] * h1 + wt[8]);
            vertexData[2] = z * ((wt[0] * w0) + (wt[3] * h1) + wt[6]);
            vertexData[3] = z * ((wt[1] * w0) + (wt[4] * h1) + wt[7]);

            z = 1.0 / (wt[2] * w0 + wt[5] * h0 + wt[8]);
            vertexData[4] = z * ((wt[0] * w0) + (wt[3] * h0) + wt[6]);
            vertexData[5] = z * ((wt[1] * w0) + (wt[4] * h0) + wt[7]);

            z = 1.0 / (wt[2] * w1 + wt[5] * h0 + wt[8]);
            vertexData[6] = z * ((wt[0] * w1) + (wt[3] * h0) + wt[6]);
            vertexData[7] = z * ((wt[1] * w1) + (wt[4] * h0) + wt[7]);
        }

        toLocal(position, from, point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            return container2dToLocal.call(this, position, from, point, skipUpdate, step);
        }

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }
    }

    const tempTransform = new math.Transform();

    class TilingSprite2d extends spriteTiling.TilingSprite
    {
        constructor(texture, width, height)
        {
            super(texture, width, height);

            this.tileProj = new Projection2d(this.tileTransform);
            this.tileProj.reverseLocalOrder = true;
            this.proj = new Projection2d(this.transform);

            this.pluginName = 'tilingSprite2d';
            this.uvRespectAnchor = true;
        }

        
        

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }

        toLocal(position, from, point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            return container2dToLocal.call(this, position, from, point, skipUpdate, step);
        }

        _render(renderer)
        {
            // tweak our texture temporarily..
            const texture = this._texture;

            if (!texture || !texture.valid)
            {
                return;
            }

            // changed
            this.tileTransform.updateTransform(tempTransform);
            this.uvMatrix.update();

            renderer.batch.setObjectRenderer((renderer.plugins )[this.pluginName]);
            (renderer.plugins )[this.pluginName].render(this);
        }
    }

    function convertTo2d()
    {
        if (this.proj) return;
        this.proj = new Projection2d(this.transform);
        this.toLocal = Container2d.prototype.toLocal;
        Object.defineProperty(this, 'worldTransform', {
            get: container2dWorldTransform,
            enumerable: true,
            configurable: true
        });
    }

    display.Container.prototype.convertTo2d = convertTo2d;

    sprite.Sprite.prototype.convertTo2d = function convertTo2d()
    {
        if (this.proj) return;
        this.calculateVertices = Sprite2d.prototype.calculateVertices;
        this.calculateTrimmedVertices = Sprite2d.prototype.calculateTrimmedVertices;
        this._calculateBounds = Sprite2d.prototype._calculateBounds;
        this.pluginName = 'batch2d';
        convertTo2d.call(this);
    };

    display.Container.prototype.convertSubtreeTo2d = function convertTo2d()
    {
        this.convertTo2d();
        for (let i = 0; i < this.children.length; i++)
        {
            this.children[i].convertSubtreeTo2d();
        }
    };

    meshExtras.SimpleMesh.prototype.convertTo2d
        = meshExtras.SimpleRope.prototype.convertTo2d
            = function convertTo2d()
            {
                if (this.proj) return;
                this.calculateVertices = Mesh2d.prototype.calculateVertices;
                this._renderDefault = Mesh2d.prototype._renderDefault;
                if (this.material.pluginName !== 'batch2d')
                {
                    this.material = new mesh.MeshMaterial(this.material.texture, {
                        program: core.Program.from(Mesh2d.defaultVertexShader, Mesh2d.defaultFragmentShader),
                        pluginName: 'batch2d'
                    });
                }
                convertTo2d.call(this);
            };

    spriteTiling.TilingSprite.prototype.convertTo2d = function convertTo2d()
    {
        if (this.proj) return;

        this.tileProj = new Projection2d(this.tileTransform);
        this.tileProj.reverseLocalOrder = true;
        this.uvRespectAnchor = true;

        this.calculateTrimmedVertices = Sprite2d.prototype.calculateTrimmedVertices;
        this._calculateBounds = Sprite2d.prototype._calculateBounds;
        this._render = TilingSprite2d.prototype._render;

        this.pluginName = 'tilingSprite2d';
        convertTo2d.call(this);
    };

    class Text2d extends text.Text
    {
        constructor(text, style, canvas)
        {
            super(text, style, canvas);Text2d.prototype.__init.call(this);;
            this.proj = new Projection2d(this.transform);
            this.pluginName = 'batch2d';
        }

        
        __init() {this.vertexData2d = null;}

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }
    }

    Text2d.prototype.calculateVertices = Sprite2d.prototype.calculateVertices;
    Text2d.prototype.calculateTrimmedVertices = Sprite2d.prototype.calculateTrimmedVertices;
    (Text2d.prototype )._calculateBounds = Sprite2d.prototype._calculateBounds;

    const spriteMaskVert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 otherMatrix;

varying vec3 vMaskCoord;
varying vec2 vTextureCoord;

void main(void)
{
gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

vTextureCoord = aTextureCoord;
vMaskCoord = otherMatrix * vec3( aTextureCoord, 1.0);
}
`;
    const spriteMaskFrag = `
varying vec3 vMaskCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mask;
uniform float alpha;
uniform vec4 maskClamp;

void main(void)
{
vec2 uv = vMaskCoord.xy / vMaskCoord.z;

float clip = step(3.5,
    step(maskClamp.x, uv.x) +
    step(maskClamp.y, uv.y) +
    step(uv.x, maskClamp.z) +
    step(uv.y, maskClamp.w));

vec4 original = texture2D(uSampler, vTextureCoord);
vec4 masky = texture2D(mask, uv);

original *= (masky.r * masky.a * alpha * clip);

gl_FragColor = original;
}
`;

    const tempMat$2 = new Matrix2d();

    class SpriteMaskFilter2d extends core.Filter
    {
        constructor(sprite)
        {
            super(spriteMaskVert, spriteMaskFrag);SpriteMaskFilter2d.prototype.__init.call(this);;

            sprite.renderable = false;

            this.maskSprite = sprite;
        }

        
        __init() {this.maskMatrix = new Matrix2d();}

        apply(filterManager, input, output,
            clearMode)
        {
            const maskSprite = this.maskSprite;
            const tex = this.maskSprite.texture;

            if (!tex.valid)
            {
                return;
            }
            if (!tex.uvMatrix)
            {
                // margin = 0.0, let it bleed a bit, shader code becomes easier
                // assuming that atlas textures were made with 1-pixel padding
                tex.uvMatrix = new core.TextureMatrix(tex, 0.0);
            }
            tex.uvMatrix.update();

            this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0.0 : 1.0;
            this.uniforms.mask = maskSprite.texture;
            this.uniforms.otherMatrix = SpriteMaskFilter2d.calculateSpriteMatrix(input, this.maskMatrix, maskSprite)
                .prepend(tex.uvMatrix.mapCoord);
            this.uniforms.alpha = maskSprite.worldAlpha;
            this.uniforms.maskClamp = tex.uvMatrix.uClampFrame;

            filterManager.applyFilter(this, input, output, clearMode);
        }

        static calculateSpriteMatrix(input, mappedMatrix, sprite)
        {
            const proj = (sprite ).proj ;

            const filterArea = (input ).filterFrame;

            // eslint-disable-next-line max-len
            const worldTransform = proj && !proj._affine ? proj.world.copyTo2dOr3d(tempMat$2) : tempMat$2.copyFrom(sprite.transform.worldTransform);
            const texture = sprite.texture.orig;

            mappedMatrix.set(input.width, 0, 0, input.height, filterArea.x, filterArea.y);
            worldTransform.invert();
            mappedMatrix.setToMult(worldTransform, mappedMatrix);
            mappedMatrix.scaleAndTranslate(1.0 / texture.width, 1.0 / texture.height,
                sprite.anchor.x, sprite.anchor.y);

            return mappedMatrix;
        }
    }

    core.MaskSystem.prototype.pushSpriteMask = function pushSpriteMask(maskData)
    {
        const { maskObject } = maskData;
        const target = (maskData )._target;

        let alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

        if (!alphaMaskFilter)
        {
            alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter2d(maskObject )];
        }

        alphaMaskFilter[0].resolution = this.renderer.resolution;
        alphaMaskFilter[0].maskSprite = maskObject;

        const stashFilterArea = target.filterArea;

        target.filterArea = maskObject.getBounds(true);
        this.renderer.filter.push(target, alphaMaskFilter);
        target.filterArea = stashFilterArea;

        this.alphaMaskIndex++;
    };

    core.Renderer.registerPlugin('tilingSprite2d', TilingSprite2dRenderer );

    class Point3d extends math.Point
    {
        // TODO: pixi 6.1.0 global mixin
        
        constructor(x, y, z)
        {
            super(x, y);
            this.z = z;
        }

        set(x, y, z)
        {
            this.x = x || 0;
            this.y = (y === undefined) ? this.x : (y || 0);
            this.z = (y === undefined) ? this.x : (z || 0);

            return this;
        }

        copyFrom(p)
        {
            // TODO: pixi 6.1.0 global mixin
            this.set(p.x, p.y, (p ).z || 0);

            return this;
        }

        copyTo(p)
        {
            (p ).set(this.x, this.y, this.z);

            return p;
        }
    }

    class ObservablePoint3d extends math.ObservablePoint
    {constructor(...args) { super(...args); ObservablePoint3d.prototype.__init.call(this); }
        __init() {this._z = 0;}

        get z()
        {
            return this._z;
        }

        set z(value)
        {
            if (this._z !== value)
            {
                this._z = value;
                this.cb.call(this.scope);
            }
        }

        set(x, y, z)
        {
            const _x = x || 0;
            const _y = (y === undefined) ? _x : (y || 0);
            const _z = (y === undefined) ? _x : (z || 0);

            if (this._x !== _x || this._y !== _y || this._z !== _z)
            {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this.cb.call(this.scope);
            }

            return this;
        }

        copyFrom(p)
        {
            // TODO: pixi 6.1.0 global mixin
            this.set(p.x, p.y, (p ).z || 0);

            return this;
        }

        copyTo(p)
        {
            (p ).set(this._x, this._y, this._z);

            return p;
        }
    }

    class Euler
    {
        constructor(x, y, z)
        {;Euler.prototype.__init.call(this);Euler.prototype.__init2.call(this);Euler.prototype.__init3.call(this);
            /**
             * @member {number}
             * @default 0
             */
            this._x = x || 0;

            /**
             * @member {number}
             * @default 0
             */
            this._y = y || 0;

            /**
             * @member {number}
             * @default 0
             */
            this._z = z || 0;

            this.quaternion = new Float64Array(4);
            this.quaternion[3] = 1;

            this.update();
        }

        __init() {this._quatUpdateId = -1;}
        __init2() {this._quatDirtyId = 0;}

        

        
        
        
        __init3() {this._sign = 1;}

        get x()
        {
            return this._x;
        }

        set x(value)
        {
            if (this._x !== value)
            {
                this._x = value;
                this._quatDirtyId++;
            }
        }

        get y()
        {
            return this._y;
        }

        set y(value)
        {
            if (this._y !== value)
            {
                this._y = value;
                this._quatDirtyId++;
            }
        }

        get z()
        {
            return this._z;
        }

        set z(value)
        {
            if (this._z !== value)
            {
                this._z = value;
                this._quatDirtyId++;
            }
        }

        get pitch()
        {
            return this._x;
        }

        set pitch(value)
        {
            if (this._x !== value)
            {
                this._x = value;
                this._quatDirtyId++;
            }
        }

        get yaw()
        {
            return this._y;
        }

        set yaw(value)
        {
            if (this._y !== value)
            {
                this._y = value;
                this._quatDirtyId++;
            }
        }

        get roll()
        {
            return this._z;
        }

        set roll(value)
        {
            if (this._z !== value)
            {
                this._z = value;
                this._quatDirtyId++;
            }
        }

        set(x, y, z)
        {
            const _x = x || 0;
            const _y = y || 0;
            const _z = z || 0;

            if (this._x !== _x || this._y !== _y || this._z !== _z)
            {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
            }
        }

        copyFrom(euler)
        {
            const _x = euler.x;
            const _y = euler.y;
            const _z = euler.z;

            if (this._x !== _x || this._y !== _y || this._z !== _z)
            {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
            }

            return this;
        }

        copyTo(p)
        {
            p.set(this._x, this._y, this._z);

            return p;
        }

        equals(euler)
        {
            return this._x === euler.x
                && this._y === euler.y
                && this._z === euler.z;
        }

        clone()
        {
            return new Euler(this._x, this._y, this._z);
        }

        update()
        {
            if (this._quatUpdateId === this._quatDirtyId)
            {
                return false;
            }
            this._quatUpdateId = this._quatDirtyId;

            const c1 = Math.cos(this._x / 2);
            const c2 = Math.cos(this._y / 2);
            const c3 = Math.cos(this._z / 2);

            const s = this._sign;
            const s1 = s * Math.sin(this._x / 2);
            const s2 = s * Math.sin(this._y / 2);
            const s3 = s * Math.sin(this._z / 2);

            const q = this.quaternion;

            q[0] = (s1 * c2 * c3) + (c1 * s2 * s3);
            q[1] = (c1 * s2 * c3) - (s1 * c2 * s3);
            q[2] = (c1 * c2 * s3) + (s1 * s2 * c3);
            q[3] = (c1 * c2 * c3) - (s1 * s2 * s3);

            return true;
        }
    }

    /**
     * The Euler angles, order is YZX. Except for projections (camera.lookEuler), its reversed XZY
     * @class
     * @namespace PIXI.projection
     * @param x pitch
     * @param y yaw
     * @param z roll
     * @constructor
     */

    class ObservableEuler
    {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        constructor( cb,  scope, x, y, z)
        {;this.cb = cb;this.scope = scope;ObservableEuler.prototype.__init.call(this);ObservableEuler.prototype.__init2.call(this);ObservableEuler.prototype.__init3.call(this);
            /**
             * @member {number}
             * @default 0
             */
            this._x = x || 0;

            /**
             * @member {number}
             * @default 0
             */
            this._y = y || 0;

            /**
             * @member {number}
             * @default 0
             */
            this._z = z || 0;

            this.quaternion = new Float64Array(4);
            this.quaternion[3] = 1;

            this.update();
        }

        __init() {this._quatUpdateId = -1;}
        __init2() {this._quatDirtyId = 0;}

        

        
        
        
        __init3() {this._sign = 1;}

        get x()
        {
            return this._x;
        }

        set x(value)
        {
            if (this._x !== value)
            {
                this._x = value;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        }

        get y()
        {
            return this._y;
        }

        set y(value)
        {
            if (this._y !== value)
            {
                this._y = value;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        }

        get z()
        {
            return this._z;
        }

        set z(value)
        {
            if (this._z !== value)
            {
                this._z = value;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        }

        get pitch()
        {
            return this._x;
        }

        set pitch(value)
        {
            if (this._x !== value)
            {
                this._x = value;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        }

        get yaw()
        {
            return this._y;
        }

        set yaw(value)
        {
            if (this._y !== value)
            {
                this._y = value;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        }

        get roll()
        {
            return this._z;
        }

        set roll(value)
        {
            if (this._z !== value)
            {
                this._z = value;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        }

        set(x, y, z)
        {
            const _x = x || 0;
            const _y = y || 0;
            const _z = z || 0;

            if (this._x !== _x || this._y !== _y || this._z !== _z)
            {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }

            return this;
        }

        copyFrom(euler)
        {
            const _x = euler.x;
            const _y = euler.y;
            const _z = euler.z;

            if (this._x !== _x || this._y !== _y || this._z !== _z)
            {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }

            return this;
        }

        copyTo(p)
        {
            p.set(this._x, this._y, this._z);

            return p;
        }

        equals(euler)
        {
            return this._x === euler.x
                && this._y === euler.y
                && this._z === euler.z;
        }

        clone()
        {
            return new Euler(this._x, this._y, this._z);
        }

        update()
        {
            if (this._quatUpdateId === this._quatDirtyId)
            {
                return false;
            }
            this._quatUpdateId = this._quatDirtyId;

            const c1 = Math.cos(this._x / 2);
            const c2 = Math.cos(this._y / 2);
            const c3 = Math.cos(this._z / 2);

            const s = this._sign;
            const s1 = s * Math.sin(this._x / 2);
            const s2 = s * Math.sin(this._y / 2);
            const s3 = s * Math.sin(this._z / 2);

            const q = this.quaternion;

            q[0] = (s1 * c2 * c3) + (c1 * s2 * s3);
            q[1] = (c1 * s2 * c3) - (s1 * c2 * s3);
            q[2] = (c1 * c2 * s3) + (s1 * s2 * c3);
            q[3] = (c1 * c2 * c3) - (s1 * s2 * s3);

            return true;
        }
    }

    const mat4id = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];

    class Matrix3d
    {
        /**
         * A default (identity) matrix
         *
         * @static
         * @const
         */
        static  __initStatic() {this.IDENTITY = new Matrix3d();}

        /**
         * A temp matrix
         *
         * @static
         * @const
         */
        static  __initStatic2() {this.TEMP_MATRIX = new Matrix3d();}

        /**
         * mat4 implementation through array of 16 elements
         */
        

        __init() {this.floatArray = null;}

        __init2() {this._dirtyId = 0;}
        __init3() {this._updateId = -1;}
        __init4() {this._mat4inv = null;}
        __init5() {this.cacheInverse = false;}

        constructor(backingArray)
        {;Matrix3d.prototype.__init.call(this);Matrix3d.prototype.__init2.call(this);Matrix3d.prototype.__init3.call(this);Matrix3d.prototype.__init4.call(this);Matrix3d.prototype.__init5.call(this);
            this.mat4 = new Float64Array(backingArray || mat4id);
        }

        get a()
        {
            return this.mat4[0] / this.mat4[15];
        }

        set a(value)
        {
            this.mat4[0] = value * this.mat4[15];
        }

        get b()
        {
            return this.mat4[1] / this.mat4[15];
        }

        set b(value)
        {
            this.mat4[1] = value * this.mat4[15];
        }

        get c()
        {
            return this.mat4[4] / this.mat4[15];
        }

        set c(value)
        {
            this.mat4[4] = value * this.mat4[15];
        }

        get d()
        {
            return this.mat4[5] / this.mat4[15];
        }

        set d(value)
        {
            this.mat4[5] = value * this.mat4[15];
        }

        get tx()
        {
            return this.mat4[12] / this.mat4[15];
        }

        set tx(value)
        {
            this.mat4[12] = value * this.mat4[15];
        }

        get ty()
        {
            return this.mat4[13] / this.mat4[15];
        }

        set ty(value)
        {
            this.mat4[13] = value * this.mat4[15];
        }

        set(a, b, c, d, tx, ty)
        {
            const mat4 = this.mat4;

            mat4[0] = a;
            mat4[1] = b;
            mat4[2] = 0;
            mat4[3] = 0;
            mat4[4] = c;
            mat4[5] = d;
            mat4[6] = 0;
            mat4[7] = 0;
            mat4[8] = 0;
            mat4[9] = 0;
            mat4[10] = 1;
            mat4[11] = 0;
            mat4[12] = tx;
            mat4[13] = ty;
            mat4[14] = 0;
            mat4[15] = 1;

            return this;
        }

        toArray(transpose, out)
        {
            if (!this.floatArray)
            {
                this.floatArray = new Float32Array(9);
            }

            const array = out || this.floatArray;
            const mat3 = this.mat4;

            if (transpose)
            {
                array[0] = mat3[0];
                array[1] = mat3[1];
                array[2] = mat3[3];
                array[3] = mat3[4];
                array[4] = mat3[5];
                array[5] = mat3[7];
                array[6] = mat3[12];
                array[7] = mat3[13];
                array[8] = mat3[15];
            }
            else
            {
                // this branch is NEVER USED in pixi
                array[0] = mat3[0];
                array[1] = mat3[4];
                array[2] = mat3[12];
                array[3] = mat3[2];
                array[4] = mat3[6];
                array[5] = mat3[13];
                array[6] = mat3[3];
                array[7] = mat3[7];
                array[8] = mat3[15];
            }

            return array;
        }

        setToTranslation(tx, ty, tz)
        {
            const mat4 = this.mat4;

            mat4[0] = 1;
            mat4[1] = 0;
            mat4[2] = 0;
            mat4[3] = 0;

            mat4[4] = 0;
            mat4[5] = 1;
            mat4[6] = 0;
            mat4[7] = 0;

            mat4[8] = 0;
            mat4[9] = 0;
            mat4[10] = 1;
            mat4[11] = 0;

            mat4[12] = tx;
            mat4[13] = ty;
            mat4[14] = tz;
            mat4[15] = 1;
        }

        // eslint-disable-next-line max-len
        setToRotationTranslationScale(quat, tx, ty, tz, sx, sy, sz)
        {
            const out = this.mat4;

            const x = quat[0]; const y = quat[1]; const z = quat[2]; const
                w = quat[3];
            const x2 = x + x;
            const y2 = y + y;
            const z2 = z + z;

            const xx = x * x2;
            const xy = x * y2;
            const xz = x * z2;
            const yy = y * y2;
            const yz = y * z2;
            const zz = z * z2;
            const wx = w * x2;
            const wy = w * y2;
            const wz = w * z2;

            out[0] = (1 - (yy + zz)) * sx;
            out[1] = (xy + wz) * sx;
            out[2] = (xz - wy) * sx;
            out[3] = 0;
            out[4] = (xy - wz) * sy;
            out[5] = (1 - (xx + zz)) * sy;
            out[6] = (yz + wx) * sy;
            out[7] = 0;
            out[8] = (xz + wy) * sz;
            out[9] = (yz - wx) * sz;
            out[10] = (1 - (xx + yy)) * sz;
            out[11] = 0;
            out[12] = tx;
            out[13] = ty;
            out[14] = tz;
            out[15] = 1;

            return out;
        }

        apply(pos, newPos)
        {
            newPos = newPos || new Point3d();

            const mat4 = this.mat4;
            const x = pos.x;
            const y = pos.y;
            // TODO: pixi 6.1.0 global mixin
            const z = (pos ).z || 0;

            // TODO: apply for 2d point

            const w = 1.0 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);

            newPos.x = w * (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]);
            newPos.y = w * (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]);
            // TODO: pixi 6.1.0 global mixin
            (newPos ).z = w * (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]);

            return newPos;
        }

        translate(tx, ty, tz)
        {
            const a = this.mat4;

            a[12] = a[0] * tx + a[4] * ty + a[8] * tz + a[12];
            a[13] = a[1] * tx + a[5] * ty + a[9] * tz + a[13];
            a[14] = a[2] * tx + a[6] * ty + a[10] * tz + a[14];
            a[15] = a[3] * tx + a[7] * ty + a[11] * tz + a[15];

            return this;
        }

        scale(x, y, z)
        {
            const mat4 = this.mat4;

            mat4[0] *= x;
            mat4[1] *= x;
            mat4[2] *= x;
            mat4[3] *= x;

            mat4[4] *= y;
            mat4[5] *= y;
            mat4[6] *= y;
            mat4[7] *= y;

            if (z !== undefined)
            {
                mat4[8] *= z;
                mat4[9] *= z;
                mat4[10] *= z;
                mat4[11] *= z;
            }

            return this;
        }

        scaleAndTranslate(scaleX, scaleY, scaleZ, tx, ty, tz)
        {
            const mat4 = this.mat4;

            mat4[0] = scaleX * mat4[0] + tx * mat4[3];
            mat4[1] = scaleY * mat4[1] + ty * mat4[3];
            mat4[2] = scaleZ * mat4[2] + tz * mat4[3];

            mat4[4] = scaleX * mat4[4] + tx * mat4[7];
            mat4[5] = scaleY * mat4[5] + ty * mat4[7];
            mat4[6] = scaleZ * mat4[6] + tz * mat4[7];

            mat4[8] = scaleX * mat4[8] + tx * mat4[11];
            mat4[9] = scaleY * mat4[9] + ty * mat4[11];
            mat4[10] = scaleZ * mat4[10] + tz * mat4[11];

            mat4[12] = scaleX * mat4[12] + tx * mat4[15];
            mat4[13] = scaleY * mat4[13] + ty * mat4[15];
            mat4[14] = scaleZ * mat4[14] + tz * mat4[15];
        }

        // TODO: remove props
        applyInverse(pos, newPos)
        {
            newPos = (newPos || new Point3d()) ;
            if (!this._mat4inv)
            {
                this._mat4inv = new Float64Array(16);
            }

            const mat4 = this._mat4inv;
            const a = this.mat4;
            const x = pos.x;
            const y = pos.y;
            // TODO: pixi 6.1.0 global mixin
            let z = (pos ).z || 0;

            if (!this.cacheInverse || this._updateId !== this._dirtyId)
            {
                this._updateId = this._dirtyId;
                Matrix3d.glMatrixMat4Invert(mat4, a);
            }

            const w1 = 1.0 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);
            const x1 = w1 * (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]);
            const y1 = w1 * (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]);
            const z1 = w1 * (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]);

            z += 1.0;

            const w2 = 1.0 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);
            const x2 = w2 * (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]);
            const y2 = w2 * (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]);
            const z2 = w2 * (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]);

            if (Math.abs(z1 - z2) < 1e-10)
            {
                (newPos ).set(NaN, NaN, 0);
            }

            const alpha = (0 - z1) / (z2 - z1);

            (newPos ).set((x2 - x1) * alpha + x1, (y2 - y1) * alpha + y1, 0.0);

            return newPos;
        }

        invert()
        {
            Matrix3d.glMatrixMat4Invert(this.mat4, this.mat4);

            return this;
        }

        invertCopyTo(matrix)
        {
            if (!this._mat4inv)
            {
                this._mat4inv = new Float64Array(16);
            }

            const mat4 = this._mat4inv;
            const a = this.mat4;

            if (!this.cacheInverse || this._updateId !== this._dirtyId)
            {
                this._updateId = this._dirtyId;
                Matrix3d.glMatrixMat4Invert(mat4, a);
            }

            matrix.mat4.set(mat4);
        }

        identity()
        {
            const mat3 = this.mat4;

            mat3[0] = 1;
            mat3[1] = 0;
            mat3[2] = 0;
            mat3[3] = 0;

            mat3[4] = 0;
            mat3[5] = 1;
            mat3[6] = 0;
            mat3[7] = 0;

            mat3[8] = 0;
            mat3[9] = 0;
            mat3[10] = 1;
            mat3[11] = 0;

            mat3[12] = 0;
            mat3[13] = 0;
            mat3[14] = 0;
            mat3[15] = 1;

            return this;
        }

        clone()
        {
            return new Matrix3d(this.mat4);
        }

        copyTo3d(matrix)
        {
            const mat3 = this.mat4;
            const ar2 = matrix.mat4;

            ar2[0] = mat3[0];
            ar2[1] = mat3[1];
            ar2[2] = mat3[2];
            ar2[3] = mat3[3];
            ar2[4] = mat3[4];
            ar2[5] = mat3[5];
            ar2[6] = mat3[6];
            ar2[7] = mat3[7];
            ar2[8] = mat3[8];

            return matrix;
        }

        copyTo2d(matrix)
        {
            const mat3 = this.mat4;
            const ar2 = matrix.mat3;

            ar2[0] = mat3[0];
            ar2[1] = mat3[1];
            ar2[2] = mat3[3];
            ar2[3] = mat3[4];
            ar2[4] = mat3[5];
            ar2[5] = mat3[7];
            ar2[6] = mat3[12];
            ar2[7] = mat3[13];
            ar2[8] = mat3[15];

            return matrix;
        }

        copyTo2dOr3d(matrix)
        {
            if (matrix instanceof Matrix2d)
            {
                return this.copyTo2d(matrix) ;
            }

            return this.copyTo3d(matrix ) ;
        }

        /**
         * legacy method, change the values of given pixi matrix
         * @param matrix
         * @param affine
         * @param preserveOrientation
         * @return matrix
         */
        copyTo(matrix, affine, preserveOrientation)
        {
            const mat3 = this.mat4;
            const d = 1.0 / mat3[15];
            const tx = mat3[12] * d; const
                ty = mat3[13] * d;

            matrix.a = (mat3[0] - mat3[3] * tx) * d;
            matrix.b = (mat3[1] - mat3[3] * ty) * d;
            matrix.c = (mat3[4] - mat3[7] * tx) * d;
            matrix.d = (mat3[5] - mat3[7] * ty) * d;
            matrix.tx = tx;
            matrix.ty = ty;

            if (affine >= 2)
            {
                let D = matrix.a * matrix.d - matrix.b * matrix.c;

                if (!preserveOrientation)
                {
                    D = Math.abs(D);
                }
                if (affine === exports.AFFINE.POINT)
                {
                    if (D > 0)
                    {
                        D = 1;
                    }
                    else D = -1;
                    matrix.a = D;
                    matrix.b = 0;
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === exports.AFFINE.AXIS_X)
                {
                    D /= Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d);
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === exports.AFFINE.AXIS_Y)
                {
                    D /= Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c);
                    matrix.a = D;
                    matrix.c = 0;
                }
            }

            return matrix;
        }

        /**
         * legacy method, change the values of given pixi matrix
         * @param matrix
         * @return
         */
        copyFrom(matrix)
        {
            const mat3 = this.mat4;

            mat3[0] = matrix.a;
            mat3[1] = matrix.b;
            mat3[2] = 0;
            mat3[3] = 0;

            mat3[4] = matrix.c;
            mat3[5] = matrix.d;
            mat3[6] = 0;
            mat3[7] = 0;

            mat3[8] = 0;
            mat3[9] = 0;
            mat3[10] = 1;
            mat3[11] = 0;

            mat3[12] = matrix.tx;
            mat3[13] = matrix.ty;
            mat3[14] = 0;
            mat3[15] = 1;

            this._dirtyId++;

            return this;
        }

        setToMultLegacy(pt, lt)
        {
            const out = this.mat4;
            const b = lt.mat4;

            const a00 = pt.a; const a01 = pt.b;
            const a10 = pt.c; const a11 = pt.d;
            const a30 = pt.tx; const
                a31 = pt.ty;

            let b0 = b[0]; let b1 = b[1]; let b2 = b[2]; let
                b3 = b[3];

            out[0] = b0 * a00 + b1 * a10 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b3 * a31;
            out[2] = b2;
            out[3] = b3;

            b0 = b[4];
            b1 = b[5];
            b2 = b[6];
            b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b3 * a31;
            out[6] = b2;
            out[7] = b3;

            b0 = b[8];
            b1 = b[9];
            b2 = b[10];
            b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b3 * a31;
            out[10] = b2;
            out[11] = b3;

            b0 = b[12];
            b1 = b[13];
            b2 = b[14];
            b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b3 * a31;
            out[14] = b2;
            out[15] = b3;

            this._dirtyId++;

            return this;
        }

        setToMultLegacy2(pt, lt)
        {
            const out = this.mat4;
            const a = pt.mat4;

            const a00 = a[0]; const a01 = a[1]; const a02 = a[2]; const
                a03 = a[3];
            const a10 = a[4]; const a11 = a[5]; const a12 = a[6]; const
                a13 = a[7];

            const b00 = lt.a; const b01 = lt.b;
            const b10 = lt.c; const b11 = lt.d;
            const b30 = lt.tx; const
                b31 = lt.ty;

            out[0] = b00 * a00 + b01 * a10;
            out[1] = b00 * a01 + b01 * a11;
            out[2] = b00 * a02 + b01 * a12;
            out[3] = b00 * a03 + b01 * a13;

            out[4] = b10 * a00 + b11 * a10;
            out[5] = b10 * a01 + b11 * a11;
            out[6] = b10 * a02 + b11 * a12;
            out[7] = b10 * a03 + b11 * a13;

            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];

            out[12] = b30 * a00 + b31 * a10 + a[12];
            out[13] = b30 * a01 + b31 * a11 + a[13];
            out[14] = b30 * a02 + b31 * a12 + a[14];
            out[15] = b30 * a03 + b31 * a13 + a[15];

            this._dirtyId++;

            return this;
        }

        // that's transform multiplication we use
        setToMult(pt, lt)
        {
            Matrix3d.glMatrixMat4Multiply(this.mat4, pt.mat4, lt.mat4);

            this._dirtyId++;

            return this;
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        prepend(lt)
        {
            if (lt.mat4)
            {
                this.setToMult(lt, this);
            }
            else
            {
                this.setToMultLegacy(lt, this);
            }
        }

        static glMatrixMat4Invert(out, a)
        {
            const a00 = a[0]; const a01 = a[1]; const a02 = a[2]; const
                a03 = a[3];
            const a10 = a[4]; const a11 = a[5]; const a12 = a[6]; const
                a13 = a[7];
            const a20 = a[8]; const a21 = a[9]; const a22 = a[10]; const
                a23 = a[11];
            const a30 = a[12]; const a31 = a[13]; const a32 = a[14]; const
                a33 = a[15];

            const b00 = a00 * a11 - a01 * a10;
            const b01 = a00 * a12 - a02 * a10;
            const b02 = a00 * a13 - a03 * a10;
            const b03 = a01 * a12 - a02 * a11;
            const b04 = a01 * a13 - a03 * a11;
            const b05 = a02 * a13 - a03 * a12;
            const b06 = a20 * a31 - a21 * a30;
            const b07 = a20 * a32 - a22 * a30;
            const b08 = a20 * a33 - a23 * a30;
            const b09 = a21 * a32 - a22 * a31;
            const b10 = a21 * a33 - a23 * a31;
            const b11 = a22 * a33 - a23 * a32;

            // Calculate the determinant
            let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det)
            {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

            return out;
        }

        static glMatrixMat4Multiply(out, a, b)
        {
            const a00 = a[0]; const a01 = a[1]; const a02 = a[2]; const
                a03 = a[3];
            const a10 = a[4]; const a11 = a[5]; const a12 = a[6]; const
                a13 = a[7];
            const a20 = a[8]; const a21 = a[9]; const a22 = a[10]; const
                a23 = a[11];
            const a30 = a[12]; const a31 = a[13]; const a32 = a[14]; const
                a33 = a[15];

            // Cache only the current line of the second matrix
            let b0 = b[0]; let b1 = b[1]; let b2 = b[2]; let
                b3 = b[3];

            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[4];
            b1 = b[5];
            b2 = b[6];
            b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[8];
            b1 = b[9];
            b2 = b[10];
            b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[12];
            b1 = b[13];
            b2 = b[14];
            b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            return out;
        }
    } Matrix3d.__initStatic(); Matrix3d.__initStatic2();

    const tempMat$1 = new Matrix3d();

    class Projection3d extends LinearProjection
    {
        constructor(legacy, enable)
        {
            super(legacy, enable);Projection3d.prototype.__init.call(this);Projection3d.prototype.__init2.call(this);Projection3d.prototype.__init3.call(this);Projection3d.prototype.__init4.call(this);Projection3d.prototype.__init5.call(this);Projection3d.prototype.__init6.call(this);;
            this.local = new Matrix3d();
            this.world = new Matrix3d();

            this.local.cacheInverse = true;
            this.world.cacheInverse = true;

            this.position._z = 0;
            this.scale._z = 1;
            this.pivot._z = 0;
        }

        __init() {this.cameraMatrix = null;}

        __init2() {this._cameraMode = false;}

        get cameraMode()
        {
            return this._cameraMode;
        }

        set cameraMode(value)
        {
            if (this._cameraMode === value)
            {
                return;
            }
            this._cameraMode = value;

            this.euler._sign = this._cameraMode ? -1 : 1;
            this.euler._quatDirtyId++;

            if (value)
            {
                this.cameraMatrix = new Matrix3d();
            }
        }

        __init3() {this.position = new ObservablePoint3d(this.onChange, this, 0, 0);}
        __init4() {this.scale = new ObservablePoint3d(this.onChange, this, 1, 1);}
        __init5() {this.euler = new ObservableEuler(this.onChange, this, 0, 0, 0);}
        __init6() {this.pivot = new ObservablePoint3d(this.onChange, this, 0, 0);}

        onChange()
        {
            this._projID++;
        }

        clear()
        {
            if (this.cameraMatrix)
            {
                this.cameraMatrix.identity();
            }
            this.position.set(0, 0, 0);
            this.scale.set(1, 1, 1);
            this.euler.set(0, 0, 0);
            this.pivot.set(0, 0, 0);
            super.clear();
        }

        updateLocalTransform(lt)
        {
            if (this._projID === 0)
            {
                this.local.copyFrom(lt);

                return;
            }
            const matrix = this.local;
            const euler = this.euler;
            const pos = this.position;
            const scale = this.scale;
            const pivot = this.pivot;

            euler.update();

            if (!this.cameraMode)
            {
                matrix.setToRotationTranslationScale(euler.quaternion, pos._x, pos._y, pos._z, scale._x, scale._y, scale._z);
                matrix.translate(-pivot._x, -pivot._y, -pivot._z);
                matrix.setToMultLegacy(lt, matrix);

                return;
            }

            matrix.setToMultLegacy(lt, this.cameraMatrix);
            matrix.translate(pivot._x, pivot._y, pivot._z);
            matrix.scale(1.0 / scale._x, 1.0 / scale._y, 1.0 / scale._z);
            tempMat$1.setToRotationTranslationScale(euler.quaternion, 0, 0, 0, 1, 1, 1);
            matrix.setToMult(matrix, tempMat$1);
            matrix.translate(-pos._x, -pos._y, -pos._z);

            this.local._dirtyId++;
        }
    }

    /* eslint-disable no-mixed-operators */


    function container3dWorldTransform()
    {
        return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
    }












    class Container3d extends display.Container 
    {
        constructor()
        {
            super();
            this.proj = new Projection3d(this.transform);
        }

        

        isFrontFace(forceUpdate = false)
        {
            if (forceUpdate)
            {
                this._recursivePostUpdateTransform();
                this.displayObjectUpdateTransform();
            }

            const mat = this.proj.world.mat4;
            const dx1 = mat[0] * mat[15] - mat[3] * mat[12];
            const dy1 = mat[1] * mat[15] - mat[3] * mat[13];
            const dx2 = mat[4] * mat[15] - mat[7] * mat[12];
            const dy2 = mat[5] * mat[15] - mat[7] * mat[13];

            return dx1 * dy2 - dx2 * dy1 > 0;
        }

        /**
         * returns depth from 0 to 1
         *
         * @param {boolean} forceUpdate whether to force matrix updates
         * @returns {number} depth
         */
        getDepth(forceUpdate = false)
        {
            if (forceUpdate)
            {
                this._recursivePostUpdateTransform();
                this.displayObjectUpdateTransform();
            }

            const mat4 = this.proj.world.mat4;

            return mat4[14] / mat4[15];
        }

        toLocal(position, from, point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            if (from)
            {
                position = from.toGlobal(position, point, skipUpdate);
            }

            if (!skipUpdate)
            {
                this._recursivePostUpdateTransform();
            }

            if (step === exports.TRANSFORM_STEP.ALL)
            {
                if (!skipUpdate)
                {
                    this.displayObjectUpdateTransform();
                }
                if (this.proj.affine)
                {
                    return this.transform.worldTransform.applyInverse(position, point) ;
                }

                return this.proj.world.applyInverse(position, point) ;
            }

            if (this.parent)
            {
                point = this.parent.worldTransform.applyInverse(position, point) ;
            }
            else
            {
                point.x = position.x;
                point.y = position.y;
                // TODO: pixi 6.1.0 global mixin
                (point ).z = (position ).z;
            }
            if (step === exports.TRANSFORM_STEP.NONE)
            {
                return point;
            }

            point = this.transform.localTransform.applyInverse(point, point) ;
            if (step === exports.TRANSFORM_STEP.PROJ && this.proj.cameraMode)
            {
                point = this.proj.cameraMatrix.applyInverse(point, point) ;
            }

            return point;
        }

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }

        get position3d()
        {
            return this.proj.position;
        }
        set position3d(value)
        {
            this.proj.position.copyFrom(value);
        }
        get scale3d()
        {
            return this.proj.scale;
        }
        set scale3d(value)
        {
            this.proj.scale.copyFrom(value);
        }
        get euler()
        {
            return this.proj.euler;
        }
        set euler(value)
        {
            this.proj.euler.copyFrom(value);
        }
        get pivot3d()
        {
            return this.proj.pivot;
        }
        set pivot3d(value)
        {
            this.proj.pivot.copyFrom(value);
        }
    }

    const container3dToLocal = Container3d.prototype.toLocal;
    const container3dGetDepth = Container3d.prototype.getDepth;
    const container3dIsFrontFace = Container3d.prototype.isFrontFace;

    class Camera3d extends Container3d
    {
        constructor()
        {
            super();Camera3d.prototype.__init.call(this);Camera3d.prototype.__init2.call(this);Camera3d.prototype.__init3.call(this);Camera3d.prototype.__init4.call(this);;
            this.proj.cameraMode = true;
            this.setPlanes(400, 10, 10000, false);
        }

        __init() {this._far = 0;}
        __init2() {this._near = 0;}
        __init3() {this._focus = 0;}
        __init4() {this._orthographic = false;}

        get far()
        {
            return this._far;
        }

        get near()
        {
            return this._near;
        }

        get focus()
        {
            return this._focus;
        }

        get ortographic()
        {
            return this._orthographic;
        }

        setPlanes(focus, near = 10, far = 10000, orthographic = false)
        {
            this._focus = focus;
            this._near = near;
            this._far = far;
            this._orthographic = orthographic;

            const proj = this.proj;
            const mat4 = proj.cameraMatrix.mat4;

            proj._projID++;

            mat4[10] = 1.0 / (far - near);
            mat4[14] = (focus - near) / (far - near);
            if (this._orthographic)
            {
                mat4[11] = 0;
            }
            else
            {
                mat4[11] = 1.0 / focus;
            }
        }
    }

    class Mesh3d2d extends mesh.Mesh
    {
        constructor(geometry, shader, state, drawMode)
        {
            super(geometry, shader, state, drawMode);Mesh3d2d.prototype.__init.call(this);;
            this.proj = new Projection3d(this.transform);
        }

        __init() {this.vertexData2d = null;}
        

        calculateVertices()
        {
            if (this.proj._affine)
            {
                this.vertexData2d = null;
                super.calculateVertices();

                return;
            }

            const geometry = this.geometry ;
            const vertices = geometry.buffers[0].data;
            const thisAny = this ;

            if (geometry.vertexDirtyId === thisAny.vertexDirty && thisAny._transformID === thisAny.transform._worldID)
            {
                return;
            }

            thisAny._transformID = thisAny.transform._worldID;

            if (thisAny.vertexData.length !== vertices.length)
            {
                thisAny.vertexData = new Float32Array(vertices.length);
            }
            if (!this.vertexData2d || this.vertexData2d.length !== vertices.length * 3 / 2)
            {
                this.vertexData2d = new Float32Array(vertices.length * 3);
            }

            const wt = this.proj.world.mat4;

            const vertexData2d = this.vertexData2d;
            const vertexData = thisAny.vertexData;

            for (let i = 0; i < vertexData.length / 2; i++)
            {
                const x = vertices[(i * 2)];
                const y = vertices[(i * 2) + 1];

                const xx = (wt[0] * x) + (wt[4] * y) + wt[12];
                const yy = (wt[1] * x) + (wt[5] * y) + wt[13];
                const ww = (wt[3] * x) + (wt[7] * y) + wt[15];

                vertexData2d[i * 3] = xx;
                vertexData2d[(i * 3) + 1] = yy;
                vertexData2d[(i * 3) + 2] = ww;

                vertexData[(i * 2)] = xx / ww;
                vertexData[(i * 2) + 1] = yy / ww;
            }

            thisAny.vertexDirty = geometry.vertexDirtyId;
        }

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }

        toLocal(position, from,
            point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            return container3dToLocal.call(this, position, from, point, skipUpdate, step);
        }

        isFrontFace(forceUpdate)
        {
            return container3dIsFrontFace.call(this, forceUpdate);
        }

        getDepth(forceUpdate)
        {
            return container3dGetDepth.call(this, forceUpdate);
        }

        get position3d()
        {
            return this.proj.position;
        }
        set position3d(value)
        {
            this.proj.position.copyFrom(value);
        }
        get scale3d()
        {
            return this.proj.scale;
        }
        set scale3d(value)
        {
            this.proj.scale.copyFrom(value);
        }
        get euler()
        {
            return this.proj.euler;
        }
        set euler(value)
        {
            this.proj.euler.copyFrom(value);
        }
        get pivot3d()
        {
            return this.proj.pivot;
        }
        set pivot3d(value)
        {
            this.proj.pivot.copyFrom(value);
        }
    }

    (Mesh3d2d.prototype )._renderDefault = Mesh2d.prototype._renderDefault;

    class SimpleMesh3d2d extends Mesh3d2d
    {
        constructor(texture, vertices, uvs,
            indices, drawMode)
        {
            super(new mesh.MeshGeometry(vertices, uvs, indices),
                new mesh.MeshMaterial(texture, {
                    program: core.Program.from(Mesh2d.defaultVertexShader, Mesh2d.defaultFragmentShader),
                    pluginName: 'batch2d'
                }),
                null,
                drawMode);SimpleMesh3d2d.prototype.__init2.call(this);;

            (this.geometry.getBuffer('aVertexPosition') ).static = false;
        }

        __init2() {this.autoUpdate = true;}

        get vertices()
        {
            return this.geometry.getBuffer('aVertexPosition').data ;
        }
        set vertices(value)
        {
            this.geometry.getBuffer('aVertexPosition').data = value;
        }

         _render(renderer)
        {
            if (this.autoUpdate)
            {
                this.geometry.getBuffer('aVertexPosition').update();
            }

            (super._render )(renderer);
        }
    }

    /**
     * Same as Sprite2d, but
     * 1. uses Matrix3d in proj
     * 2. does not render if at least one vertex is behind camera
     */
    class Sprite3d extends sprite.Sprite
    {
        constructor(texture)
        {
            super(texture);Sprite3d.prototype.__init.call(this);Sprite3d.prototype.__init2.call(this);Sprite3d.prototype.__init3.call(this);;
            this.proj = new Projection3d(this.transform);
            this.pluginName = 'batch2d';
        }

        __init() {this.vertexData2d = null;}
        
        __init2() {this.culledByFrustrum = false;}
        __init3() {this.trimmedCulledByFrustrum = false;}

        calculateVertices()
        {
            const texture = this._texture;

            if (this.proj._affine)
            {
                this.vertexData2d = null;
                super.calculateVertices();

                return;
            }
            if (!this.vertexData2d)
            {
                this.vertexData2d = new Float32Array(12);
            }

            const wid = (this.transform )._worldID;
            const tuid = (texture )._updateID;
            const thisAny = this ;

            if (thisAny._transformID === wid && this._textureID === tuid)
            {
                return;
            }
            // update texture UV here, because base texture can be changed without calling `_onTextureUpdate`
            if (this._textureID !== tuid)
            {
                (this ).uvs = (texture )._uvs.uvsFloat32;
            }

            thisAny._transformID = wid;
            this._textureID = tuid;

            const wt = this.proj.world.mat4;
            const vertexData2d = this.vertexData2d;
            const vertexData = this.vertexData;
            const trim = texture.trim;
            const orig = texture.orig;
            const anchor = this._anchor;

            let w0;
            let w1;
            let h0;
            let h1;

            if (trim)
            {
                w1 = trim.x - (anchor._x * orig.width);
                w0 = w1 + trim.width;

                h1 = trim.y - (anchor._y * orig.height);
                h0 = h1 + trim.height;
            }
            else
            {
                w1 = -anchor._x * orig.width;
                w0 = w1 + orig.width;

                h1 = -anchor._y * orig.height;
                h0 = h1 + orig.height;
            }

            let culled = false;

            let z;

            vertexData2d[0] = (wt[0] * w1) + (wt[4] * h1) + wt[12];
            vertexData2d[1] = (wt[1] * w1) + (wt[5] * h1) + wt[13];
            z = (wt[2] * w1) + (wt[6] * h1) + wt[14];
            vertexData2d[2] = (wt[3] * w1) + (wt[7] * h1) + wt[15];
            culled = culled || z < 0;

            vertexData2d[3] = (wt[0] * w0) + (wt[4] * h1) + wt[12];
            vertexData2d[4] = (wt[1] * w0) + (wt[5] * h1) + wt[13];
            z = (wt[2] * w0) + (wt[6] * h1) + wt[14];
            vertexData2d[5] = (wt[3] * w0) + (wt[7] * h1) + wt[15];
            culled = culled || z < 0;

            vertexData2d[6] = (wt[0] * w0) + (wt[4] * h0) + wt[12];
            vertexData2d[7] = (wt[1] * w0) + (wt[5] * h0) + wt[13];
            z = (wt[2] * w0) + (wt[6] * h0) + wt[14];
            vertexData2d[8] = (wt[3] * w0) + (wt[7] * h0) + wt[15];
            culled = culled || z < 0;

            vertexData2d[9] = (wt[0] * w1) + (wt[4] * h0) + wt[12];
            vertexData2d[10] = (wt[1] * w1) + (wt[5] * h0) + wt[13];
            z = (wt[2] * w1) + (wt[6] * h0) + wt[14];
            vertexData2d[11] = (wt[3] * w1) + (wt[7] * h0) + wt[15];
            culled = culled || z < 0;

            this.culledByFrustrum = culled;

            vertexData[0] = vertexData2d[0] / vertexData2d[2];
            vertexData[1] = vertexData2d[1] / vertexData2d[2];

            vertexData[2] = vertexData2d[3] / vertexData2d[5];
            vertexData[3] = vertexData2d[4] / vertexData2d[5];

            vertexData[4] = vertexData2d[6] / vertexData2d[8];
            vertexData[5] = vertexData2d[7] / vertexData2d[8];

            vertexData[6] = vertexData2d[9] / vertexData2d[11];
            vertexData[7] = vertexData2d[10] / vertexData2d[11];
        }

        calculateTrimmedVertices()
        {
            if (this.proj._affine)
            {
                super.calculateTrimmedVertices();

                return;
            }

            const wid = (this.transform )._worldID;
            const tuid = (this._texture )._updateID;
            const thisAny = this ;

            if (!thisAny.vertexTrimmedData)
            {
                thisAny.vertexTrimmedData = new Float32Array(8);
            }
            else if (thisAny._transformTrimmedID === wid && this._textureTrimmedID === tuid)
            {
                return;
            }

            thisAny._transformTrimmedID = wid;
            this._textureTrimmedID = tuid;

            // lets do some special trim code!
            const texture = this._texture;
            const vertexData = thisAny.vertexTrimmedData;
            const orig = texture.orig;
            const anchor = this._anchor;

            // lets calculate the new untrimmed bounds..
            const wt = this.proj.world.mat4;

            const w1 = -anchor._x * orig.width;
            const w0 = w1 + orig.width;

            const h1 = -anchor._y * orig.height;
            const h0 = h1 + orig.height;

            let culled = false;

            let z;

            let w = 1.0 / ((wt[3] * w1) + (wt[7] * h1) + wt[15]);

            vertexData[0] = w * ((wt[0] * w1) + (wt[4] * h1) + wt[12]);
            vertexData[1] = w * ((wt[1] * w1) + (wt[5] * h1) + wt[13]);
            z = (wt[2] * w1) + (wt[6] * h1) + wt[14];
            culled = culled || z < 0;

            w = 1.0 / ((wt[3] * w0) + (wt[7] * h1) + wt[15]);
            vertexData[2] = w * ((wt[0] * w0) + (wt[4] * h1) + wt[12]);
            vertexData[3] = w * ((wt[1] * w0) + (wt[5] * h1) + wt[13]);
            z = (wt[2] * w0) + (wt[6] * h1) + wt[14];
            culled = culled || z < 0;

            w = 1.0 / ((wt[3] * w0) + (wt[7] * h0) + wt[15]);
            vertexData[4] = w * ((wt[0] * w0) + (wt[4] * h0) + wt[12]);
            vertexData[5] = w * ((wt[1] * w0) + (wt[5] * h0) + wt[13]);
            z = (wt[2] * w0) + (wt[6] * h0) + wt[14];
            culled = culled || z < 0;

            w = 1.0 / ((wt[3] * w1) + (wt[7] * h0) + wt[15]);
            vertexData[6] = w * ((wt[0] * w1) + (wt[4] * h0) + wt[12]);
            vertexData[7] = w * ((wt[1] * w1) + (wt[5] * h0) + wt[13]);
            z = (wt[2] * w1) + (wt[6] * h0) + wt[14];
            culled = culled || z < 0;

            this.culledByFrustrum = culled;
        }

        _calculateBounds()
        {
            this.calculateVertices();
            if (this.culledByFrustrum)
            {
                return;
            }

            const trim = this._texture.trim;
            const orig = this._texture.orig;

            if (!trim || (trim.width === orig.width && trim.height === orig.height))
            {
                // no trim! lets use the usual calculations..
                this._bounds.addQuad(this.vertexData);

                return;
            }

            this.calculateTrimmedVertices();
            if (!this.trimmedCulledByFrustrum)
            {
                this._bounds.addQuad((this ).vertexTrimmedData );
            }
        }

        _render(renderer)
        {
            this.calculateVertices();

            if (this.culledByFrustrum)
            {
                return;
            }

            renderer.batch.setObjectRenderer((renderer ).plugins[this.pluginName]);
            (renderer ).plugins[this.pluginName].render(this);
        }

        containsPoint(point)
        {
            if (this.culledByFrustrum)
            {
                return false;
            }

            return super.containsPoint(point );
        }

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }

        toLocal(position, from,
            point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            return container3dToLocal.call(this, position, from, point, skipUpdate, step);
        }

        isFrontFace(forceUpdate)
        {
            return container3dIsFrontFace.call(this, forceUpdate);
        }

        getDepth(forceUpdate)
        {
            return container3dGetDepth.call(this, forceUpdate);
        }

        get position3d()
        {
            return this.proj.position;
        }
        set position3d(value)
        {
            this.proj.position.copyFrom(value);
        }
        get scale3d()
        {
            return this.proj.scale;
        }
        set scale3d(value)
        {
            this.proj.scale.copyFrom(value);
        }
        get euler()
        {
            return this.proj.euler;
        }
        set euler(value)
        {
            this.proj.euler.copyFrom(value);
        }
        get pivot3d()
        {
            return this.proj.pivot;
        }
        set pivot3d(value)
        {
            this.proj.pivot.copyFrom(value);
        }
    }

    const containerProps = {
        worldTransform: {
            get: container3dWorldTransform,
            enumerable: true,
            configurable: true
        },
        position3d: {
            get() { return this.proj.position; },
            set(value) { this.proj.position.copy(value); }
        },
        scale3d: {
            get() { return this.proj.scale; },
            set(value) { this.proj.scale.copy(value); }
        },
        pivot3d: {
            get() { return this.proj.pivot; },
            set(value) { this.proj.pivot.copy(value); }
        },
        euler: {
            get() { return this.proj.euler; },
            set(value) { this.proj.euler.copy(value); }
        }
    };

    function convertTo3d()
    {
        if (this.proj) return;
        this.proj = new Projection3d(this.transform);
        this.toLocal = Container3d.prototype.toLocal;
        this.isFrontFace = Container3d.prototype.isFrontFace;
        this.getDepth = Container3d.prototype.getDepth;
        Object.defineProperties(this, containerProps);
    }

    display.Container.prototype.convertTo3d = convertTo3d;

    sprite.Sprite.prototype.convertTo3d = function convertTo3d()
    {
        if (this.proj) return;
        this.calculateVertices = Sprite3d.prototype.calculateVertices;
        this.calculateTrimmedVertices = Sprite3d.prototype.calculateTrimmedVertices;
        this._calculateBounds = Sprite3d.prototype._calculateBounds;
        this.containsPoint = Sprite3d.prototype.containsPoint;
        this.pluginName = 'batch2d';
        convertTo3d.call(this);
    };

    display.Container.prototype.convertSubtreeTo3d = function convertTo3d()
    {
        this.convertTo3d();
        for (let i = 0; i < this.children.length; i++)
        {
            this.children[i].convertSubtreeTo3d();
        }
    };

    meshExtras.SimpleMesh.prototype.convertTo3d
        = meshExtras.SimpleRope.prototype.convertTo3d
        = function convertTo3d()
            {
                if (this.proj) return;
                this.calculateVertices = Mesh3d2d.prototype.calculateVertices;
                this._renderDefault = (Mesh3d2d.prototype )._renderDefault;
                if (this.material.pluginName !== 'batch2d')
                {
                    this.material = new mesh.MeshMaterial(this.material.texture, {
                        program: core.Program.from(Mesh2d.defaultVertexShader, Mesh2d.defaultFragmentShader),
                        pluginName: 'batch2d'
                    });
                }
                convertTo3d.call(this);
            };

    class Text3d extends text.Text
    {
        constructor(text, style, canvas)
        {
            super(text, style, canvas);Text3d.prototype.__init.call(this);;
            this.proj = new Projection3d(this.transform);
            this.pluginName = 'batch2d';
        }

        
        __init() {this.vertexData2d = null;}

        get worldTransform()
        {
            return this.proj.affine ? this.transform.worldTransform : this.proj.world ;
        }

        toLocal(position, from,
            point, skipUpdate,
            step = exports.TRANSFORM_STEP.ALL)
        {
            return container3dToLocal.call(this, position, from, point, skipUpdate, step);
        }

        isFrontFace(forceUpdate)
        {
            return container3dIsFrontFace.call(this, forceUpdate);
        }

        getDepth(forceUpdate)
        {
            return container3dGetDepth.call(this, forceUpdate);
        }

        get position3d()
        {
            return this.proj.position;
        }
        set position3d(value)
        {
            this.proj.position.copyFrom(value);
        }
        get scale3d()
        {
            return this.proj.scale;
        }
        set scale3d(value)
        {
            this.proj.scale.copyFrom(value);
        }
        get euler()
        {
            return this.proj.euler;
        }
        set euler(value)
        {
            this.proj.euler.copyFrom(value);
        }
        get pivot3d()
        {
            return this.proj.pivot;
        }
        set pivot3d(value)
        {
            this.proj.pivot.copyFrom(value);
        }
    }

    Text3d.prototype.calculateVertices = Sprite3d.prototype.calculateVertices;
    (Text3d.prototype ).calculateTrimmedVertices = Sprite3d.prototype.calculateTrimmedVertices;
    (Text3d.prototype )._calculateBounds = Sprite3d.prototype._calculateBounds;
    Text3d.prototype.containsPoint = Sprite3d.prototype.containsPoint;
    (Text3d.prototype )._render = Sprite3d.prototype._render;

    var _class;
    const shaderVert = `precision highp float;
attribute vec2 aVertexPosition;
attribute vec3 aTrans1;
attribute vec3 aTrans2;
attribute vec2 aSamplerSize;
attribute vec4 aFrame;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;

varying vec2 vertexPosition;
varying vec3 vTrans1;
varying vec3 vTrans2;
varying vec2 vSamplerSize;
varying vec4 vFrame;
varying vec4 vColor;
varying float vTextureId;

void main(void){
gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);
gl_Position.z = 0.0;

vertexPosition = aVertexPosition;
vTrans1 = aTrans1;
vTrans2 = aTrans2;
vTextureId = aTextureId;
vColor = aColor;
vSamplerSize = aSamplerSize;
vFrame = aFrame;
}
`;

    const shaderFrag = `precision highp float;
varying vec2 vertexPosition;
varying vec3 vTrans1;
varying vec3 vTrans2;
varying vec2 vSamplerSize;
varying vec4 vFrame;
varying vec4 vColor;
varying float vTextureId;

uniform sampler2D uSamplers[%count%];
uniform vec4 distortion;

void main(void){
vec2 surface;
vec2 surface2;

float vx = vertexPosition.x;
float vy = vertexPosition.y;
float dx = distortion.x;
float dy = distortion.y;
float revx = distortion.z;
float revy = distortion.w;

if (distortion.x == 0.0) {
surface.x = vx;
surface.y = vy / (1.0 + dy * vx);
surface2 = surface;
} else
if (distortion.y == 0.0) {
surface.y = vy;
surface.x = vx / (1.0 + dx * vy);
surface2 = surface;
} else {
float c = vy * dx - vx * dy;
float b = (c + 1.0) * 0.5;
float b2 = (-c + 1.0) * 0.5;
float d = b * b + vx * dy;
if (d < -0.00001) {
    discard;
}
d = sqrt(max(d, 0.0));
surface.x = (- b + d) * revy;
surface2.x = (- b - d) * revy;
surface.y = (- b2 + d) * revx;
surface2.y = (- b2 - d) * revx;
}

vec2 uv;
uv.x = vTrans1.x * surface.x + vTrans1.y * surface.y + vTrans1.z;
uv.y = vTrans2.x * surface.x + vTrans2.y * surface.y + vTrans2.z;

vec2 pixels = uv * vSamplerSize;

if (pixels.x < vFrame.x || pixels.x > vFrame.z ||
pixels.y < vFrame.y || pixels.y > vFrame.w) {
uv.x = vTrans1.x * surface2.x + vTrans1.y * surface2.y + vTrans1.z;
uv.y = vTrans2.x * surface2.x + vTrans2.y * surface2.y + vTrans2.z;
pixels = uv * vSamplerSize;

if (pixels.x < vFrame.x || pixels.x > vFrame.z ||
   pixels.y < vFrame.y || pixels.y > vFrame.w) {
   discard;
}
}

vec4 edge;
edge.xy = clamp(pixels - vFrame.xy + 0.5, vec2(0.0, 0.0), vec2(1.0, 1.0));
edge.zw = clamp(vFrame.zw - pixels + 0.5, vec2(0.0, 0.0), vec2(1.0, 1.0));

float alpha = 1.0; //edge.x * edge.y * edge.z * edge.w;
vec4 rColor = vColor * alpha;

float textureId = floor(vTextureId+0.5);
vec2 vTextureCoord = uv;
vec4 color;
%forloop%
gl_FragColor = color * rColor;
}`;

    class BatchBilineardGeometry extends core.Geometry
    {
        
        

        constructor(_static = false)
        {
            super();

            this._buffer = new core.Buffer(null, _static, false);

            this._indexBuffer = new core.Buffer(null, _static, true);

            this.addAttribute('aVertexPosition', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aTrans1', this._buffer, 3, false, constants.TYPES.FLOAT)
                .addAttribute('aTrans2', this._buffer, 3, false, constants.TYPES.FLOAT)
                .addAttribute('aSamplerSize', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aFrame', this._buffer, 4, false, constants.TYPES.FLOAT)
                .addAttribute('aColor', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', this._buffer, 1, true, constants.TYPES.FLOAT)
                .addIndex(this._indexBuffer);
        }
    }

    class BatchBilinearPluginFactory
    {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        static create(options)
        {
            const { vertex, fragment, vertexSize, geometryClass } = (Object ).assign({
                vertex: shaderVert,
                fragment: shaderFrag,
                geometryClass: BatchBilineardGeometry,
                vertexSize: 16,
            }, options);

            return (_class = class BatchPlugin extends UniformBatchRenderer
            {
                constructor(renderer)
                {
                    super(renderer);_class.prototype.__init.call(this);_class.prototype.__init2.call(this);_class.prototype.__init3.call(this);;

                    this.shaderGenerator = new core.BatchShaderGenerator(vertex, fragment);
                    this.geometryClass = geometryClass;
                    this.vertexSize = vertexSize;
                }

                __init() {this.defUniforms = {
                    translationMatrix: new math.Matrix(),
                    distortion: new Float32Array([0, 0, Infinity, Infinity])
                };}
                __init2() {this.size = 1000;}
                __init3() {this.forceMaxTextures = 1;}

                getUniforms(sprite)
                {
                    const { proj } = sprite ;

                    if (proj.surface !== null)
                    {
                        return proj.uniforms;
                    }
                    if (proj._activeProjection !== null)
                    {
                        return proj._activeProjection.uniforms;
                    }

                    return this.defUniforms;
                }

                // eslint-disable-next-line max-len
                packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex)
                {
                    const {
                        uint32View,
                        float32View,
                    } = attributeBuffer;
                    const p = aIndex / this.vertexSize;
                    const indices = element.indices;
                    const vertexData = element.vertexData;
                    const tex = element._texture;
                    const frame = tex._frame;
                    const aTrans = element.aTrans;
                    const { _batchLocation, realWidth, realHeight, resolution } = element._texture.baseTexture;

                    const alpha = Math.min(element.worldAlpha, 1.0);

                    const argb = alpha < 1.0 && element._texture.baseTexture.alphaMode ? utils.premultiplyTint(element._tintRGB, alpha)
                        : element._tintRGB + (alpha * 255 << 24);

                    for (let i = 0; i < vertexData.length; i += 2)
                    {
                        float32View[aIndex] = vertexData[i];
                        float32View[aIndex + 1] = vertexData[i + 1];

                        float32View[aIndex + 2] = aTrans.a;
                        float32View[aIndex + 3] = aTrans.c;
                        float32View[aIndex + 4] = aTrans.tx;
                        float32View[aIndex + 5] = aTrans.b;
                        float32View[aIndex + 6] = aTrans.d;
                        float32View[aIndex + 7] = aTrans.ty;

                        float32View[aIndex + 8] = realWidth;
                        float32View[aIndex + 9] = realHeight;
                        float32View[aIndex + 10] = frame.x * resolution;
                        float32View[aIndex + 11] = frame.y * resolution;
                        float32View[aIndex + 12] = (frame.x + frame.width) * resolution;
                        float32View[aIndex + 13] = (frame.y + frame.height) * resolution;

                        uint32View[aIndex + 14] = argb;
                        float32View[aIndex + 15] = _batchLocation;
                        aIndex += 16;
                    }

                    for (let i = 0; i < indices.length; i++)
                    {
                        indexBuffer[iIndex++] = p + indices[i];
                    }
                }
            }, _class);
        }
    }

    const p = [new math.Point(), new math.Point(), new math.Point(), new math.Point()];
    const a = [0, 0, 0, 0];

    class Surface 
    {constructor() { Surface.prototype.__init.call(this);Surface.prototype.__init2.call(this);Surface.prototype.__init3.call(this);Surface.prototype.__init4.call(this); }
        __init() {this.surfaceID = 'default';}

        __init2() {this._updateID = 0;}

        __init3() {this.vertexSrc = '';}
        __init4() {this.fragmentSrc = '';}

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fillUniforms(uniforms)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        {

        }

        clear()
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        {

        }

        /**
         * made for bilinear, other things will need adjustments, like test if (0) is inside
         * @param {ArrayLike<number>} v
         * @param out
         * @param {Matrix} after
         */
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        boundsQuad(v, out, after)
        {
            let minX = out[0]; let
                minY = out[1];
            let maxX = out[0]; let
                maxY = out[1];

            for (let i = 2; i < 8; i += 2)
            {
                if (minX > out[i]) minX = out[i];
                if (maxX < out[i]) maxX = out[i];
                if (minY > out[i + 1]) minY = out[i + 1];
                if (maxY < out[i + 1]) maxY = out[i + 1];
            }

            p[0].set(minX, minY);
            this.apply(p[0], p[0]);
            p[1].set(maxX, minY);
            this.apply(p[1], p[1]);
            p[2].set(maxX, maxY);
            this.apply(p[2], p[2]);
            p[3].set(minX, maxY);
            this.apply(p[3], p[3]);

            if (after)
            {
                after.apply(p[0], p[0]);
                after.apply(p[1], p[1]);
                after.apply(p[2], p[2]);
                after.apply(p[3], p[3]);
                out[0] = p[0].x;
                out[1] = p[0].y;
                out[2] = p[1].x;
                out[3] = p[1].y;
                out[4] = p[2].x;
                out[5] = p[2].y;
                out[6] = p[3].x;
                out[7] = p[3].y;
            }
            else
            {
                for (let i = 1; i <= 3; i++)
                {
                    if (p[i].y < p[0].y || (p[i].y === p[0].y && p[i].x < p[0].x))
                    {
                        const t = p[0];

                        p[0] = p[i];
                        p[i] = t;
                    }
                }

                for (let i = 1; i <= 3; i++)
                {
                    a[i] = Math.atan2(p[i].y - p[0].y, p[i].x - p[0].x);
                }
                for (let i = 1; i <= 3; i++)
                {
                    for (let j = i + 1; j <= 3; j++)
                    {
                        if (a[i] > a[j])
                        {
                            const t = p[i];

                            p[i] = p[j];
                            p[j] = t;
                            const t2 = a[i];

                            a[i] = a[j];
                            a[j] = t2;
                        }
                    }
                }

                out[0] = p[0].x;
                out[1] = p[0].y;
                out[2] = p[1].x;
                out[3] = p[1].y;
                out[4] = p[2].x;
                out[5] = p[2].y;
                out[6] = p[3].x;
                out[7] = p[3].y;

                if (((p[3].x - p[2].x) * (p[1].y - p[2].y)) - ((p[1].x - p[2].x) * (p[3].y - p[2].y)) < 0)
                {
                    // triangle!!!
                    out[4] = p[3].x;
                    out[5] = p[3].y;

                    return;
                }
            }
        }

        



    }

    /* eslint-disable no-mixed-operators */


    const tempMat = new math.Matrix();
    const tempRect = new math.Rectangle();
    const tempPoint = new math.Point();

    class BilinearSurface extends Surface
    {constructor(...args) { super(...args); BilinearSurface.prototype.__init.call(this); }
        __init() {this.distortion = new math.Point();}

        clear()
        {
            this.distortion.set(0, 0);
        }

        apply(pos, newPos)
        {
            newPos = newPos || new math.Point();
            const d = this.distortion;
            const m = pos.x * pos.y;

            newPos.x = pos.x + d.x * m;
            newPos.y = pos.y + d.y * m;

            return newPos;
        }

        applyInverse(pos, newPos)
        {
            newPos = newPos || new math.Point();
            const vx = pos.x; const
                vy = pos.y;
            const dx = this.distortion.x; const
                dy = this.distortion.y;

            if (dx === 0.0)
            {
                newPos.x = vx;
                newPos.y = vy / (1.0 + dy * vx);
            }
            else
            if (dy === 0.0)
            {
                newPos.y = vy;
                newPos.x = vx / (1.0 + dx * vy);
            }
            else
            {
                const b = (vy * dx - vx * dy + 1.0) * 0.5 / dy;
                const d = b * b + vx / dy;

                if (d <= 0.00001)
                {
                    newPos.set(NaN, NaN);

                    return newPos;
                }
                if (dy > 0.0)
                {
                    newPos.x = -b + Math.sqrt(d);
                }
                else
                {
                    newPos.x = -b - Math.sqrt(d);
                }
                newPos.y = (vx / newPos.x - 1.0) / dx;
            }

            return newPos;
        }

        mapSprite(sprite, quad, outTransform)
        {
            const tex = sprite.texture;

            tempRect.x = -sprite.anchor.x * tex.orig.width;
            tempRect.y = -sprite.anchor.y * tex.orig.height;
            tempRect.width = tex.orig.width;
            tempRect.height = tex.orig.height;

            return this.mapQuad(tempRect, quad, outTransform || sprite.transform );
        }

        mapQuad(rect, quad, outTransform)
        {
            const ax = -rect.x / rect.width;
            const ay = -rect.y / rect.height;

            const ax2 = (1.0 - rect.x) / rect.width;
            const ay2 = (1.0 - rect.y) / rect.height;

            const up1x = (quad[0].x * (1.0 - ax) + quad[1].x * ax);
            const up1y = (quad[0].y * (1.0 - ax) + quad[1].y * ax);
            const up2x = (quad[0].x * (1.0 - ax2) + quad[1].x * ax2);
            const up2y = (quad[0].y * (1.0 - ax2) + quad[1].y * ax2);

            const down1x = (quad[3].x * (1.0 - ax) + quad[2].x * ax);
            const down1y = (quad[3].y * (1.0 - ax) + quad[2].y * ax);
            const down2x = (quad[3].x * (1.0 - ax2) + quad[2].x * ax2);
            const down2y = (quad[3].y * (1.0 - ax2) + quad[2].y * ax2);

            const x00 = up1x * (1.0 - ay) + down1x * ay;
            const y00 = up1y * (1.0 - ay) + down1y * ay;

            const x10 = up2x * (1.0 - ay) + down2x * ay;
            const y10 = up2y * (1.0 - ay) + down2y * ay;

            const x01 = up1x * (1.0 - ay2) + down1x * ay2;
            const y01 = up1y * (1.0 - ay2) + down1y * ay2;

            const x11 = up2x * (1.0 - ay2) + down2x * ay2;
            const y11 = up2y * (1.0 - ay2) + down2y * ay2;

            const mat = tempMat;

            mat.tx = x00;
            mat.ty = y00;
            mat.a = x10 - x00;
            mat.b = y10 - y00;
            mat.c = x01 - x00;
            mat.d = y01 - y00;
            tempPoint.set(x11, y11);
            mat.applyInverse(tempPoint, tempPoint);
            this.distortion.set(tempPoint.x - 1, tempPoint.y - 1);

            outTransform.setFromMatrix(mat);

            return this;
        }

        fillUniforms(uniforms)
        {
            uniforms.distortion = uniforms.distortion || new Float32Array([0, 0, 0, 0]);
            const ax = Math.abs(this.distortion.x);
            const ay = Math.abs(this.distortion.y);

            uniforms.distortion[0] = ax * 10000 <= ay ? 0 : this.distortion.x;
            uniforms.distortion[1] = ay * 10000 <= ax ? 0 : this.distortion.y;
            uniforms.distortion[2] = 1.0 / uniforms.distortion[0];
            uniforms.distortion[3] = 1.0 / uniforms.distortion[1];
        }
    }

    const fun = math.Transform.prototype.updateTransform;








    function transformHack( parentTransform)
    {
        // TODO: pixi 6.1.0 global mixin
        const proj = (this ).proj ;

        const pp = (parentTransform ).proj ;
        const ta = this ;

        if (!pp)
        {
            fun.call(this, parentTransform);
            proj._activeProjection = null;

            return;
        }

        if (pp._surface)
        {
            proj._activeProjection = pp;
            this.updateLocalTransform();
            this.localTransform.copyTo(this.worldTransform);
            if (ta._parentID < 0)
            {
                ++ta._worldID;
            }

            return;
        }

        fun.call(this, parentTransform);
        proj._activeProjection = pp._activeProjection;
    }

    class ProjectionSurface extends AbstractProjection
    {constructor(...args) { super(...args); ProjectionSurface.prototype.__init.call(this);ProjectionSurface.prototype.__init2.call(this);ProjectionSurface.prototype.__init3.call(this);ProjectionSurface.prototype.__init4.call(this);ProjectionSurface.prototype.__init5.call(this); }
        __init() {this._surface = null;}
        __init2() {this._activeProjection = null;}

        // eslint-disable-next-line accessor-pairs
        set enabled(value)
        {
            if (value === this._enabled)
            {
                return;
            }
            this._enabled = value;
            if (value)
            {
                this.legacy.updateTransform = transformHack;
                (this.legacy )._parentID = -1;
            }
            else
            {
                this.legacy.updateTransform = math.Transform.prototype.updateTransform;
                (this.legacy )._parentID = -1;
            }
        }

        get surface()
        {
            return this._surface;
        }

        set surface(value)
        {
            if (this._surface === value)
            {
                return;
            }
            this._surface = value || null;
            (this.legacy )._parentID = -1;
        }

        applyPartial(pos, newPos)
        {
            if (this._activeProjection !== null)
            {
                newPos = this.legacy.worldTransform.apply(pos, newPos);

                return this._activeProjection.surface.apply(newPos, newPos);
            }
            if (this._surface !== null)
            {
                return this.surface.apply(pos, newPos);
            }

            return this.legacy.worldTransform.apply(pos, newPos);
        }

        apply(pos, newPos)
        {
            if (this._activeProjection !== null)
            {
                newPos = this.legacy.worldTransform.apply(pos, newPos);
                this._activeProjection.surface.apply(newPos, newPos);

                return this._activeProjection.legacy.worldTransform.apply(newPos, newPos);
            }
            if (this._surface !== null)
            {
                newPos = this.surface.apply(pos, newPos);

                return this.legacy.worldTransform.apply(newPos, newPos);
            }

            return this.legacy.worldTransform.apply(pos, newPos);
        }

        applyInverse(pos, newPos)
        {
            if (this._activeProjection !== null)
            {
                newPos = this._activeProjection.legacy.worldTransform.applyInverse(pos, newPos);
                this._activeProjection._surface.applyInverse(newPos, newPos);

                return this.legacy.worldTransform.applyInverse(newPos, newPos);
            }
            if (this._surface !== null)
            {
                newPos = this.legacy.worldTransform.applyInverse(pos, newPos);

                return this._surface.applyInverse(newPos, newPos);
            }

            return this.legacy.worldTransform.applyInverse(pos, newPos);
        }

        mapBilinearSprite(sprite, quad)
        {
            if (!(this._surface instanceof BilinearSurface))
            {
                this.surface = new BilinearSurface();
            }
            (this.surface ).mapSprite(sprite, quad, this.legacy);
        }

        __init3() {this._currentSurfaceID = -1;}
        __init4() {this._currentLegacyID = -1;}
        __init5() {this._lastUniforms  = null;}

        clear()
        {
            if (this.surface)
            {
                this.surface.clear();
            }
        }

        get uniforms()
        {
            if (this._currentLegacyID === (this.legacy )._worldID
                && this._currentSurfaceID === this.surface._updateID)
            {
                return this._lastUniforms;
            }

            this._lastUniforms = this._lastUniforms || {};
            this._lastUniforms.translationMatrix = this.legacy.worldTransform;
            this._surface.fillUniforms(this._lastUniforms);

            return this._lastUniforms;
        }
    }

    class Sprite2s extends sprite.Sprite
    {
        constructor(texture)
        {
            super(texture);Sprite2s.prototype.__init.call(this);;
            this.proj = new ProjectionSurface(this.transform);
            this.pluginName = 'batch_bilinear';
        }

        
        __init() {this.aTrans = new math.Matrix();}

        _calculateBounds()
        {
            this.calculateTrimmedVertices();
            this._bounds.addQuad((this ).vertexTrimmedData );
        }

        calculateVertices()
        {
            const wid = (this.transform )._worldID;
            const tuid = (this._texture )._updateID;
            const thisAny = this ;

            if (thisAny._transformID === wid && this._textureID === tuid)
            {
                return;
            }

            thisAny._transformID = wid;
            this._textureID = tuid;

            const texture = this._texture;
            const vertexData = this.vertexData;
            const trim = texture.trim;
            const orig = texture.orig;
            const anchor = this._anchor;

            let w0;
            let w1;
            let h0;
            let h1;

            if (trim)
            {
                w1 = trim.x - (anchor._x * orig.width);
                w0 = w1 + trim.width;

                h1 = trim.y - (anchor._y * orig.height);
                h0 = h1 + trim.height;
            }
            else
            {
                w1 = -anchor._x * orig.width;
                w0 = w1 + orig.width;

                h1 = -anchor._y * orig.height;
                h0 = h1 + orig.height;
            }

            if (this.proj._surface)
            {
                vertexData[0] = w1;
                vertexData[1] = h1;
                vertexData[2] = w0;
                vertexData[3] = h1;
                vertexData[4] = w0;
                vertexData[5] = h0;
                vertexData[6] = w1;
                vertexData[7] = h0;
                this.proj._surface.boundsQuad(vertexData, vertexData);
            }
            else
            {
                const wt = this.transform.worldTransform;
                const a = wt.a;
                const b = wt.b;
                const c = wt.c;
                const d = wt.d;
                const tx = wt.tx;
                const ty = wt.ty;

                vertexData[0] = (a * w1) + (c * h1) + tx;
                vertexData[1] = (d * h1) + (b * w1) + ty;
                vertexData[2] = (a * w0) + (c * h1) + tx;
                vertexData[3] = (d * h1) + (b * w0) + ty;
                vertexData[4] = (a * w0) + (c * h0) + tx;
                vertexData[5] = (d * h0) + (b * w0) + ty;
                vertexData[6] = (a * w1) + (c * h0) + tx;
                vertexData[7] = (d * h0) + (b * w1) + ty;
                if (this.proj._activeProjection)
                {
                    this.proj._activeProjection.surface.boundsQuad(vertexData, vertexData);
                }
            }

            if (!texture.uvMatrix)
            {
                texture.uvMatrix = new core.TextureMatrix(texture);
            }
            texture.uvMatrix.update();

            const aTrans = this.aTrans;

            aTrans.set(orig.width, 0, 0, orig.height, w1, h1);
            if (this.proj._surface === null)
            {
                aTrans.prepend(this.transform.worldTransform);
            }
            aTrans.invert();
            aTrans.prepend((texture.uvMatrix ).mapCoord);
        }

        calculateTrimmedVertices()
        {
            const wid = (this.transform )._worldID;
            const tuid = (this._texture )._updateID;
            const thisAny = this ;

            if (!thisAny.vertexTrimmedData)
            {
                thisAny.vertexTrimmedData = new Float32Array(8);
            }
            else if (thisAny._transformTrimmedID === wid && this._textureTrimmedID === tuid)
            {
                return;
            }

            thisAny._transformTrimmedID = wid;
            this._textureTrimmedID = tuid;

            // lets do some special trim code!
            const texture = this._texture;
            const vertexData = thisAny.vertexTrimmedData;
            const orig = texture.orig;
            const anchor = this._anchor;

            // lets calculate the new untrimmed bounds..

            const w1 = -anchor._x * orig.width;
            const w0 = w1 + orig.width;

            const h1 = -anchor._y * orig.height;
            const h0 = h1 + orig.height;

            // TODO: take rotations into account! form temporary bounds

            if (this.proj._surface)
            {
                vertexData[0] = w1;
                vertexData[1] = h1;
                vertexData[2] = w0;
                vertexData[3] = h1;
                vertexData[4] = w0;
                vertexData[5] = h0;
                vertexData[6] = w1;
                vertexData[7] = h0;
                this.proj._surface.boundsQuad(vertexData, vertexData, this.transform.worldTransform);
            }
            else
            {
                const wt = this.transform.worldTransform;
                const a = wt.a;
                const b = wt.b;
                const c = wt.c;
                const d = wt.d;
                const tx = wt.tx;
                const ty = wt.ty;

                vertexData[0] = (a * w1) + (c * h1) + tx;
                vertexData[1] = (d * h1) + (b * w1) + ty;
                vertexData[2] = (a * w0) + (c * h1) + tx;
                vertexData[3] = (d * h1) + (b * w0) + ty;
                vertexData[4] = (a * w0) + (c * h0) + tx;
                vertexData[5] = (d * h0) + (b * w0) + ty;
                vertexData[6] = (a * w1) + (c * h0) + tx;
                vertexData[7] = (d * h0) + (b * w1) + ty;
                if (this.proj._activeProjection)
                {
                    this.proj._activeProjection.surface.boundsQuad(vertexData, vertexData,
                        this.proj._activeProjection.legacy.worldTransform);
                }
            }
        }

        get worldTransform()
        {
            return this.proj ;
        }
    }

    sprite.Sprite.prototype.convertTo2s = function convertTo2s()
    {
        if (this.proj) return;
        // container
        this.pluginName = 'sprite_bilinear';
        this.aTrans = new math.Matrix();
        this.calculateVertices = Sprite2s.prototype.calculateVertices;
        this.calculateTrimmedVertices = Sprite2s.prototype.calculateTrimmedVertices;
        this._calculateBounds = Sprite2s.prototype._calculateBounds;
        display.Container.prototype.convertTo2s.call(this);
    };

    display.Container.prototype.convertTo2s = function convertTo2s()
    {
        if (this.proj) return;
        this.proj = new ProjectionSurface(this.transform);
        Object.defineProperty(this, 'worldTransform', {
            get()
            {
                return this.proj;
            },
            enumerable: true,
            configurable: true
        });
    };

    display.Container.prototype.convertSubtreeTo2s = function convertSubtreeTo2s()
    {
        this.convertTo2s();
        for (let i = 0; i < this.children.length; i++)
        {
            this.children[i].convertSubtreeTo2s();
        }
    };

    class Text2s extends text.Text
    {
        constructor(text, style, canvas)
        {
            super(text, style, canvas);Text2s.prototype.__init.call(this);;
            this.proj = new ProjectionSurface(this.transform);
            this.pluginName = 'batch_bilinear';
        }

        

        __init() {this.aTrans = new math.Matrix();}

        get worldTransform()
        {
            return this.proj ;
        }
    }

    (Text2s.prototype ).calculateVertices = Sprite2s.prototype.calculateVertices;
    (Text2s.prototype ).calculateTrimmedVertices = Sprite2s.prototype.calculateTrimmedVertices;
    (Text2s.prototype )._calculateBounds = Sprite2s.prototype._calculateBounds;

    core.Renderer.registerPlugin('batch_bilinear', BatchBilinearPluginFactory.create({}));

    function applySpine2dMixin(spineClassPrototype)
    {
        spineClassPrototype.newMesh = function newMesh(texture, vertices,
            uvs, indices, drawMode)
        {
            return new SimpleMesh2d(texture, vertices, uvs, indices, drawMode) ;
        };
        spineClassPrototype.newContainer = function newMesh()
        {
            if (!this.proj)
            {
                this.convertTo2d();
            }

            return new Container2d() ;
        };
        spineClassPrototype.newSprite = function newSprite(texture)
        {
            return new Sprite2d(texture);
        };
        spineClassPrototype.newGraphics = function newMesh()
        {
            const graphics$1 = new graphics.Graphics();
            // TODO: make Graphics2d

            graphics$1.convertTo2d();

            return graphics$1;
        };
        spineClassPrototype.transformHack = function transformHack()
        {
            return 2;
        };
    }

    function applySpine3dMixin(spineClassPrototype)
    {
        spineClassPrototype.newMesh = function newMesh(texture, vertices,
            uvs, indices, drawMode)
        {
            return new SimpleMesh3d2d(texture, vertices, uvs, indices, drawMode) ;
        };
        spineClassPrototype.newContainer = function newMesh()
        {
            if (!this.proj)
            {
                this.convertTo3d();
            }

            return new Container3d() ;
        };
        spineClassPrototype.newSprite = function newSprite(texture)
        {
            return new Sprite3d(texture);
        };
        spineClassPrototype.newGraphics = function newMesh()
        {
            const graphics$1 = new graphics.Graphics();
            // TODO: make Graphics2d

            graphics$1.convertTo3d();

            return graphics$1;
        };
        spineClassPrototype.transformHack = function transformHack()
        {
            return 2;
        };
    }

    // eslint-disable-next-line @typescript-eslint/triple-slash-reference,spaced-comment

    exports.AbstractProjection = AbstractProjection;
    exports.Batch2dPluginFactory = Batch2dPluginFactory;
    exports.Batch3dGeometry = Batch3dGeometry;
    exports.BatchBilinearPluginFactory = BatchBilinearPluginFactory;
    exports.BatchBilineardGeometry = BatchBilineardGeometry;
    exports.BilinearSurface = BilinearSurface;
    exports.Camera3d = Camera3d;
    exports.Container2d = Container2d;
    exports.Container3d = Container3d;
    exports.Euler = Euler;
    exports.LinearProjection = LinearProjection;
    exports.Matrix2d = Matrix2d;
    exports.Matrix3d = Matrix3d;
    exports.Mesh2d = Mesh2d;
    exports.Mesh3d2d = Mesh3d2d;
    exports.ObservableEuler = ObservableEuler;
    exports.ObservablePoint3d = ObservablePoint3d;
    exports.Point3d = Point3d;
    exports.Projection2d = Projection2d;
    exports.Projection3d = Projection3d;
    exports.ProjectionSurface = ProjectionSurface;
    exports.SimpleMesh2d = SimpleMesh2d;
    exports.SimpleMesh3d2d = SimpleMesh3d2d;
    exports.Sprite2d = Sprite2d;
    exports.Sprite2s = Sprite2s;
    exports.Sprite3d = Sprite3d;
    exports.SpriteMaskFilter2d = SpriteMaskFilter2d;
    exports.Surface = Surface;
    exports.Text2d = Text2d;
    exports.Text2s = Text2s;
    exports.Text3d = Text3d;
    exports.TilingSprite2d = TilingSprite2d;
    exports.TilingSprite2dRenderer = TilingSprite2dRenderer;
    exports.UniformBatchRenderer = UniformBatchRenderer;
    exports.applySpine2dMixin = applySpine2dMixin;
    exports.applySpine3dMixin = applySpine3dMixin;
    exports.container2dToLocal = container2dToLocal;
    exports.container2dWorldTransform = container2dWorldTransform;
    exports.container3dGetDepth = container3dGetDepth;
    exports.container3dIsFrontFace = container3dIsFrontFace;
    exports.container3dToLocal = container3dToLocal;
    exports.container3dWorldTransform = container3dWorldTransform;
    exports.getIntersectionFactor = getIntersectionFactor;
    exports.getPositionFromQuad = getPositionFromQuad;
    exports.transformHack = transformHack$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof pixi_projection !== 'undefined') { Object.assign(this.PIXI.projection, pixi_projection); }
//# sourceMappingURL=pixi-projection.umd.js.map
