/*!
 * pixi-legacy - v1.0.0
 * Compiled Sat, 28 Jan 2017 00:28:31 UTC
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

var _Application = require("./Application");

var _Application2 = _interopRequireDefault(_Application);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!PIXI.Ticker && PIXI.ticker) {
    Object.assign(PIXI, PIXI.ticker);
}

if (!PIXI.Application) {
    PIXI.Application = _Application2.default;
}

module.exports = PIXI;

},{"./Application":1}]},{},[2])(2)
});


//# sourceMappingURL=pixi-legacy.js.map
