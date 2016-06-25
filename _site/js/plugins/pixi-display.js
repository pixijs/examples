(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @mixin
 */
var CanvasRendererMixin = {
    _oldRender: PIXI.CanvasRenderer.prototype.render,
    render: function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
};

module.exports = CanvasRendererMixin;

},{}],2:[function(require,module,exports){
var Const = {
    /**
     * controls RenderList behaviour. AUTO_ will be assigned by renderlist itself
     */
    DISPLAY_FLAG: {
        /**
         * pass through, recursively go into children
         */
        AUTO_CHILDREN: 0,
        /**
         * container will handle it itself
         */
        AUTO_CONTAINER: 1,
        /**
         * like DisplayObject, no children
         */
        AUTO_OBJECT: 2,
        /**
         * Container will always handle rendering itself, no need to go inside
         */
        MANUAL_CONTAINER: 3
    }
};

module.exports = Const;

},{}],3:[function(require,module,exports){
/**
 * @mixin
 */
var ContainerMixin = {
    /**
     * @type {PIXI.DisplayList}
     */
    displayList: null,

    /**
     * calculated display children in last
     * @type {PIXI.DisplayObject[]}
     */
    displayChildren: null,

    updateTransform: function () {
        if (!this.visible) {
            return;
        }
        this.containerUpdateTransform();
        if (this.displayList) {
            this.displayList.update(this);
        }
    },

    /**
     * Renders the object using the Canvas renderer
     *
     * @param renderer {PIXI.CanvasRenderer} The renderer
     */
    renderCanvas: function (renderer) {
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }

        this.displayOrder = renderer.incDisplayOrder();

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        //hook for displayList

        if (this.displayList) {
            this.displayList.renderCanvas(this, renderer);
            return;
        }

        this.containerRenderCanvas(renderer);
    },

    /**
     * Renders the object using the WebGL renderer
     *
     * @param renderer {PIXI.WebGLRenderer} The renderer
     */
    renderWebGL: function (renderer) {
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }

        this.displayOrder = renderer.incDisplayOrder();

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        //hook for displayList

        if (this.displayList) {
            this.displayList.renderWebGL(this, renderer);
            return;
        }


        this.containerRenderWebGL(renderer);
    },
    containerRenderWebGL: PIXI.Container.prototype.renderWebGL,
    containerRenderCanvas: PIXI.Container.prototype.renderCanvas
};

module.exports = ContainerMixin;

},{}],4:[function(require,module,exports){
var EventEmitter = PIXI.utils.EventEmitter;
/**
 * A shared component for multiple DisplayObject's allows to specify rendering order for them
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 * @param zIndex {number} z-index for display group
 * @param sorting {boolean | Function} if you need to sort elements inside, please provide function that will set displayObject.zOrder accordingly
 */

function DisplayGroup(zIndex, sorting) {
    EventEmitter.call(this);
    /**
     * Children that were rendered in last run
     * @type {Array}
     */
    this.computedChildren = [];

    /**
     * Temporary variable for manipulations inside displayList
     * @type {null}
     */
    this.currentDisplayList = null;

    /**
     * real order in the current display list
     * @type {number}
     */
    this.currentIndex = 0;

    /**
     * Groups with lesser zIndex will be rendered first. Inside one group objects with largest zOrder will be rendered first.
     * @type {number}
     */
    this.zIndex = zIndex || 0;

    /**
     * sort elements inside or not
     * @type {boolean}
     */
    this.enableSort = !!sorting;

    if (typeof sorting === 'function') {
        this.on('add', sorting);
    }
}

DisplayGroup.prototype = Object.create(EventEmitter.prototype);
DisplayGroup.prototype.constructor = DisplayGroup;
module.exports = DisplayGroup;

/**
 * 
 * @param a
 * @param b
 * @returns {number}
 */
DisplayGroup.compareZOrder = function (a, b) {
    if (a.zOrder < b.zOrder) {
        return 1;
    }
    if (a.zOrder > b.zOrder) {
        return -1;
    }
    return a.updateOrder - b.updateOrder;
};

/**
 * clears temporary variables
 */
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

/**
 * used only by displayList before sorting takes place
 * @param container {PIXI.DisplayObject}
 */
DisplayGroup.prototype.add = function (displayObject) {
    displayObject.displayOrder = this.computedChildren.length;
    this.emit('add', displayObject);
    this.computedChildren.push(displayObject);
};

/**
 * Called after all childrens are computed
 */
DisplayGroup.prototype.update = function () {
    this.emit('update');
    if (this.enableSort && this.computedChildren.length > 1) {
        this.computedChildren.sort(DisplayGroup.compareZOrder);
    }
};

},{}],5:[function(require,module,exports){
var EventEmitter = PIXI.utils.EventEmitter,
    Const = require('./Const'),
    DisplayGroup = require('./DisplayGroup');
/**
 * A component for container, sorts all children inside according to their displayGroups
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
function DisplayList() {
    EventEmitter.call(this);
    /**
     * Children that were rendered in last run
     * @type {Array}
     */
    this.displayGroups = [];

    this.container = null;

    /**
     * how many elements were rendered by display list last time
     * also it is used to generate updateOrder for them
     * @type {number}
     */
    this.totalElements = 0;

    this.defaultDisplayGroup = new DisplayGroup(0, false);
}

DisplayList.prototype = Object.create(EventEmitter.prototype);
DisplayList.prototype.constructor = DisplayList;
module.exports = DisplayList;

/**
 * clears all display lists that were used in last rendering session
 * please clear it when you stop using this displayList, otherwise you may have problems with GC in some cases
 */
DisplayList.prototype.clear = function () {
    var list = this.displayGroups;
    for (var i = 0; i < list.length; i++) {
        list[i].clear();
    }
    list.length = 0;
    this.totalElements = 0;
    this.container = null;
};

/**
 * alias for clear()
 * please call it if you stop using this displayList
 */
DisplayList.prototype.destroy = function () {
    this.clear();
};

DisplayList.compareZIndex = function (a, b) {
    if (a.zIndex !== b.zIndex) {
        return a.zIndex - b.zIndex;
    }
    return a.currentIndex - b.currentIndex;
};

/**
 *
 * @param displayObject {PIXI.DisplayObject} container that we are adding to displaylist
 * @param parent {PIXI.Container} it is not direct parent, but some of ancestors
 * @private
 */
DisplayList.prototype._addRecursive = function (container, parent) {
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
    } else {
        container.displayParent = parent;
        if (!parent.displayChildren) {
            parent.displayChildren = [];
        }
        parent.displayChildren.push(container);
    }

    if (container.displayFlag !== Const.DISPLAY_FLAG.MANUAL_CONTAINER) {
        var children = container.children;
        if (children && children.length > 0) {
            if (container._mask || container._filters && container._filters.length || container.displayList) {
                container.displayFlag = Const.DISPLAY_FLAG.AUTO_CONTAINER;
            } else {
                container.displayFlag = Const.DISPLAY_FLAG.AUTO_CHILDREN;
                for (var i = 0; i < children.length; i++) {
                    this._addRecursive(children[i], container.displayParent);
                }
            }
        } else {
            container.displayFlag = Const.DISPLAY_FLAG.AUTO_OBJECT;
        }
    }
};

/**
 * Called from container that owns this display list
 * @param parentContainer
 */
DisplayList.prototype.update = function (parentContainer) {
    this.clear();
    var tempGroup = parentContainer.displayGroup;
    this.displayGroups.push(this.defaultDisplayGroup);
    this.defaultDisplayGroup.add(parentContainer);

    this.container = parentContainer;
    var children = parentContainer.children;
    var i;
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

/**
 * renders container with webgl context
 * @param parentContainer
 * @param renderer
 */
DisplayList.prototype.renderWebGL = function (parentContainer, renderer) {
    var groups = this.displayGroups;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var list = group.computedChildren;
        for (var j = 0; j < list.length; j++) {
            var container = list[j];
            if (container.displayFlag) {
                container.renderWebGL(renderer);
            } else {
                container.displayOrder = renderer.incDisplayOrder();
                container._renderWebGL(renderer);
                var children = container.displayChildren;
                if (children && children.length) {
                    for (var k = 0; k < children.length; k++) {
                        var child = children[k];
                        child.displayOrder = renderer.incDisplayOrder();
                        if (child.displayFlag) {
                            child.renderWebGL(renderer);
                        } else {
                            child._renderWebGL(renderer);
                        }
                    }
                }
            }
        }
    }
};

/**
 * renders container with canvas2d context
 * @param parentContainer
 * @param renderer
 */
DisplayList.prototype.renderCanvas = function (parentContainer, renderer) {
    var groups = this.displayGroups;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var list = group.computedChildren;
        for (var j = 0; j < list.length; j++) {
            var container = list[j];
            if (container.displayFlag) {
                container.renderCanvas(renderer);
            } else {
                container.displayOrder = renderer.incDisplayOrder();
                container._renderCanvas(renderer);
                var children = container.displayChildren;
                if (children && children.length) {
                    for (var k = 0; k < children.length; k++) {
                        var child = children[k];
                        child.displayOrder = renderer.incDisplayOrder();
                        if (child.displayFlag) {
                            child.renderCanvas(renderer);
                        } else {
                            child._renderCanvas(renderer);
                        }
                    }
                }
            }
        }
    }
};

},{"./Const":2,"./DisplayGroup":4}],6:[function(require,module,exports){
var Const = require('./Const');

/**
 * @mixin
 */
var DisplayObjectMixin = {
    /**
     * please specify it to handle zOrder and zIndex
     * @type {PIXI.DisplayGroup}
     */
    displayGroup: null,

    /**
     * calculated inside displayList. Can be set to manual mode
     * @type {number}
     */
    displayFlag: Const.DISPLAY_FLAG.AUTO_CHILDREN,

    /**
     * calculated inside displayList. Cleared on displayList.clear()
     * Equal to 'this' if displayGroup is specified
     * @type {PIXI.Container}
     */
    displayParent: null,

    /**
     * zOrder is distance between screen and object. Objects with largest zOrder will appear first in their DisplayGroup
     * @type {number}
     */
    zOrder: 0,

    /**
     * updateOrder is calculated by DisplayList, it is required for sorting inside DisplayGroup
     * @type {number}
     */
    updateOrder: 0
};

module.exports = DisplayObjectMixin;

},{"./Const":2}],7:[function(require,module,exports){
//TODO: add maxDisplayOrder for displayObjects and use it to speed up the interaction here

var gameofbombs = !!PIXI.Camera2d;

/**
 * @mixin
 */
var InteractionManagerMixin = {
    /**
     * This is private recursive copy of processInteractive
     */
    _processInteractive: function (point, displayObject, hitTestOrder, interactive) {
        if (!displayObject || !displayObject.visible) {
            return false;
        }

        // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
        //
        // This function will now loop through all objects and then only hit test the objects it HAS to, not all of them. MUCH faster..
        // An object will be hit test if the following is true:
        //
        // 1: It is interactive.
        // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
        //
        // As another little optimisation once an interactive object has been hit we can carry on through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
        // A final optimisation is that an object is not hit test directly if a child has already been hit.

        var hit = 0,
            interactiveParent = interactive = displayObject.interactive || interactive;


        // if the displayobject has a hitArea, then it does not need to hitTest children.
        if (displayObject.hitArea) {
            interactiveParent = false;
        }

        // it has a mask! Then lets hit test that before continuing..
        if (hitTestOrder < Infinity && displayObject._mask) {
            if (!displayObject._mask.containsPoint(point)) {
                hitTestOrder = Infinity;
            }
        }

        // it has a filterArea! Same as mask but easier, its a rectangle
        if (hitTestOrder < Infinity && displayObject.filterArea) {
            if (!displayObject.filterArea.contains(point.x, point.y)) {
                hitTestOrder = Infinity;
            }
        }

        // ** FREE TIP **! If an object is not interactive or has no buttons in it (such as a game scene!) set interactiveChildren to false for that displayObject.
        // This will allow pixi to completly ignore and bypass checking the displayObjects children.
        if (displayObject.interactiveChildren) {
            var children = displayObject.children;

            for (var i = children.length - 1; i >= 0; i--) {

                var child = children[i];

                var hitChild = this._processInteractive(point, child, hitTestOrder, interactiveParent);
                // time to get recursive.. if this function will return if something is hit..
                if (hitChild) {
                    hit = hitChild;
                    hitTestOrder = hitChild;
                }
            }
        }


        // no point running this if the item is not interactive or does not have an interactive parent.
        if (interactive) {
            // if we are hit testing (as in we have no hit any objects yet)
            // We also don't need to worry about hit testing if once of the displayObjects children has already been hit!
            if (hitTestOrder < displayObject.displayOrder) {
                if (gameofbombs) {
                    //gameofbombs version
                    if (displayObject.hitArea && displayObject.isRaycastPossible) {
                        if (displayObject.containsPoint(point)) {
                            hit = displayObject.displayOrder;
                        }
                    }
                } else {
                    //pixi v4
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
            }

            if (displayObject.interactive) {
                this._queueAdd(displayObject, hit);
            }
        }

        return hit;

    },

    /**
     * This function is provides a neat way of crawling through the scene graph and running a specified function on all interactive objects it finds.
     * It will also take care of hit testing the interactive objects and passes the hit across in the function.
     *
     * @param  {PIXI.Point} point the point that is tested for collision
     * @param  {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject the displayObject that will be hit test (recursively crawls its children)
     * @param  {boolean} hitTest this indicates if the objects inside should be hit test against the point
     * @param {Function} func the function that will be called on each interactive object. The displayObject and hit will be passed to the function
     * @private
     * @return {boolean} returns true if the displayObject hit the point
     */
    processInteractive: function (point, displayObject, func, hitTest) {
        this._startInteractionProcess();
        this._processInteractive(point, displayObject, hitTest ? 0 : Infinity, false);
        this._finishInteractionProcess(func);
    },

    _startInteractionProcess: function () {
        //move it to constructor
        this._eventDisplayOrder = 1;
        if (!this._queue) {
            //move it to constructor
            this._queue = [[], []];
        }
        this._queue[0].length = 0;
        this._queue[1].length = 0;
    },

    _queueAdd: function (displayObject, order) {
        var queue = this._queue;
        if (order < this._eventDisplayOrder) {
            queue[0].push(displayObject);
        } else {
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

    /**
     *
     * @param {Function} func the function that will be called on each interactive object. The displayObject and hit will be passed to the function
     */
    _finishInteractionProcess: function (func) {
        var queue = this._queue;
        var q = queue[0];
        var i;
        for (i = 0; i < q.length; i++) {
            func(q[i], false);
        }
        q = queue[1];
        for (i = 0; i < q.length; i++) {
            func(q[i], true);
        }
    }
};

module.exports = InteractionManagerMixin;

},{}],8:[function(require,module,exports){
/**
 * @mixin
 */
var SystemRendererMixin = {
    /**
     * @private
     * @type {number}
     */
    _lastDisplayOrder: 0,

    /**
     * gets new display order for container/displayobject
     */
    incDisplayOrder: function() {
        return ++this._lastDisplayOrder;
    }
};

module.exports = SystemRendererMixin;

},{}],9:[function(require,module,exports){
/**
 * @mixin
 */
var WebGLRendererMixin = {
    _oldRender: PIXI.WebGLRenderer.prototype.render,
    render: function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
};

module.exports = WebGLRendererMixin;

},{}],10:[function(require,module,exports){
var plugin = {
    DisplayGroup: require('./DisplayGroup'),
    DisplayList: require('./DisplayList'),
    Const: require('./Const'),
    DisplayObjectMixin: require('./DisplayObjectMixin'),
    ContainerMixin: require('./ContainerMixin'),
    SystemRendererMixin: require('./SystemRendererMixin'),
    WebGLRendererMixin: require('./WebGLRendererMixin'),
    CanvasRendererMixin: require('./CanvasRendererMixin'),
    InteractionManagerMixin: require('./InteractionManagerMixin')
};

var pluginMixin = {
    DisplayGroup: plugin.DisplayGroup,
    DisplayList: plugin.DisplayList
};

Object.assign(pluginMixin, plugin.Const);

Object.assign(PIXI.DisplayObject.prototype, plugin.DisplayObjectMixin);

Object.assign(PIXI.Container.prototype, plugin.ContainerMixin);

Object.assign(PIXI.WebGLRenderer.prototype, plugin.SystemRendererMixin, plugin.WebGLRendererMixin);

Object.assign(PIXI.CanvasRenderer.prototype, plugin.SystemRendererMixin, plugin.CanvasRendererMixin);

Object.assign(PIXI.interaction.InteractionManager.prototype, plugin.InteractionManagerMixin);

Object.assign(PIXI, pluginMixin);

module.exports = plugin;

},{"./CanvasRendererMixin":1,"./Const":2,"./ContainerMixin":3,"./DisplayGroup":4,"./DisplayList":5,"./DisplayObjectMixin":6,"./InteractionManagerMixin":7,"./SystemRendererMixin":8,"./WebGLRendererMixin":9}]},{},[10])


//# sourceMappingURL=pixi-display.js.map
