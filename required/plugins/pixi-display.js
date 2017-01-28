PIXI.DISPLAY_FLAG = {
    AUTO_CHILDREN: 0,
    AUTO_CONTAINER: 1,
    AUTO_OBJECT: 2,
    MANUAL_CONTAINER: 3
};
var WebGLRenderer = PIXI.WebGLRenderer;
var CanvasRenderer = PIXI.CanvasRenderer;
Object.assign(PIXI.Container.prototype, {
    displayList: null,
    displayChildren: null,
    displayParent: null,
    updateTransform: function () {
        if (!this.visible) {
            return;
        }
        this.containerUpdateTransform();
        if (this.displayList) {
            this.displayList.update(this);
        }
    },
    renderCanvas: function (renderer) {
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }
        this.displayOrder = renderer.incDisplayOrder();
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }
        if (this.displayList) {
            this.displayList.renderCanvas(this, renderer);
            return;
        }
        this.containerRenderCanvas(renderer);
    },
    renderWebGL: function (renderer) {
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }
        this.displayOrder = renderer.incDisplayOrder();
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }
        if (this.displayList) {
            this.displayList.renderWebGL(this, renderer);
            return;
        }
        this.containerRenderWebGL(renderer);
    },
    containerRenderWebGL: PIXI.Container.prototype.renderWebGL,
    containerRenderCanvas: PIXI.Container.prototype.renderCanvas
});
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var pixi_display;
(function (pixi_display) {
    var utils = PIXI.utils;
    var DisplayGroup = (function (_super) {
        __extends(DisplayGroup, _super);
        function DisplayGroup(zIndex, sorting) {
            _super.call(this);
            this.currentIndex = 0;
            this.zIndex = 0;
            this.enableSort = false;
            this.computedChildren = [];
            this.currentDisplayList = null;
            this.currentIndex = 0;
            this.zIndex = zIndex || 0;
            this.enableSort = !!sorting;
            if (typeof sorting === 'function') {
                this.on('add', sorting);
            }
        }
        DisplayGroup.compareZOrder = function (a, b) {
            if (a.zOrder < b.zOrder) {
                return 1;
            }
            if (a.zOrder > b.zOrder) {
                return -1;
            }
            return a.updateOrder - b.updateOrder;
        };
        ;
        DisplayGroup.prototype.clear = function () {
            var list = this.computedChildren;
            for (var i = 0; i < list.length; i++) {
                var children = list[i].displayChildren;
                if (children && children.length > 0) {
                    for (var j = 0; j < children.length; j++) {
                        children[j].displayParent = null;
                    }
                    children.length = 0;
                }
                list[i].displayParent = null;
            }
            list.length = 0;
            this.currentDisplayList = null;
            this.currentIndex = 0;
        };
        ;
        DisplayGroup.prototype.add = function (displayObject) {
            displayObject.displayOrder = this.computedChildren.length;
            this.emit('add', displayObject);
            this.computedChildren.push(displayObject);
        };
        ;
        DisplayGroup.prototype.update = function () {
            this.emit('update');
            if (this.enableSort && this.computedChildren.length > 1) {
                this.computedChildren.sort(DisplayGroup.compareZOrder);
            }
        };
        ;
        DisplayGroup.prototype.renderWebGL = function (parentContainer, renderer) {
            var list = this.computedChildren;
            for (var j = 0; j < list.length; j++) {
                var container = list[j];
                if (container.displayFlag) {
                    container.renderWebGL(renderer);
                }
                else {
                    container.displayOrder = renderer.incDisplayOrder();
                    container._renderWebGL(renderer);
                    var children = container.displayChildren;
                    if (children && children.length) {
                        for (var k = 0; k < children.length; k++) {
                            var child = children[k];
                            child.displayOrder = renderer.incDisplayOrder();
                            if (child.displayFlag) {
                                child.renderWebGL(renderer);
                            }
                            else {
                                child._renderWebGL(renderer);
                            }
                        }
                    }
                }
            }
        };
        ;
        DisplayGroup.prototype.renderCanvas = function (parentContainer, renderer) {
            var list = this.computedChildren;
            for (var j = 0; j < list.length; j++) {
                var container = list[j];
                if (container.displayFlag) {
                    container.renderCanvas(renderer);
                }
                else {
                    container.displayOrder = renderer.incDisplayOrder();
                    container._renderCanvas(renderer);
                    var children = container.displayChildren;
                    if (children && children.length) {
                        for (var k = 0; k < children.length; k++) {
                            var child = children[k];
                            child.displayOrder = renderer.incDisplayOrder();
                            if (child.displayFlag) {
                                child.renderCanvas(renderer);
                            }
                            else {
                                child._renderCanvas(renderer);
                            }
                        }
                    }
                }
            }
        };
        ;
        return DisplayGroup;
    }(utils.EventEmitter));
    pixi_display.DisplayGroup = DisplayGroup;
})(pixi_display || (pixi_display = {}));
var pixi_display;
(function (pixi_display) {
    var utils = PIXI.utils;
    var DisplayList = (function (_super) {
        __extends(DisplayList, _super);
        function DisplayList() {
            _super.call(this);
            this.container = null;
            this.totalElements = 0;
            this.displayGroups = [];
            this.defaultDisplayGroup = new pixi_display.DisplayGroup(0, false);
        }
        DisplayList.prototype.clear = function () {
            var list = this.displayGroups;
            for (var i = 0; i < list.length; i++) {
                list[i].clear();
            }
            list.length = 0;
            this.totalElements = 0;
            this.container = null;
        };
        ;
        DisplayList.prototype.destroy = function () {
            this.clear();
        };
        ;
        DisplayList.compareZIndex = function (a, b) {
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex;
            }
            return a.currentIndex - b.currentIndex;
        };
        ;
        DisplayList.prototype._addRecursive = function (displayObject, parent) {
            var container = displayObject;
            if (!container.visible || !container.renderable) {
                return;
            }
            var groups = this.displayGroups;
            var group = parent.displayGroup;
            container.updateOrder = this.totalElements++;
            if (container.displayGroup) {
                group = container.displayGroup;
                if (!group.currentDisplayList) {
                    group.currentDisplayList = this;
                    group.currentIndex = groups.length;
                    groups.push(group);
                }
                group.add(container);
                container.displayParent = container;
            }
            else {
                container.displayParent = parent;
                if (!parent.displayChildren) {
                    parent.displayChildren = [];
                }
                parent.displayChildren.push(container);
            }
            if (container.displayFlag !== PIXI.DISPLAY_FLAG.MANUAL_CONTAINER) {
                var children = container.children;
                if (children && children.length > 0) {
                    if (container._mask || container._filters && container._filters.length || container.displayList) {
                        container.displayFlag = PIXI.DISPLAY_FLAG.AUTO_CONTAINER;
                    }
                    else {
                        container.displayFlag = PIXI.DISPLAY_FLAG.AUTO_CHILDREN;
                        for (var i = 0; i < children.length; i++) {
                            this._addRecursive(children[i], container.displayParent);
                        }
                    }
                }
                else {
                    container.displayFlag = PIXI.DISPLAY_FLAG.AUTO_OBJECT;
                }
            }
        };
        ;
        DisplayList.prototype.update = function (parentContainer) {
            this.clear();
            var tempGroup = parentContainer.displayGroup;
            this.displayGroups.push(this.defaultDisplayGroup);
            this.defaultDisplayGroup.add(parentContainer);
            this.container = parentContainer;
            var children = parentContainer.children;
            var i = 0;
            for (i = 0; i < children.length; i++) {
                this._addRecursive(children[i], parentContainer);
            }
            var groups = this.displayGroups;
            groups.sort(DisplayList.compareZIndex);
            for (i = 0; i < groups.length; i++) {
                groups[i].currentIndex = i;
                groups[i].update();
            }
            this.emit('afterUpdate');
        };
        ;
        DisplayList.prototype.renderWebGL = function (parentContainer, renderer) {
            parentContainer.displayFlag = PIXI.DISPLAY_FLAG.AUTO_CHILDREN;
            var groups = this.displayGroups;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                group.renderWebGL(parentContainer, renderer);
            }
        };
        ;
        DisplayList.prototype.renderCanvas = function (parentContainer, renderer) {
            var groups = this.displayGroups;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                group.renderCanvas(parentContainer, renderer);
            }
        };
        ;
        return DisplayList;
    }(utils.EventEmitter));
    pixi_display.DisplayList = DisplayList;
})(pixi_display || (pixi_display = {}));
Object.assign(PIXI.DisplayObject.prototype, {
    displayGroup: null,
    displayFlag: PIXI.DISPLAY_FLAG.AUTO_CHILDREN,
    displayParent: null,
    zOrder: 0,
    updateOrder: 0,
    displayOrder: 0
});
var pixi_display;
(function (pixi_display) {
    var InteractionManager = PIXI.interaction.InteractionManager;
    Object.assign(InteractionManager.prototype, {
        _queue: [[], []],
        _displayProcessInteractive: function (point, displayObject, hitTestOrder, interactive) {
            if (!displayObject || !displayObject.visible) {
                return 0;
            }
            var hit = 0, interactiveParent = interactive = displayObject.interactive || interactive;
            if (displayObject.hitArea) {
                interactiveParent = false;
            }
            var mask = displayObject._mask;
            if (hitTestOrder < Infinity && mask) {
                if (!mask.containsPoint(point)) {
                    hitTestOrder = Infinity;
                }
            }
            if (hitTestOrder < Infinity && displayObject.filterArea) {
                if (!displayObject.filterArea.contains(point.x, point.y)) {
                    hitTestOrder = Infinity;
                }
            }
            var children = displayObject.children;
            if (displayObject.interactiveChildren && children) {
                for (var i = children.length - 1; i >= 0; i--) {
                    var child = children[i];
                    var hitChild = this._displayProcessInteractive(point, child, hitTestOrder, interactiveParent);
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
                    this._queueAdd(displayObject, hit);
                }
            }
            return hit;
        },
        processInteractive: function (strangeStuff, displayObject, func, hitTest, interactive) {
            var interactionEvent = null;
            var point = null;
            if (strangeStuff.data &&
                strangeStuff.data.global) {
                interactionEvent = strangeStuff;
                point = interactionEvent.data.global;
            }
            else {
                point = strangeStuff;
            }
            this._startInteractionProcess();
            this._displayProcessInteractive(point, displayObject, hitTest ? 0 : Infinity, false);
            this._finishInteractionProcess(interactionEvent, func);
        },
        _startInteractionProcess: function () {
            this._eventDisplayOrder = 1;
            if (!this._queue) {
                this._queue = [[], []];
            }
            this._queue[0].length = 0;
            this._queue[1].length = 0;
        },
        _queueAdd: function (displayObject, order) {
            var queue = this._queue;
            if (order < this._eventDisplayOrder) {
                queue[0].push(displayObject);
            }
            else {
                if (order > this._eventDisplayOrder) {
                    this._eventDisplayOrder = order;
                    var q = queue[1];
                    for (var i = 0; i < q.length; i++) {
                        queue[0].push(q[i]);
                    }
                    queue[1].length = 0;
                }
                queue[1].push(displayObject);
            }
        },
        _finishInteractionProcess: function (event, func) {
            var queue = this._queue;
            var q = queue[0];
            var i = 0;
            for (; i < q.length; i++) {
                if (event) {
                    func(event, q[i], false);
                }
                else {
                    func(q[i], false);
                }
            }
            q = queue[1];
            for (i = 0; i < q.length; i++) {
                if (event) {
                    if (!event.target) {
                        event.target = q[i];
                    }
                    func(event, q[i], true);
                }
                else {
                    func(q[i], true);
                }
            }
        }
    });
})(pixi_display || (pixi_display = {}));
Object.assign(WebGLRenderer.prototype, {
    _lastDisplayOrder: 0,
    incDisplayOrder: function () {
        return ++this._lastDisplayOrder;
    },
    _oldRender: WebGLRenderer.prototype.render,
    render: function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
});
Object.assign(CanvasRenderer.prototype, {
    _lastDisplayOrder: 0,
    incDisplayOrder: function () {
        return ++this._lastDisplayOrder;
    },
    _oldRender: CanvasRenderer.prototype.render,
    render: function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
});
Object.assign(PIXI, {
    display: pixi_display,
    DisplayGroup: pixi_display.DisplayGroup,
    DisplayList: pixi_display.DisplayList
});
//# sourceMappingURL=pixi-display.js.map