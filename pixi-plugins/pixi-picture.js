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
var pixi_picture;
(function (pixi_picture) {
    var BackdropFilter = (function (_super) {
        __extends(BackdropFilter, _super);
        function BackdropFilter() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.backdropUniformName = null;
            _this._backdropActive = false;
            _this.clearColor = null;
            return _this;
        }
        return BackdropFilter;
    }(PIXI.Filter));
    pixi_picture.BackdropFilter = BackdropFilter;
    var filterFrag = "\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform sampler2D uBackdrop;\n\n%UNIFORM_CODE%\n\nvoid main(void)\n{\n   vec4 b_src = texture2D(uSampler, vTextureCoord);\n   vec4 b_dest = texture2D(uBackdrop, vTextureCoord);\n   vec4 b_res = b_dest;\n   \n   %BLEND_CODE%\n\n   gl_FragColor = b_res;\n}";
    var BlendFilter = (function (_super) {
        __extends(BlendFilter, _super);
        function BlendFilter(shaderParts) {
            var _this = this;
            var fragCode = filterFrag;
            fragCode = fragCode.replace('%UNIFORM_CODE%', shaderParts.uniformCode || "");
            fragCode = fragCode.replace('%BLEND_CODE%', shaderParts.blendCode || "");
            _this = _super.call(this, undefined, fragCode, shaderParts.uniforms) || this;
            _this.backdropUniformName = 'uBackdrop';
            return _this;
        }
        return BlendFilter;
    }(BackdropFilter));
    pixi_picture.BlendFilter = BlendFilter;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    function containsRect(rectOut, rectIn) {
        var r1 = rectIn.x + rectIn.width;
        var b1 = rectIn.y + rectIn.height;
        var r2 = rectOut.x + rectOut.width;
        var b2 = rectOut.y + rectOut.height;
        return (rectIn.x >= rectOut.x) &&
            (rectIn.x <= r2) &&
            (rectIn.y >= rectOut.y) &&
            (rectIn.y <= b2) &&
            (r1 >= rectOut.x) &&
            (r1 <= r2) &&
            (b1 >= rectOut.y) &&
            (b1 <= b2);
    }
    PIXI.systems.TextureSystem.prototype.bindForceLocation = function (texture, location) {
        if (location === void 0) { location = 0; }
        var gl = this.gl;
        if (this.currentLocation !== location) {
            this.currentLocation = location;
            gl.activeTexture(gl.TEXTURE0 + location);
        }
        this.bind(texture, location);
    };
    function pushWithCheck(target, filters, checkEmptyBounds) {
        if (checkEmptyBounds === void 0) { checkEmptyBounds = true; }
        var renderer = this.renderer;
        var filterStack = this.defaultFilterStack;
        var state = this.statePool.pop() || new PIXI.FilterState();
        var resolution = filters[0].resolution;
        var padding = filters[0].padding;
        var autoFit = filters[0].autoFit;
        var legacy = filters[0].legacy;
        for (var i = 1; i < filters.length; i++) {
            var filter = filters[i];
            resolution = Math.min(resolution, filter.resolution);
            padding = this.useMaxPadding
                ? Math.max(padding, filter.padding)
                : padding + filter.padding;
            autoFit = autoFit || filter.autoFit;
            legacy = legacy || filter.legacy;
        }
        if (filterStack.length === 1) {
            this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
        }
        filterStack.push(state);
        state.resolution = resolution;
        state.legacy = legacy;
        state.target = target;
        state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));
        var canUseBackdrop = true;
        state.sourceFrame.pad(padding);
        if (autoFit) {
            state.sourceFrame.fit(this.renderer.renderTexture.sourceFrame);
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
        state.sourceFrame.ceil(resolution);
        if (canUseBackdrop) {
            var backdrop = null;
            for (var i = 0; i < filters.length; i++) {
                var bName = filters[i].backdropUniformName;
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
        var destinationFrame = this.tempRect;
        destinationFrame.width = state.sourceFrame.width;
        destinationFrame.height = state.sourceFrame.height;
        state.renderTexture.filterFrame = state.sourceFrame;
        renderer.renderTexture.bind(state.renderTexture, state.sourceFrame, destinationFrame);
        renderer.renderTexture.clear(filters[filters.length - 1].clearColor);
        return true;
    }
    function push(target, filters) {
        return this.pushWithCheck(target, filters, false);
    }
    function pop() {
        var filterStack = this.defaultFilterStack;
        var state = filterStack.pop();
        var filters = state.filters;
        this.activeState = state;
        var globalUniforms = this.globalUniforms.uniforms;
        globalUniforms.outputFrame = state.sourceFrame;
        globalUniforms.resolution = state.resolution;
        var inputSize = globalUniforms.inputSize;
        var inputPixel = globalUniforms.inputPixel;
        var inputClamp = globalUniforms.inputClamp;
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
            var filterArea = globalUniforms.filterArea;
            filterArea[0] = state.destinationFrame.width;
            filterArea[1] = state.destinationFrame.height;
            filterArea[2] = state.sourceFrame.x;
            filterArea[3] = state.sourceFrame.y;
            globalUniforms.filterClamp = globalUniforms.inputClamp;
        }
        this.globalUniforms.update();
        var lastState = filterStack[filterStack.length - 1];
        if (state.renderTexture.framebuffer.multisample > 1) {
            this.renderer.framebuffer.blit();
        }
        if (filters.length === 1) {
            filters[0].apply(this, state.renderTexture, lastState.renderTexture, PIXI.CLEAR_MODES.BLEND, state);
            this.returnFilterTexture(state.renderTexture);
        }
        else {
            var flip = state.renderTexture;
            var flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
            flop.filterFrame = flip.filterFrame;
            var i = 0;
            for (i = 0; i < filters.length - 1; ++i) {
                filters[i].apply(this, flip, flop, PIXI.CLEAR_MODES.CLEAR, state);
                var t = flip;
                flip = flop;
                flop = t;
            }
            filters[i].apply(this, flip, lastState.renderTexture, PIXI.CLEAR_MODES.BLEND, state);
            this.returnFilterTexture(flip);
            this.returnFilterTexture(flop);
        }
        var backdropFree = false;
        for (var i = 0; i < filters.length; i++) {
            if (filters[i]._backdropActive) {
                var bName = filters[i].backdropUniformName;
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
    var hadBackbufferError = false;
    function prepareBackdrop(bounds) {
        var renderer = this.renderer;
        var renderTarget = renderer.renderTexture.current;
        var fr = this.renderer.renderTexture.sourceFrame;
        if (!renderTarget) {
            if (!hadBackbufferError) {
                hadBackbufferError = true;
                console.warn('pixi-picture: you are trying to use Blend Filter on main framebuffer! That wont work.');
            }
            return null;
        }
        var resolution = renderTarget.baseTexture.resolution;
        var x = (bounds.x - fr.x) * resolution;
        var y = (bounds.y - fr.y) * resolution;
        var w = (bounds.width) * resolution;
        var h = (bounds.height) * resolution;
        var gl = renderer.gl;
        var rt = this.getOptimalFilterTexture(w, h, 1);
        renderer.texture.bindForceLocation(rt.baseTexture, 0);
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x, y, w, h);
        return rt;
    }
    PIXI.systems.FilterSystem.prototype.push = push;
    PIXI.systems.FilterSystem.prototype.pushWithCheck = pushWithCheck;
    PIXI.systems.FilterSystem.prototype.pop = pop;
    PIXI.systems.FilterSystem.prototype.prepareBackdrop = prepareBackdrop;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var MASK_CHANNEL;
    (function (MASK_CHANNEL) {
        MASK_CHANNEL[MASK_CHANNEL["RED"] = 0] = "RED";
        MASK_CHANNEL[MASK_CHANNEL["GREEN"] = 1] = "GREEN";
        MASK_CHANNEL[MASK_CHANNEL["BLUE"] = 2] = "BLUE";
        MASK_CHANNEL[MASK_CHANNEL["ALPHA"] = 3] = "ALPHA";
    })(MASK_CHANNEL = pixi_picture.MASK_CHANNEL || (pixi_picture.MASK_CHANNEL = {}));
    var MaskConfig = (function () {
        function MaskConfig(maskBefore, channel) {
            if (maskBefore === void 0) { maskBefore = false; }
            if (channel === void 0) { channel = MASK_CHANNEL.ALPHA; }
            this.maskBefore = maskBefore;
            this.uniformCode = 'uniform vec4 uChannel;';
            this.uniforms = {
                uChannel: new Float32Array([0, 0, 0, 0]),
            };
            this.blendCode = "b_res = dot(b_src, uChannel) * b_dest;";
            this.uniforms.uChannel[channel] = 1.0;
        }
        return MaskConfig;
    }());
    pixi_picture.MaskConfig = MaskConfig;
    var MaskFilter = (function (_super) {
        __extends(MaskFilter, _super);
        function MaskFilter(baseFilter, config) {
            if (config === void 0) { config = new MaskConfig(); }
            var _this = _super.call(this, config) || this;
            _this.baseFilter = baseFilter;
            _this.config = config;
            _this.padding = baseFilter.padding;
            return _this;
        }
        MaskFilter.prototype.apply = function (filterManager, input, output, clearMode) {
            var target = filterManager.getFilterTexture(input);
            if (this.config.maskBefore) {
                var blendMode = this.state.blendMode;
                this.state.blendMode = PIXI.BLEND_MODES.NONE;
                filterManager.applyFilter(this, input, target, PIXI.CLEAR_MODES.BLIT);
                this.baseFilter.blendMode = blendMode;
                this.baseFilter.apply(filterManager, target, output, clearMode);
                this.state.blendMode = blendMode;
            }
            else {
                var uBackdrop = this.uniforms.uBackdrop;
                this.baseFilter.blendMode = PIXI.BLEND_MODES.NONE;
                this.baseFilter.apply(filterManager, uBackdrop, target, PIXI.CLEAR_MODES.BLIT);
                this.uniforms.uBackdrop = target;
                filterManager.applyFilter(this, input, output, clearMode);
                this.uniforms.uBackdrop = uBackdrop;
            }
            filterManager.returnFilterTexture(target);
        };
        return MaskFilter;
    }(pixi_picture.BlendFilter));
    pixi_picture.MaskFilter = MaskFilter;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var blends;
    (function (blends) {
        blends.NPM_BLEND = "if (b_src.a == 0.0) {\n    gl_FragColor = vec4(0, 0, 0, 0);\n    return;\n}\nvec3 Cb = b_src.rgb / b_src.a, Cs;\nif (b_dest.a > 0.0) {\n    Cs = b_dest.rgb / b_dest.a;\n}\n%NPM_BLEND%\nb_res.a = b_src.a + b_dest.a * (1.0-b_src.a);\nb_res.rgb = (1.0 - b_src.a) * Cs + b_src.a * B;\nb_res.rgb *= b_res.a;\n";
        blends.OVERLAY_PART = "vec3 multiply = Cb * Cs * 2.0;\nvec3 Cb2 = Cb * 2.0 - 1.0;\nvec3 screen = Cb2 + Cs - Cb2 * Cs;\nvec3 B;\nif (Cs.r <= 0.5) {\n    B.r = multiply.r;\n} else {\n    B.r = screen.r;\n}\nif (Cs.g <= 0.5) {\n    B.g = multiply.g;\n} else {\n    B.g = screen.g;\n}\nif (Cs.b <= 0.5) {\n    B.b = multiply.b;\n} else {\n    B.b = screen.b;\n}\n";
        blends.HARDLIGHT_PART = "vec3 multiply = Cb * Cs * 2.0;\nvec3 Cs2 = Cs * 2.0 - 1.0;\nvec3 screen = Cb + Cs2 - Cb * Cs2;\nvec3 B;\nif (Cb.r <= 0.5) {\n    B.r = multiply.r;\n} else {\n    B.r = screen.r;\n}\nif (Cb.g <= 0.5) {\n    B.g = multiply.g;\n} else {\n    B.g = screen.g;\n}\nif (Cb.b <= 0.5) {\n    B.b = multiply.b;\n} else {\n    B.b = screen.b;\n}\n";
        blends.SOFTLIGHT_PART = "vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\nvec3 B;\nvec3 D;\nif (Cs.r <= 0.5)\n{\n    B.r = first.r;\n}\nelse\n{\n    if (Cb.r <= 0.25)\n    {\n        D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    \n    }\n    else\n    {\n        D.r = sqrt(Cb.r);\n    }\n    B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);\n}\nif (Cs.g <= 0.5)\n{\n    B.g = first.g;\n}\nelse\n{\n    if (Cb.g <= 0.25)\n    {\n        D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    \n    }\n    else\n    {\n        D.g = sqrt(Cb.g);\n    }\n    B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);\n}\nif (Cs.b <= 0.5)\n{\n    B.b = first.b;\n}\nelse\n{\n    if (Cb.b <= 0.25)\n    {\n        D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    \n    }\n    else\n    {\n        D.b = sqrt(Cb.b);\n    }\n    B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);\n}\n";
        blends.MULTIPLY_FULL = "if (dest.a > 0.0) {\n   b_res.rgb = (dest.rgb / dest.a) * ((1.0 - src.a) + src.rgb);\n   b_res.a = min(src.a + dest.a - src.a * dest.a, 1.0);\n   b_res.rgb *= mult.a;\n}\n";
        blends.OVERLAY_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", blends.OVERLAY_PART);
        blends.HARDLIGHT_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", blends.HARDLIGHT_PART);
        blends.SOFTLIGHT_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", blends.SOFTLIGHT_PART);
        blends.blendFullArray = [];
        blends.blendFullArray[PIXI.BLEND_MODES.MULTIPLY] = blends.MULTIPLY_FULL;
        blends.blendFullArray[PIXI.BLEND_MODES.OVERLAY] = blends.OVERLAY_FULL;
        blends.blendFullArray[PIXI.BLEND_MODES.HARD_LIGHT] = blends.HARDLIGHT_FULL;
        blends.blendFullArray[PIXI.BLEND_MODES.SOFT_LIGHT] = blends.SOFTLIGHT_FULL;
    })(blends = pixi_picture.blends || (pixi_picture.blends = {}));
    var filterCache = [];
    var filterCacheArray = [];
    function getBlendFilter(blendMode) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCache[blendMode]) {
            filterCache[blendMode] = new pixi_picture.BlendFilter({ blendCode: blends.blendFullArray[blendMode] });
        }
        return filterCache[blendMode];
    }
    pixi_picture.getBlendFilter = getBlendFilter;
    function getBlendFilterArray(blendMode) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCacheArray[blendMode]) {
            filterCacheArray[blendMode] = [this.getBlendFilter(blendMode)];
        }
        return filterCacheArray[blendMode];
    }
    pixi_picture.getBlendFilterArray = getBlendFilterArray;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Sprite.prototype._render = function (renderer) {
            var texture = this._texture;
            if (!texture || !texture.valid) {
                return;
            }
            var blendFilterArray = pixi_picture.getBlendFilterArray(this.blendMode);
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
        };
        return Sprite;
    }(PIXI.Sprite));
    pixi_picture.Sprite = Sprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var TilingSprite = (function (_super) {
        __extends(TilingSprite, _super);
        function TilingSprite() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TilingSprite.prototype._render = function (renderer) {
            var texture = this._texture;
            if (!texture || !texture.valid) {
                return;
            }
            var blendFilterArray = pixi_picture.getBlendFilterArray(this.blendMode);
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
        };
        return TilingSprite;
    }(PIXI.TilingSprite));
    pixi_picture.TilingSprite = TilingSprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    PIXI.picture = pixi_picture;
})(pixi_picture || (pixi_picture = {}));
//# sourceMappingURL=pixi-picture.js.map