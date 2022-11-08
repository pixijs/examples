/* eslint-disable */
 
/*!
 * @pixi/graphics-smooth - v0.0.2
 * Compiled Thu, 17 Jun 2021 16:37:58 UTC
 *
 * @pixi/graphics-smooth is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.smooth = this.PIXI.smooth || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/math'), require('@pixi/core'), require('@pixi/constants'), require('@pixi/graphics'), require('@pixi/utils'), require('@pixi/display')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/math', '@pixi/core', '@pixi/constants', '@pixi/graphics', '@pixi/utils', '@pixi/display'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global._pixi_graphics_smooth = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI, global.PIXI.utils, global.PIXI));
}(this, (function (exports, math, core, constants, graphics, utils, display) { 'use strict';

    function matrixEquals(th, matrix, eps = 1e-3) {
        return this === matrix || Math.abs(th.a - matrix.a) < eps
            && Math.abs(th.b - matrix.b) < eps
            && Math.abs(th.c - matrix.c) < eps
            && Math.abs(th.d - matrix.d) < eps
            && Math.abs(th.tx - matrix.tx) < eps
            && Math.abs(th.ty - matrix.ty) < eps;
    }

    class BatchStyleArray {
        
        
        
        

        constructor() {
            this.textureIds = [];
            this.matrices = [];
            this.lines = [];
            this.count = 0;
            //TODO: mapCoord for atlas cases
            //TODO: gradients?
        }

        clear() {
            for (let i = 0; i < this.count; i++) {
                this.textureIds[i] = null;
                this.matrices[i] = null;
            }
            this.count = 0;
        }

        add(textureId, matrix,
            lineWidth, lineAlignment,
            settings) {
            const {textureIds, matrices, lines, count} = this;
            for (let i = 0; i < count; i++) {
                if (lines[i * 2] === lineWidth && lines[i * 2 + 1] === lineAlignment
                    && textureIds[i] === textureId && (matrixEquals(matrices[i], matrix))) {
                    return i;
                }
            }
            if (count >= settings.maxStyles) {
                return -1;
            }
            textureIds[count] = textureId;
            matrices[count] = matrix;
            lines[count * 2] = lineWidth;
            lines[count * 2 + 1] = lineAlignment;
            this.count++;

            return count;
        }
    }

    class BatchDrawCall {
        
        
        
        
        
        
        
        
        

        constructor() {
            this.texArray = new core.BatchTextureArray();
            this.styleArray = new BatchStyleArray();
            this.shader = null;
            this.blend = constants.BLEND_MODES.NORMAL;

            this.start = 0;
            this.size = 0;
            this.TICK = 0; // for filling textures
            this.settings = null;
            /**
             * data for uniforms or custom webgl state
             * @member {object}
             */
            this.data = null;
        }

        clear() {
            this.texArray.clear();
            this.styleArray.clear();
            this.settings = null;
            this.data = null;
            this.shader = null;
        }

        begin(settings, shader) {
            this.TICK = ++core.BaseTexture._globalBatch;
            this.settings = settings;
            this.shader = shader;
            // start and size calculated outside
            this.start = 0;
            this.size = 0;
            this.data = null;
            if (shader && (shader ).settings) {
                this.settings = (shader ).settings;
            }
        }

        check(shader) {
            if (this.size === 0) {
                this.shader = shader;
                return true;
            }
            return (this.shader === shader);
        }

        add(texture, matrix, lineWidth, lineAlignment) {
            const {texArray, TICK, styleArray, settings} = this;
            const {baseTexture} = texture;
            // check tex
            if (baseTexture._batchEnabled !== TICK && texArray.count === settings.maxTextures) {
                return -1;
            }
            const loc = baseTexture._batchEnabled !== TICK ? texArray.count : baseTexture._batchLocation;
            // check and add style
            // add1 -> add2 only works in chain, not when there are several adds inside
            const res = styleArray.add(loc, matrix || math.Matrix.IDENTITY, lineWidth, lineAlignment, settings);
            if (res >= 0) {
                // SUCCESS here
                // add tex
                if (baseTexture._batchEnabled !== TICK) {
                    baseTexture._batchEnabled = TICK;
                    baseTexture._batchLocation = texArray.count;
                    texArray.elements[texArray.count++] = baseTexture;
                }
            }

            return res;
        }
    }

    class BatchPart
    {
        
        
        
        
        
        
        
        

        constructor()
        {
            this.reset();
        }

         begin(style, startIndex, attribStart)
        {
            this.reset();
            this.style = style;
            this.start = startIndex;
            this.attribStart = attribStart;
            this.jointEnd = 0;
        }

         end(endIndex, endAttrib)
        {
            this.attribSize = endAttrib - this.attribStart;
            this.size = endIndex - this.start;
        }

         reset()
        {
            this.style = null;
            this.size = 0;
            this.start = 0;
            this.attribStart = 0;
            this.attribSize = 0;
            this.styleId = -1;
            this.rgba = 0;
            this.jointEnd = 0;
        }
    }

    class FillStyle {
        constructor() {
            this.reset();
        }

        
        
        
        
        
        
        
        

        toJSON() {
            return this.copyTo({});
        }

        clone() {
            return this.copyTo(new FillStyle());
        }

        copyTo(obj) {
            obj.color = this.color;
            obj.alpha = this.alpha;
            obj.texture = this.texture;
            obj.matrix = this.matrix;
            obj.shader = this.shader;
            obj.visible = this.visible;
            obj.smooth = this.smooth;
            obj.matrixTex = null;
            return obj;
        }

        reset() {
            this.color = 0xFFFFFF;

            this.alpha = 1;

            this.texture = core.Texture.WHITE;

            this.matrix = null;

            this.shader = null;

            this.visible = false;

            this.smooth = false;

            this.matrixTex = null;
        }

        destroy() {
            this.texture = null;
            this.matrix = null;
            this.matrixTex = null;
        }

        getTextureMatrix() {
            const tex = this.texture;
            if (!this.matrix) {
                return null;
            }

            if (tex.frame.width === tex.baseTexture.width
                && tex.frame.height === tex.baseTexture.height) {
                return this.matrix;
            }

            if (!this.matrixTex) {
                this.matrixTex = this.matrix.clone();
            } else {
                this.matrixTex.copyFrom(this.matrix);
            }
            this.matrixTex.translate(+tex.frame.x, +tex.frame.y);
            return this.matrixTex;
        }
    }

    class LineStyle extends FillStyle {
        
        

        
        
        

        clone() {
            return this.copyTo(new LineStyle());
        }

        copyTo(obj) {
            obj.color = this.color;
            obj.alpha = this.alpha;
            obj.texture = this.texture;
            obj.matrix = this.matrix;
            obj.visible = this.visible;
            obj.width = this.width;
            obj.alignment = this.alignment;
            obj.cap = this.cap;
            obj.join = this.join;
            obj.miterLimit = this.miterLimit;
            return obj;
        }

        reset() {
            super.reset();

            this.smooth = true;

            this.color = 0x0;

            this.width = 0;

            this.alignment = 0.5;

            this.cap = graphics.LINE_CAP.BUTT;
            this.join = graphics.LINE_JOIN.MITER;
            this.miterLimit = 10;
        }
    }

    class BuildData {constructor() { BuildData.prototype.__init.call(this);BuildData.prototype.__init2.call(this);BuildData.prototype.__init3.call(this);BuildData.prototype.__init4.call(this);BuildData.prototype.__init5.call(this); }
        __init() {this.verts = [];}
        __init2() {this.joints = [];}
        __init3() {this.vertexSize = 0;}
        __init4() {this.indexSize = 0;}
        __init5() {this.closePointEps = 1e-4;}

        clear() {
            this.verts.length = 0;
            this.joints.length = 0;
            this.vertexSize = 0;
            this.indexSize = 0;
        }

        destroy() {
            this.verts.length = 0;
            this.joints.length = 0;
        }
    }

    exports.JOINT_TYPE = void 0; (function (JOINT_TYPE) {
        const NONE = 0; JOINT_TYPE[JOINT_TYPE["NONE"] = NONE] = "NONE";
        const FILL = 1; JOINT_TYPE[JOINT_TYPE["FILL"] = FILL] = "FILL";
        const JOINT_BEVEL = 4; JOINT_TYPE[JOINT_TYPE["JOINT_BEVEL"] = JOINT_BEVEL] = "JOINT_BEVEL";
        const JOINT_MITER = 8; JOINT_TYPE[JOINT_TYPE["JOINT_MITER"] = JOINT_MITER] = "JOINT_MITER";
        const JOINT_ROUND = 12; JOINT_TYPE[JOINT_TYPE["JOINT_ROUND"] = JOINT_ROUND] = "JOINT_ROUND";
        const JOINT_CAP_BUTT = 16; JOINT_TYPE[JOINT_TYPE["JOINT_CAP_BUTT"] = JOINT_CAP_BUTT] = "JOINT_CAP_BUTT";
        const JOINT_CAP_SQUARE = 18; JOINT_TYPE[JOINT_TYPE["JOINT_CAP_SQUARE"] = JOINT_CAP_SQUARE] = "JOINT_CAP_SQUARE";
        const JOINT_CAP_ROUND = 20; JOINT_TYPE[JOINT_TYPE["JOINT_CAP_ROUND"] = JOINT_CAP_ROUND] = "JOINT_CAP_ROUND";
        const FILL_EXPAND = 24; JOINT_TYPE[JOINT_TYPE["FILL_EXPAND"] = FILL_EXPAND] = "FILL_EXPAND";
        const CAP_BUTT = 1 << 5; JOINT_TYPE[JOINT_TYPE["CAP_BUTT"] = CAP_BUTT] = "CAP_BUTT";
        const CAP_SQUARE = 2 << 5; JOINT_TYPE[JOINT_TYPE["CAP_SQUARE"] = CAP_SQUARE] = "CAP_SQUARE";
        const CAP_ROUND = 3 << 5; JOINT_TYPE[JOINT_TYPE["CAP_ROUND"] = CAP_ROUND] = "CAP_ROUND";
        const CAP_BUTT2 = 4 << 5; JOINT_TYPE[JOINT_TYPE["CAP_BUTT2"] = CAP_BUTT2] = "CAP_BUTT2";
    })(exports.JOINT_TYPE || (exports.JOINT_TYPE = {}));

    class SegmentPacker {constructor() { SegmentPacker.prototype.__init.call(this);SegmentPacker.prototype.__init2.call(this);SegmentPacker.prototype.__init3.call(this); }
        static __initStatic() {this.vertsByJoint = [];}

        __init() {this.strideFloats = 11;}

        updateBufferSize(jointStart, jointLen, triangles, target) {
            const {joints} = target;
            let foundTriangle = false;

            let vertexSize = 0;
            let indexSize = 0;
            for (let i = jointStart; i < jointStart + jointLen; i++) {
                const prevCap = joints[i] & ~31;
                const joint = joints[i] & 31;

                if (joint === exports.JOINT_TYPE.FILL) {
                    foundTriangle = true;
                    vertexSize++;
                    continue;
                }

                if (joint >= exports.JOINT_TYPE.FILL_EXPAND) {
                    vertexSize += 3;
                    indexSize += 3;
                    continue;
                }

                const vs = SegmentPacker.vertsByJoint[joint] + SegmentPacker.vertsByJoint[prevCap];
                if (vs >= 3) {
                    vertexSize += vs;
                    indexSize += (vs - 2) * 3;
                }
            }
            if (foundTriangle) {
                indexSize += triangles;
            }

            target.vertexSize += vertexSize;
            target.indexSize += indexSize;
        }

        __init2() {this.bufferPos = 0;}
        __init3() {this.indexPos = 0;}
        
        
        
        

        beginPack(buildData, bufFloat, bufUint, indices, bufferPos = 0, indexPos = 0) {
            this.buildData = buildData;
            this.bufFloat = bufFloat;
            this.bufUint = bufUint;
            this.indices = indices;
            this.bufferPos = bufferPos;
            this.indexPos = indexPos;
        }

        endPack() {
            this.buildData = null;
            this.bufFloat = null;
            this.bufUint = null;
            this.indices = null;
        }

        packInterleavedGeometry(jointStart, jointLen, triangles,
                                lineStyle, color) {
            const {bufFloat, bufUint, indices, buildData, strideFloats} = this;
            const {joints, verts} = buildData;

            let bufPos = this.bufferPos;
            let indPos = this.indexPos;
            let index = this.bufferPos / this.strideFloats;

            let x1, y1, x2, y2, prevX, prevY, nextX, nextY;
            let type;
            let hasTriangle = false;

            for (let j = jointStart; j < jointStart + jointLen; j++) {
                const fullJoint = joints[j];
                const prevCap = joints[j] & ~31;
                const joint = joints[j] & 31;

                if (joint === exports.JOINT_TYPE.FILL) {
                    // just one vertex
                    hasTriangle = true;
                    x1 = verts[j * 2];
                    y1 = verts[j * 2 + 1];
                    bufFloat[bufPos] = x1;
                    bufFloat[bufPos + 1] = y1;
                    bufFloat[bufPos + 2] = x1;
                    bufFloat[bufPos + 3] = y1;
                    bufFloat[bufPos + 4] = x1;
                    bufFloat[bufPos + 5] = y1;
                    bufFloat[bufPos + 6] = x1;
                    bufFloat[bufPos + 7] = y1;
                    bufFloat[bufPos + 8] = 16 * joint;
                    bufFloat[bufPos + 9] = lineStyle;
                    bufUint[bufPos + 10] = color;
                    bufPos += strideFloats;
                    continue;
                }

                if (joint >= exports.JOINT_TYPE.FILL_EXPAND) {
                    prevX = verts[j * 2];
                    prevY = verts[j * 2 + 1];
                    x1 = verts[j * 2 + 2];
                    y1 = verts[j * 2 + 3];
                    x2 = verts[j * 2 + 4];
                    y2 = verts[j * 2 + 5];

                    const bis = j + 3;
                    for (let i = 0; i < 3; i++) {
                        bufFloat[bufPos] = prevX;
                        bufFloat[bufPos + 1] = prevY;
                        bufFloat[bufPos + 2] = x1;
                        bufFloat[bufPos + 3] = y1;
                        bufFloat[bufPos + 4] = x2;
                        bufFloat[bufPos + 5] = y2;
                        bufFloat[bufPos + 6] = verts[(bis + i) * 2];
                        bufFloat[bufPos + 7] = verts[(bis + i) * 2 + 1];
                        bufFloat[bufPos + 8] = 16 * fullJoint + i;
                        bufFloat[bufPos + 9] = lineStyle;
                        bufUint[bufPos + 10] = color;
                        bufPos += strideFloats;
                    }

                    indices[indPos] = index;
                    indices[indPos + 1] = index + 1;
                    indices[indPos + 2] = index + 2;
                    indPos += 3;
                    index += 3;
                    continue;
                }

                const vs = SegmentPacker.vertsByJoint[joint] + SegmentPacker.vertsByJoint[prevCap];
                if (vs === 0) {
                    continue;
                }
                x1 = verts[j * 2];
                y1 = verts[j * 2 + 1];
                x2 = verts[j * 2 + 2];
                y2 = verts[j * 2 + 3];
                //TODO: caps here
                prevX = verts[j * 2 - 2];
                prevY = verts[j * 2 - 1];

                if ((joint & ~2) !== exports.JOINT_TYPE.JOINT_CAP_BUTT) {
                    nextX = verts[j * 2 + 4];
                    nextY = verts[j * 2 + 5];
                } else {
                    nextX = x1;
                    nextY = y1;
                }
                type = joint;

                for (let i = 0; i < vs; i++) {
                    bufFloat[bufPos] = prevX;
                    bufFloat[bufPos + 1] = prevY;
                    bufFloat[bufPos + 2] = x1;
                    bufFloat[bufPos + 3] = y1;
                    bufFloat[bufPos + 4] = x2;
                    bufFloat[bufPos + 5] = y2;
                    bufFloat[bufPos + 6] = nextX;
                    bufFloat[bufPos + 7] = nextY;
                    bufFloat[bufPos + 8] = 16 * fullJoint + i;
                    bufFloat[bufPos + 9] = lineStyle;
                    bufUint[bufPos + 10] = color;
                    bufPos += strideFloats;
                }

                indices[indPos] = index;
                indices[indPos + 1] = index + 1;
                indices[indPos + 2] = index + 2;
                indices[indPos + 3] = index;
                indices[indPos + 4] = index + 2;
                indices[indPos + 5] = index + 3;
                indPos += 6;
                for (let j = 5; j + 1 < vs; j++) {
                    indices[indPos] = index + 4;
                    indices[indPos + 1] = index + j;
                    indices[indPos + 2] = index + j + 1;
                    indPos += 3;
                }
                index += vs;
            }

            if (hasTriangle) {
                for (let i = 0; i < triangles.length; i++) {
                    indices[indPos + i] = triangles[i] + index;
                }
                indPos += triangles.length;
            }

            this.bufferPos = bufPos;
            this.indexPos = indPos;
        }
    } SegmentPacker.__initStatic();

    const verts = SegmentPacker.vertsByJoint;
    for (let i = 0; i < 256; i++)
        verts.push(0);
    // simple fill
    verts[exports.JOINT_TYPE.FILL] = 1;

    for (let i = 0; i < 8; i++) {
        verts[exports.JOINT_TYPE.FILL_EXPAND + i] = 3;
    }

    // no caps for now
    verts[exports.JOINT_TYPE.JOINT_BEVEL] = 4 + 3;
    verts[exports.JOINT_TYPE.JOINT_BEVEL + 1] = 4 + 3;
    verts[exports.JOINT_TYPE.JOINT_BEVEL + 2] = 4 + 3;
    verts[exports.JOINT_TYPE.JOINT_BEVEL + 3] = 4 + 3;
    verts[exports.JOINT_TYPE.JOINT_ROUND] = 4 + 5;
    verts[exports.JOINT_TYPE.JOINT_ROUND + 1] = 4 + 5;
    verts[exports.JOINT_TYPE.JOINT_ROUND + 2] = 4 + 5;
    verts[exports.JOINT_TYPE.JOINT_ROUND + 3] = 4 + 5;
    verts[exports.JOINT_TYPE.JOINT_MITER] = 4 + 4;
    verts[exports.JOINT_TYPE.JOINT_MITER + 1] = 4 + 4;
    verts[exports.JOINT_TYPE.JOINT_MITER + 2] = 4;
    verts[exports.JOINT_TYPE.JOINT_MITER + 3] = 4;
    verts[exports.JOINT_TYPE.JOINT_CAP_BUTT] = 4;
    verts[exports.JOINT_TYPE.JOINT_CAP_BUTT + 1] = 4;
    verts[exports.JOINT_TYPE.JOINT_CAP_SQUARE] = 4;
    verts[exports.JOINT_TYPE.JOINT_CAP_SQUARE + 1] = 4;
    verts[exports.JOINT_TYPE.JOINT_CAP_ROUND] = 4 + 4;
    verts[exports.JOINT_TYPE.JOINT_CAP_ROUND + 1] = 4 + 4;

    verts[exports.JOINT_TYPE.CAP_ROUND] = 4;

    /**
     * A class to contain data useful for Graphics objects
     *
     * @class
     * @memberof PIXI
     */
    class SmoothGraphicsData
    {
        
        
        
        
        
        

        // result of simplification
        
        
        
        // indices in build
        
        
        
        
        
        

        constructor(shape, fillStyle = null, lineStyle = null, matrix = null)
        {
            this.shape = shape;

            this.lineStyle = lineStyle;

             this.fillStyle = fillStyle;

            this.matrix = matrix;

            this.type = shape.type;

            this.points = [];

            this.holes = [];

            this.triangles = [];

            this.closeStroke = false;

            this.clearBuild();
        }

         clearPath() {
            this.points.length = 0;
            this.closeStroke = true;
        }

         clearBuild() {
            this.triangles.length = 0;
            this.fillStart = 0;
            this.fillLen = 0;
            this.strokeStart = 0;
            this.strokeLen = 0;
            this.fillAA = false;
        }

         clone()
        {
            return new SmoothGraphicsData(
                this.shape,
                this.fillStyle,
                this.lineStyle,
                this.matrix
            );
        }

         capType() {
            let cap;
            switch (this.lineStyle.cap) {
                case graphics.LINE_CAP.SQUARE:
                    cap = exports.JOINT_TYPE.CAP_SQUARE;
                    break;
                case graphics.LINE_CAP.ROUND:
                    cap = exports.JOINT_TYPE.CAP_ROUND;
                    break;
                default:
                    cap = exports.JOINT_TYPE.CAP_BUTT;
                    break;
            }
            return cap;
        }

         jointType() {
            let joint;
            switch (this.lineStyle.join) {
                case graphics.LINE_JOIN.BEVEL:
                    joint = exports.JOINT_TYPE.JOINT_BEVEL;
                    break;
                case graphics.LINE_JOIN.ROUND:
                    joint = exports.JOINT_TYPE.JOINT_ROUND;
                    break;
                default:
                    joint = exports.JOINT_TYPE.JOINT_MITER;
                    break;
            }
            return joint;
        }

         destroy()
        {
            this.shape = null;
            this.holes.length = 0;
            this.holes = null;
            this.points.length = 0;
            this.points = null;
            this.lineStyle = null;
            this.fillStyle = null;
            this.triangles = null;
        }
    }

    // for type only

    class CircleBuilder  {
        path(graphicsData, target) {
            // need to convert points to a nice regular data
            const circleData = graphicsData.shape ;
            const points = graphicsData.points;
            const x = circleData.x;
            const y = circleData.y;
            let width;
            let height;
            // TODO - bit hacky??
            if (graphicsData.type === math.SHAPES.CIRC) {
                width = circleData.radius;
                height = circleData.radius;
            } else {
                const ellipseData = graphicsData.shape ;

                width = ellipseData.width;
                height = ellipseData.height;
            }

            if (width === 0 || height === 0) {
                return;
            }

            points.push(x, y);

            let totalSegs = Math.floor(30 * Math.sqrt(circleData.radius))
                || Math.floor(15 * Math.sqrt(width + height));

            totalSegs /= 2.3;
            if (totalSegs < 3) {
                totalSegs = 3;
            }

            const seg = (Math.PI * 2) / totalSegs;

            for (let i = 0; i < totalSegs - 0.5; i++) {
                points.push(
                    x + (Math.sin(-seg * i) * width),
                    y + (Math.cos(-seg * i) * height)
                );
            }
        }

        fill(graphicsData, target) {
            const {verts, joints} = target;
            const {points, triangles} = graphicsData;

            let vertPos = 1;
            const center = 0;

            if (!graphicsData.fillAA) {
                for (let i = 0; i < points.length; i += 2) {
                    verts.push(points[i], points[i + 1]);
                    joints.push(exports.JOINT_TYPE.FILL);
                    if (i > 2) {
                        triangles.push(vertPos++, center, vertPos);
                    }
                }
                triangles.push(vertPos, center, 1);
                return;
            }

            let cx = points[0], cy = points[1];
            let rad = (graphicsData.shape ).radius;

            for (let i = 2; i < points.length; i += 2) {
                let prev = i, cur = i, next = i + 2 < points.length ? i + 2 : 2;
                verts.push(cx);
                verts.push(cy);
                verts.push(points[cur]);
                verts.push(points[cur + 1]);
                verts.push(points[next]);
                verts.push(points[next + 1]);

                verts.push(0);
                verts.push(0);
                verts.push((points[cur] - cx) / rad);
                verts.push((points[cur + 1] - cy) / rad);
                verts.push((points[next] - cx) / rad);
                verts.push((points[next + 1] - cy) / rad);

                joints.push(exports.JOINT_TYPE.FILL_EXPAND + 2);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
            }
        }

        line(graphicsData, target) {
            const {verts, joints} = target;
            const {points} = graphicsData;
            const joint = graphicsData.jointType();
            const len = points.length;

            verts.push(points[len - 2], points[len - 1]);
            joints.push(exports.JOINT_TYPE.NONE);
            for (let i = 2; i < len; i += 2) {
                verts.push(points[i], points[i + 1]);
                joints.push(joint + 3);
            }
            verts.push(points[2], points[3]);
            joints.push(exports.JOINT_TYPE.NONE);
            verts.push(points[4], points[5]);
            joints.push(exports.JOINT_TYPE.NONE);
        }
    }

    class RectangleBuilder  {
        path(graphicsData, target) {
            // --- //
            // need to convert points to a nice regular data
            //
            const rectData = graphicsData.shape ;
            const x = rectData.x;
            const y = rectData.y;
            const width = rectData.width;
            const height = rectData.height;
            const points = graphicsData.points;

            points.length = 0;

            points.push(x, y,
                x + width, y,
                x + width, y + height,
                x, y + height);
        }

        line(graphicsData, target) {
            const {verts, joints} = target;
            const {points} = graphicsData;

            const joint = graphicsData.jointType();
            const len = points.length;

            verts.push(points[len - 2], points[len - 1]);
            joints.push(exports.JOINT_TYPE.NONE);
            for (let i = 0; i < len; i += 2) {
                verts.push(points[i], points[i + 1]);
                joints.push(joint + 3);
            }
            verts.push(points[0], points[1]);
            joints.push(exports.JOINT_TYPE.NONE);
            verts.push(points[2], points[3]);
            joints.push(exports.JOINT_TYPE.NONE);
        }

        fill(graphicsData, target) {
            const {verts, joints} = target;
            const {points, triangles} = graphicsData;

            triangles.length = 0;

            const vertPos = verts.length / 2;

            verts.push(points[0], points[1],
                points[2], points[3],
                points[4], points[5],
                points[6], points[7]);

            joints.push(exports.JOINT_TYPE.FILL, exports.JOINT_TYPE.FILL, exports.JOINT_TYPE.FILL, exports.JOINT_TYPE.FILL);
            triangles.push(0, 1, 2, 0, 2, 3);
        }
    }

    function getPt(n1, n2, perc) {
        const diff = n2 - n1;

        return n1 + (diff * perc);
    }

    function quadraticBezierCurve(
        fromX, fromY,
        cpX, cpY,
        toX, toY,
        out = []) {
        const n = 20;
        const points = out;

        let xa = 0;
        let ya = 0;
        let xb = 0;
        let yb = 0;
        let x = 0;
        let y = 0;

        for (let i = 0, j = 0; i <= n; ++i) {
            j = i / n;

            // The Green Line
            xa = getPt(fromX, cpX, j);
            ya = getPt(fromY, cpY, j);
            xb = getPt(cpX, toX, j);
            yb = getPt(cpY, toY, j);

            // The Black Dot
            x = getPt(xa, xb, j);
            y = getPt(ya, yb, j);

            points.push(x, y);
        }

        return points;
    }

    class RoundedRectangleBuilder  {
        path(graphicsData, target) {
            const rrectData = graphicsData.shape ;
            const {points} = graphicsData;
            const x = rrectData.x;
            const y = rrectData.y;
            const width = rrectData.width;
            const height = rrectData.height;

            // Don't allow negative radius or greater than half the smallest width
            const radius = Math.max(0, Math.min(rrectData.radius, Math.min(width, height) / 2));

            points.length = 0;

            // No radius, do a simple rectangle
            if (!radius) {
                points.push(x, y,
                    x + width, y,
                    x + width, y + height,
                    x, y + height);
            } else {
                quadraticBezierCurve(x, y + radius,
                    x, y,
                    x + radius, y,
                    points);
                quadraticBezierCurve(x + width - radius,
                    y, x + width, y,
                    x + width, y + radius,
                    points);
                quadraticBezierCurve(x + width, y + height - radius,
                    x + width, y + height,
                    x + width - radius, y + height,
                    points);
                quadraticBezierCurve(x + radius, y + height,
                    x, y + height,
                    x, y + height - radius,
                    points);
            }
        }

        line(graphicsData, target) {
            const {verts, joints} = target;
            const {points} = graphicsData;

            const joint = graphicsData.jointType();
            const len = points.length;

            verts.push(points[len - 2], points[len - 1]);
            joints.push(exports.JOINT_TYPE.NONE);
            for (let i = 0; i < len; i += 2) {
                verts.push(points[i], points[i + 1]);
                joints.push(joint + 3);
            }
            verts.push(points[0], points[1]);
            joints.push(exports.JOINT_TYPE.NONE);
        }

        fill(graphicsData, target) {
            const {verts, joints} = target;
            const {points, triangles} = graphicsData;

            const vecPos = verts.length / 2;

            graphicsData.triangles = utils.earcut(points, null, 2);

            for (let i = 0, j = points.length; i < j; i++)
            {
                verts.push(points[i], points[++i]);
                joints.push(exports.JOINT_TYPE.FILL);
            }
        }
    }

    let tempArr = [];

    class PolyBuilder  {
        path(graphicsData, buildData) {
            const shape = graphicsData.shape ;
            let points = graphicsData.points = shape.points.slice();
            const eps = buildData.closePointEps;
            const eps2 = eps * eps;

            if (points.length === 0) {
                return;
            }

            const firstPoint = new math.Point(points[0], points[1]);
            const lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);
            const closedShape = graphicsData.closeStroke = shape.closeStroke;

            let len = points.length;
            let newLen = 2;

            // 1. remove equal points
            for (let i = 2; i < len; i += 2) {
                const x1 = points[i - 2], y1 = points[i - 1], x2 = points[i], y2 = points[i + 1];
                let flag = true;
                if (Math.abs(x1 - x2) < eps
                    && Math.abs(y1 - y2) < eps) {
                    flag = false;
                }

                if (flag) {
                    points[newLen] = points[i];
                    points[newLen + 1] = points[i + 1];
                    newLen += 2;
                }
            }
            points.length = len = newLen;

            newLen = 2;
            // 2. remove middle points
            for (let i = 2; i + 2 < len; i += 2) {
                let x1 = points[i - 2], y1 = points[i - 1], x2 = points[i], y2 = points[i + 1],
                    x3 = points[i + 2], y3 = points[i + 3];

                x1 -= x2;
                y1 -= y2;
                x3 -= x2;
                y3 -= y2;
                let flag = true;
                if (Math.abs(x3 * y1 - y3 * x1) < eps2) {
                    if (x1 * x2 + y1 * y2 < -eps2) {
                        flag = false;
                    }
                }

                if (flag) {
                    points[newLen] = points[i];
                    points[newLen + 1] = points[i + 1];
                    newLen += 2;
                }
            }
            points[newLen] = points[len - 2];
            points[newLen + 1] = points[len - 1];
            newLen += 2;

            points.length = len = newLen;

            if (len <= 2) {
                // suddenly, nothing
                return;
            }

            if (closedShape) {
                // first point should be last point in closed line!
                const closedPath = Math.abs(firstPoint.x - lastPoint.x) < eps
                    && Math.abs(firstPoint.y - lastPoint.y) < eps;

                if (closedPath) {
                    points.pop();
                    points.pop();
                }
            }
        }

        line(graphicsData, buildData) {
            const {closeStroke, points} = graphicsData;
            const eps = buildData.closePointEps;
            const eps2 = eps * eps;
            const len = points.length;
            const style = graphicsData.lineStyle;

            if (len <= 2) {
                return;
            }
            const {verts, joints} = buildData;

            //TODO: alignment

            let joint = graphicsData.jointType();
            let cap = graphicsData.capType();
            let prevCap = 0;

            let prevX, prevY;
            if (closeStroke) {
                prevX = points[len - 2];
                prevY = points[len - 1];
                joints.push(exports.JOINT_TYPE.NONE);
            } else {
                prevX = points[2];
                prevY = points[3];
                if (cap === exports.JOINT_TYPE.CAP_ROUND) {
                    verts.push(points[0], points[1]);
                    joints.push(exports.JOINT_TYPE.NONE);
                    joints.push(exports.JOINT_TYPE.CAP_ROUND);
                    prevCap = 0;
                } else {
                    prevCap = cap;
                    joints.push(exports.JOINT_TYPE.NONE);
                }
            }
            verts.push(prevX, prevY);

            /* Line segments of interest where (x1,y1) forms the corner. */
            for (let i = 0; i < len; i += 2) {
                const x1 = points[i], y1 = points[i + 1];

                let x2, y2;
                if (i + 2 < len) {
                    x2 = points[i + 2];
                    y2 = points[i + 3];
                } else {
                    x2 = points[0];
                    y2 = points[1];
                }

                const dx = x2 - x1;
                const dy = y2 - y1;
                let nextX, nextY;

                let endJoint = joint;
                if (i + 2 >= len) {
                    nextX = points[2];
                    nextY = points[3];
                    if (!closeStroke) {
                        endJoint = exports.JOINT_TYPE.NONE;
                    }
                } else if (i + 4 >= len) {
                    nextX = points[0];
                    nextY = points[1];
                    if (!closeStroke) {
                        if (cap === exports.JOINT_TYPE.CAP_ROUND) {
                            endJoint = exports.JOINT_TYPE.JOINT_CAP_ROUND;
                        }
                        if (cap === exports.JOINT_TYPE.CAP_BUTT) {
                            endJoint = exports.JOINT_TYPE.JOINT_CAP_BUTT;
                        }
                        if (cap === exports.JOINT_TYPE.CAP_SQUARE) {
                            endJoint = exports.JOINT_TYPE.JOINT_CAP_SQUARE;
                        }
                    }
                } else {
                    nextX = points[i + 4];
                    nextY = points[i + 5];
                }

                const dx3 = x1 - prevX;
                const dy3 = y1 - prevY;

                if (joint >= exports.JOINT_TYPE.JOINT_BEVEL && joint <= exports.JOINT_TYPE.JOINT_MITER) {
                    const dx2 = nextX - x2;
                    const dy2 = nextY - y2;
                    if (endJoint >= exports.JOINT_TYPE.JOINT_BEVEL
                        && endJoint <= exports.JOINT_TYPE.JOINT_MITER + 3) {
                        const D = dx2 * dy - dy2 * dx;
                        if (Math.abs(D) < eps) {
                            switch (joint & ~3) {
                                case exports.JOINT_TYPE.JOINT_ROUND:
                                    endJoint = exports.JOINT_TYPE.JOINT_CAP_ROUND;
                                    break;
                                default:
                                    endJoint = exports.JOINT_TYPE.JOINT_CAP_BUTT;
                                    break;
                            }
                        }
                    }

                    if (joint === exports.JOINT_TYPE.JOINT_MITER) {
                        let jointAdd = 0;
                        if (dx3 * dx + dy3 * dy > -eps) {
                            jointAdd++;
                        }
                        if (endJoint === exports.JOINT_TYPE.JOINT_MITER && dx2 * dx + dy2 * dy > -eps) {
                            jointAdd += 2;
                        }
                        endJoint += jointAdd;
                    }
                }
                if (prevCap === 0) {
                    if (Math.abs(dx3 * dy - dy3 * dx) < eps) {
                        prevCap = exports.JOINT_TYPE.CAP_BUTT2;
                    }
                }
                endJoint += prevCap;
                prevCap = 0;

                verts.push(x1, y1);
                joints.push(endJoint);

                prevX = x1;
                prevY = y1;
            }

            if (closeStroke) {
                verts.push(points[0], points[1]);
                joints.push(exports.JOINT_TYPE.NONE);
                verts.push(points[2], points[3]);
                joints.push(exports.JOINT_TYPE.NONE);
            } else {
                verts.push(points[len - 4], points[len - 3]);
                joints.push(exports.JOINT_TYPE.NONE);
            }
        }

        fill(graphicsData, buildData) {
            let points = graphicsData.points;
            //TODO: simplify holes too!
            const holes = graphicsData.holes;
            const eps = buildData.closePointEps;

            const {verts, joints} = buildData;

            if (points.length < 6) {
                return
            }
            const holeArray = [];
            let len = points.length;
            // Process holes..

            for (let i = 0; i < holes.length; i++) {
                const hole = holes[i];

                holeArray.push(points.length / 2);
                points = points.concat(hole.points);
            }

            //TODO: reduce size later?
            const pn = tempArr;
            if (pn.length < points.length) {
                pn.length = points.length;
            }
            let start = 0;
            for (let i = 0; i <= holeArray.length; i++) {
                let finish = len / 2;
                if (i > 0) {
                    if (i < holeArray.length) {
                        finish = holeArray[i];
                    } else {
                        finish = (points.length >> 1);
                    }
                }
                pn[start * 2] = finish - 1;
                pn[(finish - 1) * 2 + 1] = 0;
                for (let j = start; j + 1 < finish; j++) {
                    pn[j * 2 + 1] = j + 1;
                    pn[j * 2 + 2] = j;
                }
            }

            // sort color
            graphicsData.triangles = utils.earcut(points, holeArray, 2);

            if (!graphicsData.triangles) {
                return;
            }

            if (!graphicsData.fillAA) {
                for (let i = 0; i < points.length; i += 2) {
                    verts.push(points[i], points[i + 1]);
                    joints.push(exports.JOINT_TYPE.FILL);
                }
                return;
            }

            const {triangles} = graphicsData;
            len = points.length;

            for (let i = 0; i < triangles.length; i += 3) {
                //TODO: holes prev/next!!!
                let flag = 0;
                for (let j = 0; j < 3; j++) {
                    const ind1 = triangles[i + j];
                    const ind2 = triangles[i + (j + 1) % 3];
                    if (pn[ind1 * 2] === ind2 || pn[ind1 * 2 + 1] === ind2) {
                        flag |= (1 << j);
                    }
                }
                joints.push(exports.JOINT_TYPE.FILL_EXPAND + flag);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
                joints.push(exports.JOINT_TYPE.NONE);
            }

            // bisect, re-using pn
            for (let ind = 0; ind < len / 2; ind++) {
                let prev = pn[ind * 2];
                let next = pn[ind * 2 + 1];
                let nx1 = (points[next * 2 + 1] - points[ind * 2 + 1]), ny1 = -(points[next * 2] - points[ind * 2]);
                let nx2 = (points[ind * 2 + 1] - points[prev * 2 + 1]), ny2 = -(points[ind * 2] - points[prev * 2]);
                let D1 = Math.sqrt(nx1 * nx1 + ny1 * ny1);
                nx1 /= D1;
                ny1 /= D1;
                let D2 = Math.sqrt(nx2 * nx2 + ny2 * ny2);
                nx2 /= D2;
                ny2 /= D2;

                let bx = (nx1 + nx2);
                let by = (ny1 + ny2);
                let D = bx * nx1 + by * ny1;
                if (Math.abs(D) < eps) {
                    bx = nx1;
                    by = ny1;
                } else {
                    bx /= D;
                    by /= D;
                }
                pn[ind * 2] = bx;
                pn[ind * 2 + 1] = by;
            }

            for (let i = 0; i < triangles.length; i += 3) {
                const prev = triangles[i];
                const ind = triangles[i + 1];
                const next = triangles[i + 2];
                let nx1 = (points[next * 2 + 1] - points[ind * 2 + 1]), ny1 = -(points[next * 2] - points[ind * 2]);
                let nx2 = (points[ind * 2 + 1] - points[prev * 2 + 1]), ny2 = -(points[ind * 2] - points[prev * 2]);

                let j1 = 1;
                if (nx1 * ny2 - nx2 * ny1 > 0.0) {
                    j1 = 2;
                }

                for (let j = 0; j < 3; j++) {
                    let ind = triangles[i + (j * j1) % 3];
                    verts.push(points[ind * 2], points[ind * 2 + 1]);
                }
                for (let j = 0; j < 3; j++) {
                    let ind = triangles[i + (j * j1) % 3];
                    verts.push(pn[ind * 2], pn[ind * 2 + 1]);
                }
            }
        }
    }

    const FILL_COMMANDS = {
        [math.SHAPES.POLY]: new PolyBuilder(),
        [math.SHAPES.CIRC]: new CircleBuilder(),
        [math.SHAPES.ELIP]: new CircleBuilder(),
        [math.SHAPES.RECT]: new RectangleBuilder(),
        [math.SHAPES.RREC]: new RoundedRectangleBuilder()
    };

    /*
     * Complex shape type
     * @todo Move to Math shapes
     */


    const BATCH_POOL = [];
    const DRAW_CALL_POOL = [];

    const tmpPoint = new math.Point();
    const tmpBounds = new display.Bounds();

    class SmoothGraphicsGeometry extends core.Geometry {
         static __initStatic() {this.BATCHABLE_SIZE = 100;}

        

        __init() {this.indicesUint16 = null;}
        

        

        get points() {
            return this.buildData.verts;
        }

        get closePointEps() {
            return this.buildData.closePointEps;
        }

        
        
        
        
        
        
        
        

        
        
        
        
        
        
        

        
        
        
        

        initAttributes(_static) {
            this._buffer = new core.Buffer(null, _static, false);
            this._bufferFloats = new Float32Array();
            this._bufferUint = new Uint32Array();

            this._indexBuffer = new core.Buffer(null, _static, true);
            this.addAttribute('aPrev', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aPoint1', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aPoint2', this._buffer, 2, false, constants.TYPES.FLOAT)
                .addAttribute('aNext', this._buffer, 2, false, constants.TYPES.FLOAT)
                // number of vertex
                .addAttribute('aVertexJoint', this._buffer, 1, false, constants.TYPES.FLOAT)
                // line width, alignment
                .addAttribute('aStyleId', this._buffer, 1, false, constants.TYPES.FLOAT)
                // the usual
                .addAttribute('aColor', this._buffer, 4, true, constants.TYPES.UNSIGNED_BYTE)
                .addIndex(this._indexBuffer);

            this.strideFloats = 11;
        }

        constructor() {
            super();SmoothGraphicsGeometry.prototype.__init.call(this);;

            this.initAttributes(false);

            this.buildData = new BuildData();

            this.graphicsData = [];

            this.dirty = 0;

            this.batchDirty = -1;

            this.cacheDirty = -1;

            this.clearDirty = 0;

            this.drawCalls = [];

            this.batches = [];

            this.shapeBuildIndex = 0;

            this.shapeBatchIndex = 0;

            this._bounds = new display.Bounds();

            this.boundsDirty = -1;

            this.boundsPadding = 0;

            this.batchable = false;

            this.indicesUint16 = null;

            this.packer = null;
            this.packSize = 0;
            this.pack32index = null;
        }

         checkInstancing(instanced, allow32Indices) {
            if (this.packer) {
                return;
            }
            this.packer = new SegmentPacker();
            this.pack32index = allow32Indices;
        }

        /**
         * Get the current bounds of the graphic geometry.
         *
         * @member {PIXI.Bounds}
         * @readonly
         */
         get bounds() {
            if (this.boundsDirty !== this.dirty) {
                this.boundsDirty = this.dirty;
                this.calculateBounds();
            }

            return this._bounds;
        }

        /**
         * Call if you changed graphicsData manually.
         * Empties all batch buffers.
         */
         invalidate() {
            this.boundsDirty = -1;
            this.dirty++;
            this.batchDirty++;
            this.shapeBuildIndex = 0;
            this.shapeBatchIndex = 0;
            this.packSize = 0;

            this.buildData.clear();

            for (let i = 0; i < this.drawCalls.length; i++) {
                this.drawCalls[i].texArray.clear();
                DRAW_CALL_POOL.push(this.drawCalls[i]);
            }

            this.drawCalls.length = 0;

            for (let i = 0; i < this.batches.length; i++) {
                const batchPart = this.batches[i];

                batchPart.reset();
                BATCH_POOL.push(batchPart);
            }

            this.batches.length = 0;
        }

         clear() {
            if (this.graphicsData.length > 0) {
                this.invalidate();
                this.clearDirty++;
                this.graphicsData.length = 0;
            }

            return this;
        }

         drawShape(
            shape,
            fillStyle = null,
            lineStyle = null,
            matrix = null) {
            const data = new SmoothGraphicsData(shape, fillStyle, lineStyle, matrix);

            this.graphicsData.push(data);
            this.dirty++;

            return this;
        }

         drawHole(shape, matrix = null) {
            if (!this.graphicsData.length) {
                return null;
            }

            const data = new SmoothGraphicsData(shape, null, null, matrix);

            const lastShape = this.graphicsData[this.graphicsData.length - 1];

            data.lineStyle = lastShape.lineStyle;

            lastShape.holes.push(data);

            this.dirty++;

            return this;
        }

         destroy() {
            super.destroy();

            // destroy each of the SmoothGraphicsData objects
            for (let i = 0; i < this.graphicsData.length; ++i) {
                this.graphicsData[i].destroy();
            }

            this.buildData.destroy();
            this.buildData = null;
            this.indexBuffer.destroy();
            this.indexBuffer = null;
            this.graphicsData.length = 0;
            this.graphicsData = null;
            this.drawCalls.length = 0;
            this.drawCalls = null;
            this.batches.length = 0;
            this.batches = null;
            this._bounds = null;
        }

        /**
         * Check to see if a point is contained within this geometry.
         *
         * @param {PIXI.IPointData} point - Point to check if it's contained.
         * @return {Boolean} `true` if the point is contained within geometry.
         */
         containsPoint(point) {
            const graphicsData = this.graphicsData;

            for (let i = 0; i < graphicsData.length; ++i) {
                const data = graphicsData[i];

                if (!data.fillStyle.visible) {
                    continue;
                }

                // only deal with fills..
                if (data.shape) {
                    if (data.matrix) {
                        data.matrix.applyInverse(point, tmpPoint);
                    } else {
                        tmpPoint.copyFrom(point);
                    }

                    if (data.shape.contains(tmpPoint.x, tmpPoint.y)) {
                        let hitHole = false;

                        if (data.holes) {
                            for (let i = 0; i < data.holes.length; i++) {
                                const hole = data.holes[i];

                                if (hole.shape.contains(tmpPoint.x, tmpPoint.y)) {
                                    hitHole = true;
                                    break;
                                }
                            }
                        }

                        if (!hitHole) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        updatePoints() {

        }

        updateBufferSize() {
            this._buffer.update(new Float32Array());
        }

        updateBuild() {
            const {graphicsData, buildData} = this;
            const len = graphicsData.length;

            for (let i = this.shapeBuildIndex; i < len; i++) {
                const data = graphicsData[i];

                data.strokeStart = 0;
                data.strokeLen = 0;
                data.fillStart = 0;
                data.fillLen = 0;
                const {fillStyle, lineStyle, holes} = data;
                if (!fillStyle.visible && !lineStyle.visible) {
                    continue;
                }

                const command = FILL_COMMANDS[data.type];
                data.clearPath();

                command.path(data, buildData);
                if (data.matrix) {
                    this.transformPoints(data.points, data.matrix);
                }

                data.clearBuild();
                if (fillStyle.visible) {
                    if (holes.length) {
                        this.processHoles(holes);
                    }
                    data.fillAA = (data.fillStyle ).smooth
                        && !(data.lineStyle.visible
                        && data.lineStyle.alpha >= 0.99
                        && data.lineStyle.width >= 0.99);

                    data.fillStart = buildData.joints.length;
                    command.fill(data, buildData);
                    data.fillLen = buildData.joints.length - data.fillStart;
                }
                if (lineStyle.visible) {
                    data.strokeStart = buildData.joints.length;
                    command.line(data, buildData);
                    data.strokeLen = buildData.joints.length - data.strokeStart;
                }
            }
            this.shapeBuildIndex = len;
        }

        updateBatches(shaderSettings) {
            if (!this.graphicsData.length) {
                this.batchable = true;

                return;
            }
            this.updateBuild();

            if (!this.validateBatching()) {
                return;
            }

            const {buildData, graphicsData, packer} = this;
            const len = graphicsData.length;

            this.cacheDirty = this.dirty;

            let batchPart = null;

            let currentStyle = null;

            if (this.batches.length > 0) {
                batchPart = this.batches[this.batches.length - 1];
                currentStyle = batchPart.style;
            }

            for (let i = this.shapeBatchIndex; i < len; i++) {

                const data = graphicsData[i];
                const fillStyle = data.fillStyle;
                const lineStyle = data.lineStyle;

                if (data.matrix) {
                    this.transformPoints(data.points, data.matrix);
                }
                if (!fillStyle.visible && !lineStyle.visible) {
                    continue;
                }
                for (let j = 0; j < 2; j++) {
                    const style = (j === 0) ? fillStyle : lineStyle;

                    if (!style.visible) continue;

                    const nextTexture = style.texture.baseTexture;
                    const attribOld = buildData.vertexSize;
                    const indexOld = buildData.indexSize;

                    nextTexture.wrapMode = constants.WRAP_MODES.REPEAT;
                    if (j === 0) {
                        this.packer.updateBufferSize(data.fillStart, data.fillLen, data.triangles.length, buildData);
                    } else {
                        this.packer.updateBufferSize(data.strokeStart, data.strokeLen, data.triangles.length, buildData);
                    }

                    const attribSize = buildData.vertexSize;

                    if (attribSize === attribOld) continue;
                    // close batch if style is different
                    if (batchPart && !this._compareStyles(currentStyle, style)) {
                        batchPart.end(indexOld, attribOld);
                        batchPart = null;
                    }
                    // spawn new batch if its first batch or previous was closed
                    if (!batchPart) {
                        batchPart = BATCH_POOL.pop() || new BatchPart();
                        batchPart.begin(style, indexOld, attribOld);
                        this.batches.push(batchPart);
                        currentStyle = style;
                    }

                    if (j === 0) {
                        batchPart.jointEnd = data.fillStart + data.fillLen;
                    } else {
                        batchPart.jointEnd = data.strokeStart + data.strokeLen;
                    }
                }
            }
            this.shapeBatchIndex = len;

            if (batchPart) {
                batchPart.end(buildData.indexSize, buildData.vertexSize);
            }

            if (this.batches.length === 0) {
                // there are no visible styles in SmoothGraphicsData
                // its possible that someone wants Graphics just for the bounds
                this.batchable = true;

                return;
            }

            // TODO make this a const..
            this.batchable = this.isBatchable();

            if (this.batchable) {
                this.packBatches();
            } else {
                this.buildDrawCalls(shaderSettings);
                this.updatePack();
            }
        }

        updatePack() {
            const { vertexSize, indexSize } = this.buildData;

            if (this.packSize === vertexSize) {
                return;
            }

            const { strideFloats, packer, buildData, batches } = this;
            const buffer = this._buffer;
            const index = this._indexBuffer;
            const floatsSize = vertexSize * strideFloats;

            if (buffer.data.length !== floatsSize) {
                const arrBuf = new ArrayBuffer(floatsSize * 4);
                this._bufferFloats = new Float32Array(arrBuf);
                this._bufferUint = new Uint32Array(arrBuf);
                buffer.data = this._bufferFloats;
            }
            if (index.data.length !== indexSize) {
                if (vertexSize > 0xffff && this.pack32index) {
                    index.data = new Uint32Array(indexSize);
                } else {
                    index.data = new Uint16Array(indexSize);
                }
            }

            packer.beginPack(buildData, this._bufferFloats, this._bufferUint, index.data );

            let j = 0;
            for (let i=0; i < this.graphicsData.length; i++) {
                const data = this.graphicsData[i];

                if (data.fillLen) {
                    while (batches[j].jointEnd <= data.fillStart) {
                        j++;
                    }
                    packer.packInterleavedGeometry(data.fillStart, data.fillLen, data.triangles,
                        batches[j].styleId, batches[j].rgba);
                }
                if (data.strokeLen) {
                    while (batches[j].jointEnd <= data.strokeStart) {
                        j++;
                    }
                    packer.packInterleavedGeometry(data.strokeStart, data.strokeLen, data.triangles,
                            batches[j].styleId, batches[j].rgba);
                }
            }

            buffer.update();
            index.update();
            this.packSize = vertexSize;
        }

        /**
         * Affinity check
         *
         * @param {PIXI.FillStyle | PIXI.LineStyle} styleA
         * @param {PIXI.FillStyle | PIXI.LineStyle} styleB
         */
         _compareStyles(styleA, styleB) {
            if (!styleA || !styleB) {
                return false;
            }

            if (styleA.texture.baseTexture !== styleB.texture.baseTexture) {
                return false;
            }

            if (styleA.color + styleA.alpha !== styleB.color + styleB.alpha) {
                return false;
            }

            //TODO: propagate width for FillStyle
            if ((styleA ).width !== (styleB ).width) {
                return false;
            }

            const mat1 = styleA.matrix || math.Matrix.IDENTITY;
            const mat2 = styleB.matrix || math.Matrix.IDENTITY;

            return matrixEquals(mat1, mat2);
        }

        /**
         * Test geometry for batching process.
         *
         * @protected
         */
         validateBatching() {
            if (this.dirty === this.cacheDirty || !this.graphicsData.length) {
                return false;
            }

            for (let i = 0, l = this.graphicsData.length; i < l; i++) {
                const data = this.graphicsData[i];
                const fill = data.fillStyle;
                const line = data.lineStyle;

                if (fill && !fill.texture.baseTexture.valid) return false;
                if (line && !line.texture.baseTexture.valid) return false;
            }

            return true;
        }

        /**
         * Offset the indices so that it works with the batcher.
         *
         * @protected
         */
         packBatches() {
            this.batchDirty++;
            const batches = this.batches;

            for (let i = 0, l = batches.length; i < l; i++) {
                const batch = batches[i];

                for (let j = 0; j < batch.size; j++) {
                    const index = batch.start + j;

                    this.indicesUint16[index] = this.indicesUint16[index] - batch.attribStart;
                }
            }
        }

         isBatchable() {
            return false;

            // prevent heavy mesh batching
            // if (this.points.length > 0xffff * 2) {
            //     return false;
            // }
            //
            // const batches = this.batches;
            //
            // for (let i = 0; i < batches.length; i++) {
            //     if ((batches[i].style as LineStyle).native) {
            //         return false;
            //     }
            // }
            //
            // return (this.points.length < SmoothGraphicsGeometry.BATCHABLE_SIZE * 2);
        }

        /**
         * Converts intermediate batches data to drawCalls.
         *
         * @protected
         */
         buildDrawCalls(shaderSettings) {
            let TICK = ++core.BaseTexture._globalBatch;

            for (let i = 0; i < this.drawCalls.length; i++) {
                this.drawCalls[i].texArray.clear();
                DRAW_CALL_POOL.push(this.drawCalls[i]);
            }

            this.drawCalls.length = 0;

            let currentGroup = DRAW_CALL_POOL.pop() || new BatchDrawCall();
            currentGroup.begin(shaderSettings, null);

            let index = 0;

            this.drawCalls.push(currentGroup);

            for (let i = 0; i < this.batches.length; i++) {
                const batchData = this.batches[i];
                const style = batchData.style ;

                if (batchData.attribSize === 0) {
                    // I don't know how why do we have size=0 sometimes
                    continue;
                }

                let styleId = -1;
                const mat = style.getTextureMatrix();
                if (currentGroup.check(style.shader)) {
                    styleId = currentGroup.add(style.texture, mat, style.width || 0, style.alignment || 0);
                }
                if (styleId < 0) {
                    currentGroup = DRAW_CALL_POOL.pop() || new BatchDrawCall();
                    this.drawCalls.push(currentGroup);
                    currentGroup.begin(shaderSettings, style.shader);
                    currentGroup.start = index;
                    styleId = currentGroup.add(style.texture, mat, style.width || 0, style.alignment || 0);
                }
                currentGroup.size += batchData.size;
                index += batchData.size;

                const {color, alpha} = style;
                const rgb = (color >> 16) + (color & 0xff00) + ((color & 0xff) << 16);
                batchData.rgba = utils.premultiplyTint(rgb, alpha);
                batchData.styleId = styleId;
            }

            core.BaseTexture._globalBatch = TICK;
        }

         processHoles(holes) {
            for (let i = 0; i < holes.length; i++) {
                const hole = holes[i];
                const command = FILL_COMMANDS[hole.type];

                command.path(hole, this.buildData);

                if (hole.matrix) {
                    this.transformPoints(hole.points, hole.matrix);
                }
            }
        }

        /**
         * Update the local bounds of the object. Expensive to use performance-wise.
         *
         * @protected
         */
         calculateBounds() {
            const bounds = this._bounds;
            const sequenceBounds = tmpBounds;
            let curMatrix = math.Matrix.IDENTITY;

            this._bounds.clear();
            sequenceBounds.clear();

            for (let i = 0; i < this.graphicsData.length; i++) {
                const data = this.graphicsData[i];
                const shape = data.shape;
                const type = data.type;
                const lineStyle = data.lineStyle;
                const nextMatrix = data.matrix || math.Matrix.IDENTITY;
                let lineWidth = 0.0;

                if (lineStyle && lineStyle.visible) {
                    const alignment = lineStyle.alignment;

                    lineWidth = lineStyle.width;

                    if (type === math.SHAPES.POLY) {
                        lineWidth = lineWidth * (0.5 + Math.abs(0.5 - alignment));
                    } else {
                        lineWidth = lineWidth * Math.max(0, alignment);
                    }
                }

                if (curMatrix !== nextMatrix) {
                    if (!sequenceBounds.isEmpty()) {
                        bounds.addBoundsMatrix(sequenceBounds, curMatrix);
                        sequenceBounds.clear();
                    }
                    curMatrix = nextMatrix;
                }

                if (type === math.SHAPES.RECT || type === math.SHAPES.RREC) {
                    const rect = shape ;

                    sequenceBounds.addFramePad(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height,
                        lineWidth, lineWidth);
                } else if (type === math.SHAPES.CIRC) {
                    const circle = shape ;

                    sequenceBounds.addFramePad(circle.x, circle.y, circle.x, circle.y,
                        circle.radius + lineWidth, circle.radius + lineWidth);
                } else if (type === math.SHAPES.ELIP) {
                    const ellipse = shape ;

                    sequenceBounds.addFramePad(ellipse.x, ellipse.y, ellipse.x, ellipse.y,
                        ellipse.width + lineWidth, ellipse.height + lineWidth);
                } else {
                    const poly = shape ;
                    // adding directly to the bounds

                    bounds.addVerticesMatrix(curMatrix, (poly.points ), 0, poly.points.length, lineWidth, lineWidth);
                }
            }

            if (!sequenceBounds.isEmpty()) {
                bounds.addBoundsMatrix(sequenceBounds, curMatrix);
            }

            bounds.pad(this.boundsPadding, this.boundsPadding);
        }

        /**
         * Transform points using matrix.
         *
         * @protected
         * @param {number[]} points - Points to transform
         * @param {PIXI.Matrix} matrix - Transform matrix
         */
         transformPoints(points, matrix) {
            for (let i = 0; i < points.length / 2; i++) {
                const x = points[(i * 2)];
                const y = points[(i * 2) + 1];

                points[(i * 2)] = (matrix.a * x) + (matrix.c * y) + matrix.tx;
                points[(i * 2) + 1] = (matrix.b * x) + (matrix.d * y) + matrix.ty;
            }
        }
    } SmoothGraphicsGeometry.__initStatic();

    const smoothVert = `precision highp float;
const float FILL = 1.0;
const float BEVEL = 4.0;
const float MITER = 8.0;
const float ROUND = 12.0;
const float JOINT_CAP_BUTT = 16.0;
const float JOINT_CAP_SQUARE = 18.0;
const float JOINT_CAP_ROUND = 20.0;

const float FILL_EXPAND = 24.0;

const float CAP_BUTT = 1.0;
const float CAP_SQUARE = 2.0;
const float CAP_ROUND = 3.0;
const float CAP_BUTT2 = 4.0;

const float MITER_LIMIT = 10.0;

// === geom ===
attribute vec2 aPrev;
attribute vec2 aPoint1;
attribute vec2 aPoint2;
attribute vec2 aNext;
attribute float aVertexJoint;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec4 vSignedCoord;
varying vec4 vDistance;
varying float vType;

uniform float resolution;
uniform float expand;

// === style ===
attribute float aStyleId;
attribute vec4 aColor;

varying float vTextureId;
varying vec4 vColor;
varying vec2 vTextureCoord;

uniform vec2 styleLine[%MAX_STYLES%];
uniform vec3 styleMatrix[2 * %MAX_STYLES%];
uniform float styleTextureId[%MAX_STYLES%];
uniform vec2 samplerSize[%MAX_TEXTURES%];

vec2 doBisect(vec2 norm, float len, vec2 norm2, float len2,
    float dy, float inner) {
    vec2 bisect = (norm + norm2) / 2.0;
    bisect /= dot(norm, bisect);
    vec2 shift = dy * bisect;
    if (inner > 0.5) {
        if (len < len2) {
            if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
                return dy * norm;
            }
        } else {
            if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
                return dy * norm;
            }
        }
    }
    return dy * bisect;
}

void main(void){
    vec2 pointA = (translationMatrix * vec3(aPoint1, 1.0)).xy;
    vec2 pointB = (translationMatrix * vec3(aPoint2, 1.0)).xy;

    vec2 xBasis = pointB - pointA;
    float len = length(xBasis);
    vec2 norm = vec2(xBasis.y, -xBasis.x) / len;

    float type = floor(aVertexJoint / 16.0);
    float vertexNum = aVertexJoint - type * 16.0;
    float dx = 0.0, dy = 1.0;

    float capType = floor(type / 32.0);
    type -= capType * 32.0;

    int styleId = int(aStyleId + 0.5);
    float lineWidth = styleLine[styleId].x * 0.5;
    vTextureId = styleTextureId[styleId];
    vTextureCoord = vec2(0.0);

    vec2 pos;

    if (capType == CAP_ROUND) {
        vertexNum += 4.0;
        type = JOINT_CAP_ROUND;
        capType = 0.0;
    }

    if (type == FILL) {
        pos = pointA;
        vDistance = vec4(0.0, -0.5, -0.5, 1.0);
        vType = 0.0;

        vec2 vTexturePixel;
        vTexturePixel.x = dot(vec3(aPoint1, 1.0), styleMatrix[styleId * 2]);
        vTexturePixel.y = dot(vec3(aPoint1, 1.0), styleMatrix[styleId * 2 + 1]);
        vTextureCoord = vTexturePixel / samplerSize[int(vTextureId)];
    } else if (type >= FILL_EXPAND && type < FILL_EXPAND + 7.5) {
        // expand vertices
        float flags = type - FILL_EXPAND;
        float flag3 = floor(flags / 4.0);
        float flag2 = floor((flags - flag3 * 4.0) / 2.0);
        float flag1 = flags - flag3 * 4.0 - flag2 * 2.0;

        vec2 prev = (translationMatrix * vec3(aPrev, 1.0)).xy;

        if (vertexNum < 0.5) {
            pos = prev;
        } else if (vertexNum < 1.5) {
            pos = pointA;
        } else {
            pos = pointB;
        }
        float len2 = length(aNext);
        vec2 bisect = (translationMatrix * vec3(aNext, 0.0)).xy;
        if (len2 > 0.01) {
            bisect = normalize(bisect) * len2;
        }

        vec2 n1 = normalize(vec2(pointA.y - prev.y, -(pointA.x - prev.x)));
        vec2 n2 = normalize(vec2(pointB.y - pointA.y, -(pointB.x - pointA.x)));
        vec2 n3 = normalize(vec2(prev.y - pointB.y, -(prev.x - pointB.x)));

        if (n1.x * n2.y - n1.y * n2.x < 0.0) {
            n1 = -n1;
            n2 = -n2;
            n3 = -n3;
        }

        vDistance.w = 1.0;
        pos += bisect * expand;

        vDistance = vec4(16.0, 16.0, 16.0, -1.0);
        if (flag1 > 0.5) {
            vDistance.x = -dot(pos - prev, n1);
        }
        if (flag2 > 0.5) {
            vDistance.y = -dot(pos - pointA, n2);
        }
        if (flag3 > 0.5) {
            vDistance.z = -dot(pos - pointB, n3);
        }
        vDistance.xyz *= resolution;
        vType = 2.0;
    } else if (type >= BEVEL) {
        float dy = lineWidth + expand;
        float inner = 0.0;
        if (vertexNum >= 1.5) {
            dy = -dy;
            inner = 1.0;
        }

        vec2 base, next, xBasis2, bisect;
        float flag = 0.0;
        float sign2 = 1.0;
        if (vertexNum < 0.5 || vertexNum > 2.5 && vertexNum < 3.5) {
            next = (translationMatrix * vec3(aPrev, 1.0)).xy;
            base = pointA;
            flag = type - floor(type / 2.0) * 2.0;
            sign2 = -1.0;
        } else {
            next = (translationMatrix * vec3(aNext, 1.0)).xy;
            base = pointB;
            if (type >= MITER && type < MITER + 3.5) {
                flag = step(MITER + 1.5, type);
                // check miter limit here?
            }
        }
        xBasis2 = next - base;
        float len2 = length(xBasis2);
        vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;
        float D = norm.x * norm2.y - norm.y * norm2.x;
        if (D < 0.0) {
            inner = 1.0 - inner;
        }
        norm2 *= sign2;
        float collinear = step(0.0, dot(norm, norm2));

        vType = 0.0;
        float dy2 = -0.5;
        float dy3 = -0.5;

        if (abs(D) < 0.01 && collinear < 0.5) {
            if (type >= ROUND && type < ROUND + 1.5) {
                type = JOINT_CAP_ROUND;
            }
            //TODO: BUTT here too
        }

        if (vertexNum < 3.5) {
            if (abs(D) < 0.01) {
                pos = dy * norm;
            } else {
                if (flag < 0.5 && inner < 0.5) {
                    pos = dy * norm;
                } else {
                    pos = doBisect(norm, len, norm2, len2, dy, inner);
                }
            }
            if (capType >= CAP_BUTT && capType < CAP_ROUND) {
                vec2 back = -vec2(-norm.y, norm.x);
                float extra = step(CAP_SQUARE, capType) * lineWidth;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    pos += back * (expand + extra);
                    dy2 = expand;
                } else {
                    dy2 = dot(pos + base - pointA, back) - extra;
                }
            }
            if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {
                vec2 forward = vec2(-norm.y, norm.x);
                float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    dy3 = dot(pos + base - pointB, forward) - extra;
                } else {
                    pos += forward * (expand + extra);
                    dy3 = expand;
                    if (capType >= CAP_BUTT) {
                        dy2 -= expand + extra;
                    }
                }
            }
        } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {
            if (inner > 0.5) {
                dy = -dy;
                inner = 0.0;
            }
            vec2 d2 = abs(dy) * vec2(-norm.y, norm.x);
            if (vertexNum < 4.5) {
                dy = -dy;
                pos = dy * norm;
            } else if (vertexNum < 5.5) {
                pos = dy * norm;
            } else if (vertexNum < 6.5) {
                pos = dy * norm + d2;
            } else {
                dy = -dy;
                pos = dy * norm + d2;
            }
            dy = -0.5;
            dy2 = pos.x;
            dy3 = pos.y;
            vType = 3.0;
        } else if (abs(D) < 0.01) {
            pos = dy * norm;
        } else {
            if (type >= ROUND && type < ROUND + 1.5) {
                if (inner > 0.5) {
                    dy = -dy;
                    inner = 0.0;
                }
                if (vertexNum < 4.5) {
                    pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
                } else if (vertexNum < 5.5) {
                    pos = dy * norm;
                } else if (vertexNum > 7.5) {
                    pos = dy * norm2;
                } else {
                    pos = doBisect(norm, len, norm2, len2, dy, 0.0);
                    float d2 = abs(dy);
                    if (length(pos) > abs(dy) * 1.5) {
                        if (vertexNum < 6.5) {
                            pos.x = dy * norm.x - d2 * norm.y;
                            pos.y = dy * norm.y + d2 * norm.x;
                        } else {
                            pos.x = dy * norm2.x + d2 * norm2.y;
                            pos.y = dy * norm2.y - d2 * norm2.x;
                        }
                    }
                }
                vec2 norm3 = normalize(norm - norm2);
                dy = pos.x * norm3.y - pos.y * norm3.x - 3.0;
                dy2 = pos.x;
                dy3 = pos.y;
                vType = 3.0;
            } else {
                if (type >= MITER && type < MITER + 3.5) {
                    if (inner > 0.5) {
                        dy = -dy;
                        inner = 0.0;
                    }
                    float sign = step(0.0, dy) * 2.0 - 1.0;
                    pos = doBisect(norm, len, norm2, len2, dy, 0.0);
                    if (length(pos) > abs(dy) * MITER_LIMIT) {
                        type = BEVEL;
                    } else {
                        if (vertexNum < 4.5) {
                            dy = -dy;
                            pos = doBisect(norm, len, norm2, len2, dy, 1.0);
                        } else if (vertexNum < 5.5) {
                            pos = dy * norm;
                        } else if (vertexNum > 6.5) {
                            pos = dy * norm2;
                            // dy = ...
                        }
                    }
                    vType = 1.0;
                    dy2 = sign * dot(pos, norm) - lineWidth;
                    dy3 = sign * dot(pos, norm2) - lineWidth;
                }
                if (type >= BEVEL && type < BEVEL + 1.5) {
                    if (inner < 0.5) {
                        dy = -dy;
                        inner = 1.0;
                    }
                    vec2 norm3 = normalize((norm + norm2) / 2.0);
                    if (vertexNum < 4.5) {
                        pos = doBisect(norm, len, norm2, len2, dy, 1.0);
                        dy2 = -abs(dot(pos + dy * norm, norm3));
                    } else {
                        dy2 = 0.0;
                        dy = -dy;
                        if (vertexNum < 5.5) {
                            pos = dy * norm;
                        } else {
                            pos = dy * norm2;
                        }
                    }
                }
            }
        }

        pos += base;
        vDistance = vec4(dy, dy2, dy3, lineWidth) * resolution;
    }

    gl_Position = vec4((projectionMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);

    vColor = aColor * tint;
}`;

    const smoothFrag = `
varying vec4 vColor;
varying vec4 vDistance;
varying float vType;
varying float vTextureId;
varying vec2 vTextureCoord;
uniform sampler2D uSamplers[%MAX_TEXTURES%];

void main(void){
    float alpha = 1.0;
    if (vType < 0.5) {
        float left = max(vDistance.x - 0.5, -vDistance.w);
        float right = min(vDistance.x + 0.5, vDistance.w);
        float near = vDistance.y - 0.5;
        float far = min(vDistance.y + 0.5, 0.0);
        float top = vDistance.z - 0.5;
        float bottom = min(vDistance.z + 0.5, 0.0);
        alpha = max(right - left, 0.0) * max(bottom - top, 0.0) * max(far - near, 0.0);
    } else if (vType < 1.5) {
        float near = vDistance.y - 0.5;
        float far = min(vDistance.y + 0.5, 0.0);
        float top = vDistance.z - 0.5;
        float bottom = min(vDistance.z + 0.5, 0.0);
        alpha = max(bottom - top, 0.0) * max(far - near, 0.0);
    } else if (vType < 2.5) {
        alpha *= max(min(vDistance.x + 0.5, 1.0), 0.0);
        alpha *= max(min(vDistance.y + 0.5, 1.0), 0.0);
        alpha *= max(min(vDistance.z + 0.5, 1.0), 0.0);
    } else {
        float dist2 = sqrt(dot(vDistance.yz, vDistance.yz));
        float rad = vDistance.w;
        float left = max(dist2 - 0.5, -rad);
        float right = min(dist2 + 0.5, rad);
        // TODO: something has to be done about artifact at vDistance.x far side
        alpha = 1.0 - step(vDistance.x, 0.0) * (1.0 - max(right - left, 0.0));
    }

    vec4 texColor;
    float textureId = floor(vTextureId+0.5);
    %FOR_LOOP%

    gl_FragColor = vColor * texColor * alpha;
}
`;

    class SmoothGraphicsProgram extends core.Program {
        

        constructor(settings,
                    vert = smoothVert,
                    frag = smoothFrag, uniforms = {}) {
            const {maxStyles, maxTextures} = settings;
            vert = vert.replace(/%MAX_TEXTURES%/gi, '' + maxTextures)
                .replace(/%MAX_STYLES%/gi, '' + maxStyles);
            frag = frag.replace(/%MAX_TEXTURES%/gi, '' + maxTextures)
                .replace(/%FOR_LOOP%/gi, SmoothGraphicsShader.generateSampleSrc(maxTextures));

            super(vert, frag);
            this.settings = settings;
        }
    }

    class SmoothGraphicsShader extends core.Shader {
        

        constructor(settings, prog = new SmoothGraphicsProgram(settings), uniforms = {}) {
            const {maxStyles, maxTextures} = settings;
            const sampleValues = new Int32Array(maxTextures);
            for (let i = 0; i < maxTextures; i++) {
                sampleValues[i] = i;
            }
            super(prog, (Object ).assign(uniforms, {
                styleMatrix: new Float32Array(6 * maxStyles),
                styleTextureId: new Float32Array(maxStyles),
                styleLine: new Float32Array(2 * maxStyles),
                samplerSize: new Float32Array(2 * maxTextures),
                uSamplers: sampleValues,
                tint: new Float32Array([1, 1, 1, 1]),
                resolution: 1,
                expand: 1,
            }));
            this.settings = settings;
        }

        static generateSampleSrc(maxTextures) {
            let src = '';

            src += '\n';
            src += '\n';

            for (let i = 0; i < maxTextures; i++) {
                if (i > 0) {
                    src += '\nelse ';
                }

                if (i < maxTextures - 1) {
                    src += `if(textureId < ${i}.5)`;
                }

                src += '\n{';
                src += `\n\ttexColor = texture2D(uSamplers[${i}], vTextureCoord);`;
                src += '\n}';
            }

            src += '\n';
            src += '\n';

            return src;
        }
    }

    const {BezierUtils, QuadraticUtils, ArcUtils} = graphics.graphicsUtils;

    const temp = new Float32Array(3);
    // a default shaders map used by graphics..
    const DEFAULT_SHADERS = {};

    const defaultShaderSettings = {
        maxStyles: 24,
        maxTextures: 4,
    };









    class SmoothGraphics extends display.Container {
        static __initStatic() {this._TEMP_POINT = new math.Point();}

        
        
        

        
        
        
        

        
        
        
        
        
        

        
        

         get geometry() {
            return this._geometry;
        }

        constructor(geometry = null) {
            super();

            this._geometry = geometry || new SmoothGraphicsGeometry();
            this._geometry.refCount++;

            this.shader = null;

            this.state = core.State.for2d();

            this._fillStyle = new FillStyle();

            this._lineStyle = new LineStyle();

            this._matrix = null;

            this._holeMode = false;

            this.currentPath = null;

            this.batches = [];

            this.batchTint = -1;

            this.batchDirty = -1;

            this.vertexData = null;

            this.pluginName = 'smooth';

            this._transformID = -1;

            // Set default
            this.tint = 0xFFFFFF;
            this.blendMode = constants.BLEND_MODES.NORMAL;
        }

         clone() {
            this.finishPoly();

            return new SmoothGraphics(this._geometry);
        }

         set blendMode(value) {
            this.state.blendMode = value;
        }

         get blendMode() {
            return this.state.blendMode;
        }

         get tint() {
            return this._tint;
        }

         set tint(value) {
            this._tint = value;
        }

         get fill() {
            return this._fillStyle;
        }

         get line() {
            return this._lineStyle;
        }

        



         lineStyle(options = null,
                         color = 0x0, alpha = 1, alignment = 0.5, native = false) {
            // Support non-object params: (width, color, alpha, alignment, native)
            if (typeof options === 'number') {
                options = {width: options, color, alpha, alignment, native} ;
            }

            return this.lineTextureStyle(options);
        }

         lineTextureStyle(options) {
            // Apply defaults
            options = Object.assign({
                width: 0,
                texture: core.Texture.WHITE,
                color: (options && options.texture) ? 0xFFFFFF : 0x0,
                alpha: 1,
                matrix: null,
                alignment: 0.5,
                native: false,
                cap: graphics.LINE_CAP.BUTT,
                join: graphics.LINE_JOIN.MITER,
                miterLimit: 10,
            }, options);

            if (this.currentPath) {
                this.startPoly();
            }

            const visible = options.width > 0 && options.alpha > 0;

            if (!visible) {
                this._lineStyle.reset();
            } else {
                if (options.matrix) {
                    options.matrix = options.matrix.clone();
                    options.matrix.invert();
                }

                Object.assign(this._lineStyle, {visible}, options);
            }

            return this;
        }

         startPoly() {
            if (this.currentPath) {
                const points = this.currentPath.points;
                const len = this.currentPath.points.length;

                if (len > 2) {
                    this.drawShape(this.currentPath);
                    this.currentPath = new math.Polygon();
                    this.currentPath.closeStroke = false;
                    this.currentPath.points.push(points[len - 2], points[len - 1]);
                }
            } else {
                this.currentPath = new math.Polygon();
                this.currentPath.closeStroke = false;
            }
        }

        finishPoly() {
            if (this.currentPath) {
                if (this.currentPath.points.length > 2) {
                    this.drawShape(this.currentPath);
                    this.currentPath = null;
                } else {
                    this.currentPath.points.length = 0;
                }
            }
        }

         moveTo(x, y) {
            this.startPoly();
            this.currentPath.points[0] = x;
            this.currentPath.points[1] = y;

            return this;
        }

         lineTo(x, y) {
            if (!this.currentPath) {
                this.moveTo(0, 0);
            }

            // remove duplicates..
            const points = this.currentPath.points;
            const fromX = points[points.length - 2];
            const fromY = points[points.length - 1];

            if (fromX !== x || fromY !== y) {
                points.push(x, y);
            }

            return this;
        }

         _initCurve(x = 0, y = 0) {
            if (this.currentPath) {
                if (this.currentPath.points.length === 0) {
                    this.currentPath.points = [x, y];
                }
            } else {
                this.moveTo(x, y);
            }
        }

         quadraticCurveTo(cpX, cpY, toX, toY) {
            this._initCurve();

            const points = this.currentPath.points;

            if (points.length === 0) {
                this.moveTo(0, 0);
            }

            QuadraticUtils.curveTo(cpX, cpY, toX, toY, points);

            return this;
        }

         bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
            this._initCurve();

            BezierUtils.curveTo(cpX, cpY, cpX2, cpY2, toX, toY, this.currentPath.points);

            return this;
        }

         arcTo(x1, y1, x2, y2, radius) {
            this._initCurve(x1, y1);

            const points = this.currentPath.points;

            const result = ArcUtils.curveTo(x1, y1, x2, y2, radius, points);

            if (result) {
                const {cx, cy, radius, startAngle, endAngle, anticlockwise} = result;

                this.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
            }

            return this;
        }

         arc(cx, cy, radius, startAngle, endAngle, anticlockwise = false) {
            if (startAngle === endAngle) {
                return this;
            }

            if (!anticlockwise && endAngle <= startAngle) {
                endAngle += math.PI_2;
            } else if (anticlockwise && startAngle <= endAngle) {
                startAngle += math.PI_2;
            }

            const sweep = endAngle - startAngle;

            if (sweep === 0) {
                return this;
            }

            const startX = cx + (Math.cos(startAngle) * radius);
            const startY = cy + (Math.sin(startAngle) * radius);
            const eps = this._geometry.closePointEps;

            // If the currentPath exists, take its points. Otherwise call `moveTo` to start a path.
            let points = this.currentPath ? this.currentPath.points : null;

            if (points) {
                // TODO: make a better fix.

                // We check how far our start is from the last existing point
                const xDiff = Math.abs(points[points.length - 2] - startX);
                const yDiff = Math.abs(points[points.length - 1] - startY);

                if (xDiff < eps && yDiff < eps) {
                    // If the point is very close, we don't add it, since this would lead to artifacts
                    // during tessellation due to floating point imprecision.
                } else {
                    points.push(startX, startY);
                }
            } else {
                this.moveTo(startX, startY);
                points = this.currentPath.points;
            }

            ArcUtils.arc(startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points);

            return this;
        }

         beginFill(color = 0, alpha = 1, smooth = false) {
            return this.beginTextureFill({texture: core.Texture.WHITE, color, alpha, smooth});
        }

        beginTextureFill(options) {
            // Apply defaults
            options = Object.assign({
                texture: core.Texture.WHITE,
                color: 0xFFFFFF,
                alpha: 1,
                matrix: null,
                smooth: false,
            }, options) ;

            if (this.currentPath) {
                this.startPoly();
            }

            const visible = options.alpha > 0;

            if (!visible) {
                this._fillStyle.reset();
            } else {
                if (options.matrix) {
                    options.matrix = options.matrix.clone();
                    options.matrix.invert();
                }

                Object.assign(this._fillStyle, {visible}, options);
            }

            return this;
        }

         endFill() {
            this.finishPoly();

            this._fillStyle.reset();

            return this;
        }

         drawRect(x, y, width, height) {
            return this.drawShape(new math.Rectangle(x, y, width, height));
        }

         drawRoundedRect(x, y, width, height, radius) {
            return this.drawShape(new math.RoundedRectangle(x, y, width, height, radius));
        }

         drawCircle(x, y, radius) {
            return this.drawShape(new math.Circle(x, y, radius));
        }

         drawEllipse(x, y, width, height) {
            return this.drawShape(new math.Ellipse(x, y, width, height));
        }

        


         drawPolygon(...path) {
            let points;
            let closeStroke = true;// !!this._fillStyle;

            const poly = path[0] ;

            // check if data has points..
            if (poly.points) {
                closeStroke = poly.closeStroke;
                points = poly.points;
            } else if (Array.isArray(path[0])) {
                points = path[0];
            } else {
                points = path;
            }

            const shape = new math.Polygon(points);

            shape.closeStroke = closeStroke;

            this.drawShape(shape);

            return this;
        }

         drawShape(shape) {
            if (!this._holeMode) {
                this._geometry.drawShape(
                    shape,
                    this._fillStyle.clone(),
                    this._lineStyle.clone(),
                    this._matrix
                );
            } else {
                this._geometry.drawHole(shape, this._matrix);
            }

            return this;
        }

         clear() {
            this._geometry.clear();
            this._lineStyle.reset();
            this._fillStyle.reset();

            this._boundsID++;
            this._matrix = null;
            this._holeMode = false;
            this.currentPath = null;

            return this;
        }

         isFastRect() {
            const data = this._geometry.graphicsData;

            return data.length === 1
                && data[0].shape.type === math.SHAPES.RECT
                && !(data[0].lineStyle.visible && data[0].lineStyle.width);
        }

         _renderCanvas(renderer) {
            (graphics.Graphics.prototype )._renderCanvas.call(this, renderer);
        }

         _render(renderer) {
            this.finishPoly();

            const geometry = this._geometry;
            const hasuint32 = renderer.context.supports.uint32Indices;
            // batch part..
            // batch it!

            geometry.checkInstancing(renderer.geometry.hasInstance, hasuint32);

            geometry.updateBatches(defaultShaderSettings);

            if (geometry.batchable) {
                if (this.batchDirty !== geometry.batchDirty) {
                    this._populateBatches();
                }

                this._renderBatched(renderer);
            } else {
                // no batching...
                renderer.batch.flush();

                this._renderDirect(renderer);
            }
        }

         _populateBatches() {
            const geometry = this._geometry;
            const blendMode = this.blendMode;
            const len = geometry.batches.length;

            this.batchTint = -1;
            this._transformID = -1;
            this.batchDirty = geometry.batchDirty;
            this.batches.length = len;

            this.vertexData = new Float32Array(geometry.points);

            for (let i = 0; i < len; i++) {
                const gI = geometry.batches[i];
                const color = gI.style.color;
                const vertexData = new Float32Array(this.vertexData.buffer,
                    gI.attribStart * 4 * 2,
                    gI.attribSize * 2);

                // const uvs = new Float32Array(geometry.uvsFloat32.buffer,
                //     gI.attribStart * 4 * 2,
                //     gI.attribSize * 2);

                // const indices = new Uint16Array(geometry.indicesUint16.buffer,
                //     gI.start * 2,
                //     gI.size);

                const batch = {
                    vertexData,
                    blendMode,
                    // indices,
                    // uvs,
                    _batchRGB: utils.hex2rgb(color) ,
                    _tintRGB: color,
                    _texture: gI.style.texture,
                    alpha: gI.style.alpha,
                    worldAlpha: 1
                };

                this.batches[i] = batch;
            }
        }

         _renderBatched(renderer) {
            if (!this.batches.length) {
                return;
            }

            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);

            this.calculateVertices();
            this.calculateTints();

            for (let i = 0, l = this.batches.length; i < l; i++) {
                const batch = this.batches[i];

                batch.worldAlpha = this.worldAlpha * batch.alpha;

                renderer.plugins[this.pluginName].render(batch);
            }
        }

         _renderDirect(renderer) {
            let directShader = this._resolveDirectShader(renderer);
            let shader = directShader;

            const geometry = this._geometry;
            const tint = this.tint;
            const worldAlpha = this.worldAlpha;
            const uniforms = shader.uniforms;
            const drawCalls = geometry.drawCalls;

            // lets set the transfomr
            uniforms.translationMatrix = this.transform.worldTransform;

            // and then lets set the tint..
            uniforms.tint[0] = (((tint >> 16) & 0xFF) / 255) * worldAlpha;
            uniforms.tint[1] = (((tint >> 8) & 0xFF) / 255) * worldAlpha;
            uniforms.tint[2] = ((tint & 0xFF) / 255) * worldAlpha;
            uniforms.tint[3] = worldAlpha;

            uniforms.resolution = renderer.renderTexture.current ?
                renderer.renderTexture.current.resolution : renderer.resolution;

            const projTrans = renderer.projection.transform;

            if (projTrans) {
                // only uniform scale is supported!
                const scale = Math.sqrt(projTrans.a * projTrans.a + projTrans.b * projTrans.b);
                uniforms.resolution *= scale;
            }

            uniforms.expand = (renderer.options.antialias ? 2 : 1) / uniforms.resolution;

            // the first draw call, we can set the uniforms of the shader directly here.

            // this means that we can tack advantage of the sync function of pixi!
            // bind and sync uniforms..
            // there is a way to optimise this..
            renderer.shader.bind(shader);
            renderer.geometry.bind(geometry, shader);

            // set state..
            renderer.state.set(this.state);

            shader = null;
            // then render the rest of them...
            for (let i = 0, l = drawCalls.length; i < l; i++) {
                //TODO: refactor it to another class, that fills uniforms of this shader
                const drawCall = geometry.drawCalls[i];

                const shaderChange = shader !== drawCall.shader;
                if (shaderChange) {
                    shader = drawCall.shader;
                    if (shader) {
                        shader.uniforms.translationMatrix = this.transform.worldTransform;
                        if (shader.uniforms.tint) {
                            shader.uniforms.tint[0] = uniforms.tint[0];
                            shader.uniforms.tint[1] = uniforms.tint[1];
                            shader.uniforms.tint[2] = uniforms.tint[2];
                            shader.uniforms.tint[3] = uniforms.tint[3];
                        }
                    }
                }

                const {texArray, styleArray, size, start} = drawCall;
                const groupTextureCount = texArray.count;
                const shaderHere = shader || directShader;

                const texs = shaderHere.uniforms.styleTextureId,
                    mats = shaderHere.uniforms.styleMatrix,
                    lines = shaderHere.uniforms.styleLine;
                for (let i = 0; i < styleArray.count; i++) {
                    texs[i] = styleArray.textureIds[i];
                    lines[i * 2] = styleArray.lines[i * 2];
                    lines[i * 2 + 1] = styleArray.lines[i * 2 + 1];
                    const m = styleArray.matrices[i];
                    mats[i * 6] = m.a;
                    mats[i * 6 + 1] = m.c;
                    mats[i * 6 + 2] = m.tx;
                    mats[i * 6 + 3] = m.b;
                    mats[i * 6 + 4] = m.d;
                    mats[i * 6 + 5] = m.ty;
                }
                const sizes = shaderHere.uniforms.samplerSize;
                for (let i = 0; i < groupTextureCount; i++) {
                    sizes[i * 2] = texArray.elements[i].width;
                    sizes[i * 2 + 1] = texArray.elements[i].height;
                }

                renderer.shader.bind(shaderHere);
                if (shaderChange) {
                    renderer.geometry.bind(geometry);
                }

                //TODO: bind styles!
                for (let j = 0; j < groupTextureCount; j++) {
                    renderer.texture.bind(texArray.elements[j], j);
                }

                // bind the geometry...
                renderer.geometry.draw(constants.DRAW_MODES.TRIANGLES, size, start);
            }
        }

         _resolveDirectShader(renderer) {
            let shader = this.shader;

            const pluginName = this.pluginName;

            if (!shader) {
                if (!DEFAULT_SHADERS[pluginName]) {
                    DEFAULT_SHADERS[pluginName] = new SmoothGraphicsShader(defaultShaderSettings);
                }
                shader = DEFAULT_SHADERS[pluginName];
            }

            return shader;
        }

         _calculateBounds() {
            this.finishPoly();

            const geometry = this._geometry;

            // skipping when graphics is empty, like a container
            if (!geometry.graphicsData.length) {
                return;
            }

            const {minX, minY, maxX, maxY} = geometry.bounds;

            this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
        }

         containsPoint(point) {
            this.worldTransform.applyInverse(point, SmoothGraphics._TEMP_POINT);

            return this._geometry.containsPoint(SmoothGraphics._TEMP_POINT);
        }

         calculateTints() {
            if (this.batchTint !== this.tint) {
                this.batchTint = this.tint;

                const tintRGB = utils.hex2rgb(this.tint, temp);

                for (let i = 0; i < this.batches.length; i++) {
                    const batch = this.batches[i];

                    const batchTint = batch._batchRGB;

                    const r = (tintRGB[0] * batchTint[0]) * 255;
                    const g = (tintRGB[1] * batchTint[1]) * 255;
                    const b = (tintRGB[2] * batchTint[2]) * 255;

                    // TODO Ivan, can this be done in one go?
                    const color = (r << 16) + (g << 8) + (b | 0);

                    batch._tintRGB = (color >> 16)
                        + (color & 0xff00)
                        + ((color & 0xff) << 16);
                }
            }
        }

         calculateVertices() {
            const wtID = this.transform._worldID;

            if (this._transformID === wtID) {
                return;
            }

            this._transformID = wtID;

            const wt = this.transform.worldTransform;
            const a = wt.a;
            const b = wt.b;
            const c = wt.c;
            const d = wt.d;
            const tx = wt.tx;
            const ty = wt.ty;

            const data = this._geometry.points;// batch.vertexDataOriginal;
            const vertexData = this.vertexData;

            let count = 0;

            for (let i = 0; i < data.length; i += 2) {
                const x = data[i];
                const y = data[i + 1];

                vertexData[count++] = (a * x) + (c * y) + tx;
                vertexData[count++] = (d * y) + (b * x) + ty;
            }
        }

         closePath() {
            const currentPath = this.currentPath;

            if (currentPath) {
                // we don't need to add extra point in the end because buildLine will take care of that
                currentPath.closeStroke = true;
            }

            return this;
        }

         setMatrix(matrix) {
            this._matrix = matrix;

            return this;
        }

         beginHole() {
            this.finishPoly();
            this._holeMode = true;

            return this;
        }

         endHole() {
            this.finishPoly();
            this._holeMode = false;

            return this;
        }

         destroy(options) {
            this._geometry.refCount--;
            if (this._geometry.refCount === 0) {
                this._geometry.dispose();
            }

            this._matrix = null;
            this.currentPath = null;
            this._lineStyle.destroy();
            this._lineStyle = null;
            this._fillStyle.destroy();
            this._fillStyle = null;
            this._geometry = null;
            this.shader = null;
            this.vertexData = null;
            this.batches.length = 0;
            this.batches = null;

            super.destroy(options);
        }

        drawStar(x, y,
                 points, radius, innerRadius, rotation = 0) {
            return this.drawPolygon(new Star(x, y, points, radius, innerRadius, rotation) );
        }
    } SmoothGraphics.__initStatic();

    class Star extends math.Polygon {
        constructor(x, y, points, radius, innerRadius, rotation = 0) {
            innerRadius = innerRadius || radius / 2;

            const startAngle = (-1 * Math.PI / 2) + rotation;
            const len = points * 2;
            const delta = math.PI_2 / len;
            const polygon = [];

            for (let i = 0; i < len; i++) {
                const r = i % 2 ? innerRadius : radius;
                const angle = (i * delta) + startAngle;

                polygon.push(
                    x + (r * Math.cos(angle)),
                    y + (r * Math.sin(angle))
                );
            }

            super(polygon);
        }
    }

    exports.BATCH_POOL = BATCH_POOL;
    exports.BatchDrawCall = BatchDrawCall;
    exports.BatchPart = BatchPart;
    exports.BatchStyleArray = BatchStyleArray;
    exports.BuildData = BuildData;
    exports.CircleBuilder = CircleBuilder;
    exports.DRAW_CALL_POOL = DRAW_CALL_POOL;
    exports.FILL_COMMANDS = FILL_COMMANDS;
    exports.FillStyle = FillStyle;
    exports.LineStyle = LineStyle;
    exports.PolyBuilder = PolyBuilder;
    exports.RectangleBuilder = RectangleBuilder;
    exports.RoundedRectangleBuilder = RoundedRectangleBuilder;
    exports.SegmentPacker = SegmentPacker;
    exports.SmoothGraphics = SmoothGraphics;
    exports.SmoothGraphicsData = SmoothGraphicsData;
    exports.SmoothGraphicsGeometry = SmoothGraphicsGeometry;
    exports.SmoothGraphicsProgram = SmoothGraphicsProgram;
    exports.SmoothGraphicsShader = SmoothGraphicsShader;
    exports.Star = Star;
    exports.defaultShaderSettings = defaultShaderSettings;
    exports.matrixEquals = matrixEquals;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof _pixi_graphics_smooth !== 'undefined') { Object.assign(this.PIXI.smooth, _pixi_graphics_smooth); }
//# sourceMappingURL=pixi-graphics-smooth.umd.js.map
