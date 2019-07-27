var pixi_heaven;
(function (pixi_heaven) {
    var CLAMP_OPTIONS;
    (function (CLAMP_OPTIONS) {
        CLAMP_OPTIONS[CLAMP_OPTIONS["NEVER"] = 0] = "NEVER";
        CLAMP_OPTIONS[CLAMP_OPTIONS["AUTO"] = 1] = "AUTO";
        CLAMP_OPTIONS[CLAMP_OPTIONS["ALWAYS"] = 2] = "ALWAYS";
    })(CLAMP_OPTIONS = pixi_heaven.CLAMP_OPTIONS || (pixi_heaven.CLAMP_OPTIONS = {}));
    pixi_heaven.settings = {
        MESH_CLAMP: CLAMP_OPTIONS.AUTO,
    };
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var utils;
    (function (utils) {
        function createIndicesForQuads(size) {
            var totalIndices = size * 6;
            var indices = new Uint16Array(totalIndices);
            for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
                indices[i + 0] = j + 0;
                indices[i + 1] = j + 1;
                indices[i + 2] = j + 2;
                indices[i + 3] = j + 0;
                indices[i + 4] = j + 2;
                indices[i + 5] = j + 3;
            }
            return indices;
        }
        utils.createIndicesForQuads = createIndicesForQuads;
        function isPow2(v) {
            return !(v & (v - 1)) && (!!v);
        }
        utils.isPow2 = isPow2;
        function nextPow2(v) {
            v += +(v === 0);
            --v;
            v |= v >>> 1;
            v |= v >>> 2;
            v |= v >>> 4;
            v |= v >>> 8;
            v |= v >>> 16;
            return v + 1;
        }
        utils.nextPow2 = nextPow2;
        function log2(v) {
            var r, shift;
            r = +(v > 0xFFFF) << 4;
            v >>>= r;
            shift = +(v > 0xFF) << 3;
            v >>>= shift;
            r |= shift;
            shift = +(v > 0xF) << 2;
            v >>>= shift;
            r |= shift;
            shift = +(v > 0x3) << 1;
            v >>>= shift;
            r |= shift;
            return r | (v >> 1);
        }
        utils.log2 = log2;
    })(utils = pixi_heaven.utils || (pixi_heaven.utils = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    PIXI.heaven = pixi_heaven;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    if (!PIXI.spine) {
        PIXI.spine = {
            Spine: function () { }
        };
    }
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var AnimationState = (function () {
        function AnimationState(textures, autoUpdate) {
            this._textures = null;
            this._durations = null;
            this.animationSpeed = 1;
            this.loop = true;
            this.onComplete = null;
            this.onFrameChange = null;
            this.onLoop = null;
            this._currentTime = 0;
            this.playing = false;
            this.texture = textures[0] instanceof PIXI.Texture ? textures[0] : textures[0].texture;
            this.textures = textures;
            this._autoUpdate = autoUpdate !== false;
        }
        AnimationState.prototype.stop = function () {
            if (!this.playing) {
                return;
            }
            this.playing = false;
            if (this._autoUpdate) {
                PIXI.ticker.shared.remove(this.update, this);
            }
        };
        AnimationState.prototype.play = function () {
            if (this.playing) {
                return;
            }
            this.playing = true;
            if (this._autoUpdate) {
                PIXI.ticker.shared.add(this.update, this, PIXI.UPDATE_PRIORITY.HIGH);
            }
        };
        AnimationState.prototype.gotoAndStop = function (frameNumber) {
            this.stop();
            var previousFrame = this.currentFrame;
            this._currentTime = frameNumber;
            if (previousFrame !== this.currentFrame) {
                this.updateTexture();
            }
        };
        AnimationState.prototype.gotoAndPlay = function (frameNumber) {
            var previousFrame = this.currentFrame;
            this._currentTime = frameNumber;
            if (previousFrame !== this.currentFrame) {
                this.updateTexture();
            }
            this.play();
        };
        AnimationState.prototype.update = function (deltaTime) {
            var elapsed = this.animationSpeed * deltaTime;
            var previousFrame = this.currentFrame;
            if (this._durations !== null) {
                var lag = this._currentTime % 1 * this._durations[this.currentFrame];
                lag += elapsed / 60 * 1000;
                while (lag < 0) {
                    this._currentTime--;
                    lag += this._durations[this.currentFrame];
                }
                var sign = this.animationSpeed * deltaTime;
                if (sign < 0)
                    sign = -1;
                else if (sign > 0)
                    sign = 1;
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
        };
        AnimationState.prototype.updateTexture = function () {
            this.texture = this._textures[this.currentFrame];
            if (this._target) {
                this._target.texture = this.texture;
            }
            if (this.onFrameChange) {
                this.onFrameChange(this.currentFrame);
            }
        };
        AnimationState.prototype.bind = function (target) {
            this._target = target;
            target.animState = this;
        };
        AnimationState.fromFrames = function (frames) {
            var textures = [];
            for (var i = 0; i < frames.length; ++i) {
                textures.push(PIXI.Texture.from(frames[i]));
            }
            return new AnimationState(textures);
        };
        AnimationState.fromImages = function (images) {
            var textures = [];
            for (var i = 0; i < images.length; ++i) {
                textures.push(PIXI.Texture.from(images[i]));
            }
            return new AnimationState(textures);
        };
        Object.defineProperty(AnimationState.prototype, "totalFrames", {
            get: function () {
                return this._textures.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "textures", {
            get: function () {
                return this._textures;
            },
            set: function (value) {
                if (value[0] instanceof PIXI.Texture) {
                    this._textures = value;
                    this._durations = null;
                }
                else {
                    this._textures = [];
                    this._durations = [];
                    for (var i = 0; i < value.length; i++) {
                        var val = value[i];
                        this._textures.push(val.texture);
                        this._durations.push(val.time);
                    }
                }
                this.gotoAndStop(0);
                this.updateTexture();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "currentFrame", {
            get: function () {
                var currentFrame = Math.floor(this._currentTime) % this._textures.length;
                if (currentFrame < 0) {
                    currentFrame += this._textures.length;
                }
                return currentFrame;
            },
            enumerable: true,
            configurable: true
        });
        return AnimationState;
    }());
    pixi_heaven.AnimationState = AnimationState;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var TexturePolygon = (function () {
        function TexturePolygon(vertices, uvs, indices) {
            this.vertices = vertices;
            this.uvs = uvs;
            this.indices = indices;
        }
        return TexturePolygon;
    }());
    pixi_heaven.TexturePolygon = TexturePolygon;
    PIXI.Spritesheet.prototype._processFrames = function (initialFrameIndex) {
        var meta = this.data.meta;
        var frameIndex = initialFrameIndex;
        var maxFrames = PIXI.Spritesheet.BATCH_SIZE;
        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length) {
            var i = this._frameKeys[frameIndex];
            var data = this._frames[i];
            var rect = data.frame;
            if (rect) {
                var frame = null;
                var trim = null;
                var sourceSize = data.trimmed !== false && data.sourceSize
                    ? data.sourceSize : data.frame;
                var orig = new PIXI.Rectangle(0, 0, Math.floor(sourceSize.w) / this.resolution, Math.floor(sourceSize.h) / this.resolution);
                if (data.rotated) {
                    frame = new PIXI.Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.h) / this.resolution, Math.floor(rect.w) / this.resolution);
                }
                else {
                    frame = new PIXI.Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
                }
                if (data.trimmed !== false && data.spriteSourceSize) {
                    trim = new PIXI.Rectangle(Math.floor(data.spriteSourceSize.x) / this.resolution, Math.floor(data.spriteSourceSize.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
                }
                this.textures[i] = new PIXI.Texture(this.baseTexture, frame, orig, trim, data.rotated ? 2 : 0, data.anchor);
                if (data.vertices) {
                    var vertices = new Float32Array(data.vertices.length * 2);
                    for (var i_1 = 0; i_1 < data.vertices.length; i_1++) {
                        vertices[i_1 * 2] = Math.floor(data.vertices[i_1][0]) / this.resolution;
                        vertices[i_1 * 2 + 1] = Math.floor(data.vertices[i_1][1]) / this.resolution;
                    }
                    var uvs = new Float32Array(data.verticesUV.length * 2);
                    for (var i_2 = 0; i_2 < data.verticesUV.length; i_2++) {
                        uvs[i_2 * 2] = data.verticesUV[i_2][0] / meta.size.w;
                        uvs[i_2 * 2 + 1] = data.verticesUV[i_2][1] / meta.size.h;
                    }
                    var indices = new Uint16Array(data.triangles.length * 3);
                    for (var i_3 = 0; i_3 < data.triangles.length; i_3++) {
                        indices[i_3 * 3] = data.triangles[i_3][0];
                        indices[i_3 * 3 + 1] = data.triangles[i_3][1];
                        indices[i_3 * 3 + 2] = data.triangles[i_3][2];
                    }
                    this.textures[i].polygon = new TexturePolygon(vertices, uvs, indices);
                }
                PIXI.Texture.addToCache(this.textures[i], i);
            }
            frameIndex++;
        }
    };
})(pixi_heaven || (pixi_heaven = {}));
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
var pixi_heaven;
(function (pixi_heaven) {
    var BitmapText = (function (_super) {
        __extends(BitmapText, _super);
        function BitmapText(text, style) {
            var _this = _super.call(this, text, style) || this;
            if (!_this.color) {
                _this.color = new pixi_heaven.ColorTransform();
            }
            return _this;
        }
        Object.defineProperty(BitmapText.prototype, "tint", {
            get: function () {
                return this.color ? this.color.tintBGR : 0xffffff;
            },
            set: function (value) {
                this.color && (this.color.tintBGR = value);
            },
            enumerable: true,
            configurable: true
        });
        BitmapText.prototype.addChild = function (child) {
            var additionalChildren = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                additionalChildren[_i - 1] = arguments[_i];
            }
            if (!child.color && child.vertexData) {
                if (!this.color) {
                    this.color = new pixi_heaven.ColorTransform();
                }
                child.color = this.color;
                child.pluginName = 'batchHeaven';
            }
            return _super.prototype.addChild.apply(this, [child].concat(additionalChildren));
        };
        BitmapText.prototype._render = function (renderer) {
            this.color.alpha = this.worldAlpha;
            this.color.updateTransform();
        };
        return BitmapText;
    }(PIXI.BitmapText));
    pixi_heaven.BitmapText = BitmapText;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var whiteRgba = [1.0, 1.0, 1.0, 1.0];
    var blackRgba = [0.0, 0.0, 0.0, 1.0];
    var ColorTransform = (function () {
        function ColorTransform() {
            this.dark = new Float32Array(blackRgba);
            this.light = new Float32Array(whiteRgba);
            this._updateID = 0;
            this._currentUpdateID = -1;
            this.darkRgba = 0;
            this.lightRgba = -1;
            this.hasNoTint = true;
        }
        Object.defineProperty(ColorTransform.prototype, "darkR", {
            get: function () {
                return this.dark[0];
            },
            set: function (value) {
                if (this.dark[0] === value)
                    return;
                this.dark[0] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "darkG", {
            get: function () {
                return this.dark[1];
            },
            set: function (value) {
                if (this.dark[1] === value)
                    return;
                this.dark[1] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "darkB", {
            get: function () {
                return this.dark[2];
            },
            set: function (value) {
                if (this.dark[2] === value)
                    return;
                this.dark[2] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "lightR", {
            get: function () {
                return this.light[0];
            },
            set: function (value) {
                if (this.light[0] === value)
                    return;
                this.light[0] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "lightG", {
            get: function () {
                return this.light[1];
            },
            set: function (value) {
                if (this.light[1] === value)
                    return;
                this.light[1] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "lightB", {
            get: function () {
                return this.light[2];
            },
            set: function (value) {
                if (this.light[2] === value)
                    return;
                this.light[2] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "alpha", {
            get: function () {
                return this.light[3];
            },
            set: function (value) {
                if (this.light[3] === value)
                    return;
                this.light[3] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "pma", {
            get: function () {
                return this.dark[3] !== 0.0;
            },
            set: function (value) {
                if ((this.dark[3] !== 0.0) !== value)
                    return;
                this.dark[3] = value ? 1.0 : 0.0;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "tintBGR", {
            get: function () {
                var light = this.light;
                return ((light[0] * 255) << 16) + ((light[1] * 255) << 8) + (light[2] * 255 | 0);
            },
            set: function (value) {
                this.setLight(((value >> 16) & 0xff) / 255.0, ((value >> 8) & 0xff) / 255.0, (value & 0xff) / 255.0);
            },
            enumerable: true,
            configurable: true
        });
        ColorTransform.prototype.setLight = function (R, G, B) {
            var color = this.light;
            if (color[0] === R && color[1] === G && color[2] === B) {
                return;
            }
            color[0] = R;
            color[1] = G;
            color[2] = B;
            this._updateID++;
        };
        ColorTransform.prototype.setDark = function (R, G, B) {
            var color = this.dark;
            if (color[0] === R && color[1] === G && color[2] === B) {
                return;
            }
            color[0] = R;
            color[1] = G;
            color[2] = B;
            this._updateID++;
        };
        ColorTransform.prototype.clear = function () {
            this.dark[0] = 0.0;
            this.dark[1] = 0.0;
            this.dark[2] = 0.0;
            this.light[0] = 1.0;
            this.light[1] = 1.0;
            this.light[2] = 1.0;
        };
        ColorTransform.prototype.invalidate = function () {
            this._updateID++;
        };
        ColorTransform.prototype.updateTransformLocal = function () {
            var dark = this.dark, light = this.light;
            var la = 255 * (1.0 + (light[3] - 1.0) * dark[3]);
            this.hasNoTint = dark[0] === 0.0 && dark[1] === 0.0 && dark[2] === 0.0
                && light[0] === 1.0 && light[1] === 1.0 && light[2] === 1.0;
            this.darkRgba = (dark[0] * la | 0) + ((dark[1] * la) << 8)
                + ((dark[2] * la) << 16) + ((dark[3] * 255) << 24);
            this.lightRgba = (light[0] * la | 0) + ((light[1] * la) << 8)
                + ((light[2] * la) << 16) + ((light[3] * 255) << 24);
            this._currentUpdateID = this._updateID;
        };
        ColorTransform.prototype.updateTransform = function () {
            if (this._currentUpdateID === this._updateID) {
                return;
            }
            this.updateTransformLocal();
        };
        return ColorTransform;
    }());
    pixi_heaven.ColorTransform = ColorTransform;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var Mesh = (function (_super) {
        __extends(Mesh, _super);
        function Mesh(geometry, shader, state, drawMode) {
            var _this = _super.call(this, geometry, shader, state, drawMode) || this;
            _this.color = null;
            _this.color = shader.color;
            return _this;
        }
        Mesh.prototype._renderDefault = function (renderer) {
            var shader = this.shader;
            shader.color.alpha = this.worldAlpha;
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
        Mesh.prototype._renderToBatch = function (renderer) {
            this.color.updateTransform();
            _super.prototype._renderToBatch.call(this, renderer);
        };
        return Mesh;
    }(PIXI.Mesh));
    pixi_heaven.Mesh = Mesh;
    var SimpleMesh = (function (_super) {
        __extends(SimpleMesh, _super);
        function SimpleMesh(texture, vertices, uvs, indices, drawMode) {
            var _this = _super.call(this, new PIXI.MeshGeometry(vertices, uvs, indices), new pixi_heaven.MeshMaterial(texture), null, drawMode) || this;
            _this.autoUpdate = true;
            _this.geometry.getBuffer('aVertexPosition').static = false;
            return _this;
        }
        Object.defineProperty(SimpleMesh.prototype, "vertices", {
            get: function () {
                return this.geometry.getBuffer('aVertexPosition').data;
            },
            set: function (value) {
                this.geometry.getBuffer('aVertexPosition').data = value;
            },
            enumerable: true,
            configurable: true
        });
        SimpleMesh.prototype._render = function (renderer) {
            if (this.autoUpdate) {
                this.geometry.getBuffer('aVertexPosition').update();
            }
            _super.prototype._render.call(this, renderer);
        };
        return SimpleMesh;
    }(Mesh));
    pixi_heaven.SimpleMesh = SimpleMesh;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var vertex = "attribute vec2 aVertexPosition;\n\tattribute vec2 aTextureCoord;\n\n\tuniform mat3 projectionMatrix;\n\tuniform mat3 translationMatrix;\n\tuniform mat3 uTextureMatrix;\n\n\tvarying vec2 vTextureCoord;\n\n\tvoid main(void)\n\t{\n\t\tgl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n\t\tvTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;\n\t}";
    var fragment = "varying vec2 vTextureCoord;\nuniform vec4 uLight, uDark;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec4 texColor = texture2D(uSampler, vTextureCoord);\n    gl_FragColor.a = texColor.a * uLight.a;\n\tgl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;\n}\n\t";
    var fragTrim = "\n\tvarying vec2 vTextureCoord;\n\tuniform vec4 uLight, uDark;\n\tuniform vec4 uClampFrame;\n\t\n\tuniform sampler2D uSampler;\n\t\n\tvoid main(void)\n\t{\n\t    vec2 coord = vTextureCoord;\n\t    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z\n\t        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)\n\t            discard;\n\t    vec4 texColor = texture2D(uSampler, vTextureCoord);\n\t    gl_FragColor.a = texColor.a * uLight.a;\n\t\tgl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;\n\t}\n\t";
    var MeshMaterial = (function (_super) {
        __extends(MeshMaterial, _super);
        function MeshMaterial(uSampler, options) {
            var _this = this;
            var uniforms = {
                uSampler: uSampler,
                uTextureMatrix: PIXI.Matrix.IDENTITY,
                uColor: new Float32Array([1, 1, 1, 1]),
            };
            options = Object.assign({
                pluginName: 'batchHeaven',
            }, options);
            var allowTrim = options.allowTrim;
            if (!allowTrim) {
                if (pixi_heaven.settings.MESH_CLAMP === pixi_heaven.CLAMP_OPTIONS.AUTO) {
                    allowTrim = uSampler.trim && (uSampler.trim.width < uSampler.orig.width || uSampler.trim.height < uSampler.orig.height);
                }
                else if (pixi_heaven.settings.MESH_CLAMP === pixi_heaven.CLAMP_OPTIONS.ALWAYS) {
                    allowTrim = true;
                }
            }
            if (options.uniforms) {
                Object.assign(uniforms, options.uniforms);
            }
            _this = _super.call(this, options.program || PIXI.Program.from(vertex, allowTrim ? fragTrim : fragment), uniforms) || this;
            _this.allowTrim = allowTrim;
            _this.uvMatrix = new PIXI.TextureMatrix(uSampler);
            _this.batchable = options.program === undefined && !_this.allowTrim;
            _this.pluginName = options.pluginName;
            _this.color = options.color || new pixi_heaven.ColorTransform();
            _this.uniforms.uDark = _this.color.dark;
            _this.uniforms.uLight = _this.color.light;
            return _this;
        }
        Object.defineProperty(MeshMaterial.prototype, "texture", {
            get: function () {
                return this.uniforms.uSampler;
            },
            set: function (value) {
                if (this.uniforms.uSampler !== value) {
                    this.uniforms.uSampler = value;
                    this.uvMatrix.texture = value;
                    this.color.pma = value.baseTexture.premultiplyAlpha;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MeshMaterial.prototype, "alpha", {
            get: function () {
                return this.color.alpha;
            },
            set: function (value) {
                this.color.alpha = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MeshMaterial.prototype, "tint", {
            get: function () {
                return this.color.tintBGR;
            },
            set: function (value) {
                this.color.tintBGR = value;
            },
            enumerable: true,
            configurable: true
        });
        MeshMaterial.prototype.update = function () {
            this.color.updateTransform();
            if (this.uvMatrix.update()) {
                this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
                if (this.allowTrim) {
                    this.uniforms.uClampFrame = this.uvMatrix.uClampFrame;
                }
            }
        };
        return MeshMaterial;
    }(PIXI.Shader));
    pixi_heaven.MeshMaterial = MeshMaterial;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var sign = PIXI.utils.sign;
    var tempMat = new PIXI.Matrix();
    var defIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(texture) {
            var _this = _super.call(this, texture) || this;
            _this.color = new pixi_heaven.ColorTransform();
            _this.maskSprite = null;
            _this.uvs = null;
            _this.indices = defIndices;
            _this.animState = null;
            _this.pluginName = 'batchHeaven';
            if (_this.texture.valid)
                _this._onTextureUpdate();
            return _this;
        }
        Object.defineProperty(Sprite.prototype, "_tintRGB", {
            get: function () {
                this.color.updateTransform();
                return this.color.lightRgba & 0xffffff;
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "tint", {
            get: function () {
                return this.color ? this.color.tintBGR : 0xffffff;
            },
            set: function (value) {
                this.color && (this.color.tintBGR = value);
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype._onTextureUpdate = function () {
            var thisAny = this;
            thisAny._textureID = -1;
            thisAny._textureTrimmedID = -1;
            var texture = thisAny._texture;
            if (texture.polygon) {
                this.uvs = texture.polygon.uvs;
                this.indices = texture.polygon.indices;
            }
            else {
                this.uvs = texture._uvs.uvsFloat32;
                this.indices = defIndices;
            }
            this._cachedTint = 0xFFFFFF;
            if (this.color) {
                this.color.pma = thisAny._texture.baseTexture.premultipliedAlpha;
            }
            if (thisAny._width) {
                this.scale.x = sign(this.scale.x) * thisAny._width / thisAny._texture.orig.width;
            }
            if (thisAny._height) {
                this.scale.y = sign(this.scale.y) * thisAny._height / thisAny._texture.orig.height;
            }
        };
        Sprite.prototype._render = function (renderer) {
            this.color.alpha = this.worldAlpha;
            this.color.updateTransform();
            _super.prototype._render.call(this, renderer);
        };
        Sprite.prototype._calculateBounds = function () {
            var thisAny = this;
            var polygon = thisAny.polygon;
            var trim = thisAny.trim;
            var orig = thisAny.orig;
            if (!polygon && (!trim || (trim.width === orig.width && trim.height === orig.height))) {
                this.calculateVertices();
                this._bounds.addQuad(thisAny.vertexData);
            }
            else {
                this.calculateTrimmedVertices();
                this._bounds.addQuad(thisAny.vertexTrimmedData);
            }
        };
        Sprite.prototype.calculateVertices = function () {
            var thisAny = this;
            var transform = this.transform;
            var texture = thisAny._texture;
            if (thisAny._transformID === transform._worldID && thisAny._textureID === texture._updateID) {
                return;
            }
            thisAny._transformID = transform._worldID;
            thisAny._textureID = texture._updateID;
            var wt = this.transform.worldTransform;
            var a = wt.a;
            var b = wt.b;
            var c = wt.c;
            var d = wt.d;
            var tx = wt.tx;
            var ty = wt.ty;
            var anchor = thisAny._anchor;
            var orig = texture.orig;
            if (texture.polygon) {
                var vertices = texture.polygon.vertices;
                var n = vertices.length;
                if (thisAny.vertexData.length !== n) {
                    thisAny.vertexData = new Float32Array(n);
                }
                var vertexData = thisAny.vertexData;
                var dx = -(anchor._x * orig.width);
                var dy = -(anchor._y * orig.height);
                for (var i = 0; i < n; i += 2) {
                    var x = vertices[i] + dx;
                    var y = vertices[i + 1] + dy;
                    vertexData[i] = x * a + y * c + tx;
                    vertexData[i + 1] = x * b + y * d + ty;
                }
            }
            else {
                var vertexData = thisAny.vertexData;
                var trim = texture.trim;
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
                vertexData[0] = (a * w1) + (c * h1) + tx;
                vertexData[1] = (d * h1) + (b * w1) + ty;
                vertexData[2] = (a * w0) + (c * h1) + tx;
                vertexData[3] = (d * h1) + (b * w0) + ty;
                vertexData[4] = (a * w0) + (c * h0) + tx;
                vertexData[5] = (d * h0) + (b * w0) + ty;
                vertexData[6] = (a * w1) + (c * h0) + tx;
                vertexData[7] = (d * h0) + (b * w1) + ty;
            }
        };
        Sprite.prototype.destroy = function (options) {
            if (this.animState) {
                this.animState.stop();
                this.animState = null;
            }
            _super.prototype.destroy.call(this, options);
        };
        return Sprite;
    }(PIXI.Sprite));
    pixi_heaven.Sprite = Sprite;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var pixi_projection;
    (function (pixi_projection) {
        var TYPES = PIXI.TYPES;
        var premultiplyTint = PIXI.utils.premultiplyTint;
        var shaderVert = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aLight, aDark;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform vec4 tint;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nvarying float vTextureId;\n\nvoid main(void){\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vTextureId = aTextureId;\n    vLight = aLight * tint;\n    vDark = vec4(aDark.rgb * tint.rgb, aDark.a);\n}\n";
        var shaderFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nvarying float vTextureId;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void) {\nvec4 color;\nfloat textureId = floor(vTextureId+0.5);\n%forloop%\ngl_FragColor.a = color.a * vLight.a;\ngl_FragColor.rgb = ((color.a - 1.0) * vDark.a + 1.0 - color.rgb) * vDark.rgb + color.rgb * vLight.rgb;\n}";
        var DarkLightGeometry = (function (_super) {
            __extends(DarkLightGeometry, _super);
            function DarkLightGeometry(_static) {
                if (_static === void 0) { _static = false; }
                var _this = _super.call(this) || this;
                _this._buffer = new PIXI.Buffer(null, _static, false);
                _this._indexBuffer = new PIXI.Buffer(null, _static, true);
                _this.addAttribute('aVertexPosition', _this._buffer, 2, false, TYPES.FLOAT)
                    .addAttribute('aTextureCoord', _this._buffer, 2, false, TYPES.FLOAT)
                    .addAttribute('aLight', _this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
                    .addAttribute('aDark', _this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
                    .addAttribute('aTextureId', _this._buffer, 1, true, TYPES.FLOAT)
                    .addIndex(_this._indexBuffer);
                return _this;
            }
            return DarkLightGeometry;
        }(PIXI.Geometry));
        pixi_projection.DarkLightGeometry = DarkLightGeometry;
        var DarkLightPluginFactory = (function () {
            function DarkLightPluginFactory() {
            }
            DarkLightPluginFactory.create = function (options) {
                var _a = Object.assign({
                    vertex: shaderVert,
                    fragment: shaderFrag,
                    geometryClass: DarkLightGeometry,
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
                        var lightRgba = -1;
                        var darkRgba = 0;
                        if (element.color) {
                            lightRgba = element.color.lightRgba;
                            darkRgba = element.color.darkRgba;
                        }
                        else {
                            var alpha = Math.min(element.worldAlpha, 1.0);
                            lightRgba = (alpha < 1.0
                                && element._texture.baseTexture.premultiplyAlpha)
                                ? premultiplyTint(element._tintRGB, alpha)
                                : element._tintRGB + (alpha * 255 << 24);
                        }
                        var p = aIndex / this.vertexSize;
                        var uvs = element.uvs;
                        var indices = element.indices;
                        var vertexData = element.vertexData;
                        var textureId = element._texture.baseTexture._id;
                        for (var i = 0; i < vertexData.length; i += 2) {
                            float32View[aIndex++] = vertexData[i];
                            float32View[aIndex++] = vertexData[i + 1];
                            float32View[aIndex++] = uvs[i];
                            float32View[aIndex++] = uvs[i + 1];
                            uint32View[aIndex++] = lightRgba;
                            uint32View[aIndex++] = darkRgba;
                            float32View[aIndex++] = textureId;
                        }
                        for (var i = 0; i < indices.length; i++) {
                            indexBuffer[iIndex++] = p + indices[i];
                        }
                    };
                    return BatchPlugin;
                }(PIXI.AbstractBatchRenderer));
            };
            return DarkLightPluginFactory;
        }());
        pixi_projection.DarkLightPluginFactory = DarkLightPluginFactory;
        PIXI.Renderer.registerPlugin('batchHeaven', DarkLightPluginFactory.create({}));
    })(pixi_projection || (pixi_projection = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    PIXI.Container.prototype.convertToHeaven = function () {
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
    PIXI.Sprite.prototype.convertToHeaven = function () {
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
        this._onTextureUpdate = pixi_heaven.Sprite.prototype._onTextureUpdate;
        this._render = pixi_heaven.Sprite.prototype._render;
        this._calculateBounds = pixi_heaven.Sprite.prototype._calculateBounds;
        this.calculateVertices = pixi_heaven.Sprite.prototype.calculateVertices;
        this.color = new pixi_heaven.ColorTransform();
        this.pluginName = 'batchHeaven';
        return this;
    };
    PIXI.Container.prototype.convertSubtreeToHeaven = function () {
        if (this.convertToHeaven) {
            this.convertToHeaven();
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeToHeaven();
        }
    };
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var Spine = (function (_super) {
        __extends(Spine, _super);
        function Spine(spineData) {
            var _this = _super.call(this, spineData) || this;
            _this.hasSpriteMask = false;
            _this.color = new pixi_heaven.ColorTransform();
            return _this;
        }
        Spine.prototype.newSprite = function (tex) {
            return new SpineSprite(tex, this);
        };
        Spine.prototype.newMesh = function (texture, vertices, uvs, indices, drawMode) {
            return new SpineMesh(texture, vertices, uvs, indices, drawMode, this);
        };
        return Spine;
    }(PIXI.spine.Spine));
    pixi_heaven.Spine = Spine;
    var SpineMesh = (function (_super) {
        __extends(SpineMesh, _super);
        function SpineMesh(texture, vertices, uvs, indices, drawMode, spine) {
            if (spine === void 0) { spine = null; }
            var _this = _super.call(this, texture, vertices, uvs, indices, drawMode) || this;
            _this.region = null;
            _this.spine = spine;
            return _this;
        }
        SpineMesh.prototype._render = function (renderer) {
            _super.prototype._render.call(this, renderer);
        };
        return SpineMesh;
    }(pixi_heaven.SimpleMesh));
    pixi_heaven.SpineMesh = SpineMesh;
    var SpineSprite = (function (_super) {
        __extends(SpineSprite, _super);
        function SpineSprite(tex, spine) {
            var _this = _super.call(this, tex) || this;
            _this.region = null;
            _this.spine = spine;
            return _this;
        }
        SpineSprite.prototype._render = function (renderer) {
            if (this.maskSprite) {
                this.spine.hasSpriteMask = true;
            }
            if (this.spine.hasSpriteMask) {
                this.pluginName = 'spriteMasked';
            }
            _super.prototype._render.call(this, renderer);
        };
        return SpineSprite;
    }(pixi_heaven.Sprite));
    pixi_heaven.SpineSprite = SpineSprite;
})(pixi_heaven || (pixi_heaven = {}));
//# sourceMappingURL=pixi-heaven.js.map