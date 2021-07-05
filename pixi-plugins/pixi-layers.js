/* eslint-disable */
 
/*!
 * @pixi/layers - v1.0.5
 * Compiled Mon, 05 Jul 2021 14:07:01 UTC
 *
 * @pixi/layers is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2017-2021, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.display = this.PIXI.display || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/display'), require('@pixi/core'), require('@pixi/math'), require('@pixi/utils'), require('@pixi/settings')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/display', '@pixi/core', '@pixi/math', '@pixi/utils', '@pixi/settings'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global._pixi_layers = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI.utils, global.PIXI));
}(this, (function (exports, display, core, math, utils, settings) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var utils__namespace = /*#__PURE__*/_interopNamespace(utils);

    function generateLayerContainerRenderMethod(originalRender) {
        return function render(renderer) {
            if (this._activeParentLayer && this._activeParentLayer !== renderer._activeLayer) {
                return;
            }
            if (!this.visible) {
                this.displayOrder = 0;
                return;
            }
            this.displayOrder = renderer.incDisplayOrder();
            if (this.worldAlpha <= 0 || !this.renderable) {
                return;
            }
            renderer._activeLayer = null;
            originalRender.call(this, renderer);
            renderer._activeLayer = this._activeParentLayer;
        };
    }
    function containerRender(renderer) {
        if (this._activeParentLayer && this._activeParentLayer !== renderer._activeLayer) {
            return;
        }
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }
        this.displayOrder = renderer.incDisplayOrder();
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }
        renderer._activeLayer = null;
        this.containerRenderWebGL(renderer);
        renderer._activeLayer = this._activeParentLayer;
    }
    function applyDisplayMixin() {
        if (display.DisplayObject.prototype.displayOrder !== undefined) {
            return;
        }
        Object.assign(display.DisplayObject.prototype, {
            parentLayer: null,
            _activeParentLayer: null,
            parentGroup: null,
            zOrder: 0,
            zIndex: 0,
            updateOrder: 0,
            displayOrder: 0,
            layerableChildren: true,
            isLayer: false
        });
        const ContainerProto = display.Container.prototype;
        ContainerProto.containerRenderWebGL = ContainerProto.render;
        ContainerProto.render = containerRender;
    }
    function applyContainerRenderMixin(CustomRenderContainer) {
        if (CustomRenderContainer.originalRenderWebGL) {
            return;
        }
        CustomRenderContainer.originalRenderWebGL = CustomRenderContainer.render;
        CustomRenderContainer.render = generateLayerContainerRenderMethod(CustomRenderContainer.render);
        if (CustomRenderContainer.renderCanvas) {
            CustomRenderContainer.originalRenderWebGL = CustomRenderContainer.renderCanvas;
            CustomRenderContainer.renderCanvas = generateLayerContainerRenderMethod(CustomRenderContainer.renderCanvas);
        }
    }
    function applyParticleMixin(ParticleContainer) {
        ParticleContainer.prototype.layerableChildren = false;
        this.applyRenderMixing(ParticleContainer);
    }

    class LayersTreeSearch {
        constructor() {
            this._tempPoint = new math.Point();
            this._queue = [[], []];
            this._eventDisplayOrder = 0;
            this.worksWithLayers = true;
        }
        recursiveFindHit(point, displayObject, hitTestOrder, interactive, outOfMask) {
            if (!displayObject || !displayObject.visible) {
                return 0;
            }
            let hit = 0;
            let interactiveParent = interactive = displayObject.interactive || interactive;
            if (displayObject.hitArea) {
                interactiveParent = false;
            }
            if (displayObject._activeParentLayer) {
                outOfMask = false;
            }
            const mask = displayObject._mask;
            if (hitTestOrder < Infinity && mask) {
                if (!mask.containsPoint(point)) {
                    outOfMask = true;
                }
            }
            if (hitTestOrder < Infinity && displayObject.filterArea) {
                if (!displayObject.filterArea.contains(point.x, point.y)) {
                    outOfMask = true;
                }
            }
            const children = displayObject.children;
            if (displayObject.interactiveChildren && children) {
                for (let i = children.length - 1; i >= 0; i--) {
                    const child = children[i];
                    const hitChild = this.recursiveFindHit(point, child, hitTestOrder, interactiveParent, outOfMask);
                    if (hitChild) {
                        if (!child.parent) {
                            continue;
                        }
                        hit = hitChild;
                        hitTestOrder = hitChild;
                    }
                }
            }
            if (interactive) {
                if (!outOfMask) {
                    if (hitTestOrder < displayObject.displayOrder) {
                        if (displayObject.hitArea) {
                            displayObject.worldTransform.applyInverse(point, this._tempPoint);
                            if (displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                                hit = displayObject.displayOrder;
                            }
                        }
                        else if (displayObject.containsPoint) {
                            if (displayObject.containsPoint(point)) {
                                hit = displayObject.displayOrder;
                            }
                        }
                    }
                    if (displayObject.interactive) {
                        this._queueAdd(displayObject, hit === Infinity ? 0 : hit);
                    }
                }
                else if (displayObject.interactive) {
                    this._queueAdd(displayObject, 0);
                }
            }
            return hit;
        }
        findHit(interactionEvent, displayObject, func, hitTest) {
            const point = interactionEvent.data.global;
            this._startInteractionProcess();
            this.recursiveFindHit(point, displayObject, hitTest ? 0 : Infinity, false, false);
            this._finishInteractionProcess(interactionEvent, func);
        }
        _startInteractionProcess() {
            this._eventDisplayOrder = 1;
            if (!this._queue) {
                this._queue = [[], []];
            }
            this._queue[0].length = 0;
            this._queue[1].length = 0;
        }
        _queueAdd(displayObject, order) {
            const queue = this._queue;
            if (order < this._eventDisplayOrder) {
                queue[0].push(displayObject);
            }
            else {
                if (order > this._eventDisplayOrder) {
                    this._eventDisplayOrder = order;
                    const q = queue[1];
                    for (let i = 0, l = q.length; i < l; i++) {
                        queue[0].push(q[i]);
                    }
                    queue[1].length = 0;
                }
                queue[1].push(displayObject);
            }
        }
        _finishInteractionProcess(event, func) {
            const queue = this._queue;
            let q = queue[0];
            for (let i = 0, l = q.length; i < l; i++) {
                func(event, q[i], false);
            }
            q = queue[1];
            for (let i = 0, l = q.length; i < l; i++) {
                if (!event.target) {
                    event.target = q[i];
                }
                if (func) {
                    func(event, q[i], true);
                }
            }
        }
    }

    function generateLayerRendererMethod(_oldRender) {
        return function render(displayObject, options, arg1, arg2, arg3) {
            if (!options || (!options.renderTexture && !options.baseTexture)) {
                this._lastDisplayOrder = 0;
            }
            this._activeLayer = null;
            if (displayObject.isStage) {
                displayObject.updateStage();
            }
            if (this.plugins.interaction && !this.plugins.interaction.search.worksWithLayers) {
                this.plugins.interaction.search = new LayersTreeSearch();
            }
            _oldRender.call(this, displayObject, options, arg1, arg2, arg3);
        };
    }
    function applyRendererMixin(rendererClass) {
        const RendererProto = rendererClass.prototype;
        if (RendererProto._oldRender) {
            return;
        }
        Object.assign(RendererProto, {
            _lastDisplayOrder: 0,
            _activeLayer: null,
            incDisplayOrder() {
                return ++this._lastDisplayOrder;
            },
            _oldRender: core.Renderer.prototype.render,
        });
        RendererProto._oldRender = RendererProto.render;
        RendererProto.render = generateLayerRendererMethod(RendererProto.render);
    }
    function applyCanvasMixin(canvasRenderClass) {
        if (!canvasRenderClass) {
            console.log('@pixi/layers: Canvas mixin was called with empty parameter. Are you sure that you even need this line?');
            return;
        }
        applyRendererMixin(canvasRenderClass);
        const ContainerProto = display.Container.prototype;
        if (ContainerProto.containerRenderCanvas) {
            return;
        }
        ContainerProto.containerRenderCanvas = ContainerProto.renderCanvas;
        ContainerProto.renderCanvas = generateLayerContainerRenderMethod(ContainerProto.renderCanvas);
    }

    class Group extends utils__namespace.EventEmitter {
        constructor(zIndex, sorting) {
            super();
            this.useRenderTexture = false;
            this.useDoubleBuffer = false;
            this.sortPriority = 0;
            this.clearColor = new Float32Array([0, 0, 0, 0]);
            this.canDrawWithoutLayer = false;
            this.canDrawInParentStage = true;
            this._activeLayer = null;
            this._activeStage = null;
            this._activeChildren = [];
            this._lastUpdateId = -1;
            this.zIndex = zIndex || 0;
            this.enableSort = !!sorting;
            if (typeof sorting === 'function') {
                this.on('sort', sorting);
            }
        }
        doSort(layer, sorted) {
            if (this.listeners('sort', true)) {
                for (let i = 0; i < sorted.length; i++) {
                    this.emit('sort', sorted[i]);
                }
            }
            sorted.sort(Group.compareZIndex);
        }
        static compareZIndex(a, b) {
            if (a.zOrder < b.zOrder) {
                return -1;
            }
            if (a.zOrder > b.zOrder) {
                return 1;
            }
            return a.updateOrder - b.updateOrder;
        }
        clear() {
            this._activeLayer = null;
            this._activeStage = null;
            this._activeChildren.length = 0;
        }
        _resolveChildDisplayObject(stage, displayObject) {
            this.check(stage);
            displayObject._activeParentLayer = this._activeLayer;
            if (this._activeLayer) {
                this._activeLayer._activeChildren.push(displayObject);
            }
            else {
                this._activeChildren.push(displayObject);
            }
        }
        _resolveLayer(stage, layer) {
            this.check(stage);
            if (this._activeLayer) {
                Group.conflict();
            }
            this._activeLayer = layer;
            this._activeStage = stage;
        }
        check(stage) {
            if (this._lastUpdateId < Group._layerUpdateId) {
                this._lastUpdateId = Group._layerUpdateId;
                this.clear();
                this._activeStage = stage;
            }
            else if (this.canDrawInParentStage) {
                let current = this._activeStage;
                while (current && current !== stage) {
                    current = current._activeParentStage;
                }
                this._activeStage = current;
                if (current === null) {
                    this.clear();
                }
            }
        }
        static conflict() {
            if (Group._lastLayerConflict + 5000 < Date.now()) {
                Group._lastLayerConflict = Date.now();
                console.log(`@pixi/layers found two layers with the same group in one stage - that's not healthy. Please place a breakpoint here and debug it`);
            }
        }
    }
    Group._layerUpdateId = 0;
    Group._lastLayerConflict = 0;

    class LayerTextureCache {
        constructor(layer) {
            this.layer = layer;
            this.renderTexture = null;
            this.doubleBuffer = null;
            this.currentBufferIndex = 0;
            this._tempRenderTarget = null;
            this._tempRenderTargetSource = new math.Rectangle();
            this._tempRenderTargetDestination = new math.Rectangle();
        }
        init(renderer) {
            const width = renderer ? renderer.screen.width : 100;
            const height = renderer ? renderer.screen.height : 100;
            const resolution = renderer ? renderer.resolution : settings.settings.RESOLUTION;
            this.renderTexture = core.RenderTexture.create({ width, height, resolution });
            if (this.layer.group.useDoubleBuffer) {
                this.doubleBuffer = [
                    core.RenderTexture.create({ width, height, resolution }),
                    core.RenderTexture.create({ width, height, resolution })
                ];
            }
        }
        getRenderTexture() {
            if (!this.renderTexture) {
                this.init();
            }
            return this.renderTexture;
        }
        pushTexture(renderer) {
            const screen = renderer.screen;
            if (!this.renderTexture) {
                this.init(renderer);
            }
            const rt = this.renderTexture;
            const group = this.layer.group;
            const db = this.doubleBuffer;
            if (rt.width !== screen.width
                || rt.height !== screen.height
                || rt.baseTexture.resolution !== renderer.resolution) {
                rt.baseTexture.resolution = renderer.resolution;
                rt.resize(screen.width, screen.height);
                if (db) {
                    db[0].baseTexture.resolution = renderer.resolution;
                    db[0].resize(screen.width, screen.height);
                    db[1].baseTexture.resolution = renderer.resolution;
                    db[1].resize(screen.width, screen.height);
                }
            }
            if (db) {
                db[0].framebuffer.multisample = rt.framebuffer.multisample;
                db[1].framebuffer.multisample = rt.framebuffer.multisample;
            }
            this._tempRenderTarget = renderer.renderTexture.current;
            this._tempRenderTargetSource.copyFrom(renderer.renderTexture.sourceFrame);
            this._tempRenderTargetDestination.copyFrom(renderer.renderTexture.destinationFrame);
            renderer.batch.flush();
            if (group.useDoubleBuffer) {
                let buffer = db[this.currentBufferIndex];
                if (!buffer.baseTexture._glTextures[renderer.CONTEXT_UID]) {
                    renderer.renderTexture.bind(buffer, undefined, undefined);
                    renderer.texture.bind(buffer);
                    if (group.clearColor) {
                        renderer.renderTexture.clear(group.clearColor);
                    }
                }
                renderer.texture.unbind(rt.baseTexture);
                rt.baseTexture._glTextures = buffer.baseTexture._glTextures;
                rt.baseTexture.framebuffer = buffer.baseTexture.framebuffer;
                buffer = db[1 - this.currentBufferIndex];
                renderer.renderTexture.bind(buffer, undefined, undefined);
            }
            else {
                renderer.renderTexture.bind(rt, undefined, undefined);
            }
            if (group.clearColor) {
                renderer.renderTexture.clear(group.clearColor);
            }
            const filterStack = renderer.filter.defaultFilterStack;
            if (filterStack.length > 1) {
                filterStack[filterStack.length - 1].renderTexture = renderer.renderTexture.current;
            }
        }
        popTexture(renderer) {
            renderer.batch.flush();
            renderer.framebuffer.blit();
            const filterStack = renderer.filter.defaultFilterStack;
            if (filterStack.length > 1) {
                filterStack[filterStack.length - 1].renderTexture = this._tempRenderTarget;
            }
            renderer.renderTexture.bind(this._tempRenderTarget, this._tempRenderTargetSource, this._tempRenderTargetDestination);
            this._tempRenderTarget = null;
            const rt = this.renderTexture;
            const group = this.layer.group;
            const db = this.doubleBuffer;
            if (group.useDoubleBuffer) {
                renderer.texture.unbind(rt.baseTexture);
                this.currentBufferIndex = 1 - this.currentBufferIndex;
                const buffer = db[this.currentBufferIndex];
                rt.baseTexture._glTextures = buffer.baseTexture._glTextures;
                rt.baseTexture.framebuffer = buffer.baseTexture.framebuffer;
            }
        }
        destroy() {
            if (this.renderTexture) {
                this.renderTexture.destroy();
                if (this.doubleBuffer) {
                    this.doubleBuffer[0].destroy(true);
                    this.doubleBuffer[1].destroy(true);
                }
            }
        }
    }
    class Layer extends display.Container {
        constructor(group = null) {
            super();
            this.isLayer = true;
            this.group = null;
            this._activeChildren = [];
            this._tempChildren = null;
            this._activeStageParent = null;
            this._sortedChildren = [];
            this._tempLayerParent = null;
            this.insertChildrenBeforeActive = true;
            this.insertChildrenAfterActive = true;
            if (group) {
                this.group = group;
                this.zIndex = group.zIndex;
            }
            else {
                this.group = new Group(0, false);
            }
            this._tempChildren = this.children;
        }
        get useRenderTexture() {
            return this.group.useRenderTexture;
        }
        set useRenderTexture(value) {
            this.group.useRenderTexture = value;
        }
        get useDoubleBuffer() {
            return this.group.useDoubleBuffer;
        }
        set useDoubleBuffer(value) {
            this.group.useDoubleBuffer = value;
        }
        get clearColor() {
            return this.group.clearColor;
        }
        set clearColor(value) {
            this.group.clearColor = value;
        }
        get sortPriority() {
            return this.group.sortPriority;
        }
        set sortPriority(value) {
            this.group.sortPriority = value;
        }
        getRenderTexture() {
            if (!this.textureCache) {
                this.textureCache = new LayerTextureCache(this);
            }
            return this.textureCache.getRenderTexture();
        }
        doSort() {
            this.group.doSort(this, this._sortedChildren);
        }
        destroy(options) {
            if (this.textureCache) {
                this.textureCache.destroy();
                this.textureCache = null;
            }
            super.destroy(options);
        }
        render(renderer) {
            if (!this.prerender(renderer)) {
                return;
            }
            if (this.group.useRenderTexture) {
                if (!this.textureCache) {
                    this.textureCache = new LayerTextureCache(this);
                }
                this.textureCache.pushTexture(renderer);
            }
            this.containerRenderWebGL(renderer);
            this.postrender(renderer);
            if (this.group.useRenderTexture) {
                this.textureCache.popTexture(renderer);
            }
        }
        renderCanvas(renderer) {
            if (this.prerender(renderer)) {
                this.containerRenderCanvas(renderer);
                this.postrender(renderer);
            }
        }
        _onBeginLayerSubtreeTraversal(stage) {
            const active = this._activeChildren;
            this._activeStageParent = stage;
            this.group._resolveLayer(stage, this);
            const groupChildren = this.group._activeChildren;
            active.length = 0;
            for (let i = 0; i < groupChildren.length; i++) {
                groupChildren[i]._activeParentLayer = this;
                active.push(groupChildren[i]);
            }
            groupChildren.length = 0;
        }
        _onEndLayerSubtreeTraversal() {
            const children = this.children;
            const active = this._activeChildren;
            const sorted = this._sortedChildren;
            for (let i = 0; i < active.length; i++) {
                this.emit('display', active[i]);
            }
            sorted.length = 0;
            if (this.insertChildrenBeforeActive) {
                for (let i = 0; i < children.length; i++) {
                    sorted.push(children[i]);
                }
            }
            for (let i = 0; i < active.length; i++) {
                sorted.push(active[i]);
            }
            if (!this.insertChildrenBeforeActive
                && this.insertChildrenAfterActive) {
                for (let i = 0; i < children.length; i++) {
                    sorted.push(children[i]);
                }
            }
            if (this.group.enableSort) {
                this.doSort();
            }
        }
        prerender(renderer) {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return false;
            }
            if (!this.visible) {
                this.displayOrder = 0;
                return false;
            }
            this.displayOrder = renderer.incDisplayOrder();
            if (this.worldAlpha <= 0 || !this.renderable) {
                return false;
            }
            if (this.children !== this._sortedChildren
                && this._tempChildren !== this.children) {
                this._tempChildren = this.children;
            }
            this._boundsID++;
            this.children = this._sortedChildren;
            this._tempLayerParent = renderer._activeLayer;
            renderer._activeLayer = this;
            return true;
        }
        postrender(renderer) {
            this.children = this._tempChildren;
            renderer._activeLayer = this._tempLayerParent;
            this._tempLayerParent = null;
        }
    }

    class Stage extends Layer {
        constructor() {
            super(...arguments);
            this.isStage = true;
            this._tempGroups = [];
            this._activeLayers = [];
            this._activeParentStage = null;
        }
        clear() {
            this._activeLayers.length = 0;
            this._tempGroups.length = 0;
        }
        destroy(options) {
            this.clear();
            super.destroy(options);
        }
        updateStage() {
            this._activeParentStage = null;
            Group._layerUpdateId++;
            this._updateStageInner();
        }
        updateAsChildStage(stage) {
            this._activeParentStage = stage;
            Stage._updateOrderCounter = 0;
            this._updateStageInner();
        }
        _updateStageInner() {
            this.clear();
            this._addRecursive(this);
            const layers = this._activeLayers;
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (layer.group.sortPriority) {
                    layer._onEndLayerSubtreeTraversal();
                    const sorted = layer._sortedChildren;
                    for (let j = 0; j < sorted.length; j++) {
                        this._addRecursiveChildren(sorted[j]);
                    }
                }
            }
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (!layer.group.sortPriority) {
                    layer._onEndLayerSubtreeTraversal();
                }
            }
        }
        _addRecursive(displayObject) {
            if (!displayObject.visible) {
                return;
            }
            if (displayObject.isLayer) {
                const layer = displayObject;
                this._activeLayers.push(layer);
                layer._onBeginLayerSubtreeTraversal(this);
            }
            if (displayObject !== this && displayObject.isStage) {
                const stage = displayObject;
                stage.updateAsChildStage(this);
                return;
            }
            displayObject._activeParentLayer = null;
            let group = displayObject.parentGroup;
            if (group) {
                group._resolveChildDisplayObject(this, displayObject);
            }
            const layer = displayObject.parentLayer;
            if (layer) {
                group = layer.group;
                group._resolveChildDisplayObject(this, displayObject);
            }
            displayObject.updateOrder = ++Stage._updateOrderCounter;
            if (displayObject.alpha <= 0 || !displayObject.renderable
                || !displayObject.layerableChildren
                || (group && group.sortPriority)) {
                return;
            }
            const children = displayObject.children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++) {
                    this._addRecursive(children[i]);
                }
            }
        }
        _addRecursiveChildren(displayObject) {
            if (displayObject.alpha <= 0 || !displayObject.renderable
                || !displayObject.layerableChildren) {
                return;
            }
            const children = displayObject.children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++) {
                    this._addRecursive(children[i]);
                }
            }
        }
    }
    Stage._updateOrderCounter = 0;

    applyDisplayMixin();
    applyRendererMixin(core.Renderer);

    exports.Group = Group;
    exports.Layer = Layer;
    exports.LayerTextureCache = LayerTextureCache;
    exports.Stage = Stage;
    exports.applyCanvasMixin = applyCanvasMixin;
    exports.applyContainerRenderMixin = applyContainerRenderMixin;
    exports.applyDisplayMixin = applyDisplayMixin;
    exports.applyParticleMixin = applyParticleMixin;
    exports.applyRendererMixin = applyRendererMixin;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof _pixi_layers !== 'undefined') { Object.assign(this.PIXI.display, _pixi_layers); }
//# sourceMappingURL=pixi-layers.umd.js.map
