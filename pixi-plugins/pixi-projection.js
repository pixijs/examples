var pixi_projection;
(function (pixi_projection) {
    var utils;
    (function (utils) {
        function getIntersectionFactor(p1, p2, p3, p4, out) {
            var A1 = p2.x - p1.x, B1 = p3.x - p4.x, C1 = p3.x - p1.x;
            var A2 = p2.y - p1.y, B2 = p3.y - p4.y, C2 = p3.y - p1.y;
            var D = A1 * B2 - A2 * B1;
            if (Math.abs(D) < 1e-7) {
                out.x = A1;
                out.y = A2;
                return 0;
            }
            var T = C1 * B2 - C2 * B1;
            var U = A1 * C2 - A2 * C1;
            var t = T / D, u = U / D;
            if (u < (1e-6) || u - 1 > -1e-6) {
                return -1;
            }
            out.x = p1.x + t * (p2.x - p1.x);
            out.y = p1.y + t * (p2.y - p1.y);
            return 1;
        }
        utils.getIntersectionFactor = getIntersectionFactor;
        function getPositionFromQuad(p, anchor, out) {
            out = out || new PIXI.Point();
            var a1 = 1.0 - anchor.x, a2 = 1.0 - a1;
            var b1 = 1.0 - anchor.y, b2 = 1.0 - b1;
            out.x = (p[0].x * a1 + p[1].x * a2) * b1 + (p[3].x * a1 + p[2].x * a2) * b2;
            out.y = (p[0].y * a1 + p[1].y * a2) * b1 + (p[3].y * a1 + p[2].y * a2) * b2;
            return out;
        }
        utils.getPositionFromQuad = getPositionFromQuad;
    })(utils = pixi_projection.utils || (pixi_projection.utils = {}));
})(pixi_projection || (pixi_projection = {}));
PIXI.projection = pixi_projection;
var pixi_projection;
(function (pixi_projection) {
    var AbstractProjection = (function () {
        function AbstractProjection(legacy, enable) {
            if (enable === void 0) { enable = true; }
            this._enabled = false;
            this.legacy = legacy;
            if (enable) {
                this.enabled = true;
            }
            this.legacy.proj = this;
        }
        Object.defineProperty(AbstractProjection.prototype, "enabled", {
            get: function () {
                return this._enabled;
            },
            set: function (value) {
                this._enabled = value;
            },
            enumerable: true,
            configurable: true
        });
        AbstractProjection.prototype.clear = function () {
        };
        return AbstractProjection;
    }());
    pixi_projection.AbstractProjection = AbstractProjection;
    var TRANSFORM_STEP;
    (function (TRANSFORM_STEP) {
        TRANSFORM_STEP[TRANSFORM_STEP["NONE"] = 0] = "NONE";
        TRANSFORM_STEP[TRANSFORM_STEP["BEFORE_PROJ"] = 4] = "BEFORE_PROJ";
        TRANSFORM_STEP[TRANSFORM_STEP["PROJ"] = 5] = "PROJ";
        TRANSFORM_STEP[TRANSFORM_STEP["ALL"] = 9] = "ALL";
    })(TRANSFORM_STEP = pixi_projection.TRANSFORM_STEP || (pixi_projection.TRANSFORM_STEP = {}));
})(pixi_projection || (pixi_projection = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_projection;
(function (pixi_projection) {
    function transformHack(parentTransform) {
        var proj = this.proj;
        var ta = this;
        var pwid = parentTransform._worldID;
        var lt = ta.localTransform;
        var scaleAfterAffine = proj.scaleAfterAffine && proj.affine >= 2;
        if (ta._localID !== ta._currentLocalID) {
            if (scaleAfterAffine) {
                lt.a = ta._cx;
                lt.b = ta._sx;
                lt.c = ta._cy;
                lt.d = ta._sy;
                lt.tx = ta.position._x;
                lt.ty = ta.position._y;
            }
            else {
                lt.a = ta._cx * ta.scale._x;
                lt.b = ta._sx * ta.scale._x;
                lt.c = ta._cy * ta.scale._y;
                lt.d = ta._sy * ta.scale._y;
                lt.tx = ta.position._x - ((ta.pivot._x * lt.a) + (ta.pivot._y * lt.c));
                lt.ty = ta.position._y - ((ta.pivot._x * lt.b) + (ta.pivot._y * lt.d));
            }
            ta._currentLocalID = ta._localID;
            proj._currentProjID = -1;
        }
        var _matrixID = proj._projID;
        if (proj._currentProjID !== _matrixID) {
            proj._currentProjID = _matrixID;
            proj.updateLocalTransform(lt);
            ta._parentID = -1;
        }
        if (ta._parentID !== pwid) {
            var pp = parentTransform.proj;
            if (pp && !pp._affine) {
                proj.world.setToMult(pp.world, proj.local);
            }
            else {
                proj.world.setToMultLegacy(parentTransform.worldTransform, proj.local);
            }
            var wa = ta.worldTransform;
            proj.world.copyTo(wa, proj._affine, proj.affinePreserveOrientation);
            if (scaleAfterAffine) {
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
    var LinearProjection = (function (_super) {
        __extends(LinearProjection, _super);
        function LinearProjection() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._projID = 0;
            _this._currentProjID = -1;
            _this._affine = pixi_projection.AFFINE.NONE;
            _this.affinePreserveOrientation = false;
            _this.scaleAfterAffine = true;
            return _this;
        }
        LinearProjection.prototype.updateLocalTransform = function (lt) {
        };
        Object.defineProperty(LinearProjection.prototype, "affine", {
            get: function () {
                return this._affine;
            },
            set: function (value) {
                if (this._affine == value)
                    return;
                this._affine = value;
                this._currentProjID = -1;
                this.legacy._currentLocalID = -1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LinearProjection.prototype, "enabled", {
            set: function (value) {
                if (value === this._enabled) {
                    return;
                }
                this._enabled = value;
                if (value) {
                    this.legacy.updateTransform = transformHack;
                    this.legacy._parentID = -1;
                }
                else {
                    this.legacy.updateTransform = PIXI.Transform.prototype.updateTransform;
                    this.legacy._parentID = -1;
                }
            },
            enumerable: true,
            configurable: true
        });
        LinearProjection.prototype.clear = function () {
            this._currentProjID = -1;
            this._projID = 0;
        };
        return LinearProjection;
    }(pixi_projection.AbstractProjection));
    pixi_projection.LinearProjection = LinearProjection;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var TYPES = PIXI.TYPES;
    var premultiplyTint = PIXI.utils.premultiplyTint;
    var shaderVert = "precision highp float;\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n\tgl_Position.xyw = projectionMatrix * aVertexPosition;\n\tgl_Position.z = 0.0;\n\n\tvTextureCoord = aTextureCoord;\n\tvTextureId = aTextureId;\n\tvColor = aColor;\n}\n";
    var shaderFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\nvec4 color;\n%forloop%\ngl_FragColor = color * vColor;\n}";
    var Batch3dGeometry = (function (_super) {
        __extends(Batch3dGeometry, _super);
        function Batch3dGeometry(_static) {
            if (_static === void 0) { _static = false; }
            var _this = _super.call(this) || this;
            _this._buffer = new PIXI.Buffer(null, _static, false);
            _this._indexBuffer = new PIXI.Buffer(null, _static, true);
            _this.addAttribute('aVertexPosition', _this._buffer, 3, false, TYPES.FLOAT)
                .addAttribute('aTextureCoord', _this._buffer, 2, false, TYPES.FLOAT)
                .addAttribute('aColor', _this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', _this._buffer, 1, true, TYPES.FLOAT)
                .addIndex(_this._indexBuffer);
            return _this;
        }
        return Batch3dGeometry;
    }(PIXI.Geometry));
    pixi_projection.Batch3dGeometry = Batch3dGeometry;
    var Batch2dPluginFactory = (function () {
        function Batch2dPluginFactory() {
        }
        Batch2dPluginFactory.create = function (options) {
            var _a = Object.assign({
                vertex: shaderVert,
                fragment: shaderFrag,
                geometryClass: Batch3dGeometry,
                vertexSize: 7,
            }, options), vertex = _a.vertex, fragment = _a.fragment, vertexSize = _a.vertexSize, geometryClass = _a.geometryClass;
            return (function (_super) {
                __extends(BatchPlugin, _super);
                function BatchPlugin(renderer) {
                    var _this = _super.call(this, renderer) || this;
                    _this.shaderGenerator = new PIXI.BatchShaderGenerator(vertex, fragment);
                    _this.geometryClass = geometryClass;
                    _this.vertexSize = vertexSize;
                    return _this;
                }
                BatchPlugin.prototype.packInterleavedGeometry = function (element, attributeBuffer, indexBuffer, aIndex, iIndex) {
                    var uint32View = attributeBuffer.uint32View, float32View = attributeBuffer.float32View;
                    var p = aIndex / this.vertexSize;
                    var uvs = element.uvs;
                    var indices = element.indices;
                    var vertexData = element.vertexData;
                    var vertexData2d = element.vertexData2d;
                    var textureId = element._texture.baseTexture._batchLocation;
                    var alpha = Math.min(element.worldAlpha, 1.0);
                    var argb = alpha < 1.0 && element._texture.baseTexture.alphaMode ? premultiplyTint(element._tintRGB, alpha)
                        : element._tintRGB + (alpha * 255 << 24);
                    if (vertexData2d) {
                        var j = 0;
                        for (var i = 0; i < vertexData2d.length; i += 3, j += 2) {
                            float32View[aIndex++] = vertexData2d[i];
                            float32View[aIndex++] = vertexData2d[i + 1];
                            float32View[aIndex++] = vertexData2d[i + 2];
                            float32View[aIndex++] = uvs[j];
                            float32View[aIndex++] = uvs[j + 1];
                            uint32View[aIndex++] = argb;
                            float32View[aIndex++] = textureId;
                        }
                    }
                    else {
                        for (var i = 0; i < vertexData.length; i += 2) {
                            float32View[aIndex++] = vertexData[i];
                            float32View[aIndex++] = vertexData[i + 1];
                            float32View[aIndex++] = 1.0;
                            float32View[aIndex++] = uvs[i];
                            float32View[aIndex++] = uvs[i + 1];
                            uint32View[aIndex++] = argb;
                            float32View[aIndex++] = textureId;
                        }
                    }
                    for (var i = 0; i < indices.length; i++) {
                        indexBuffer[iIndex++] = p + indices[i];
                    }
                };
                return BatchPlugin;
            }(PIXI.AbstractBatchRenderer));
        };
        return Batch2dPluginFactory;
    }());
    pixi_projection.Batch2dPluginFactory = Batch2dPluginFactory;
    PIXI.Renderer.registerPlugin('batch2d', Batch2dPluginFactory.create({}));
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var AbstractBatchRenderer = PIXI.AbstractBatchRenderer;
    var premultiplyBlendMode = PIXI.utils.premultiplyBlendMode;
    var UniformBatchRenderer = (function (_super) {
        __extends(UniformBatchRenderer, _super);
        function UniformBatchRenderer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.forceMaxTextures = 0;
            _this.defUniforms = {};
            return _this;
        }
        UniformBatchRenderer.prototype.getUniforms = function (sprite) {
            return this.defUniforms;
        };
        UniformBatchRenderer.prototype.syncUniforms = function (obj) {
            if (!obj)
                return;
            var sh = this._shader;
            for (var key in obj) {
                sh.uniforms[key] = obj[key];
            }
        };
        UniformBatchRenderer.prototype.buildDrawCalls = function (texArray, start, finish) {
            var thisAny = this;
            var _a = this, elements = _a._bufferedElements, _attributeBuffer = _a._attributeBuffer, _indexBuffer = _a._indexBuffer, vertexSize = _a.vertexSize;
            var drawCalls = AbstractBatchRenderer._drawCallPool;
            var dcIndex = this._dcIndex;
            var aIndex = this._aIndex;
            var iIndex = this._iIndex;
            var drawCall = drawCalls[dcIndex];
            drawCall.start = this._iIndex;
            drawCall.texArray = texArray;
            for (var i = start; i < finish; ++i) {
                var sprite = elements[i];
                var tex = sprite._texture.baseTexture;
                var spriteBlendMode = premultiplyBlendMode[tex.alphaMode ? 1 : 0][sprite.blendMode];
                var uniforms = this.getUniforms(sprite);
                elements[i] = null;
                if (start < i && (drawCall.blend !== spriteBlendMode || drawCall.uniforms !== uniforms)) {
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
                drawCall.uniforms = uniforms;
            }
            if (start < finish) {
                drawCall.size = iIndex - drawCall.start;
                ++dcIndex;
            }
            thisAny._dcIndex = dcIndex;
            thisAny._aIndex = aIndex;
            thisAny._iIndex = iIndex;
        };
        UniformBatchRenderer.prototype.drawBatches = function () {
            var dcCount = this._dcIndex;
            var _a = this.renderer, gl = _a.gl, stateSystem = _a.state, shaderSystem = _a.shader;
            var drawCalls = AbstractBatchRenderer._drawCallPool;
            var curUniforms = null;
            var curTexArray = null;
            for (var i = 0; i < dcCount; i++) {
                var _b = drawCalls[i], texArray = _b.texArray, type = _b.type, size = _b.size, start = _b.start, blend = _b.blend, uniforms = _b.uniforms;
                if (curTexArray !== texArray) {
                    curTexArray = texArray;
                    this.bindAndClearTexArray(texArray);
                }
                if (curUniforms !== uniforms) {
                    curUniforms = uniforms;
                    this.syncUniforms(uniforms);
                    shaderSystem.syncUniformGroup(this._shader.uniformGroup);
                }
                this.state.blendMode = blend;
                stateSystem.set(this.state);
                gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
            }
        };
        UniformBatchRenderer.prototype.contextChange = function () {
            if (!this.forceMaxTextures) {
                _super.prototype.contextChange.call(this);
                this.syncUniforms(this.defUniforms);
                return;
            }
            var gl = this.renderer.gl;
            var thisAny = this;
            thisAny.MAX_TEXTURES = this.forceMaxTextures;
            this._shader = thisAny.shaderGenerator.generateShader(this.MAX_TEXTURES);
            this.syncUniforms(this.defUniforms);
            for (var i = 0; i < thisAny._packedGeometryPoolSize; i++) {
                thisAny._packedGeometries[i] = new (this.geometryClass)();
            }
            this.initFlushBuffers();
        };
        return UniformBatchRenderer;
    }(AbstractBatchRenderer));
    pixi_projection.UniformBatchRenderer = UniformBatchRenderer;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var p = [new PIXI.Point(), new PIXI.Point(), new PIXI.Point(), new PIXI.Point()];
    var a = [0, 0, 0, 0];
    var Surface = (function () {
        function Surface() {
            this.surfaceID = "default";
            this._updateID = 0;
            this.vertexSrc = "";
            this.fragmentSrc = "";
        }
        Surface.prototype.fillUniforms = function (uniforms) {
        };
        Surface.prototype.clear = function () {
        };
        Surface.prototype.boundsQuad = function (v, out, after) {
            var minX = out[0], minY = out[1];
            var maxX = out[0], maxY = out[1];
            for (var i = 2; i < 8; i += 2) {
                if (minX > out[i])
                    minX = out[i];
                if (maxX < out[i])
                    maxX = out[i];
                if (minY > out[i + 1])
                    minY = out[i + 1];
                if (maxY < out[i + 1])
                    maxY = out[i + 1];
            }
            p[0].set(minX, minY);
            this.apply(p[0], p[0]);
            p[1].set(maxX, minY);
            this.apply(p[1], p[1]);
            p[2].set(maxX, maxY);
            this.apply(p[2], p[2]);
            p[3].set(minX, maxY);
            this.apply(p[3], p[3]);
            if (after) {
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
            else {
                for (var i = 1; i <= 3; i++) {
                    if (p[i].y < p[0].y || p[i].y == p[0].y && p[i].x < p[0].x) {
                        var t = p[0];
                        p[0] = p[i];
                        p[i] = t;
                    }
                }
                for (var i = 1; i <= 3; i++) {
                    a[i] = Math.atan2(p[i].y - p[0].y, p[i].x - p[0].x);
                }
                for (var i = 1; i <= 3; i++) {
                    for (var j = i + 1; j <= 3; j++) {
                        if (a[i] > a[j]) {
                            var t = p[i];
                            p[i] = p[j];
                            p[j] = t;
                            var t2 = a[i];
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
                if ((p[3].x - p[2].x) * (p[1].y - p[2].y) - (p[1].x - p[2].x) * (p[3].y - p[2].y) < 0) {
                    out[4] = p[3].x;
                    out[5] = p[3].y;
                    return;
                }
            }
        };
        return Surface;
    }());
    pixi_projection.Surface = Surface;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var tempMat = new PIXI.Matrix();
    var tempRect = new PIXI.Rectangle();
    var tempPoint = new PIXI.Point();
    var BilinearSurface = (function (_super) {
        __extends(BilinearSurface, _super);
        function BilinearSurface() {
            var _this = _super.call(this) || this;
            _this.distortion = new PIXI.Point();
            return _this;
        }
        BilinearSurface.prototype.clear = function () {
            this.distortion.set(0, 0);
        };
        BilinearSurface.prototype.apply = function (pos, newPos) {
            newPos = newPos || new PIXI.Point();
            var d = this.distortion;
            var m = pos.x * pos.y;
            newPos.x = pos.x + d.x * m;
            newPos.y = pos.y + d.y * m;
            return newPos;
        };
        BilinearSurface.prototype.applyInverse = function (pos, newPos) {
            newPos = newPos || new PIXI.Point();
            var vx = pos.x, vy = pos.y;
            var dx = this.distortion.x, dy = this.distortion.y;
            if (dx == 0.0) {
                newPos.x = vx;
                newPos.y = vy / (1.0 + dy * vx);
            }
            else if (dy == 0.0) {
                newPos.y = vy;
                newPos.x = vx / (1.0 + dx * vy);
            }
            else {
                var b = (vy * dx - vx * dy + 1.0) * 0.5 / dy;
                var d = b * b + vx / dy;
                if (d <= 0.00001) {
                    newPos.set(NaN, NaN);
                    return newPos;
                }
                if (dy > 0.0) {
                    newPos.x = -b + Math.sqrt(d);
                }
                else {
                    newPos.x = -b - Math.sqrt(d);
                }
                newPos.y = (vx / newPos.x - 1.0) / dx;
            }
            return newPos;
        };
        BilinearSurface.prototype.mapSprite = function (sprite, quad, outTransform) {
            var tex = sprite.texture;
            tempRect.x = -sprite.anchor.x * tex.orig.width;
            tempRect.y = -sprite.anchor.y * tex.orig.height;
            tempRect.width = tex.orig.width;
            tempRect.height = tex.orig.height;
            return this.mapQuad(tempRect, quad, outTransform || sprite.transform);
        };
        BilinearSurface.prototype.mapQuad = function (rect, quad, outTransform) {
            var ax = -rect.x / rect.width;
            var ay = -rect.y / rect.height;
            var ax2 = (1.0 - rect.x) / rect.width;
            var ay2 = (1.0 - rect.y) / rect.height;
            var up1x = (quad[0].x * (1.0 - ax) + quad[1].x * ax);
            var up1y = (quad[0].y * (1.0 - ax) + quad[1].y * ax);
            var up2x = (quad[0].x * (1.0 - ax2) + quad[1].x * ax2);
            var up2y = (quad[0].y * (1.0 - ax2) + quad[1].y * ax2);
            var down1x = (quad[3].x * (1.0 - ax) + quad[2].x * ax);
            var down1y = (quad[3].y * (1.0 - ax) + quad[2].y * ax);
            var down2x = (quad[3].x * (1.0 - ax2) + quad[2].x * ax2);
            var down2y = (quad[3].y * (1.0 - ax2) + quad[2].y * ax2);
            var x00 = up1x * (1.0 - ay) + down1x * ay;
            var y00 = up1y * (1.0 - ay) + down1y * ay;
            var x10 = up2x * (1.0 - ay) + down2x * ay;
            var y10 = up2y * (1.0 - ay) + down2y * ay;
            var x01 = up1x * (1.0 - ay2) + down1x * ay2;
            var y01 = up1y * (1.0 - ay2) + down1y * ay2;
            var x11 = up2x * (1.0 - ay2) + down2x * ay2;
            var y11 = up2y * (1.0 - ay2) + down2y * ay2;
            var mat = tempMat;
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
        };
        BilinearSurface.prototype.fillUniforms = function (uniforms) {
            uniforms.distortion = uniforms.distortion || new Float32Array([0, 0, 0, 0]);
            var ax = Math.abs(this.distortion.x);
            var ay = Math.abs(this.distortion.y);
            uniforms.distortion[0] = ax * 10000 <= ay ? 0 : this.distortion.x;
            uniforms.distortion[1] = ay * 10000 <= ax ? 0 : this.distortion.y;
            uniforms.distortion[2] = 1.0 / uniforms.distortion[0];
            uniforms.distortion[3] = 1.0 / uniforms.distortion[1];
        };
        return BilinearSurface;
    }(pixi_projection.Surface));
    pixi_projection.BilinearSurface = BilinearSurface;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Container2s = (function (_super) {
        __extends(Container2s, _super);
        function Container2s() {
            var _this = _super.call(this) || this;
            _this.proj = new pixi_projection.ProjectionSurface(_this.transform);
            return _this;
        }
        Object.defineProperty(Container2s.prototype, "worldTransform", {
            get: function () {
                return this.proj;
            },
            enumerable: true,
            configurable: true
        });
        return Container2s;
    }(PIXI.Container));
    pixi_projection.Container2s = Container2s;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var fun = PIXI.Transform.prototype.updateTransform;
    function transformHack(parentTransform) {
        var proj = this.proj;
        var pp = parentTransform.proj;
        var ta = this;
        if (!pp) {
            fun.call(this, parentTransform);
            proj._activeProjection = null;
            return;
        }
        if (pp._surface) {
            proj._activeProjection = pp;
            this.updateLocalTransform();
            this.localTransform.copyTo(this.worldTransform);
            if (ta._parentID < 0) {
                ++ta._worldID;
            }
            return;
        }
        fun.call(this, parentTransform);
        proj._activeProjection = pp._activeProjection;
    }
    var ProjectionSurface = (function (_super) {
        __extends(ProjectionSurface, _super);
        function ProjectionSurface(legacy, enable) {
            var _this = _super.call(this, legacy, enable) || this;
            _this._surface = null;
            _this._activeProjection = null;
            _this._currentSurfaceID = -1;
            _this._currentLegacyID = -1;
            _this._lastUniforms = null;
            return _this;
        }
        Object.defineProperty(ProjectionSurface.prototype, "enabled", {
            set: function (value) {
                if (value === this._enabled) {
                    return;
                }
                this._enabled = value;
                if (value) {
                    this.legacy.updateTransform = transformHack;
                    this.legacy._parentID = -1;
                }
                else {
                    this.legacy.updateTransform = PIXI.Transform.prototype.updateTransform;
                    this.legacy._parentID = -1;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProjectionSurface.prototype, "surface", {
            get: function () {
                return this._surface;
            },
            set: function (value) {
                if (this._surface == value) {
                    return;
                }
                this._surface = value || null;
                this.legacy._parentID = -1;
            },
            enumerable: true,
            configurable: true
        });
        ProjectionSurface.prototype.applyPartial = function (pos, newPos) {
            if (this._activeProjection !== null) {
                newPos = this.legacy.worldTransform.apply(pos, newPos);
                return this._activeProjection.surface.apply(newPos, newPos);
            }
            if (this._surface !== null) {
                return this.surface.apply(pos, newPos);
            }
            return this.legacy.worldTransform.apply(pos, newPos);
        };
        ProjectionSurface.prototype.apply = function (pos, newPos) {
            if (this._activeProjection !== null) {
                newPos = this.legacy.worldTransform.apply(pos, newPos);
                this._activeProjection.surface.apply(newPos, newPos);
                return this._activeProjection.legacy.worldTransform.apply(newPos, newPos);
            }
            if (this._surface !== null) {
                newPos = this.surface.apply(pos, newPos);
                return this.legacy.worldTransform.apply(newPos, newPos);
            }
            return this.legacy.worldTransform.apply(pos, newPos);
        };
        ProjectionSurface.prototype.applyInverse = function (pos, newPos) {
            if (this._activeProjection !== null) {
                newPos = this._activeProjection.legacy.worldTransform.applyInverse(pos, newPos);
                this._activeProjection._surface.applyInverse(newPos, newPos);
                return this.legacy.worldTransform.applyInverse(newPos, newPos);
            }
            if (this._surface !== null) {
                newPos = this.legacy.worldTransform.applyInverse(pos, newPos);
                return this._surface.applyInverse(newPos, newPos);
            }
            return this.legacy.worldTransform.applyInverse(pos, newPos);
        };
        ProjectionSurface.prototype.mapBilinearSprite = function (sprite, quad) {
            if (!(this._surface instanceof pixi_projection.BilinearSurface)) {
                this.surface = new pixi_projection.BilinearSurface();
            }
            this.surface.mapSprite(sprite, quad, this.legacy);
        };
        ProjectionSurface.prototype.clear = function () {
            if (this.surface) {
                this.surface.clear();
            }
        };
        Object.defineProperty(ProjectionSurface.prototype, "uniforms", {
            get: function () {
                if (this._currentLegacyID === this.legacy._worldID &&
                    this._currentSurfaceID === this.surface._updateID) {
                    return this._lastUniforms;
                }
                this._lastUniforms = this._lastUniforms || {};
                this._lastUniforms.translationMatrix = this.legacy.worldTransform;
                this._surface.fillUniforms(this._lastUniforms);
                return this._lastUniforms;
            },
            enumerable: true,
            configurable: true
        });
        return ProjectionSurface;
    }(pixi_projection.AbstractProjection));
    pixi_projection.ProjectionSurface = ProjectionSurface;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var TYPES = PIXI.TYPES;
    var premultiplyTint = PIXI.utils.premultiplyTint;
    var shaderVert = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec3 aTrans1;\nattribute vec3 aTrans2;\nattribute vec2 aSamplerSize;\nattribute vec4 aFrame;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\n\nvarying vec2 vertexPosition;\nvarying vec3 vTrans1;\nvarying vec3 vTrans2;\nvarying vec2 vSamplerSize;\nvarying vec4 vFrame;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n\tgl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);\n\tgl_Position.z = 0.0;\n\n\tvertexPosition = aVertexPosition;\n\tvTrans1 = aTrans1;\n\tvTrans2 = aTrans2;\n\tvTextureId = aTextureId;\n\tvColor = aColor;\n\tvSamplerSize = aSamplerSize;\n\tvFrame = aFrame;\n}\n";
    var shaderFrag = "precision highp float;\nvarying vec2 vertexPosition;\nvarying vec3 vTrans1;\nvarying vec3 vTrans2;\nvarying vec2 vSamplerSize;\nvarying vec4 vFrame;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nuniform sampler2D uSamplers[%count%];\nuniform vec4 distortion;\n\nvoid main(void){\nvec2 surface;\nvec2 surface2;\n\nfloat vx = vertexPosition.x;\nfloat vy = vertexPosition.y;\nfloat dx = distortion.x;\nfloat dy = distortion.y;\nfloat revx = distortion.z;\nfloat revy = distortion.w;\n\nif (distortion.x == 0.0) {\n\tsurface.x = vx;\n\tsurface.y = vy / (1.0 + dy * vx);\n\tsurface2 = surface;\n} else\nif (distortion.y == 0.0) {\n\tsurface.y = vy;\n\tsurface.x = vx / (1.0 + dx * vy);\n\tsurface2 = surface;\n} else {\n\tfloat c = vy * dx - vx * dy;\n\tfloat b = (c + 1.0) * 0.5;\n\tfloat b2 = (-c + 1.0) * 0.5;\n\tfloat d = b * b + vx * dy;\n\tif (d < -0.00001) {\n\t    discard;\n\t}\n\td = sqrt(max(d, 0.0));\n\tsurface.x = (- b + d) * revy;\n\tsurface2.x = (- b - d) * revy;\n\tsurface.y = (- b2 + d) * revx;\n\tsurface2.y = (- b2 - d) * revx;\n}\n\nvec2 uv;\nuv.x = vTrans1.x * surface.x + vTrans1.y * surface.y + vTrans1.z;\nuv.y = vTrans2.x * surface.x + vTrans2.y * surface.y + vTrans2.z;\n\nvec2 pixels = uv * vSamplerSize;\n\nif (pixels.x < vFrame.x || pixels.x > vFrame.z ||\n\tpixels.y < vFrame.y || pixels.y > vFrame.w) {\n\tuv.x = vTrans1.x * surface2.x + vTrans1.y * surface2.y + vTrans1.z;\n\tuv.y = vTrans2.x * surface2.x + vTrans2.y * surface2.y + vTrans2.z;\n\tpixels = uv * vSamplerSize;\n\n   if (pixels.x < vFrame.x || pixels.x > vFrame.z ||\n       pixels.y < vFrame.y || pixels.y > vFrame.w) {\n       discard;\n   }\n}\n\nvec4 edge;\nedge.xy = clamp(pixels - vFrame.xy + 0.5, vec2(0.0, 0.0), vec2(1.0, 1.0));\nedge.zw = clamp(vFrame.zw - pixels + 0.5, vec2(0.0, 0.0), vec2(1.0, 1.0));\n\nfloat alpha = 1.0; //edge.x * edge.y * edge.z * edge.w;\nvec4 rColor = vColor * alpha;\n\nfloat textureId = floor(vTextureId+0.5);\nvec2 vTextureCoord = uv;\nvec4 color;\n%forloop%\ngl_FragColor = color * rColor;\n}";
    var BatchBilineardGeometry = (function (_super) {
        __extends(BatchBilineardGeometry, _super);
        function BatchBilineardGeometry(_static) {
            if (_static === void 0) { _static = false; }
            var _this = _super.call(this) || this;
            _this._buffer = new PIXI.Buffer(null, _static, false);
            _this._indexBuffer = new PIXI.Buffer(null, _static, true);
            _this.addAttribute('aVertexPosition', _this._buffer, 2, false, TYPES.FLOAT)
                .addAttribute('aTrans1', _this._buffer, 3, false, TYPES.FLOAT)
                .addAttribute('aTrans2', _this._buffer, 3, false, TYPES.FLOAT)
                .addAttribute('aSamplerSize', _this._buffer, 2, false, TYPES.FLOAT)
                .addAttribute('aFrame', _this._buffer, 4, false, TYPES.FLOAT)
                .addAttribute('aColor', _this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
                .addAttribute('aTextureId', _this._buffer, 1, true, TYPES.FLOAT)
                .addIndex(_this._indexBuffer);
            return _this;
        }
        return BatchBilineardGeometry;
    }(PIXI.Geometry));
    pixi_projection.BatchBilineardGeometry = BatchBilineardGeometry;
    var BatchBilinearPluginFactory = (function () {
        function BatchBilinearPluginFactory() {
        }
        BatchBilinearPluginFactory.create = function (options) {
            var _a = Object.assign({
                vertex: shaderVert,
                fragment: shaderFrag,
                geometryClass: BatchBilineardGeometry,
                vertexSize: 16,
            }, options), vertex = _a.vertex, fragment = _a.fragment, vertexSize = _a.vertexSize, geometryClass = _a.geometryClass;
            return (function (_super) {
                __extends(BatchPlugin, _super);
                function BatchPlugin(renderer) {
                    var _this = _super.call(this, renderer) || this;
                    _this.defUniforms = {
                        translationMatrix: new PIXI.Matrix(),
                        distortion: new Float32Array([0, 0, Infinity, Infinity])
                    };
                    _this.size = 1000;
                    _this.forceMaxTextures = 1;
                    _this.shaderGenerator = new PIXI.BatchShaderGenerator(vertex, fragment);
                    _this.geometryClass = geometryClass;
                    _this.vertexSize = vertexSize;
                    return _this;
                }
                BatchPlugin.prototype.getUniforms = function (sprite) {
                    var proj = sprite.proj;
                    if (proj.surface !== null) {
                        return proj.uniforms;
                    }
                    if (proj._activeProjection !== null) {
                        return proj._activeProjection.uniforms;
                    }
                    return this.defUniforms;
                };
                BatchPlugin.prototype.packInterleavedGeometry = function (element, attributeBuffer, indexBuffer, aIndex, iIndex) {
                    var uint32View = attributeBuffer.uint32View, float32View = attributeBuffer.float32View;
                    var p = aIndex / this.vertexSize;
                    var indices = element.indices;
                    var vertexData = element.vertexData;
                    var tex = element._texture;
                    var frame = tex._frame;
                    var aTrans = element.aTrans;
                    var _a = element._texture.baseTexture, _batchLocation = _a._batchLocation, realWidth = _a.realWidth, realHeight = _a.realHeight, resolution = _a.resolution;
                    var alpha = Math.min(element.worldAlpha, 1.0);
                    var argb = alpha < 1.0 && element._texture.baseTexture.alphaMode ? premultiplyTint(element._tintRGB, alpha)
                        : element._tintRGB + (alpha * 255 << 24);
                    for (var i = 0; i < vertexData.length; i += 2) {
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
                    for (var i = 0; i < indices.length; i++) {
                        indexBuffer[iIndex++] = p + indices[i];
                    }
                };
                return BatchPlugin;
            }(pixi_projection.UniformBatchRenderer));
        };
        return BatchBilinearPluginFactory;
    }());
    pixi_projection.BatchBilinearPluginFactory = BatchBilinearPluginFactory;
    PIXI.Renderer.registerPlugin('batch_bilinear', BatchBilinearPluginFactory.create({}));
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Sprite2s = (function (_super) {
        __extends(Sprite2s, _super);
        function Sprite2s(texture) {
            var _this = _super.call(this, texture) || this;
            _this.aTrans = new PIXI.Matrix();
            _this.proj = new pixi_projection.ProjectionSurface(_this.transform);
            _this.pluginName = 'batch_bilinear';
            return _this;
        }
        Sprite2s.prototype._calculateBounds = function () {
            this.calculateTrimmedVertices();
            this._bounds.addQuad(this.vertexTrimmedData);
        };
        Sprite2s.prototype.calculateVertices = function () {
            var wid = this.transform._worldID;
            var tuid = this._texture._updateID;
            if (this._transformID === wid && this._textureID === tuid) {
                return;
            }
            this._transformID = wid;
            this._textureID = tuid;
            var texture = this._texture;
            var vertexData = this.vertexData;
            var trim = texture.trim;
            var orig = texture.orig;
            var anchor = this._anchor;
            var w0 = 0;
            var w1 = 0;
            var h0 = 0;
            var h1 = 0;
            if (trim) {
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
            if (this.proj._surface) {
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
            else {
                var wt = this.transform.worldTransform;
                var a = wt.a;
                var b = wt.b;
                var c = wt.c;
                var d = wt.d;
                var tx = wt.tx;
                var ty = wt.ty;
                vertexData[0] = (a * w1) + (c * h1) + tx;
                vertexData[1] = (d * h1) + (b * w1) + ty;
                vertexData[2] = (a * w0) + (c * h1) + tx;
                vertexData[3] = (d * h1) + (b * w0) + ty;
                vertexData[4] = (a * w0) + (c * h0) + tx;
                vertexData[5] = (d * h0) + (b * w0) + ty;
                vertexData[6] = (a * w1) + (c * h0) + tx;
                vertexData[7] = (d * h0) + (b * w1) + ty;
                if (this.proj._activeProjection) {
                    this.proj._activeProjection.surface.boundsQuad(vertexData, vertexData);
                }
            }
            if (!texture.uvMatrix) {
                texture.uvMatrix = new PIXI.TextureMatrix(texture);
            }
            texture.uvMatrix.update();
            var aTrans = this.aTrans;
            aTrans.set(orig.width, 0, 0, orig.height, w1, h1);
            if (this.proj._surface === null) {
                aTrans.prepend(this.transform.worldTransform);
            }
            aTrans.invert();
            aTrans.prepend(texture.uvMatrix.mapCoord);
        };
        Sprite2s.prototype.calculateTrimmedVertices = function () {
            var wid = this.transform._worldID;
            var tuid = this._texture._updateID;
            if (!this.vertexTrimmedData) {
                this.vertexTrimmedData = new Float32Array(8);
            }
            else if (this._transformTrimmedID === wid && this._textureTrimmedID === tuid) {
                return;
            }
            this._transformTrimmedID = wid;
            this._textureTrimmedID = tuid;
            var texture = this._texture;
            var vertexData = this.vertexTrimmedData;
            var orig = texture.orig;
            var anchor = this._anchor;
            var w1 = -anchor._x * orig.width;
            var w0 = w1 + orig.width;
            var h1 = -anchor._y * orig.height;
            var h0 = h1 + orig.height;
            if (this.proj._surface) {
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
            else {
                var wt = this.transform.worldTransform;
                var a = wt.a;
                var b = wt.b;
                var c = wt.c;
                var d = wt.d;
                var tx = wt.tx;
                var ty = wt.ty;
                vertexData[0] = (a * w1) + (c * h1) + tx;
                vertexData[1] = (d * h1) + (b * w1) + ty;
                vertexData[2] = (a * w0) + (c * h1) + tx;
                vertexData[3] = (d * h1) + (b * w0) + ty;
                vertexData[4] = (a * w0) + (c * h0) + tx;
                vertexData[5] = (d * h0) + (b * w0) + ty;
                vertexData[6] = (a * w1) + (c * h0) + tx;
                vertexData[7] = (d * h0) + (b * w1) + ty;
                if (this.proj._activeProjection) {
                    this.proj._activeProjection.surface.boundsQuad(vertexData, vertexData, this.proj._activeProjection.legacy.worldTransform);
                }
            }
        };
        Object.defineProperty(Sprite2s.prototype, "worldTransform", {
            get: function () {
                return this.proj;
            },
            enumerable: true,
            configurable: true
        });
        return Sprite2s;
    }(PIXI.Sprite));
    pixi_projection.Sprite2s = Sprite2s;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Text2s = (function (_super) {
        __extends(Text2s, _super);
        function Text2s(text, style, canvas) {
            var _this = _super.call(this, text, style, canvas) || this;
            _this.aTrans = new PIXI.Matrix();
            _this.proj = new pixi_projection.ProjectionSurface(_this.transform);
            _this.pluginName = 'batch_bilinear';
            return _this;
        }
        Object.defineProperty(Text2s.prototype, "worldTransform", {
            get: function () {
                return this.proj;
            },
            enumerable: true,
            configurable: true
        });
        return Text2s;
    }(PIXI.Text));
    pixi_projection.Text2s = Text2s;
    Text2s.prototype.calculateVertices = pixi_projection.Sprite2s.prototype.calculateVertices;
    Text2s.prototype.calculateTrimmedVertices = pixi_projection.Sprite2s.prototype.calculateTrimmedVertices;
    Text2s.prototype._calculateBounds = pixi_projection.Sprite2s.prototype._calculateBounds;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    PIXI.Sprite.prototype.convertTo2s = function () {
        if (this.proj)
            return;
        this.pluginName = 'sprite_bilinear';
        this.aTrans = new PIXI.Matrix();
        this.calculateVertices = pixi_projection.Sprite2s.prototype.calculateVertices;
        this.calculateTrimmedVertices = pixi_projection.Sprite2s.prototype.calculateTrimmedVertices;
        this._calculateBounds = pixi_projection.Sprite2s.prototype._calculateBounds;
        PIXI.Container.prototype.convertTo2s.call(this);
    };
    PIXI.Container.prototype.convertTo2s = function () {
        if (this.proj)
            return;
        this.proj = new pixi_projection.Projection2d(this.transform);
        Object.defineProperty(this, "worldTransform", {
            get: function () {
                return this.proj;
            },
            enumerable: true,
            configurable: true
        });
    };
    PIXI.Container.prototype.convertSubtreeTo2s = function () {
        this.convertTo2s();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeTo2s();
        }
    };
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    function container2dWorldTransform() {
        return this.proj.affine ? this.transform.worldTransform : this.proj.world;
    }
    pixi_projection.container2dWorldTransform = container2dWorldTransform;
    var Container2d = (function (_super) {
        __extends(Container2d, _super);
        function Container2d() {
            var _this = _super.call(this) || this;
            _this.proj = new pixi_projection.Projection2d(_this.transform);
            return _this;
        }
        Container2d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            if (from) {
                position = from.toGlobal(position, point, skipUpdate);
            }
            if (!skipUpdate) {
                this._recursivePostUpdateTransform();
            }
            if (step >= pixi_projection.TRANSFORM_STEP.PROJ) {
                if (!skipUpdate) {
                    this.displayObjectUpdateTransform();
                }
                if (this.proj.affine) {
                    return this.transform.worldTransform.applyInverse(position, point);
                }
                return this.proj.world.applyInverse(position, point);
            }
            if (this.parent) {
                point = this.parent.worldTransform.applyInverse(position, point);
            }
            else {
                point.copyFrom(position);
            }
            if (step === pixi_projection.TRANSFORM_STEP.NONE) {
                return point;
            }
            return this.transform.localTransform.applyInverse(point, point);
        };
        Object.defineProperty(Container2d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        return Container2d;
    }(PIXI.Container));
    pixi_projection.Container2d = Container2d;
    pixi_projection.container2dToLocal = Container2d.prototype.toLocal;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Point = PIXI.Point;
    var mat3id = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    var AFFINE;
    (function (AFFINE) {
        AFFINE[AFFINE["NONE"] = 0] = "NONE";
        AFFINE[AFFINE["FREE"] = 1] = "FREE";
        AFFINE[AFFINE["AXIS_X"] = 2] = "AXIS_X";
        AFFINE[AFFINE["AXIS_Y"] = 3] = "AXIS_Y";
        AFFINE[AFFINE["POINT"] = 4] = "POINT";
        AFFINE[AFFINE["AXIS_XR"] = 5] = "AXIS_XR";
    })(AFFINE = pixi_projection.AFFINE || (pixi_projection.AFFINE = {}));
    var Matrix2d = (function () {
        function Matrix2d(backingArray) {
            this.floatArray = null;
            this.mat3 = new Float64Array(backingArray || mat3id);
        }
        Object.defineProperty(Matrix2d.prototype, "a", {
            get: function () {
                return this.mat3[0] / this.mat3[8];
            },
            set: function (value) {
                this.mat3[0] = value * this.mat3[8];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix2d.prototype, "b", {
            get: function () {
                return this.mat3[1] / this.mat3[8];
            },
            set: function (value) {
                this.mat3[1] = value * this.mat3[8];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix2d.prototype, "c", {
            get: function () {
                return this.mat3[3] / this.mat3[8];
            },
            set: function (value) {
                this.mat3[3] = value * this.mat3[8];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix2d.prototype, "d", {
            get: function () {
                return this.mat3[4] / this.mat3[8];
            },
            set: function (value) {
                this.mat3[4] = value * this.mat3[8];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix2d.prototype, "tx", {
            get: function () {
                return this.mat3[6] / this.mat3[8];
            },
            set: function (value) {
                this.mat3[6] = value * this.mat3[8];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix2d.prototype, "ty", {
            get: function () {
                return this.mat3[7] / this.mat3[8];
            },
            set: function (value) {
                this.mat3[7] = value * this.mat3[8];
            },
            enumerable: true,
            configurable: true
        });
        Matrix2d.prototype.set = function (a, b, c, d, tx, ty) {
            var mat3 = this.mat3;
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
        };
        Matrix2d.prototype.toArray = function (transpose, out) {
            if (!this.floatArray) {
                this.floatArray = new Float32Array(9);
            }
            var array = out || this.floatArray;
            var mat3 = this.mat3;
            if (transpose) {
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
            else {
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
        };
        Matrix2d.prototype.apply = function (pos, newPos) {
            newPos = newPos || new PIXI.Point();
            var mat3 = this.mat3;
            var x = pos.x;
            var y = pos.y;
            var z = 1.0 / (mat3[2] * x + mat3[5] * y + mat3[8]);
            newPos.x = z * (mat3[0] * x + mat3[3] * y + mat3[6]);
            newPos.y = z * (mat3[1] * x + mat3[4] * y + mat3[7]);
            return newPos;
        };
        Matrix2d.prototype.translate = function (tx, ty) {
            var mat3 = this.mat3;
            mat3[0] += tx * mat3[2];
            mat3[1] += ty * mat3[2];
            mat3[3] += tx * mat3[5];
            mat3[4] += ty * mat3[5];
            mat3[6] += tx * mat3[8];
            mat3[7] += ty * mat3[8];
            return this;
        };
        Matrix2d.prototype.scale = function (x, y) {
            var mat3 = this.mat3;
            mat3[0] *= x;
            mat3[1] *= y;
            mat3[3] *= x;
            mat3[4] *= y;
            mat3[6] *= x;
            mat3[7] *= y;
            return this;
        };
        Matrix2d.prototype.scaleAndTranslate = function (scaleX, scaleY, tx, ty) {
            var mat3 = this.mat3;
            mat3[0] = scaleX * mat3[0] + tx * mat3[2];
            mat3[1] = scaleY * mat3[1] + ty * mat3[2];
            mat3[3] = scaleX * mat3[3] + tx * mat3[5];
            mat3[4] = scaleY * mat3[4] + ty * mat3[5];
            mat3[6] = scaleX * mat3[6] + tx * mat3[8];
            mat3[7] = scaleY * mat3[7] + ty * mat3[8];
        };
        Matrix2d.prototype.applyInverse = function (pos, newPos) {
            newPos = newPos || new Point();
            var a = this.mat3;
            var x = pos.x;
            var y = pos.y;
            var a00 = a[0], a01 = a[3], a02 = a[6], a10 = a[1], a11 = a[4], a12 = a[7], a20 = a[2], a21 = a[5], a22 = a[8];
            var newX = (a22 * a11 - a12 * a21) * x + (-a22 * a01 + a02 * a21) * y + (a12 * a01 - a02 * a11);
            var newY = (-a22 * a10 + a12 * a20) * x + (a22 * a00 - a02 * a20) * y + (-a12 * a00 + a02 * a10);
            var newZ = (a21 * a10 - a11 * a20) * x + (-a21 * a00 + a01 * a20) * y + (a11 * a00 - a01 * a10);
            newPos.x = newX / newZ;
            newPos.y = newY / newZ;
            return newPos;
        };
        Matrix2d.prototype.invert = function () {
            var a = this.mat3;
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20;
            var det = a00 * b01 + a01 * b11 + a02 * b21;
            if (!det) {
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
        };
        Matrix2d.prototype.identity = function () {
            var mat3 = this.mat3;
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
        };
        Matrix2d.prototype.clone = function () {
            return new Matrix2d(this.mat3);
        };
        Matrix2d.prototype.copyTo2dOr3d = function (matrix) {
            var mat3 = this.mat3;
            var ar2 = matrix.mat3;
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
        };
        Matrix2d.prototype.copyTo = function (matrix, affine, preserveOrientation) {
            var mat3 = this.mat3;
            var d = 1.0 / mat3[8];
            var tx = mat3[6] * d, ty = mat3[7] * d;
            matrix.a = (mat3[0] - mat3[2] * tx) * d;
            matrix.b = (mat3[1] - mat3[2] * ty) * d;
            matrix.c = (mat3[3] - mat3[5] * tx) * d;
            matrix.d = (mat3[4] - mat3[5] * ty) * d;
            matrix.tx = tx;
            matrix.ty = ty;
            if (affine >= 2) {
                var D = matrix.a * matrix.d - matrix.b * matrix.c;
                if (!preserveOrientation) {
                    D = Math.abs(D);
                }
                if (affine === AFFINE.POINT) {
                    if (D > 0) {
                        D = 1;
                    }
                    else
                        D = -1;
                    matrix.a = D;
                    matrix.b = 0;
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === AFFINE.AXIS_X) {
                    D /= Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d);
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === AFFINE.AXIS_Y) {
                    D /= Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c);
                    matrix.a = D;
                    matrix.c = 0;
                }
                else if (affine === AFFINE.AXIS_XR) {
                    matrix.a = matrix.d * D;
                    matrix.c = -matrix.b * D;
                }
            }
            return matrix;
        };
        Matrix2d.prototype.copyFrom = function (matrix) {
            var mat3 = this.mat3;
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
        };
        Matrix2d.prototype.setToMultLegacy = function (pt, lt) {
            var out = this.mat3;
            var b = lt.mat3;
            var a00 = pt.a, a01 = pt.b, a10 = pt.c, a11 = pt.d, a20 = pt.tx, a21 = pt.ty, b00 = b[0], b01 = b[1], b02 = b[2], b10 = b[3], b11 = b[4], b12 = b[5], b20 = b[6], b21 = b[7], b22 = b[8];
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
        };
        Matrix2d.prototype.setToMultLegacy2 = function (pt, lt) {
            var out = this.mat3;
            var a = pt.mat3;
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b00 = lt.a, b01 = lt.b, b10 = lt.c, b11 = lt.d, b20 = lt.tx, b21 = lt.ty;
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
        };
        Matrix2d.prototype.setToMult = function (pt, lt) {
            var out = this.mat3;
            var a = pt.mat3, b = lt.mat3;
            var a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8], b00 = b[0], b01 = b[1], b02 = b[2], b10 = b[3], b11 = b[4], b12 = b[5], b20 = b[6], b21 = b[7], b22 = b[8];
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
        };
        Matrix2d.prototype.prepend = function (lt) {
            if (lt.mat3) {
                return this.setToMult(lt, this);
            }
            else {
                return this.setToMultLegacy(lt, this);
            }
        };
        Matrix2d.IDENTITY = new Matrix2d();
        Matrix2d.TEMP_MATRIX = new Matrix2d();
        return Matrix2d;
    }());
    pixi_projection.Matrix2d = Matrix2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var t0 = new PIXI.Point();
    var tt = [new PIXI.Point(), new PIXI.Point(), new PIXI.Point(), new PIXI.Point()];
    var tempRect = new PIXI.Rectangle();
    var tempMat = new pixi_projection.Matrix2d();
    var Projection2d = (function (_super) {
        __extends(Projection2d, _super);
        function Projection2d(legacy, enable) {
            var _this = _super.call(this, legacy, enable) || this;
            _this.matrix = new pixi_projection.Matrix2d();
            _this.pivot = new PIXI.ObservablePoint(_this.onChange, _this, 0, 0);
            _this.reverseLocalOrder = false;
            _this.local = new pixi_projection.Matrix2d();
            _this.world = new pixi_projection.Matrix2d();
            return _this;
        }
        Projection2d.prototype.onChange = function () {
            var pivot = this.pivot;
            var mat3 = this.matrix.mat3;
            mat3[6] = -(pivot._x * mat3[0] + pivot._y * mat3[3]);
            mat3[7] = -(pivot._x * mat3[1] + pivot._y * mat3[4]);
            this._projID++;
        };
        Projection2d.prototype.setAxisX = function (p, factor) {
            if (factor === void 0) { factor = 1; }
            var x = p.x, y = p.y;
            var d = Math.sqrt(x * x + y * y);
            var mat3 = this.matrix.mat3;
            mat3[0] = x / d;
            mat3[1] = y / d;
            mat3[2] = factor / d;
            this.onChange();
        };
        Projection2d.prototype.setAxisY = function (p, factor) {
            if (factor === void 0) { factor = 1; }
            var x = p.x, y = p.y;
            var d = Math.sqrt(x * x + y * y);
            var mat3 = this.matrix.mat3;
            mat3[3] = x / d;
            mat3[4] = y / d;
            mat3[5] = factor / d;
            this.onChange();
        };
        Projection2d.prototype.mapSprite = function (sprite, quad) {
            var tex = sprite.texture;
            tempRect.x = -sprite.anchor.x * tex.orig.width;
            tempRect.y = -sprite.anchor.y * tex.orig.height;
            tempRect.width = tex.orig.width;
            tempRect.height = tex.orig.height;
            return this.mapQuad(tempRect, quad);
        };
        Projection2d.prototype.mapQuad = function (rect, p) {
            tt[0].set(rect.x, rect.y);
            tt[1].set(rect.x + rect.width, rect.y);
            tt[2].set(rect.x + rect.width, rect.y + rect.height);
            tt[3].set(rect.x, rect.y + rect.height);
            var k1 = 1, k2 = 2, k3 = 3;
            var f = pixi_projection.utils.getIntersectionFactor(p[0], p[2], p[1], p[3], t0);
            if (f !== 0) {
                k1 = 1;
                k2 = 3;
                k3 = 2;
            }
            else {
                return;
            }
            var d0 = Math.sqrt((p[0].x - t0.x) * (p[0].x - t0.x) + (p[0].y - t0.y) * (p[0].y - t0.y));
            var d1 = Math.sqrt((p[k1].x - t0.x) * (p[k1].x - t0.x) + (p[k1].y - t0.y) * (p[k1].y - t0.y));
            var d2 = Math.sqrt((p[k2].x - t0.x) * (p[k2].x - t0.x) + (p[k2].y - t0.y) * (p[k2].y - t0.y));
            var d3 = Math.sqrt((p[k3].x - t0.x) * (p[k3].x - t0.x) + (p[k3].y - t0.y) * (p[k3].y - t0.y));
            var q0 = (d0 + d3) / d3;
            var q1 = (d1 + d2) / d2;
            var q2 = (d1 + d2) / d1;
            var mat3 = this.matrix.mat3;
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
            mat3 = tempMat.mat3;
            mat3[0] = p[0].x;
            mat3[1] = p[0].y;
            mat3[2] = 1;
            mat3[3] = p[k1].x;
            mat3[4] = p[k1].y;
            mat3[5] = 1;
            mat3[6] = p[k2].x;
            mat3[7] = p[k2].y;
            mat3[8] = 1;
            this.matrix.setToMult(tempMat, this.matrix);
            this._projID++;
        };
        Projection2d.prototype.updateLocalTransform = function (lt) {
            if (this._projID !== 0) {
                if (this.reverseLocalOrder) {
                    this.local.setToMultLegacy2(this.matrix, lt);
                }
                else {
                    this.local.setToMultLegacy(lt, this.matrix);
                }
            }
            else {
                this.local.copyFrom(lt);
            }
        };
        Projection2d.prototype.clear = function () {
            _super.prototype.clear.call(this);
            this.matrix.identity();
            this.pivot.set(0, 0);
        };
        return Projection2d;
    }(pixi_projection.LinearProjection));
    pixi_projection.Projection2d = Projection2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Mesh2d = (function (_super) {
        __extends(Mesh2d, _super);
        function Mesh2d(geometry, shader, state, drawMode) {
            var _this = _super.call(this, geometry, shader, state, drawMode) || this;
            _this.vertexData2d = null;
            _this.proj = new pixi_projection.Projection2d(_this.transform);
            return _this;
        }
        Mesh2d.prototype.calculateVertices = function () {
            if (this.proj._affine) {
                this.vertexData2d = null;
                _super.prototype.calculateVertices.call(this);
                return;
            }
            var geometry = this.geometry;
            var vertices = geometry.buffers[0].data;
            var thisAny = this;
            if (geometry.vertexDirtyId === thisAny.vertexDirty && thisAny._transformID === thisAny.transform._worldID) {
                return;
            }
            thisAny._transformID = thisAny.transform._worldID;
            if (thisAny.vertexData.length !== vertices.length) {
                thisAny.vertexData = new Float32Array(vertices.length);
            }
            if (this.vertexData2d.length !== vertices.length * 3 / 2) {
                this.vertexData2d = new Float32Array(vertices.length * 3);
            }
            var wt = this.proj.world.mat3;
            var vertexData2d = this.vertexData2d;
            var vertexData = thisAny.vertexData;
            for (var i = 0; i < vertexData.length / 2; i++) {
                var x = vertices[(i * 2)];
                var y = vertices[(i * 2) + 1];
                var xx = (wt[0] * x) + (wt[3] * y) + wt[6];
                var yy = (wt[1] * x) + (wt[4] * y) + wt[7];
                var ww = (wt[2] * x) + (wt[5] * y) + wt[8];
                vertexData2d[i * 3] = xx;
                vertexData2d[i * 3 + 1] = yy;
                vertexData2d[i * 3 + 2] = ww;
                vertexData[(i * 2)] = xx / ww;
                vertexData[(i * 2) + 1] = yy / ww;
            }
            thisAny.vertexDirty = geometry.vertexDirtyId;
        };
        Mesh2d.prototype._renderDefault = function (renderer) {
            var shader = this.shader;
            shader.alpha = this.worldAlpha;
            if (shader.update) {
                shader.update();
            }
            renderer.batch.flush();
            if (shader.program.uniformData.translationMatrix) {
                shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
            }
            renderer.shader.bind(shader, false);
            renderer.state.set(this.state);
            renderer.geometry.bind(this.geometry, shader);
            renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
        };
        Mesh2d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            return pixi_projection.container2dToLocal.call(this, position, from, point, skipUpdate, step);
        };
        Object.defineProperty(Mesh2d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        Mesh2d.defaultVertexShader = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n\tgl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);\n\tgl_Position.z = 0.0;\n\n\tvTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n";
        Mesh2d.defaultFragmentShader = "\nvarying vec2 vTextureCoord;\nuniform vec4 uColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n\tgl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\n}";
        return Mesh2d;
    }(PIXI.Mesh));
    pixi_projection.Mesh2d = Mesh2d;
    var SimpleMesh2d = (function (_super) {
        __extends(SimpleMesh2d, _super);
        function SimpleMesh2d(texture, vertices, uvs, indices, drawMode) {
            var _this = _super.call(this, new PIXI.MeshGeometry(vertices, uvs, indices), new PIXI.MeshMaterial(texture, {
                program: PIXI.Program.from(Mesh2d.defaultVertexShader, Mesh2d.defaultFragmentShader),
                pluginName: 'batch2d'
            }), null, drawMode) || this;
            _this.autoUpdate = true;
            _this.geometry.getBuffer('aVertexPosition').static = false;
            return _this;
        }
        Object.defineProperty(SimpleMesh2d.prototype, "vertices", {
            get: function () {
                return this.geometry.getBuffer('aVertexPosition').data;
            },
            set: function (value) {
                this.geometry.getBuffer('aVertexPosition').data = value;
            },
            enumerable: true,
            configurable: true
        });
        SimpleMesh2d.prototype._render = function (renderer) {
            if (this.autoUpdate) {
                this.geometry.getBuffer('aVertexPosition').update();
            }
            _super.prototype._render.call(this, renderer);
        };
        return SimpleMesh2d;
    }(Mesh2d));
    pixi_projection.SimpleMesh2d = SimpleMesh2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Sprite2d = (function (_super) {
        __extends(Sprite2d, _super);
        function Sprite2d(texture) {
            var _this = _super.call(this, texture) || this;
            _this.vertexData2d = null;
            _this.proj = new pixi_projection.Projection2d(_this.transform);
            _this.pluginName = 'batch2d';
            return _this;
        }
        Sprite2d.prototype._calculateBounds = function () {
            this.calculateTrimmedVertices();
            this._bounds.addQuad(this.vertexTrimmedData);
        };
        Sprite2d.prototype.calculateVertices = function () {
            var texture = this._texture;
            if (this.proj._affine) {
                this.vertexData2d = null;
                _super.prototype.calculateVertices.call(this);
                return;
            }
            if (!this.vertexData2d) {
                this.vertexData2d = new Float32Array(12);
            }
            var wid = this.transform._worldID;
            var tuid = texture._updateID;
            if (this._transformID === wid && this._textureID === tuid) {
                return;
            }
            if (this._textureID !== tuid) {
                this.uvs = texture._uvs.uvsFloat32;
            }
            this._transformID = wid;
            this._textureID = tuid;
            var wt = this.proj.world.mat3;
            var vertexData2d = this.vertexData2d;
            var vertexData = this.vertexData;
            var trim = texture.trim;
            var orig = texture.orig;
            var anchor = this._anchor;
            var w0 = 0;
            var w1 = 0;
            var h0 = 0;
            var h1 = 0;
            if (trim) {
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
        };
        Sprite2d.prototype.calculateTrimmedVertices = function () {
            if (this.proj._affine) {
                _super.prototype.calculateTrimmedVertices.call(this);
                return;
            }
            var wid = this.transform._worldID;
            var tuid = this._texture._updateID;
            if (!this.vertexTrimmedData) {
                this.vertexTrimmedData = new Float32Array(8);
            }
            else if (this._transformTrimmedID === wid && this._textureTrimmedID === tuid) {
                return;
            }
            this._transformTrimmedID = wid;
            this._textureTrimmedID = tuid;
            var texture = this._texture;
            var vertexData = this.vertexTrimmedData;
            var orig = texture.orig;
            var anchor = this._anchor;
            var wt = this.proj.world.mat3;
            var w1 = -anchor._x * orig.width;
            var w0 = w1 + orig.width;
            var h1 = -anchor._y * orig.height;
            var h0 = h1 + orig.height;
            var z = 1.0 / (wt[2] * w1 + wt[5] * h1 + wt[8]);
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
        };
        Sprite2d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            return pixi_projection.container2dToLocal.call(this, position, from, point, skipUpdate, step);
        };
        Object.defineProperty(Sprite2d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        return Sprite2d;
    }(PIXI.Sprite));
    pixi_projection.Sprite2d = Sprite2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Text2d = (function (_super) {
        __extends(Text2d, _super);
        function Text2d(text, style, canvas) {
            var _this = _super.call(this, text, style, canvas) || this;
            _this.vertexData2d = null;
            _this.proj = new pixi_projection.Projection2d(_this.transform);
            _this.pluginName = 'batch2d';
            return _this;
        }
        Object.defineProperty(Text2d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        return Text2d;
    }(PIXI.Text));
    pixi_projection.Text2d = Text2d;
    Text2d.prototype.calculateVertices = pixi_projection.Sprite2d.prototype.calculateVertices;
    Text2d.prototype.calculateTrimmedVertices = pixi_projection.Sprite2d.prototype.calculateTrimmedVertices;
    Text2d.prototype._calculateBounds = pixi_projection.Sprite2d.prototype._calculateBounds;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    function convertTo2d() {
        if (this.proj)
            return;
        this.proj = new pixi_projection.Projection2d(this.transform);
        this.toLocal = pixi_projection.Container2d.prototype.toLocal;
        Object.defineProperty(this, "worldTransform", {
            get: pixi_projection.container2dWorldTransform,
            enumerable: true,
            configurable: true
        });
    }
    PIXI.Container.prototype.convertTo2d = convertTo2d;
    PIXI.Sprite.prototype.convertTo2d = function () {
        if (this.proj)
            return;
        this.calculateVertices = pixi_projection.Sprite2d.prototype.calculateVertices;
        this.calculateTrimmedVertices = pixi_projection.Sprite2d.prototype.calculateTrimmedVertices;
        this._calculateBounds = pixi_projection.Sprite2d.prototype._calculateBounds;
        this.pluginName = 'batch2d';
        convertTo2d.call(this);
    };
    PIXI.Container.prototype.convertSubtreeTo2d = function () {
        this.convertTo2d();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeTo2d();
        }
    };
    if (PIXI.SimpleMesh) {
        PIXI.SimpleMesh.prototype.convertTo2d =
            PIXI.SimpleRope.prototype.convertTo2d =
                function () {
                    if (this.proj)
                        return;
                    this.calculateVertices = pixi_projection.Mesh2d.prototype.calculateVertices;
                    this._renderDefault = pixi_projection.Mesh2d.prototype._renderDefault;
                    if (this.material.pluginName !== 'batch2d') {
                        this.material = new PIXI.MeshMaterial(this.material.texture, {
                            program: PIXI.Program.from(pixi_projection.Mesh2d.defaultVertexShader, pixi_projection.Mesh2d.defaultFragmentShader),
                            pluginName: 'batch2d'
                        });
                    }
                    convertTo2d.call(this);
                };
    }
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var tempTransform = new PIXI.Transform();
    var TilingSprite2d = (function (_super) {
        __extends(TilingSprite2d, _super);
        function TilingSprite2d(texture, width, height) {
            var _this = _super.call(this, texture, width, height) || this;
            _this.tileProj = new pixi_projection.Projection2d(_this.tileTransform);
            _this.tileProj.reverseLocalOrder = true;
            _this.proj = new pixi_projection.Projection2d(_this.transform);
            _this.pluginName = 'tilingSprite2d';
            _this.uvRespectAnchor = true;
            return _this;
        }
        Object.defineProperty(TilingSprite2d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        TilingSprite2d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            return pixi_projection.container2dToLocal.call(this, position, from, point, skipUpdate, step);
        };
        TilingSprite2d.prototype._render = function (renderer) {
            var texture = this._texture;
            if (!texture || !texture.valid) {
                return;
            }
            this.tileTransform.updateTransform(tempTransform);
            this.uvMatrix.update();
            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);
        };
        return TilingSprite2d;
    }(PIXI.TilingSprite));
    pixi_projection.TilingSprite2d = TilingSprite2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var shaderVert = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec3 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);\n\n    vTextureCoord = uTransform * vec3(aTextureCoord, 1.0);\n}\n";
    var shaderFrag = "\nvarying vec3 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;\n\nvoid main(void)\n{\n    vec2 coord = mod(vTextureCoord.xy / vTextureCoord.z - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\n\n    vec4 sample = texture2D(uSampler, coord);\n    gl_FragColor = sample * uColor;\n}\n";
    var shaderSimpleFrag = "\n\tvarying vec3 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\n\nvoid main(void)\n{\n    vec4 sample = texture2D(uSampler, vTextureCoord.xy / vTextureCoord.z);\n    gl_FragColor = sample * uColor;\n}\n";
    var tempMat = new pixi_projection.Matrix2d();
    var WRAP_MODES = PIXI.WRAP_MODES;
    var utils = PIXI.utils;
    var TilingSprite2dRenderer = (function (_super) {
        __extends(TilingSprite2dRenderer, _super);
        function TilingSprite2dRenderer(renderer) {
            var _this = _super.call(this, renderer) || this;
            _this.quad = new PIXI.QuadUv();
            var uniforms = { globals: _this.renderer.globalUniforms };
            _this.shader = PIXI.Shader.from(shaderVert, shaderFrag, uniforms);
            _this.simpleShader = PIXI.Shader.from(shaderVert, shaderSimpleFrag, uniforms);
            return _this;
        }
        TilingSprite2dRenderer.prototype.render = function (ts) {
            var renderer = this.renderer;
            var quad = this.quad;
            var vertices = quad.vertices;
            vertices[0] = vertices[6] = (ts._width) * -ts.anchor.x;
            vertices[1] = vertices[3] = ts._height * -ts.anchor.y;
            vertices[2] = vertices[4] = (ts._width) * (1.0 - ts.anchor.x);
            vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);
            if (ts.uvRespectAnchor) {
                vertices = quad.uvs;
                vertices[0] = vertices[6] = -ts.anchor.x;
                vertices[1] = vertices[3] = -ts.anchor.y;
                vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
                vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
            }
            quad.invalidate();
            var tex = ts._texture;
            var baseTex = tex.baseTexture;
            var lt = ts.tileProj.world;
            var uv = ts.uvMatrix;
            var isSimple = baseTex.isPowerOfTwo
                && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;
            if (isSimple) {
                if (!baseTex._glTextures[renderer.CONTEXT_UID]) {
                    if (baseTex.wrapMode === WRAP_MODES.CLAMP) {
                        baseTex.wrapMode = WRAP_MODES.REPEAT;
                    }
                }
                else {
                    isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
                }
            }
            var shader = isSimple ? this.simpleShader : this.shader;
            tempMat.identity();
            tempMat.scale(tex.width, tex.height);
            tempMat.prepend(lt);
            tempMat.scale(1.0 / ts._width, 1.0 / ts._height);
            tempMat.invert();
            if (isSimple) {
                tempMat.prepend(uv.mapCoord);
            }
            else {
                shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
                shader.uniforms.uClampFrame = uv.uClampFrame;
                shader.uniforms.uClampOffset = uv.uClampOffset;
            }
            shader.uniforms.uTransform = tempMat.toArray(true);
            shader.uniforms.uColor = utils.premultiplyTintToRgba(ts.tint, ts.worldAlpha, shader.uniforms.uColor, baseTex.premultiplyAlpha);
            shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
            shader.uniforms.uSampler = tex;
            renderer.shader.bind(shader, false);
            renderer.geometry.bind(quad, undefined);
            renderer.state.setBlendMode(utils.correctBlendMode(ts.blendMode, baseTex.premultiplyAlpha));
            renderer.geometry.draw(PIXI.DRAW_MODES.TRIANGLES, 6, 0);
        };
        return TilingSprite2dRenderer;
    }(PIXI.ObjectRenderer));
    pixi_projection.TilingSprite2dRenderer = TilingSprite2dRenderer;
    PIXI.Renderer.registerPlugin('tilingSprite2d', TilingSprite2dRenderer);
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    PIXI.systems.MaskSystem.prototype.pushSpriteMask = function (maskData) {
        var maskObject = maskData.maskObject;
        var target = maskData._target;
        var alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];
        if (!alphaMaskFilter) {
            alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new pixi_projection.SpriteMaskFilter2d(maskObject)];
        }
        alphaMaskFilter[0].resolution = this.renderer.resolution;
        alphaMaskFilter[0].maskSprite = maskObject;
        var stashFilterArea = target.filterArea;
        target.filterArea = maskObject.getBounds(true);
        this.renderer.filter.push(target, alphaMaskFilter);
        target.filterArea = stashFilterArea;
        this.alphaMaskIndex++;
    };
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var spriteMaskVert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec3 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n\tgl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n\tvTextureCoord = aTextureCoord;\n\tvMaskCoord = otherMatrix * vec3( aTextureCoord, 1.0);\n}\n";
    var spriteMaskFrag = "\nvarying vec3 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform sampler2D mask;\nuniform float alpha;\nuniform vec4 maskClamp;\n\nvoid main(void)\n{\n    vec2 uv = vMaskCoord.xy / vMaskCoord.z;\n\n    float clip = step(3.5,\n        step(maskClamp.x, uv.x) +\n        step(maskClamp.y, uv.y) +\n        step(uv.x, maskClamp.z) +\n        step(uv.y, maskClamp.w));\n\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, uv);\n\n    original *= (masky.r * masky.a * alpha * clip);\n\n    gl_FragColor = original;\n}\n";
    var tempMat = new pixi_projection.Matrix2d();
    var SpriteMaskFilter2d = (function (_super) {
        __extends(SpriteMaskFilter2d, _super);
        function SpriteMaskFilter2d(sprite) {
            var _this = _super.call(this, spriteMaskVert, spriteMaskFrag) || this;
            _this.maskMatrix = new pixi_projection.Matrix2d();
            sprite.renderable = false;
            _this.maskSprite = sprite;
            return _this;
        }
        SpriteMaskFilter2d.prototype.apply = function (filterManager, input, output, clearMode) {
            var maskSprite = this.maskSprite;
            var tex = this.maskSprite.texture;
            if (!tex.valid) {
                return;
            }
            if (!tex.uvMatrix) {
                tex.uvMatrix = new PIXI.TextureMatrix(tex, 0.0);
            }
            tex.uvMatrix.update();
            this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0.0 : 1.0;
            this.uniforms.mask = maskSprite.texture;
            this.uniforms.otherMatrix = SpriteMaskFilter2d.calculateSpriteMatrix(input, this.maskMatrix, maskSprite)
                .prepend(tex.uvMatrix.mapCoord);
            this.uniforms.alpha = maskSprite.worldAlpha;
            this.uniforms.maskClamp = tex.uvMatrix.uClampFrame;
            filterManager.applyFilter(this, input, output, clearMode);
        };
        SpriteMaskFilter2d.calculateSpriteMatrix = function (input, mappedMatrix, sprite) {
            var proj = sprite.proj;
            var filterArea = input.filterFrame;
            var worldTransform = proj && !proj._affine ? proj.world.copyTo2dOr3d(tempMat) : tempMat.copyFrom(sprite.transform.worldTransform);
            var texture = sprite.texture.orig;
            mappedMatrix.set(input.width, 0, 0, input.height, filterArea.x, filterArea.y);
            worldTransform.invert();
            mappedMatrix.setToMult(worldTransform, mappedMatrix);
            mappedMatrix.scaleAndTranslate(1.0 / texture.width, 1.0 / texture.height, sprite.anchor.x, sprite.anchor.y);
            return mappedMatrix;
        };
        return SpriteMaskFilter2d;
    }(PIXI.Filter));
    pixi_projection.SpriteMaskFilter2d = SpriteMaskFilter2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    function container3dWorldTransform() {
        return this.proj.affine ? this.transform.worldTransform : this.proj.world;
    }
    pixi_projection.container3dWorldTransform = container3dWorldTransform;
    var Container3d = (function (_super) {
        __extends(Container3d, _super);
        function Container3d() {
            var _this = _super.call(this) || this;
            _this.proj = new pixi_projection.Projection3d(_this.transform);
            return _this;
        }
        Container3d.prototype.isFrontFace = function (forceUpdate) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            if (forceUpdate) {
                this._recursivePostUpdateTransform();
                this.displayObjectUpdateTransform();
            }
            var mat = this.proj.world.mat4;
            var dx1 = mat[0] * mat[15] - mat[3] * mat[12];
            var dy1 = mat[1] * mat[15] - mat[3] * mat[13];
            var dx2 = mat[4] * mat[15] - mat[7] * mat[12];
            var dy2 = mat[5] * mat[15] - mat[7] * mat[13];
            return dx1 * dy2 - dx2 * dy1 > 0;
        };
        Container3d.prototype.getDepth = function (forceUpdate) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            if (forceUpdate) {
                this._recursivePostUpdateTransform();
                this.displayObjectUpdateTransform();
            }
            var mat4 = this.proj.world.mat4;
            return mat4[14] / mat4[15];
        };
        Container3d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            if (from) {
                position = from.toGlobal(position, point, skipUpdate);
            }
            if (!skipUpdate) {
                this._recursivePostUpdateTransform();
            }
            if (step === pixi_projection.TRANSFORM_STEP.ALL) {
                if (!skipUpdate) {
                    this.displayObjectUpdateTransform();
                }
                if (this.proj.affine) {
                    return this.transform.worldTransform.applyInverse(position, point);
                }
                return this.proj.world.applyInverse(position, point);
            }
            if (this.parent) {
                point = this.parent.worldTransform.applyInverse(position, point);
            }
            else {
                point.copyFrom(position);
            }
            if (step === pixi_projection.TRANSFORM_STEP.NONE) {
                return point;
            }
            point = this.transform.localTransform.applyInverse(point, point);
            if (step === pixi_projection.TRANSFORM_STEP.PROJ && this.proj.cameraMode) {
                point = this.proj.cameraMatrix.applyInverse(point, point);
            }
            return point;
        };
        Object.defineProperty(Container3d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Container3d.prototype, "position3d", {
            get: function () {
                return this.proj.position;
            },
            set: function (value) {
                this.proj.position.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Container3d.prototype, "scale3d", {
            get: function () {
                return this.proj.scale;
            },
            set: function (value) {
                this.proj.scale.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Container3d.prototype, "euler", {
            get: function () {
                return this.proj.euler;
            },
            set: function (value) {
                this.proj.euler.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Container3d.prototype, "pivot3d", {
            get: function () {
                return this.proj.pivot;
            },
            set: function (value) {
                this.proj.pivot.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        return Container3d;
    }(PIXI.Container));
    pixi_projection.Container3d = Container3d;
    pixi_projection.container3dToLocal = Container3d.prototype.toLocal;
    pixi_projection.container3dGetDepth = Container3d.prototype.getDepth;
    pixi_projection.container3dIsFrontFace = Container3d.prototype.isFrontFace;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Camera3d = (function (_super) {
        __extends(Camera3d, _super);
        function Camera3d() {
            var _this = _super.call(this) || this;
            _this._far = 0;
            _this._near = 0;
            _this._focus = 0;
            _this._orthographic = false;
            _this.proj.cameraMode = true;
            _this.setPlanes(400, 10, 10000, false);
            return _this;
        }
        Object.defineProperty(Camera3d.prototype, "far", {
            get: function () {
                return this._far;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera3d.prototype, "near", {
            get: function () {
                return this._near;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera3d.prototype, "focus", {
            get: function () {
                return this._focus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera3d.prototype, "ortographic", {
            get: function () {
                return this._orthographic;
            },
            enumerable: true,
            configurable: true
        });
        Camera3d.prototype.setPlanes = function (focus, near, far, orthographic) {
            if (near === void 0) { near = 10; }
            if (far === void 0) { far = 10000; }
            if (orthographic === void 0) { orthographic = false; }
            this._focus = focus;
            this._near = near;
            this._far = far;
            this._orthographic = orthographic;
            var proj = this.proj;
            var mat4 = proj.cameraMatrix.mat4;
            proj._projID++;
            mat4[10] = 1.0 / (far - near);
            mat4[14] = (focus - near) / (far - near);
            if (this._orthographic) {
                mat4[11] = 0;
            }
            else {
                mat4[11] = 1.0 / focus;
            }
        };
        return Camera3d;
    }(pixi_projection.Container3d));
    pixi_projection.Camera3d = Camera3d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Euler = (function () {
        function Euler(x, y, z) {
            this._quatUpdateId = -1;
            this._quatDirtyId = 0;
            this._sign = 1;
            this._x = x || 0;
            this._y = y || 0;
            this._z = z || 0;
            this.quaternion = new Float64Array(4);
            this.quaternion[3] = 1;
            this.update();
        }
        Object.defineProperty(Euler.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                if (this._x !== value) {
                    this._x = value;
                    this._quatDirtyId++;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Euler.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                if (this._y !== value) {
                    this._y = value;
                    this._quatDirtyId++;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Euler.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                if (this._z !== value) {
                    this._z = value;
                    this._quatDirtyId++;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Euler.prototype, "pitch", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                if (this._x !== value) {
                    this._x = value;
                    this._quatDirtyId++;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Euler.prototype, "yaw", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                if (this._y !== value) {
                    this._y = value;
                    this._quatDirtyId++;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Euler.prototype, "roll", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                if (this._z !== value) {
                    this._z = value;
                    this._quatDirtyId++;
                }
            },
            enumerable: true,
            configurable: true
        });
        Euler.prototype.set = function (x, y, z) {
            var _x = x || 0;
            var _y = y || 0;
            var _z = z || 0;
            if (this._x !== _x || this._y !== _y || this._z !== _z) {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
            }
        };
        ;
        Euler.prototype.copyFrom = function (euler) {
            var _x = euler.x;
            var _y = euler.y;
            var _z = euler.z;
            if (this._x !== _x || this._y !== _y || this._z !== _z) {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
            }
        };
        Euler.prototype.copyTo = function (p) {
            p.set(this._x, this._y, this._z);
            return p;
        };
        Euler.prototype.equals = function (euler) {
            return this._x === euler.x
                && this._y === euler.y
                && this._z === euler.z;
        };
        Euler.prototype.clone = function () {
            return new Euler(this._x, this._y, this._z);
        };
        Euler.prototype.update = function () {
            if (this._quatUpdateId === this._quatDirtyId) {
                return false;
            }
            this._quatUpdateId = this._quatDirtyId;
            var c1 = Math.cos(this._x / 2);
            var c2 = Math.cos(this._y / 2);
            var c3 = Math.cos(this._z / 2);
            var s = this._sign;
            var s1 = s * Math.sin(this._x / 2);
            var s2 = s * Math.sin(this._y / 2);
            var s3 = s * Math.sin(this._z / 2);
            var q = this.quaternion;
            q[0] = s1 * c2 * c3 + c1 * s2 * s3;
            q[1] = c1 * s2 * c3 - s1 * c2 * s3;
            q[2] = c1 * c2 * s3 + s1 * s2 * c3;
            q[3] = c1 * c2 * c3 - s1 * s2 * s3;
            return true;
        };
        return Euler;
    }());
    pixi_projection.Euler = Euler;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var mat4id = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
    var Matrix3d = (function () {
        function Matrix3d(backingArray) {
            this.floatArray = null;
            this._dirtyId = 0;
            this._updateId = -1;
            this._mat4inv = null;
            this.cacheInverse = false;
            this.mat4 = new Float64Array(backingArray || mat4id);
        }
        Object.defineProperty(Matrix3d.prototype, "a", {
            get: function () {
                return this.mat4[0] / this.mat4[15];
            },
            set: function (value) {
                this.mat4[0] = value * this.mat4[15];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3d.prototype, "b", {
            get: function () {
                return this.mat4[1] / this.mat4[15];
            },
            set: function (value) {
                this.mat4[1] = value * this.mat4[15];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3d.prototype, "c", {
            get: function () {
                return this.mat4[4] / this.mat4[15];
            },
            set: function (value) {
                this.mat4[4] = value * this.mat4[15];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3d.prototype, "d", {
            get: function () {
                return this.mat4[5] / this.mat4[15];
            },
            set: function (value) {
                this.mat4[5] = value * this.mat4[15];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3d.prototype, "tx", {
            get: function () {
                return this.mat4[12] / this.mat4[15];
            },
            set: function (value) {
                this.mat4[12] = value * this.mat4[15];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3d.prototype, "ty", {
            get: function () {
                return this.mat4[13] / this.mat4[15];
            },
            set: function (value) {
                this.mat4[13] = value * this.mat4[15];
            },
            enumerable: true,
            configurable: true
        });
        Matrix3d.prototype.set = function (a, b, c, d, tx, ty) {
            var mat4 = this.mat4;
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
        };
        Matrix3d.prototype.toArray = function (transpose, out) {
            if (!this.floatArray) {
                this.floatArray = new Float32Array(9);
            }
            var array = out || this.floatArray;
            var mat3 = this.mat4;
            if (transpose) {
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
            else {
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
        };
        Matrix3d.prototype.setToTranslation = function (tx, ty, tz) {
            var mat4 = this.mat4;
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
        };
        Matrix3d.prototype.setToRotationTranslationScale = function (quat, tx, ty, tz, sx, sy, sz) {
            var out = this.mat4;
            var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
            var x2 = x + x;
            var y2 = y + y;
            var z2 = z + z;
            var xx = x * x2;
            var xy = x * y2;
            var xz = x * z2;
            var yy = y * y2;
            var yz = y * z2;
            var zz = z * z2;
            var wx = w * x2;
            var wy = w * y2;
            var wz = w * z2;
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
        };
        Matrix3d.prototype.apply = function (pos, newPos) {
            newPos = newPos || new pixi_projection.Point3d();
            var mat4 = this.mat4;
            var x = pos.x;
            var y = pos.y;
            var z = pos.z || 0;
            var w = 1.0 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);
            newPos.x = w * (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]);
            newPos.y = w * (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]);
            newPos.z = w * (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]);
            return newPos;
        };
        Matrix3d.prototype.translate = function (tx, ty, tz) {
            var a = this.mat4;
            a[12] = a[0] * tx + a[4] * ty + a[8] * tz + a[12];
            a[13] = a[1] * tx + a[5] * ty + a[9] * tz + a[13];
            a[14] = a[2] * tx + a[6] * ty + a[10] * tz + a[14];
            a[15] = a[3] * tx + a[7] * ty + a[11] * tz + a[15];
            return this;
        };
        Matrix3d.prototype.scale = function (x, y, z) {
            var mat4 = this.mat4;
            mat4[0] *= x;
            mat4[1] *= x;
            mat4[2] *= x;
            mat4[3] *= x;
            mat4[4] *= y;
            mat4[5] *= y;
            mat4[6] *= y;
            mat4[7] *= y;
            if (z !== undefined) {
                mat4[8] *= z;
                mat4[9] *= z;
                mat4[10] *= z;
                mat4[11] *= z;
            }
            return this;
        };
        Matrix3d.prototype.scaleAndTranslate = function (scaleX, scaleY, scaleZ, tx, ty, tz) {
            var mat4 = this.mat4;
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
        };
        Matrix3d.prototype.applyInverse = function (pos, newPos) {
            newPos = newPos || new pixi_projection.Point3d();
            if (!this._mat4inv) {
                this._mat4inv = new Float64Array(16);
            }
            var mat4 = this._mat4inv;
            var a = this.mat4;
            var x = pos.x;
            var y = pos.y;
            var z = pos.z || 0;
            if (!this.cacheInverse || this._updateId !== this._dirtyId) {
                this._updateId = this._dirtyId;
                Matrix3d.glMatrixMat4Invert(mat4, a);
            }
            var w1 = 1.0 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);
            var x1 = w1 * (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]);
            var y1 = w1 * (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]);
            var z1 = w1 * (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]);
            z += 1.0;
            var w2 = 1.0 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);
            var x2 = w2 * (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]);
            var y2 = w2 * (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]);
            var z2 = w2 * (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]);
            if (Math.abs(z1 - z2) < 1e-10) {
                newPos.set(NaN, NaN, 0);
            }
            var alpha = (0 - z1) / (z2 - z1);
            newPos.set((x2 - x1) * alpha + x1, (y2 - y1) * alpha + y1, 0.0);
            return newPos;
        };
        Matrix3d.prototype.invert = function () {
            Matrix3d.glMatrixMat4Invert(this.mat4, this.mat4);
            return this;
        };
        Matrix3d.prototype.invertCopyTo = function (matrix) {
            if (!this._mat4inv) {
                this._mat4inv = new Float64Array(16);
            }
            var mat4 = this._mat4inv;
            var a = this.mat4;
            if (!this.cacheInverse || this._updateId !== this._dirtyId) {
                this._updateId = this._dirtyId;
                Matrix3d.glMatrixMat4Invert(mat4, a);
            }
            matrix.mat4.set(mat4);
        };
        Matrix3d.prototype.identity = function () {
            var mat3 = this.mat4;
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
        };
        Matrix3d.prototype.clone = function () {
            return new Matrix3d(this.mat4);
        };
        Matrix3d.prototype.copyTo3d = function (matrix) {
            var mat3 = this.mat4;
            var ar2 = matrix.mat4;
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
        };
        Matrix3d.prototype.copyTo2d = function (matrix) {
            var mat3 = this.mat4;
            var ar2 = matrix.mat3;
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
        };
        Matrix3d.prototype.copyTo2dOr3d = function (matrix) {
            if (matrix instanceof pixi_projection.Matrix2d) {
                return this.copyTo2d(matrix);
            }
            else {
                return this.copyTo3d(matrix);
            }
        };
        Matrix3d.prototype.copyTo = function (matrix, affine, preserveOrientation) {
            var mat3 = this.mat4;
            var d = 1.0 / mat3[15];
            var tx = mat3[12] * d, ty = mat3[13] * d;
            matrix.a = (mat3[0] - mat3[3] * tx) * d;
            matrix.b = (mat3[1] - mat3[3] * ty) * d;
            matrix.c = (mat3[4] - mat3[7] * tx) * d;
            matrix.d = (mat3[5] - mat3[7] * ty) * d;
            matrix.tx = tx;
            matrix.ty = ty;
            if (affine >= 2) {
                var D = matrix.a * matrix.d - matrix.b * matrix.c;
                if (!preserveOrientation) {
                    D = Math.abs(D);
                }
                if (affine === pixi_projection.AFFINE.POINT) {
                    if (D > 0) {
                        D = 1;
                    }
                    else
                        D = -1;
                    matrix.a = D;
                    matrix.b = 0;
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === pixi_projection.AFFINE.AXIS_X) {
                    D /= Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d);
                    matrix.c = 0;
                    matrix.d = D;
                }
                else if (affine === pixi_projection.AFFINE.AXIS_Y) {
                    D /= Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c);
                    matrix.a = D;
                    matrix.c = 0;
                }
            }
            return matrix;
        };
        Matrix3d.prototype.copyFrom = function (matrix) {
            var mat3 = this.mat4;
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
        };
        Matrix3d.prototype.setToMultLegacy = function (pt, lt) {
            var out = this.mat4;
            var b = lt.mat4;
            var a00 = pt.a, a01 = pt.b, a10 = pt.c, a11 = pt.d, a30 = pt.tx, a31 = pt.ty;
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
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
        };
        Matrix3d.prototype.setToMultLegacy2 = function (pt, lt) {
            var out = this.mat4;
            var a = pt.mat4;
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            var b00 = lt.a, b01 = lt.b, b10 = lt.c, b11 = lt.d, b30 = lt.tx, b31 = lt.ty;
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
        };
        Matrix3d.prototype.setToMult = function (pt, lt) {
            Matrix3d.glMatrixMat4Multiply(this.mat4, pt.mat4, lt.mat4);
            this._dirtyId++;
            return this;
        };
        Matrix3d.prototype.prepend = function (lt) {
            if (lt.mat4) {
                this.setToMult(lt, this);
            }
            else {
                this.setToMultLegacy(lt, this);
            }
        };
        Matrix3d.glMatrixMat4Invert = function (out, a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
            var b00 = a00 * a11 - a01 * a10;
            var b01 = a00 * a12 - a02 * a10;
            var b02 = a00 * a13 - a03 * a10;
            var b03 = a01 * a12 - a02 * a11;
            var b04 = a01 * a13 - a03 * a11;
            var b05 = a02 * a13 - a03 * a12;
            var b06 = a20 * a31 - a21 * a30;
            var b07 = a20 * a32 - a22 * a30;
            var b08 = a20 * a33 - a23 * a30;
            var b09 = a21 * a32 - a22 * a31;
            var b10 = a21 * a33 - a23 * a31;
            var b11 = a22 * a33 - a23 * a32;
            var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det) {
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
        };
        Matrix3d.glMatrixMat4Multiply = function (out, a, b) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
            var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
            var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
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
        };
        Matrix3d.IDENTITY = new Matrix3d();
        Matrix3d.TEMP_MATRIX = new Matrix3d();
        return Matrix3d;
    }());
    pixi_projection.Matrix3d = Matrix3d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var ObservableEuler = (function () {
        function ObservableEuler(cb, scope, x, y, z) {
            this.cb = cb;
            this.scope = scope;
            this._quatUpdateId = -1;
            this._quatDirtyId = 0;
            this._sign = 1;
            this._x = x || 0;
            this._y = y || 0;
            this._z = z || 0;
            this.quaternion = new Float64Array(4);
            this.quaternion[3] = 1;
            this.update();
        }
        Object.defineProperty(ObservableEuler.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                if (this._x !== value) {
                    this._x = value;
                    this._quatDirtyId++;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObservableEuler.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                if (this._y !== value) {
                    this._y = value;
                    this._quatDirtyId++;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObservableEuler.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                if (this._z !== value) {
                    this._z = value;
                    this._quatDirtyId++;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObservableEuler.prototype, "pitch", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                if (this._x !== value) {
                    this._x = value;
                    this._quatDirtyId++;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObservableEuler.prototype, "yaw", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                if (this._y !== value) {
                    this._y = value;
                    this._quatDirtyId++;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ObservableEuler.prototype, "roll", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                if (this._z !== value) {
                    this._z = value;
                    this._quatDirtyId++;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        ObservableEuler.prototype.set = function (x, y, z) {
            var _x = x || 0;
            var _y = y || 0;
            var _z = z || 0;
            if (this._x !== _x || this._y !== _y || this._z !== _z) {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        };
        ;
        ObservableEuler.prototype.copyFrom = function (euler) {
            var _x = euler.x;
            var _y = euler.y;
            var _z = euler.z;
            if (this._x !== _x || this._y !== _y || this._z !== _z) {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this._quatDirtyId++;
                this.cb.call(this.scope);
            }
        };
        ObservableEuler.prototype.copyTo = function (p) {
            p.set(this._x, this._y, this._z);
            return p;
        };
        ObservableEuler.prototype.equals = function (euler) {
            return this._x === euler.x
                && this._y === euler.y
                && this._z === euler.z;
        };
        ObservableEuler.prototype.clone = function () {
            return new pixi_projection.Euler(this._x, this._y, this._z);
        };
        ObservableEuler.prototype.update = function () {
            if (this._quatUpdateId === this._quatDirtyId) {
                return false;
            }
            this._quatUpdateId = this._quatDirtyId;
            var c1 = Math.cos(this._x / 2);
            var c2 = Math.cos(this._y / 2);
            var c3 = Math.cos(this._z / 2);
            var s = this._sign;
            var s1 = s * Math.sin(this._x / 2);
            var s2 = s * Math.sin(this._y / 2);
            var s3 = s * Math.sin(this._z / 2);
            var q = this.quaternion;
            q[0] = s1 * c2 * c3 + c1 * s2 * s3;
            q[1] = c1 * s2 * c3 - s1 * c2 * s3;
            q[2] = c1 * c2 * s3 + s1 * s2 * c3;
            q[3] = c1 * c2 * c3 - s1 * s2 * s3;
            return true;
        };
        return ObservableEuler;
    }());
    pixi_projection.ObservableEuler = ObservableEuler;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Point3d = (function (_super) {
        __extends(Point3d, _super);
        function Point3d(x, y, z) {
            var _this = _super.call(this, x, y) || this;
            _this.z = z;
            return _this;
        }
        Point3d.prototype.set = function (x, y, z) {
            this.x = x || 0;
            this.y = (y === undefined) ? this.x : (y || 0);
            this.z = (y === undefined) ? this.x : (z || 0);
            return this;
        };
        Point3d.prototype.copyFrom = function (p) {
            this.set(p.x, p.y, p.z || 0);
            return this;
        };
        Point3d.prototype.copyTo = function (p) {
            p.set(this.x, this.y, this.z);
            return p;
        };
        return Point3d;
    }(PIXI.Point));
    pixi_projection.Point3d = Point3d;
    var ObservablePoint3d = (function (_super) {
        __extends(ObservablePoint3d, _super);
        function ObservablePoint3d() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._z = 0;
            return _this;
        }
        Object.defineProperty(ObservablePoint3d.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                if (this._z !== value) {
                    this._z = value;
                    this.cb.call(this.scope);
                }
            },
            enumerable: true,
            configurable: true
        });
        ObservablePoint3d.prototype.set = function (x, y, z) {
            var _x = x || 0;
            var _y = (y === undefined) ? _x : (y || 0);
            var _z = (y === undefined) ? _x : (z || 0);
            if (this._x !== _x || this._y !== _y || this._z !== _z) {
                this._x = _x;
                this._y = _y;
                this._z = _z;
                this.cb.call(this.scope);
            }
            return this;
        };
        ObservablePoint3d.prototype.copyFrom = function (p) {
            this.set(p.x, p.y, p.z || 0);
            return this;
        };
        ObservablePoint3d.prototype.copyTo = function (p) {
            p.set(this._x, this._y, this._z);
            return p;
        };
        return ObservablePoint3d;
    }(PIXI.ObservablePoint));
    pixi_projection.ObservablePoint3d = ObservablePoint3d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var tempMat = new pixi_projection.Matrix3d();
    var Projection3d = (function (_super) {
        __extends(Projection3d, _super);
        function Projection3d(legacy, enable) {
            var _this = _super.call(this, legacy, enable) || this;
            _this.cameraMatrix = null;
            _this._cameraMode = false;
            _this.position = new pixi_projection.ObservablePoint3d(_this.onChange, _this, 0, 0);
            _this.scale = new pixi_projection.ObservablePoint3d(_this.onChange, _this, 1, 1);
            _this.euler = new pixi_projection.ObservableEuler(_this.onChange, _this, 0, 0, 0);
            _this.pivot = new pixi_projection.ObservablePoint3d(_this.onChange, _this, 0, 0);
            _this.local = new pixi_projection.Matrix3d();
            _this.world = new pixi_projection.Matrix3d();
            _this.local.cacheInverse = true;
            _this.world.cacheInverse = true;
            _this.position._z = 0;
            _this.scale._z = 1;
            _this.pivot._z = 0;
            return _this;
        }
        Object.defineProperty(Projection3d.prototype, "cameraMode", {
            get: function () {
                return this._cameraMode;
            },
            set: function (value) {
                if (this._cameraMode === value) {
                    return;
                }
                this._cameraMode = value;
                this.euler._sign = this._cameraMode ? -1 : 1;
                this.euler._quatDirtyId++;
                if (value) {
                    this.cameraMatrix = new pixi_projection.Matrix3d();
                }
            },
            enumerable: true,
            configurable: true
        });
        Projection3d.prototype.onChange = function () {
            this._projID++;
        };
        Projection3d.prototype.clear = function () {
            if (this.cameraMatrix) {
                this.cameraMatrix.identity();
            }
            this.position.set(0, 0, 0);
            this.scale.set(1, 1, 1);
            this.euler.set(0, 0, 0);
            this.pivot.set(0, 0, 0);
            _super.prototype.clear.call(this);
        };
        Projection3d.prototype.updateLocalTransform = function (lt) {
            if (this._projID === 0) {
                this.local.copyFrom(lt);
                return;
            }
            var matrix = this.local;
            var euler = this.euler;
            var pos = this.position;
            var scale = this.scale;
            var pivot = this.pivot;
            euler.update();
            if (!this.cameraMode) {
                matrix.setToRotationTranslationScale(euler.quaternion, pos._x, pos._y, pos._z, scale._x, scale._y, scale._z);
                matrix.translate(-pivot._x, -pivot._y, -pivot._z);
                matrix.setToMultLegacy(lt, matrix);
                return;
            }
            matrix.setToMultLegacy(lt, this.cameraMatrix);
            matrix.translate(pivot._x, pivot._y, pivot._z);
            matrix.scale(1.0 / scale._x, 1.0 / scale._y, 1.0 / scale._z);
            tempMat.setToRotationTranslationScale(euler.quaternion, 0, 0, 0, 1, 1, 1);
            matrix.setToMult(matrix, tempMat);
            matrix.translate(-pos._x, -pos._y, -pos._z);
            this.local._dirtyId++;
        };
        return Projection3d;
    }(pixi_projection.LinearProjection));
    pixi_projection.Projection3d = Projection3d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Mesh3d2d = (function (_super) {
        __extends(Mesh3d2d, _super);
        function Mesh3d2d(geometry, shader, state, drawMode) {
            var _this = _super.call(this, geometry, shader, state, drawMode) || this;
            _this.vertexData2d = null;
            _this.proj = new pixi_projection.Projection3d(_this.transform);
            return _this;
        }
        Mesh3d2d.prototype.calculateVertices = function () {
            if (this.proj._affine) {
                this.vertexData2d = null;
                _super.prototype.calculateVertices.call(this);
                return;
            }
            var geometry = this.geometry;
            var vertices = geometry.buffers[0].data;
            var thisAny = this;
            if (geometry.vertexDirtyId === thisAny.vertexDirty && thisAny._transformID === thisAny.transform._worldID) {
                return;
            }
            thisAny._transformID = thisAny.transform._worldID;
            if (thisAny.vertexData.length !== vertices.length) {
                thisAny.vertexData = new Float32Array(vertices.length);
            }
            if (this.vertexData2d.length !== vertices.length * 3 / 2) {
                this.vertexData2d = new Float32Array(vertices.length * 3);
            }
            var wt = this.proj.world.mat4;
            var vertexData2d = this.vertexData2d;
            var vertexData = thisAny.vertexData;
            for (var i = 0; i < vertexData.length / 2; i++) {
                var x = vertices[(i * 2)];
                var y = vertices[(i * 2) + 1];
                var xx = (wt[0] * x) + (wt[4] * y) + wt[12];
                var yy = (wt[1] * x) + (wt[5] * y) + wt[13];
                var ww = (wt[3] * x) + (wt[7] * y) + wt[15];
                vertexData2d[i * 3] = xx;
                vertexData2d[i * 3 + 1] = yy;
                vertexData2d[i * 3 + 2] = ww;
                vertexData[(i * 2)] = xx / ww;
                vertexData[(i * 2) + 1] = yy / ww;
            }
            thisAny.vertexDirty = geometry.vertexDirtyId;
        };
        Object.defineProperty(Mesh3d2d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        Mesh3d2d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            return pixi_projection.container3dToLocal.call(this, position, from, point, skipUpdate, step);
        };
        Mesh3d2d.prototype.isFrontFace = function (forceUpdate) {
            return pixi_projection.container3dIsFrontFace.call(this, forceUpdate);
        };
        Mesh3d2d.prototype.getDepth = function (forceUpdate) {
            return pixi_projection.container3dGetDepth.call(this, forceUpdate);
        };
        Object.defineProperty(Mesh3d2d.prototype, "position3d", {
            get: function () {
                return this.proj.position;
            },
            set: function (value) {
                this.proj.position.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Mesh3d2d.prototype, "scale3d", {
            get: function () {
                return this.proj.scale;
            },
            set: function (value) {
                this.proj.scale.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Mesh3d2d.prototype, "euler", {
            get: function () {
                return this.proj.euler;
            },
            set: function (value) {
                this.proj.euler.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Mesh3d2d.prototype, "pivot3d", {
            get: function () {
                return this.proj.pivot;
            },
            set: function (value) {
                this.proj.pivot.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        return Mesh3d2d;
    }(PIXI.Mesh));
    pixi_projection.Mesh3d2d = Mesh3d2d;
    Mesh3d2d.prototype._renderDefault = pixi_projection.Mesh2d.prototype._renderDefault;
    var SimpleMesh3d2d = (function (_super) {
        __extends(SimpleMesh3d2d, _super);
        function SimpleMesh3d2d(texture, vertices, uvs, indices, drawMode) {
            var _this = _super.call(this, new PIXI.MeshGeometry(vertices, uvs, indices), new PIXI.MeshMaterial(texture, {
                program: PIXI.Program.from(pixi_projection.Mesh2d.defaultVertexShader, pixi_projection.Mesh2d.defaultFragmentShader),
                pluginName: 'batch2d'
            }), null, drawMode) || this;
            _this.autoUpdate = true;
            _this.geometry.getBuffer('aVertexPosition').static = false;
            return _this;
        }
        Object.defineProperty(SimpleMesh3d2d.prototype, "vertices", {
            get: function () {
                return this.geometry.getBuffer('aVertexPosition').data;
            },
            set: function (value) {
                this.geometry.getBuffer('aVertexPosition').data = value;
            },
            enumerable: true,
            configurable: true
        });
        SimpleMesh3d2d.prototype._render = function (renderer) {
            if (this.autoUpdate) {
                this.geometry.getBuffer('aVertexPosition').update();
            }
            _super.prototype._render.call(this, renderer);
        };
        return SimpleMesh3d2d;
    }(Mesh3d2d));
    pixi_projection.SimpleMesh3d2d = SimpleMesh3d2d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Sprite3d = (function (_super) {
        __extends(Sprite3d, _super);
        function Sprite3d(texture) {
            var _this = _super.call(this, texture) || this;
            _this.vertexData2d = null;
            _this.culledByFrustrum = false;
            _this.trimmedCulledByFrustrum = false;
            _this.proj = new pixi_projection.Projection3d(_this.transform);
            _this.pluginName = 'batch2d';
            return _this;
        }
        Sprite3d.prototype.calculateVertices = function () {
            var texture = this._texture;
            if (this.proj._affine) {
                this.vertexData2d = null;
                _super.prototype.calculateVertices.call(this);
                return;
            }
            if (!this.vertexData2d) {
                this.vertexData2d = new Float32Array(12);
            }
            var wid = this.transform._worldID;
            var tuid = texture._updateID;
            if (this._transformID === wid && this._textureID === tuid) {
                return;
            }
            if (this._textureID !== tuid) {
                this.uvs = texture._uvs.uvsFloat32;
            }
            this._transformID = wid;
            this._textureID = tuid;
            var wt = this.proj.world.mat4;
            var vertexData2d = this.vertexData2d;
            var vertexData = this.vertexData;
            var trim = texture.trim;
            var orig = texture.orig;
            var anchor = this._anchor;
            var w0 = 0;
            var w1 = 0;
            var h0 = 0;
            var h1 = 0;
            if (trim) {
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
            var culled = false;
            var z;
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
        };
        Sprite3d.prototype.calculateTrimmedVertices = function () {
            if (this.proj._affine) {
                _super.prototype.calculateTrimmedVertices.call(this);
                return;
            }
            var wid = this.transform._worldID;
            var tuid = this._texture._updateID;
            if (!this.vertexTrimmedData) {
                this.vertexTrimmedData = new Float32Array(8);
            }
            else if (this._transformTrimmedID === wid && this._textureTrimmedID === tuid) {
                return;
            }
            this._transformTrimmedID = wid;
            this._textureTrimmedID = tuid;
            var texture = this._texture;
            var vertexData = this.vertexTrimmedData;
            var orig = texture.orig;
            var anchor = this._anchor;
            var wt = this.proj.world.mat4;
            var w1 = -anchor._x * orig.width;
            var w0 = w1 + orig.width;
            var h1 = -anchor._y * orig.height;
            var h0 = h1 + orig.height;
            var culled = false;
            var z;
            var w = 1.0 / ((wt[3] * w1) + (wt[7] * h1) + wt[15]);
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
        };
        Sprite3d.prototype._calculateBounds = function () {
            this.calculateVertices();
            if (this.culledByFrustrum) {
                return;
            }
            var trim = this._texture.trim;
            var orig = this._texture.orig;
            if (!trim || (trim.width === orig.width && trim.height === orig.height)) {
                this._bounds.addQuad(this.vertexData);
                return;
            }
            this.calculateTrimmedVertices();
            if (!this.trimmedCulledByFrustrum) {
                this._bounds.addQuad(this.vertexTrimmedData);
            }
        };
        Sprite3d.prototype._render = function (renderer) {
            this.calculateVertices();
            if (this.culledByFrustrum) {
                return;
            }
            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);
        };
        Sprite3d.prototype.containsPoint = function (point) {
            if (this.culledByFrustrum) {
                return false;
            }
            return _super.prototype.containsPoint.call(this, point);
        };
        Object.defineProperty(Sprite3d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        Sprite3d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            return pixi_projection.container3dToLocal.call(this, position, from, point, skipUpdate, step);
        };
        Sprite3d.prototype.isFrontFace = function (forceUpdate) {
            return pixi_projection.container3dIsFrontFace.call(this, forceUpdate);
        };
        Sprite3d.prototype.getDepth = function (forceUpdate) {
            return pixi_projection.container3dGetDepth.call(this, forceUpdate);
        };
        Object.defineProperty(Sprite3d.prototype, "position3d", {
            get: function () {
                return this.proj.position;
            },
            set: function (value) {
                this.proj.position.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite3d.prototype, "scale3d", {
            get: function () {
                return this.proj.scale;
            },
            set: function (value) {
                this.proj.scale.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite3d.prototype, "euler", {
            get: function () {
                return this.proj.euler;
            },
            set: function (value) {
                this.proj.euler.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite3d.prototype, "pivot3d", {
            get: function () {
                return this.proj.pivot;
            },
            set: function (value) {
                this.proj.pivot.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        return Sprite3d;
    }(PIXI.Sprite));
    pixi_projection.Sprite3d = Sprite3d;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var Text3d = (function (_super) {
        __extends(Text3d, _super);
        function Text3d(text, style, canvas) {
            var _this = _super.call(this, text, style, canvas) || this;
            _this.vertexData2d = null;
            _this.proj = new pixi_projection.Projection3d(_this.transform);
            _this.pluginName = 'batch2d';
            return _this;
        }
        Object.defineProperty(Text3d.prototype, "worldTransform", {
            get: function () {
                return this.proj.affine ? this.transform.worldTransform : this.proj.world;
            },
            enumerable: true,
            configurable: true
        });
        Text3d.prototype.toLocal = function (position, from, point, skipUpdate, step) {
            if (step === void 0) { step = pixi_projection.TRANSFORM_STEP.ALL; }
            return pixi_projection.container3dToLocal.call(this, position, from, point, skipUpdate, step);
        };
        Text3d.prototype.isFrontFace = function (forceUpdate) {
            return pixi_projection.container3dIsFrontFace.call(this, forceUpdate);
        };
        Text3d.prototype.getDepth = function (forceUpdate) {
            return pixi_projection.container3dGetDepth.call(this, forceUpdate);
        };
        Object.defineProperty(Text3d.prototype, "position3d", {
            get: function () {
                return this.proj.position;
            },
            set: function (value) {
                this.proj.position.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text3d.prototype, "scale3d", {
            get: function () {
                return this.proj.scale;
            },
            set: function (value) {
                this.proj.scale.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text3d.prototype, "euler", {
            get: function () {
                return this.proj.euler;
            },
            set: function (value) {
                this.proj.euler.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Text3d.prototype, "pivot3d", {
            get: function () {
                return this.proj.pivot;
            },
            set: function (value) {
                this.proj.pivot.copyFrom(value);
            },
            enumerable: true,
            configurable: true
        });
        return Text3d;
    }(PIXI.Text));
    pixi_projection.Text3d = Text3d;
    Text3d.prototype.calculateVertices = pixi_projection.Sprite3d.prototype.calculateVertices;
    Text3d.prototype.calculateTrimmedVertices = pixi_projection.Sprite3d.prototype.calculateTrimmedVertices;
    Text3d.prototype._calculateBounds = pixi_projection.Sprite3d.prototype._calculateBounds;
    Text3d.prototype.containsPoint = pixi_projection.Sprite3d.prototype.containsPoint;
    Text3d.prototype._render = pixi_projection.Sprite3d.prototype._render;
})(pixi_projection || (pixi_projection = {}));
var pixi_projection;
(function (pixi_projection) {
    var containerProps = {
        worldTransform: {
            get: pixi_projection.container3dWorldTransform,
            enumerable: true,
            configurable: true
        },
        position3d: {
            get: function () { return this.proj.position; },
            set: function (value) { this.proj.position.copy(value); }
        },
        scale3d: {
            get: function () { return this.proj.scale; },
            set: function (value) { this.proj.scale.copy(value); }
        },
        pivot3d: {
            get: function () { return this.proj.pivot; },
            set: function (value) { this.proj.pivot.copy(value); }
        },
        euler: {
            get: function () { return this.proj.euler; },
            set: function (value) { this.proj.euler.copy(value); }
        }
    };
    function convertTo3d() {
        if (this.proj)
            return;
        this.proj = new pixi_projection.Projection3d(this.transform);
        this.toLocal = pixi_projection.Container3d.prototype.toLocal;
        this.isFrontFace = pixi_projection.Container3d.prototype.isFrontFace;
        this.getDepth = pixi_projection.Container3d.prototype.getDepth;
        Object.defineProperties(this, containerProps);
    }
    PIXI.Container.prototype.convertTo3d = convertTo3d;
    PIXI.Sprite.prototype.convertTo3d = function () {
        if (this.proj)
            return;
        this.calculateVertices = pixi_projection.Sprite3d.prototype.calculateVertices;
        this.calculateTrimmedVertices = pixi_projection.Sprite3d.prototype.calculateTrimmedVertices;
        this._calculateBounds = pixi_projection.Sprite3d.prototype._calculateBounds;
        this.containsPoint = pixi_projection.Sprite3d.prototype.containsPoint;
        this.pluginName = 'batch2d';
        convertTo3d.call(this);
    };
    PIXI.Container.prototype.convertSubtreeTo3d = function () {
        this.convertTo3d();
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeTo3d();
        }
    };
    if (PIXI.SimpleMesh) {
        PIXI.SimpleMesh.prototype.convertTo3d =
            PIXI.SimpleRope.prototype.convertTo3d =
                function () {
                    if (this.proj)
                        return;
                    this.calculateVertices = pixi_projection.Mesh3d2d.prototype.calculateVertices;
                    this._renderDefault = pixi_projection.Mesh3d2d.prototype._renderDefault;
                    if (this.material.pluginName !== 'batch2d') {
                        this.material = new PIXI.MeshMaterial(this.material.texture, {
                            program: PIXI.Program.from(pixi_projection.Mesh2d.defaultVertexShader, pixi_projection.Mesh2d.defaultFragmentShader),
                            pluginName: 'batch2d'
                        });
                    }
                    convertTo3d.call(this);
                };
    }
})(pixi_projection || (pixi_projection = {}));
//# sourceMappingURL=pixi-projection.js.map