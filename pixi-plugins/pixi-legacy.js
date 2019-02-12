/*!
 * pixi-legacy - v1.0.1
 * Compiled Thu, 07 Sep 2017 12:33:07 UTC
 *
 * pixi-legacy is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiLegacy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Application = function () {
    function Application(width, height, options, noWebGL) {
        _classCallCheck(this, Application);

        this.renderer = PIXI.autoDetectRenderer(width, height, options, noWebGL);

        this.stage = new PIXI.Container();

        this.ticker = new PIXI.Ticker();

        this.ticker.add(this.render, this);

        // Start the rendering
        this.start();
    }

    Application.prototype.render = function render() {
        this.renderer.render(this.stage);
    };

    Application.prototype.stop = function stop() {
        this.ticker.stop();
    };

    Application.prototype.start = function start() {
        this.ticker.start();
    };

    Application.prototype.destroy = function destroy(removeView) {
        this.stop();
        this.ticker.remove(this.render, this);
        this.ticker = null;

        this.stage.destroy();
        this.stage = null;

        this.renderer.destroy(removeView);
        this.renderer = null;
    };

    _createClass(Application, [{
        key: "view",
        get: function get() {
            return this.renderer.view;
        }
    }, {
        key: "screen",
        get: function get() {
            return this.renderer.screen;
        }
    }]);

    return Application;
}();

exports.default = Application;

},{}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = FilterPatcherV3;
function FilterPatcherV3(PIXI) {

        var CONST = PIXI;
        var AbstractFilter = PIXI.AbstractFilter;
        var WebGLRenderer = PIXI.WebGLRenderer;

        PIXI.filters.VoidFilter = AbstractFilter;

        AbstractFilter.prototype.blendMode = 0;

        function FilterManager_popFilter() {
                var filterData = this.filterStack.pop();
                var previousFilterData = this.filterStack[this.filterStack.length - 1];

                var input = filterData.renderTarget;

                // if the renderTarget is null then we don't apply the filter as its offscreen
                if (!filterData.renderTarget) {
                        return;
                }

                var output = previousFilterData.renderTarget;

                // use program
                var gl = this.renderer.gl;

                this.currentFrame = input.frame;

                this.quad.map(this.textureSize, input.frame);

                // TODO.. this probably only needs to be done once!
                gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertexBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);

                var filters = filterData.filter;

                // assuming all filters follow the correct format??
                gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
                gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 2 * 4 * 4);
                gl.vertexAttribPointer(this.renderer.shaderManager.defaultShader.attributes.aColor, 4, gl.FLOAT, false, 0, 4 * 4 * 4);

                // restore the normal blendmode!
                this.renderer.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);

                if (filters.length === 1) {
                        // TODO (cengler) - There has to be a better way then setting this each time?
                        if (filters[0].uniforms.dimensions) {
                                filters[0].uniforms.dimensions.value[0] = this.renderer.width;
                                filters[0].uniforms.dimensions.value[1] = this.renderer.height;
                                filters[0].uniforms.dimensions.value[2] = this.quad.vertices[0];
                                filters[0].uniforms.dimensions.value[3] = this.quad.vertices[5];
                        }

                        this._filterBlendMode = filters[0].blendMode;
                        filters[0].applyFilter(this.renderer, input, output);
                        this.returnRenderTarget(input);
                } else {
                        var flipTexture = input;
                        var flopTexture = this.getRenderTarget(true);

                        for (var i = 0; i < filters.length - 1; i++) {
                                var filter = filters[i];

                                // TODO (cengler) - There has to be a better way then setting this each time?
                                if (filter.uniforms.dimensions) {
                                        filter.uniforms.dimensions.value[0] = this.renderer.width;
                                        filter.uniforms.dimensions.value[1] = this.renderer.height;
                                        filter.uniforms.dimensions.value[2] = this.quad.vertices[0];
                                        filter.uniforms.dimensions.value[3] = this.quad.vertices[5];
                                }

                                this._filterBlendMode = filter.blendMode;
                                filter.applyFilter(this.renderer, flipTexture, flopTexture);

                                var temp = flipTexture;
                                flipTexture = flopTexture;
                                flopTexture = temp;
                        }

                        this._filterBlendMode = filters[filters.length - 1].blendMode;
                        filters[filters.length - 1].applyFilter(this.renderer, flipTexture, output);

                        this.returnRenderTarget(flipTexture);
                        this.returnRenderTarget(flopTexture);
                }
                this._filterBlendMode = 0;

                return filterData.filter;
        }

        function FilterManager_applyFilter(shader, inputTarget, outputTarget, clear) {
                var gl = this.renderer.gl;

                this.renderer.setRenderTarget(outputTarget);

                if (clear) {
                        outputTarget.clear();
                }

                this.renderer.shaderManager.setShader(shader);

                shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);

                shader.syncUniforms();

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, inputTarget.texture);

                this.renderer.blendModeManager.setBlendMode(this._filterBlendMode);

                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

                this.renderer.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);
                this.renderer.drawCount++;
        }

        WebGLRenderer.prototype._mapGlModes = function () {
                this.filterManager.applyFilter = FilterManager_applyFilter;
                this.filterManager.popFilter = FilterManager_popFilter;

                var gl = this.gl;

                if (!this.blendModes) {
                        this.blendModes = {};

                        this.blendModes[CONST.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.ADD] = [gl.ONE, gl.DST_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR];
                        this.blendModes[CONST.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                        this.blendModes[CONST.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
                }

                if (!this.drawModes) {
                        this.drawModes = {};

                        this.drawModes[CONST.DRAW_MODES.POINTS] = gl.POINTS;
                        this.drawModes[CONST.DRAW_MODES.LINES] = gl.LINES;
                        this.drawModes[CONST.DRAW_MODES.LINE_LOOP] = gl.LINE_LOOP;
                        this.drawModes[CONST.DRAW_MODES.LINE_STRIP] = gl.LINE_STRIP;
                        this.drawModes[CONST.DRAW_MODES.TRIANGLES] = gl.TRIANGLES;
                        this.drawModes[CONST.DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
                        this.drawModes[CONST.DRAW_MODES.TRIANGLE_FAN] = gl.TRIANGLE_FAN;
                }
        };
}

},{}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = RendererPatcher;
function RendererPatcher(RendererProto) {
    if (RendererProto.hasOwnProperty("width")) {
        return;
    }
    RendererProto.screen = null;
    Object.defineProperties(RendererProto, {
        width: {
            get: function get() {
                if (!this.screen) {
                    this.screen = new PIXI.Rectangle(0, 0, 1, 1);
                }
                return this.screen.width;
            },
            set: function set(value) {
                if (!this.screen) {
                    this.screen = new PIXI.Rectangle(0, 0, 1, 1);
                }
                this.screen.width = value;
            }
        },
        height: {
            get: function get() {
                if (!this.screen) {
                    this.screen = new PIXI.Rectangle(0, 0, 1, 1);
                }
                return this.screen.height;
            },
            set: function set(value) {
                if (!this.screen) {
                    this.screen = new PIXI.Rectangle(0, 0, 1, 1);
                }
                this.screen.height = value;
            }
        }
    });
}

},{}],4:[function(require,module,exports){
"use strict";

var _Application = require("./Application");

var _Application2 = _interopRequireDefault(_Application);

var _RendererPatcher = require("./RendererPatcher");

var _RendererPatcher2 = _interopRequireDefault(_RendererPatcher);

var _FilterPatcherV = require("./FilterPatcherV3");

var _FilterPatcherV2 = _interopRequireDefault(_FilterPatcherV);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _RendererPatcher2.default)(PIXI.CanvasRenderer.prototype);
(0, _RendererPatcher2.default)(PIXI.WebGLRenderer.prototype);

if (!PIXI.Ticker && PIXI.ticker) {
    Object.assign(PIXI, PIXI.ticker);
}

if (!PIXI.Application) {
    PIXI.Application = _Application2.default;
}

if (!PIXI.filters.VoidFilter) {
    (0, _FilterPatcherV2.default)(PIXI);
}

if (!PIXI.particles) {
    PIXI.particles = {
        ParticleContainer: PIXI.ParticleContainer
    };
} else if (!PIXI.ParticleContainer) {
    PIXI.ParticleContainer = PIXI.particles.ParticleContainer;
}

module.exports = PIXI;

},{"./Application":1,"./FilterPatcherV3":2,"./RendererPatcher":3}]},{},[4])(4)
});


//# sourceMappingURL=pixi-legacy.js.map
