(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
PIXI.lights = {
    Light:                  require('./lights/light/Light'),
    LightShader:            require('./lights/light/LightShader'),

    AmbientLight:           require('./lights/ambientLight/AmbientLight'),
    AmbientLightShader:     require('./lights/ambientLight/AmbientLightShader'),

    PointLight:             require('./lights/pointLight/PointLight'),
    PointLightShader:       require('./lights/pointLight/PointLightShader'),

    DirectionalLight:             require('./lights/directionalLight/DirectionalLight'),
    DirectionalLightShader:       require('./lights/directionalLight/DirectionalLightShader'),

    LightRenderer:          require('./renderers/LightRenderer'),

    WireframeShader:        require('./lights/WireframeShader')
};

Object.assign(PIXI.lights, require('./main'));

module.exports = PIXI.lights;

require('./shapeMeshMixin');

},{"./lights/WireframeShader":2,"./lights/ambientLight/AmbientLight":3,"./lights/ambientLight/AmbientLightShader":4,"./lights/directionalLight/DirectionalLight":5,"./lights/directionalLight/DirectionalLightShader":6,"./lights/light/Light":7,"./lights/light/LightShader":8,"./lights/pointLight/PointLight":9,"./lights/pointLight/PointLightShader":10,"./main":11,"./renderers/LightRenderer":12,"./shapeMeshMixin":13}],2:[function(require,module,exports){
var main = require('../main');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function WireframeShader(gl) {
    PIXI.Shader.call(this,
        gl,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'uniform mat3 projectionMatrix;',

            'void main(void) {',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'void main() {',
            '    gl_FragColor = vec4(0, 0, 0, 1);',
            '}'
        ].join('\n'),
        /*// uniforms
        {
            translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix:   { type: 'mat3', value: new Float32Array(9) }
        },*/
        // attributes
        {
            aVertexPosition: 0
        }
    );
}

WireframeShader.prototype = Object.create(PIXI.Shader.prototype);
WireframeShader.prototype.constructor = WireframeShader;
module.exports = WireframeShader;

main.registerPlugin('wireframeShader', WireframeShader);

},{"../main":11}],3:[function(require,module,exports){
var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=0.5] {number} The brightness of the light.
 */
function AmbientLight(color, brightness) {
    // ambient light is drawn using a full-screen quad
    Light.call(this, color, brightness);

    this.shaderName = 'ambientLightShader';
}

AmbientLight.prototype = Object.create(Light.prototype);
AmbientLight.prototype.constructor = AmbientLight;
module.exports = AmbientLight;

},{"../light/Light":7}],4:[function(require,module,exports){
var main = require('../../main');
var LightShader = require('../light/LightShader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function AmbientLightShader(gl) {
    LightShader.call(this,
        gl,
        // vertex shader
        null,
        // fragment shader
        "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D uSampler;\nuniform sampler2D uNormalSampler;\n\nuniform mat3 translationMatrix;\n\nuniform vec2 uViewSize;     // size of the viewport\n\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\nuniform float uLightHeight; // light height above the viewport\n\n\nvoid main(void)\n{\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\ntexCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\n\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\nnormalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\n\n// bail out early when normal has no data\nif (normalColor.a == 0.0) discard;\n\n\n    // simplified lambert shading that makes assumptions for ambient color\n\n    // compute Distance\n    float D = 1.0;\n\n    // normalize vectors\n    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\n    vec3 L = vec3(1.0, 1.0, 1.0);\n\n    // pre-multiply light color with intensity\n    // then perform \"N dot L\" to determine our diffuse\n    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\n\n    vec4 diffuseColor = texture2D(uSampler, texCoord);\n    vec3 finalColor = diffuseColor.rgb * diffuse;\n\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\n}\n"
    );
}

AmbientLightShader.prototype = Object.create(LightShader.prototype);
AmbientLightShader.prototype.constructor = AmbientLightShader;
module.exports = AmbientLightShader;

main.registerPlugin('ambientLightShader', AmbientLightShader);

},{"../../main":11,"../light/LightShader":8}],5:[function(require,module,exports){
var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
 */
function DirectionalLight(color, brightness, target) {
    Light.call(this, color, brightness);

    this.target = target;
    this._directionVector = new PIXI.Point();

    this._updateTransform = Light.prototype.updateTransform;
    this._syncShader = Light.prototype.syncShader;

    this.shaderName = 'directionalLightShader';
}

DirectionalLight.prototype = Object.create(Light.prototype);
DirectionalLight.prototype.constructor = DirectionalLight;
module.exports = DirectionalLight;

DirectionalLight.prototype.updateTransform = function () {
    this.containerUpdateTransform();

    var vec = this._directionVector,
        wt = this.worldTransform,
        tx = this.target.worldTransform ? this.target.worldTransform.tx : this.target.x,
        ty = this.target.worldTransform ? this.target.worldTransform.ty : this.target.y;

    // calculate direction from this light to the target
    vec.x = wt.tx - tx;
    vec.y = wt.ty - ty;

    // normalize
    var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    vec.x /= len;
    vec.y /= len;
};

DirectionalLight.prototype.syncShader = function (shader) {
    this._syncShader(shader);

    var uLightDirection = shader.uniforms.uLightDirection;
    uLightDirection[0] = this._directionVector.x;
    uLightDirection[1] = this._directionVector.y;
    shader.uniforms.uLightDirection = uLightDirection;
};

},{"../light/Light":7}],6:[function(require,module,exports){
var main = require('../../main');
var LightShader = require('../light/LightShader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function DirectionalLightShader(gl) {
    LightShader.call(this,
        gl,
        // vertex shader
        null,
        // fragment shader
        "precision highp float;\n#define GLSLIFY 1\n\n// imports the common uniforms like samplers, and ambient/light color\nuniform sampler2D uSampler;\nuniform sampler2D uNormalSampler;\n\nuniform mat3 translationMatrix;\n\nuniform vec2 uViewSize;     // size of the viewport\n\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\nuniform float uLightHeight; // light height above the viewport\n\n\nuniform vec2 uLightDirection;\n\nvoid main()\n{\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\ntexCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\n\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\nnormalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\n\n// bail out early when normal has no data\nif (normalColor.a == 0.0) discard;\n\n\n    // the directional vector of the light\n    vec3 lightVector = vec3(uLightDirection, uLightHeight);\n\n    // compute Distance\n    float D = length(lightVector);\n\n// normalize vectors\nvec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\nvec3 L = normalize(lightVector);\n\n// pre-multiply light color with intensity\n// then perform \"N dot L\" to determine our diffuse\nvec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\n\n\n    // calculate attenuation\n    float attenuation = 1.0;\n\n// calculate final intesity and color, then combine\nvec3 intensity = diffuse * attenuation;\nvec4 diffuseColor = texture2D(uSampler, texCoord);\nvec3 finalColor = diffuseColor.rgb * intensity;\n\ngl_FragColor = vec4(finalColor, diffuseColor.a);\n\n}\n",
        // custom uniforms
        {
            // the directional vector of the light
            uLightDirection: { type: '2f', value: new Float32Array(2) }
        }
    );
}

DirectionalLightShader.prototype = Object.create(LightShader.prototype);
DirectionalLightShader.prototype.constructor = DirectionalLightShader;
module.exports = DirectionalLightShader;

main.registerPlugin('directionalLightShader', DirectionalLightShader);

},{"../../main":11,"../light/LightShader":8}],7:[function(require,module,exports){
/**
 * Excuse the mess, haven't cleaned this up yet!
 */

var main = require('../../main');

/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The brightness of the light, in range [0, 1].
 */
function Light(color, brightness, vertices, indices) {
    if (this.constructor === Light) {
        throw new Error('Light is an abstract base class, it should not be created directly!');
    }

    PIXI.Container.call(this);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array(8);

    /**
     * An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    this.indices = indices || new Uint16Array([0,1,2, 0,2,3]);

    /**
     * The blend mode to be applied to the light.
     *
     * @member {number}
     * @default CONST.BLEND_MODES.ADD;
     */
    this.blendMode = PIXI.BLEND_MODES.ADD;

    /**
     * The draw mode to be applied to the light geometry.
     *
     * @member {number}
     * @default CONST.DRAW_MODES.TRIANGLES;
     */
    this.drawMode = PIXI.DRAW_MODES.TRIANGLES;

    /**
     * When incremented the renderer will re-upload indices
     *
     * @member {number}
     */
    this.dirty = 0;

    /**
     * The height of the light from the viewport.
     *
     * @member {number}
     * @default 0.075
     */
    this.lightHeight = 0.075;

    /**
     * The falloff attenuation coeficients.
     *
     * @member {number[]}
     * @default [0.75, 3, 20]
     */
    this.falloff = [0.75, 3, 20];

    /**
     * The name of the shader plugin to use.
     *
     * @member {string}
     */
    this.shaderName = null;

    /**
     * By default the light uses a viewport sized quad as the mesh.
     */
    this.useViewportQuad = true;

    // color and brightness are exposed through setters
    this._color = 0x4d4d59;
    this._colorRgba = [0.3, 0.3, 0.35, 0.8];

    // run the color setter
    if (color || color === 0) {
        this.color = color;
    }

    // run the brightness setter
    if (brightness || brightness === 0) {
        this.brightness = brightness;
    }

    this.parentGroup = main.lightGroup;


    /**
     * WebGL data for this light
     * @member {Object}
     * @private
     */
    this._glDatas = {};

    this.shaderName = 'lights';
}

Light.prototype = Object.create(PIXI.Container.prototype);
Light.prototype.constructor = Light;
module.exports = Light;

Object.defineProperties(Light.prototype, {
    /**
     * The color of the lighting.
     *
     * @member {number}
     * @memberof Light#
     */
    color: {
        get: function ()
        {
            return this._color;
        },
        set: function (val)
        {
            this._color = val;
            PIXI.utils.hex2rgb(val, this._colorRgba);
        }
    },

    /**
     * The brightness of this lighting. Normalized in the range [0, 1].
     *
     * @member {number}
     * @memberof Light#
     */
    brightness: {
        get: function ()
        {
            return this._colorRgba[3];
        },
        set: function (val)
        {
            this._colorRgba[3] = val;
        }
    }
});

Light.prototype.syncShader = function (shader) {
    shader.uniforms.uUseViewportQuad = this.useViewportQuad;

    var uLightColor = shader.uniforms.uLightColor;
    if (uLightColor) {
        uLightColor[0] = this._colorRgba[0];
        uLightColor[1] = this._colorRgba[1];
        uLightColor[2] = this._colorRgba[2];
        uLightColor[3] = this._colorRgba[3];
        shader.uniforms.uLightColor = uLightColor;
    }

    shader.uniforms.uLightHeight = this.lightHeight;

    var uLightFalloff = shader.uniforms.uLightFalloff;
    if (uLightFalloff) {
        uLightFalloff[0] = this.falloff[0];
        uLightFalloff[1] = this.falloff[1];
        uLightFalloff[2] = this.falloff[2];
        shader.uniforms.uLightFalloff = uLightFalloff;
    }
};

Light.prototype._renderWebGL = function (renderer)
{
    renderer.setObjectRenderer(renderer.plugins.lights);
    renderer.plugins.lights.render(this);
};

},{"../../main":11}],8:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function LightShader(gl, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
    var uniforms = {
        translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
        projectionMatrix:   { type: 'mat3', value: new Float32Array(9) },

        // textures from the previously rendered FBOs
        uSampler:       { type: 'sampler2D', value: null },
        uNormalSampler: { type: 'sampler2D', value: null },

        // should we apply the translation matrix or not.
        uUseViewportQuad: { type: 'bool', value: true },

        // size of the renderer viewport
        uViewSize:      { type: '2f', value: new Float32Array(2) },

        // light color, alpha channel used for intensity.
        uLightColor:    { type: '4f', value: new Float32Array([1, 1, 1, 1]) },

        // light falloff attenuation coefficients
        uLightFalloff:  { type: '3f', value: new Float32Array([0, 0, 0]) },

        // height of the light above the viewport
        uLightHeight: { type: '1f', value: 0.075 }
    };

    if (customUniforms)
    {
        for (var u in customUniforms)
        {
            uniforms[u] = customUniforms[u];
        }
    }

    var attributes = {
        aVertexPosition: 0
    };

    if (customAttributes)
    {
        for (var a in customAttributes)
        {
            attributes[a] = customAttributes[a];
        }
    }

    PIXI.Shader.call(this, gl, vertexSrc || LightShader.defaultVertexSrc, fragmentSrc, attributes);
}

LightShader.prototype = Object.create(PIXI.Shader.prototype);
LightShader.prototype.constructor = LightShader;
module.exports = LightShader;

LightShader.defaultVertexSrc = "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\n\nuniform bool uUseViewportQuad;\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\n\nvoid main(void) {\n    if (uUseViewportQuad) {\n        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    }\n    else\n    {\n        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    }\n}\n";

},{}],9:[function(require,module,exports){
var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [radius=Infinity] {number} The distance the light reaches. You will likely need
 *  to change the falloff of the light as well if you change this value. Infinity will
 *  use the entire viewport as the drawing surface.
 */
function PointLight(color, brightness, radius) {
    radius = radius || Infinity;

    if (radius !== Infinity) {
        var shape = new PIXI.Circle(0, 0, radius),
            mesh = shape.getMesh();

        Light.call(this, color, brightness, mesh.vertices, mesh.indices);

        this.useViewportQuad = false;
        this.drawMode = PIXI.DRAW_MODES.TRIANGLE_FAN;
    }
    else {
        Light.call(this, color, brightness);
    }

    this._syncShader = Light.prototype.syncShader;

    this.radius = radius;
    this.shaderName = 'pointLightShader';
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;
module.exports = PointLight;

PointLight.prototype.syncShader = function (shader) {
    this._syncShader(shader);

    shader.uniforms.uLightRadius = this.radius;
}

},{"../light/Light":7}],10:[function(require,module,exports){
var main = require('../../main');
var LightShader = require('../light/LightShader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function PointLightShader(gl) {
    LightShader.call(this,
        gl,
        // vertex shader
        null,
        // fragment shader
        "precision highp float;\n#define GLSLIFY 1\n\n// imports the common uniforms like samplers, and ambient color\nuniform sampler2D uSampler;\nuniform sampler2D uNormalSampler;\n\nuniform mat3 translationMatrix;\n\nuniform vec2 uViewSize;     // size of the viewport\n\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\nuniform float uLightHeight; // light height above the viewport\n\n\nuniform float uLightRadius;\n\nvoid main()\n{\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\ntexCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\n\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\nnormalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\n\n// bail out early when normal has no data\nif (normalColor.a == 0.0) discard;\n\n\n    vec2 lightPosition = translationMatrix[2].xy / uViewSize;\n\n    // the directional vector of the light\n    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);\n\n    // correct for aspect ratio\n    lightVector.x *= uViewSize.x / uViewSize.y;\n\n    // compute Distance\n    float D = length(lightVector);\n\n    // bail out early when pixel outside of light sphere\n    if (D > uLightRadius) discard;\n\n// normalize vectors\nvec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\nvec3 L = normalize(lightVector);\n\n// pre-multiply light color with intensity\n// then perform \"N dot L\" to determine our diffuse\nvec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\n\n\n    // calculate attenuation\n    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));\n\n// calculate final intesity and color, then combine\nvec3 intensity = diffuse * attenuation;\nvec4 diffuseColor = texture2D(uSampler, texCoord);\nvec3 finalColor = diffuseColor.rgb * intensity;\n\ngl_FragColor = vec4(finalColor, diffuseColor.a);\n\n}\n",
        // custom uniforms
        {
            // height of the light above the viewport
            uLightRadius:   { type: '1f', value: 1 }
        }
    );
}

PointLightShader.prototype = Object.create(LightShader.prototype);
PointLightShader.prototype.constructor = PointLightShader;
module.exports = PointLightShader;

main.registerPlugin('pointLightShader', PointLightShader);

},{"../../main":11,"../light/LightShader":8}],11:[function(require,module,exports){
module.exports = {
    plugins: {},
    registerPlugin: function(name, fun) {
        this.plugins[name] = fun;
    },
    diffuseGroup: new PIXI.display.Group(),
    normalGroup: new PIXI.display.Group(),
    lightGroup: new PIXI.display.Group()
};

module.exports.diffuseGroup.useRenderTexture = true;
module.exports.normalGroup.useRenderTexture = true;

},{}],12:[function(require,module,exports){
var main = require('../main');
var glCore = PIXI.glCore;

/**
 *
 * @class
 * @private
 * @memberof PIXI.lights
 * @extends PIXI.ObjectRenderer
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function LightRenderer(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = LightRenderer.MAX_LIGHTS * 6;

    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    //TODO this could be a single buffer shared amongst all renderers as we reuse this set up in most renderers
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    this.shaders = {};

    /**
     * The current lights in the batch.
     *
     * @member {Light[]}
     */
    this.lights = [];
}

LightRenderer.MAX_LIGHTS = 500;

LightRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
LightRenderer.prototype.constructor = LightRenderer;
module.exports = LightRenderer;

PIXI.WebGLRenderer.registerPlugin('lights', LightRenderer);

LightRenderer.prototype.onContextChange = function () {
    this.gl = this.renderer.gl;
    for (var key in main.plugins) {
        this.shaders[key] = new (main.plugins[key])(this.gl);
    }
};

/**
 * Renders the light object.
 *
 * @param light {Light} the light to render
 */
LightRenderer.prototype.render = function (mesh) {
    var renderer = this.renderer;
    var gl = renderer.gl;

    this.lights.push(mesh);
    /**
     * Prepares all the buffers to render this light.
     */
    var glData = mesh._glDatas[renderer.CONTEXT_UID];

    if (!glData) {
        renderer.bindVao(null);

        glData = {
            shader: this.shaders[mesh.shaderName],
            vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
            indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
            // build the vao object that will render..
            vao: null,
            dirty: mesh.dirty
        };

        // build the vao object that will render..
        glData.vao = new glCore.VertexArrayObject(gl)
            .addIndex(glData.indexBuffer)
            .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)

        mesh._glDatas[renderer.CONTEXT_UID] = glData;
    }

    renderer.bindVao(glData.vao);

    if (mesh.useViewportQuad) {
        mesh.vertices[2] = mesh.vertices[4] = renderer.screen.width;
        mesh.vertices[5] = mesh.vertices[7] = renderer.screen.height;
    }
    glData.vertexBuffer.upload(mesh.vertices);

    if (glData.dirty !== mesh.dirty) {
        glData.dirty = mesh.dirty;
        glData.indexBuffer.upload(mesh.indices);
    }
};

LightRenderer.prototype.flush = function () {
    var diffuseTexture = null,
        normalTexture = null,
        lastLayer = null,
        lastShader = null,
        renderer = this.renderer;

    for (var i = 0; i < this.lights.length; ++i) {
        var light = this.lights[i],
            layer = this.lights[i]._activeParentLayer;

        if (!layer) {
            continue;
        }

        if (lastLayer !== layer) {
            lastLayer = layer;
            var stage = layer._activeStageParent;

            if (layer.diffuseTexture &&
                layer.normalTexture) {
                diffuseTexture = layer.diffuseTexture;
                normalTexture = layer.normalTexture;
            } else {
                for (var j = 0; j < stage._activeLayers.length; j++) {
                    var texLayer = stage._activeLayers[j];
                    if (texLayer.group === main.normalGroup) {
                        normalTexture = texLayer.getRenderTexture();
                    }
                    if (texLayer.group === main.diffuseGroup) {
                        diffuseTexture = texLayer.getRenderTexture();
                    }
                }
            }

            renderer.bindTexture(diffuseTexture, 0, true);
            renderer.bindTexture(normalTexture, 1, true);
        }

        var glData = light._glDatas[renderer.CONTEXT_UID],
            shader = glData.shader;

        if (lastShader !== shader) {
            lastShader = shader;
            renderer.bindShader(shader);

            shader.uniforms.uSampler = 0;
            shader.uniforms.uNormalSampler = 1;

            var uViewSize = shader.uniforms.uViewSize;
            uViewSize[0] = renderer.screen.width;
            uViewSize[1] = renderer.screen.height;
            shader.uniforms.uViewSize = uViewSize;
        }

        renderer.bindVao(glData.vao);

        light.syncShader(shader);
        renderer.state.setBlendMode(light.blendMode);
        shader.uniforms.translationMatrix = light.worldTransform.toArray(true);

        glData.vao.draw(light.drawMode, light.indices.length, 0);
    }

    this.lights.length = 0;
};

LightRenderer.prototype.stop = function() {
    this.flush();
};

},{"../main":11}],13:[function(require,module,exports){
/**
 * Creates vertices and indices arrays to describe this circle.
 * 
 * @param [totalSegments=40] {number} Total segments to build for the circle mesh.
 * @param [verticesOutput] {Float32Array} An array to output the vertices into. Length must be
 *  `((totalSegments + 2) * 2)` or more. If not passed it is created for you.
 * @param [indicesOutput] {Uint16Array} An array to output the indices into, in gl.TRIANGLE_FAN format. Length must
 *  be `(totalSegments + 3)` or more. If not passed it is created for you.
 */
PIXI.Circle.prototype.getMesh = function (totalSegments, vertices, indices)
{
    totalSegments = totalSegments || 40;

    vertices = vertices || new Float32Array((totalSegments + 1) * 2);
    indices = indices || new Uint16Array(totalSegments + 1);

    var seg = (Math.PI * 2) / totalSegments,
        indicesIndex = -1;

    indices[++indicesIndex] = indicesIndex;

    for (var i = 0; i <= totalSegments; ++i)
    {
        var index = i*2;
        var angle = seg * i;

        vertices[index] = Math.cos(angle) * this.radius;
        vertices[index+1] = Math.sin(angle) * this.radius;

        indices[++indicesIndex] = indicesIndex;
    }

    indices[indicesIndex] = 1;

    return {
        vertices: vertices,
        indices: indices
    };
};

},{}]},{},[1])

//# sourceMappingURL=pixi-lights.js.map
