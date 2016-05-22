(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.tilemap
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function OverlayShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\n\nattribute vec2 aTextureCoord;\n\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\n\nuniform mat3 mapMatrix;\n\nvarying vec2 vTextureCoord;\n\nvarying vec2 vMapCoord;\n\nvoid main(void)\n\n{\n\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;\n\n    vTextureCoord = aTextureCoord;\n\n}\n\n",
        "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nvarying vec2 vMapCoord;\n\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\n\nuniform vec4 uTextureClamp;\n\nuniform vec4 uColor;\n\nvoid main(void)\n\n{\n\n    vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);\n\n    vec4 source = texture2D(uSampler[0], textureCoord);\n\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    //reverse hardlight\r\n    //yeah, premultiplied\r\n    if (source.a == 0.0) {\n\n        gl_FragColor = vec4(0, 0, 0, 0);\n\n        return;\n\n    }\n\n    vec3 Cb = source.rgb/source.a, Cs;\n\n    if (target.a > 0.0) {\n\n        Cs = target.rgb / target.a;\n\n    }\n\n    vec3 multiply = Cb * Cs * 2.0;\n\n    vec3 Cs2 = Cs * 2.0 - 1.0;\n\n    vec3 screen = Cb + Cs2 - Cb * Cs2;\n\n    vec3 B;\n\n    if (Cb.r <= 0.5) {\n\n        B.r = multiply.r;\n\n    } else {\n\n        B.r = screen.r;\n\n    }\n\n    if (Cb.g <= 0.5) {\n\n        B.g = multiply.g;\n\n    } else {\n\n        B.g = screen.g;\n\n    }\n\n    if (Cb.b <= 0.5) {\n\n        B.b = multiply.b;\n\n    } else {\n\n        B.b = screen.b;\n\n    }\n\n    vec4 res;\n\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n\n    res.a = source.a + target.a * (1.0-source.a);\n\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n\n}\n\n"
    );
    this.bind();
    this.uniforms.uSampler = [0, 1];
}

OverlayShader.prototype = Object.create(PIXI.Shader.prototype);
OverlayShader.prototype.constructor = OverlayShader;
module.exports = OverlayShader;

},{}],2:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.tilemap
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function OverlayShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\n\nattribute vec2 aTextureCoord;\n\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\n\nuniform mat3 mapMatrix;\n\nvarying vec2 vTextureCoord;\n\nvarying vec2 vMapCoord;\n\nvoid main(void)\n\n{\n\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;\n\n    vTextureCoord = aTextureCoord;\n\n}\n\n",
        "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nvarying vec2 vMapCoord;\n\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\n\nuniform vec4 uTextureClamp;\n\nuniform vec4 uColor;\n\nvoid main(void)\n\n{\n\n    vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);\n\n    vec4 source = texture2D(uSampler[0], textureCoord);\n\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    //reverse hardlight\r\n    if (source.a == 0.0) {\n\n        gl_FragColor = vec4(0, 0, 0, 0);\n\n        return;\n\n    }\n\n    //yeah, premultiplied\r\n    vec3 Cb = source.rgb/source.a, Cs;\n\n    if (target.a > 0.0) {\n\n        Cs = target.rgb / target.a;\n\n    }\n\n    vec3 multiply = Cb * Cs * 2.0;\n\n    vec3 Cb2 = Cb * 2.0 - 1.0;\n\n    vec3 screen = Cb2 + Cs - Cb2 * Cs;\n\n    vec3 B;\n\n    if (Cs.r <= 0.5) {\n\n        B.r = multiply.r;\n\n    } else {\n\n        B.r = screen.r;\n\n    }\n\n    if (Cs.g <= 0.5) {\n\n        B.g = multiply.g;\n\n    } else {\n\n        B.g = screen.g;\n\n    }\n\n    if (Cs.b <= 0.5) {\n\n        B.b = multiply.b;\n\n    } else {\n\n        B.b = screen.b;\n\n    }\n\n    vec4 res;\n\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n\n    res.a = source.a + target.a * (1.0-source.a);\n\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n\n}\n\n"
    );
    this.bind();
    this.uniforms.uSampler = [0, 1];
}

OverlayShader.prototype = Object.create(PIXI.Shader.prototype);
OverlayShader.prototype.constructor = OverlayShader;
module.exports = OverlayShader;

},{}],3:[function(require,module,exports){
var PictureShader = require('./PictureShader'),
    mapFilterBlendModesToPixi = require('./mapFilterBlendModesToPixi'),
    glCore = PIXI.glCore;

/**
 * Renderer that clamps the texture so neighbour frames wont bleed on it
 * immitates context2d drawImage behaviour
 *
 * @class
 * @memberof PIXI.extras
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this plugin works for
 */
function PictureRenderer(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);
}

PictureRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
PictureRenderer.prototype.constructor = PictureRenderer;

PictureRenderer.prototype.onContextChange = function () {
    var gl = this.renderer.gl;
    this.quad = new PIXI.Quad(gl);
    this.normalShader = new PictureShader(gl);
    this.drawModes = mapFilterBlendModesToPixi(gl);
    this.quad.initVao(this.normalShader);
    this._tempClamp = new Float32Array(4);
    this._tempColor = new Float32Array(4);
    this._tempRect = new PIXI.Rectangle();
    this._tempRect2 = new PIXI.Rectangle();
    this._tempRect3 = new PIXI.Rectangle();
    this._tempMatrix = new PIXI.Matrix();
    this._bigBuf = new Uint8Array(1 << 20);
    this._renderTexture = new PIXI.BaseRenderTexture(1024, 1024);
};

PictureRenderer.prototype.start = function () {
    //noop
};

PictureRenderer.prototype.flush = function () {
    //noop
};

function nextPow2(v) {
    v += v === 0;
    --v;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return v + 1;
}

PictureRenderer.prototype._getRenderTexture = function (minWidth, minHeight) {
    if (this._renderTexture.width < minWidth ||
        this._renderTexture.height < minHeight) {
        minHeight = nextPow2(minWidth * resolution);
        minHeight = nextPow2(minHeight * resolution);
        this._renderTexture.resize(minWidth, minHeight);
    }
    return this._renderTexture;
};

PictureRenderer.prototype._getBuf = function (size) {
    var buf = this._bigBuf;
    if (buf.length < size) {
        size = nextPow2(size);
        buf = new Uint8Array(size);
        this._bigBuf = buf;
    }
    return buf;
};

/**
 * Renders the picture object.
 *
 * @param sprite {PIXI.tilemap.PictureSprite} the picture to render
 */
PictureRenderer.prototype.render = function (sprite) {
    if (!sprite.texture.valid) {
        return;
    }
    var blendShader = this.drawModes[sprite.blendMode];
    if (blendShader) {
        this._renderBlend(sprite, blendShader);
    } else {
        this._renderNormal(sprite, this.normalShader);
    }
};

PictureRenderer.prototype._renderNormal = function (sprite, shader) {
    var renderer = this.renderer;
    renderer.bindShader(shader);
    renderer.state.setBlendMode(sprite.blendMode);
    this._renderInner(sprite, shader);
};

PictureRenderer.prototype._renderBlend = function (sprite, shader) {
    //nothing there yet
    var renderer = this.renderer;
    var spriteBounds = sprite.getBounds();
    var renderTarget = renderer._activeRenderTarget;
    var matrix = renderTarget.projectionMatrix;
    var flipY = matrix.d < 0;
    var resolution = renderTarget.resolution;
    var screen = this._tempRect;
    var fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
    screen.x = 0;
    screen.y = 0;
    screen.width = fr.width;
    screen.height = fr.height;

    var bounds = this._tempRect2;
    var fbw = fr.width * resolution, fbh = fr.height * resolution;
    bounds.x = (spriteBounds.x + matrix.tx / matrix.a) * resolution + fbw / 2;
    bounds.y = (spriteBounds.y + matrix.ty / matrix.d) * resolution + fbh / 2;
    bounds.width = spriteBounds.width * resolution;
    bounds.height = spriteBounds.height * resolution;
    if (flipY) {
        bounds.y = fbh - bounds.height - bounds.y;
    }

    var screenBounds = this._tempRect3;
    var x_1 = Math.floor(Math.max(screen.x, bounds.x));
    var x_2 = Math.ceil(Math.min(screen.x + screen.width, bounds.x + bounds.width));
    var y_1 = Math.floor(Math.max(screen.y, bounds.y));
    var y_2 = Math.ceil(Math.min(screen.y + screen.height, bounds.y + bounds.height));
    var pixelsWidth = x_2 - x_1;
    var pixelsHeight = y_2 - y_1;
    if (pixelsWidth <= 0 || pixelsHeight <= 0) {
        //culling
        return;
    }
    //TODO: padding
    var rt = this._getRenderTexture(pixelsWidth, pixelsHeight);
    renderer.bindTexture(rt, 1);
    var gl = renderer.gl;
    if (renderer.renderingToScreen && renderTarget.root) {
        var buf = this._getBuf(pixelsWidth * pixelsHeight * 4);
        gl.readPixels(x_1, y_1, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
        //REVERT Y?
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
    } else {
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x_1, y_1, pixelsWidth, pixelsHeight);
    }

    renderer.bindShader(shader);
    renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
    if (shader.uniforms.mapMatrix) {
        var mapMatrix = this._tempMatrix;
        mapMatrix.a = bounds.width / rt.width / spriteBounds.width;
        mapMatrix.tx = (bounds.x - x_1) / rt.width - spriteBounds.x * mapMatrix.a;
        mapMatrix.d = bounds.height / rt.height / spriteBounds.height;
        if (flipY) {
            mapMatrix.d = -mapMatrix.d;
            mapMatrix.ty = (bounds.y - y_1) / rt.height - (spriteBounds.y + spriteBounds.height) * mapMatrix.d;
        } else {
            mapMatrix.ty = (bounds.y - y_1) / rt.height - spriteBounds.y * mapMatrix.d;
        }

        shader.uniforms.mapMatrix = mapMatrix.toArray(true, shader.uniforms.mapMatrix);
    }

    this._renderInner(sprite, shader);
};


PictureRenderer.prototype._renderInner = function (sprite, shader) {
    var renderer = this.renderer;
    var quad = this.quad;
    var uvs = sprite.texture._uvs;

    //sprite already has calculated the vertices. lets transfer them to quad
    var vertices = quad.vertices;
    for (var i = 0; i < 8; i++) {
        quad.vertices[i] = sprite.vertexData[i];
    }

    //SpriteRenderer works differently, with uint32 UVS
    //but for our demo float uvs are just fine
    quad.uvs[0] = uvs.x0;
    quad.uvs[1] = uvs.y0;
    quad.uvs[2] = uvs.x1;
    quad.uvs[3] = uvs.y1;
    quad.uvs[4] = uvs.x2;
    quad.uvs[5] = uvs.y2;
    quad.uvs[6] = uvs.x3;
    quad.uvs[7] = uvs.y3;

    //TODO: add baricentric coords here
    quad.upload();

    var frame = sprite.texture.frame;
    var base = sprite.texture.baseTexture;
    var clamp = this._tempClamp;
    //clamping 0.5 pixel from each side to reduce border artifact
    //this is our plugin main purpose
    clamp[0] = frame.x / base.width + 0.5 / base.realWidth;
    clamp[1] = frame.y / base.height + 0.5 / base.realWidth;
    clamp[2] = (frame.x + frame.width) / base.width - 0.5 / base.realWidth;
    clamp[3] = (frame.y + frame.height) / base.height - 0.5 / base.realWidth;
    //take a notice that size in pixels is realWidth,realHeight
    //width and height are divided by resolution
    shader.uniforms.uTextureClamp = clamp;

    var color = this._tempColor;
    PIXI.utils.hex2rgb(sprite.tint, color);
    var alpha = sprite.worldAlpha;
    //premultiplied alpha tint
    //of course we could do that in shader too
    color[0] *= alpha;
    color[1] *= alpha;
    color[2] *= alpha;
    color[3] = alpha;
    shader.uniforms.uColor = color;

    //bind texture to unit 0, our default sampler unit
    renderer.bindTexture(base, 0);
    quad.draw();
};

PIXI.WebGLRenderer.registerPlugin('picture', PictureRenderer);

module.exports = PictureRenderer;

},{"./PictureShader":4,"./mapFilterBlendModesToPixi":7}],4:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.extras
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function PictureShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\n\nattribute vec2 aTextureCoord;\n\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n\n{\n\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n\n}\n\n",
        "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nuniform vec4 uTextureClamp;\n\nuniform vec4 uColor;\n\nvoid main(void)\n\n{\n\n    vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);\n\n    vec4 sample = texture2D(uSampler, textureCoord);\n\n    gl_FragColor = sample * uColor;\n\n}\n\n"
    );
    //do some stuff, like default values for shader
    //dont forget to bind it if you really are changing the uniforms
    this.bind();
    //default tint
    //Its an example, actually PictureRenderer takes care of this stuff
    this.uniforms.uColor = new Float32Array(1,1,1,1);
}

PictureShader.prototype = Object.create(PIXI.Shader.prototype);
PictureShader.prototype.constructor = PictureShader;
module.exports = PictureShader;

},{}],5:[function(require,module,exports){
/**
 * A Sprite with reduced border artifacts
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.tilemap
 * @param texture {PIXI.Texture} the texture for this sprite
 */
function PictureSprite(texture)
{
    PIXI.Sprite.call(this, texture);
}

PictureSprite.prototype = Object.create(PIXI.Sprite.prototype);
PictureSprite.prototype.constructor = PictureSprite;
module.exports = PictureSprite;

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
PictureSprite.prototype._renderWebGL = function (renderer)
{
    //copy of PIXI.Sprite v4 behaviour
    if(this.transform.updated || this.textureDirty)
    {
        this.textureDirty = false;
        // set the vertex data
        this.calculateVertices();
    }

    //use different plugin for rendering
    renderer.setObjectRenderer(renderer.plugins.picture);
    renderer.plugins.picture.render(this);
};

},{}],6:[function(require,module,exports){
var myPlugin = {
    PictureSprite: require('./PictureSprite'),
    PictureRenderer: require('./PictureRenderer')
};

//dump everything into extras

Object.assign(PIXI.extras, myPlugin);

module.exports = myPlugin;

},{"./PictureRenderer":3,"./PictureSprite":5}],7:[function(require,module,exports){
var CONST = PIXI,
    OverlayShader = require('./OverlayShader'),
    HardLightShader = require('./HardLightShader');

/**
 * Maps gl blend combinations to WebGL
 * @class
 * @memberof PIXI
 */
function mapFilterBlendModesToPixi(gl, array)
{
    array = array || [];

    //TODO - premultiply alpha would be different.
    //add a boolean for that!
    array[CONST.BLEND_MODES.OVERLAY] = new OverlayShader(gl);
    array[CONST.BLEND_MODES.HARD_LIGHT] = new HardLightShader(gl);

    return array;
}

module.exports = mapFilterBlendModesToPixi;

},{"./HardLightShader":1,"./OverlayShader":2}]},{},[6])


//# sourceMappingURL=pixi-picture.js.map
