/* eslint-disable */
 
/*!
 * pixi-lights - v3.0.0
 * Compiled Tue, 06 Jul 2021 14:16:02 UTC
 *
 * pixi-lights is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Ivan Popelyshev, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
this.PIXI.lights = this.PIXI.lights || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/constants'), require('@pixi/core'), require('@pixi/mesh'), require('@pixi/layers'), require('@pixi/math')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/constants', '@pixi/core', '@pixi/mesh', '@pixi/layers', '@pixi/math'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_lights = {}, global.PIXI, global.PIXI, global.PIXI, global.PIXI.display, global.PIXI));
}(this, (function (exports, constants, core, mesh, layers, math) { 'use strict';

    /**
     * Creates vertices and indices arrays to describe this circle.
     * @method PIXI.Circle#getMesh
     * @param shape
     * @param [totalSegments=40] {number} Total segments to build for the circle mesh.
     * @param vertices
     * @param indices
     *  `((totalSegments + 2) * 2)` or more. If not passed it is created for you.
     *  be `(totalSegments + 3)` or more. If not passed it is created for you.
     * @return {PIXI.Circle~MeshData} Object with verticies and indices arrays
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function getCircleMesh(shape, totalSegments = 40, vertices, indices)
    {
        vertices = vertices || new Float32Array((totalSegments + 1) * 2);
        indices = indices || new Uint16Array(totalSegments + 1);

        const seg = (Math.PI * 2) / totalSegments;
        let indicesIndex = -1;

        indices[++indicesIndex] = indicesIndex;

        for (let i = 0; i <= totalSegments; ++i)
        {
            const index = i * 2;
            const angle = seg * i;

            vertices[index] = Math.cos(angle) * shape.radius;
            vertices[index + 1] = Math.sin(angle) * shape.radius;

            indices[++indicesIndex] = indicesIndex;
        }

        indices[indicesIndex] = 1;

        return { vertices, indices };
    }

    /**
     * @typedef PIXI.Circle~MeshData
     * @property {Float32Array} vertices - Vertices data
     * @property {Uint16Array} indices - Indices data
     */

    const diffuseGroup = new layers.Group(0, false);

    const normalGroup = new layers.Group(0, false);

    const lightGroup = new layers.Group(0, false);

    diffuseGroup.useRenderTexture = true;
    normalGroup.useRenderTexture = true;

    class LayerFinder
    {constructor() { LayerFinder.prototype.__init.call(this);LayerFinder.prototype.__init2.call(this);LayerFinder.prototype.__init3.call(this); }
        __init() {this.lastLayer = null;}
        __init2() {this.diffuseTexture = null;}
        __init3() {this.normalTexture = null;}

        check(layer)
        {
            if (this.lastLayer === layer)
            {
                return;
            }
            this.lastLayer = layer;

            const stage = layer._activeStageParent;
            const layerAny = layer ;

            this.diffuseTexture = core.Texture.WHITE;
            this.normalTexture = core.Texture.WHITE;

            if (layerAny.diffuseTexture && layerAny.normalTexture)
            {
                this.diffuseTexture = layerAny.diffuseTexture;
                this.normalTexture = layerAny.normalTexture;
            }
            else
            {
                for (let j = 0; j < stage._activeLayers.length; j++)
                {
                    const texLayer = stage._activeLayers[j];

                    if (texLayer.group === normalGroup)
                    {
                        this.normalTexture = texLayer.getRenderTexture();
                    }
                    if (texLayer.group === diffuseGroup)
                    {
                        this.diffuseTexture = texLayer.getRenderTexture();
                    }
                }
            }
        }

        static __initStatic() {this._instance = new LayerFinder();}
    } LayerFinder.__initStatic();

    class ViewportQuad extends core.Quad
    {
        update(viewport)
        {
            const b = this.buffers[0].data ;

            const x1 = viewport.x;
            const y1 = viewport.y;
            const x2 = viewport.x + viewport.width;
            const y2 = viewport.y + viewport.height;

            if (b[0] !== x1 || b[1] !== y1
                || b[4] !== x2 || b[5] !== y2)
            {
                b[0] = b[6] = x1;
                b[1] = b[3] = y1;
                b[2] = b[4] = x2;
                b[5] = b[7] = y2;
                this.buffers[0].update();
            }
        }

        static __initStatic() {this._instance = new ViewportQuad();}
    } ViewportQuad.__initStatic();

    /**
     * @class
     * @extends PIXI.DisplayObject
     * @memberof PIXI.lights
     *
     * @param [color=0xFFFFFF] {number} The color of the light.
     * @param [brightness=1] {number} The brightness of the light, in range [0, 1].
     */
    class Light extends mesh.Mesh
    {
        
        
        
        

        constructor(color = 0x4d4d59, brightness = 0.8, material,
            vertices, indices)
        {
            let geom;
            let useViewportQuad = false;

            if (!vertices)
            {
                geom = ViewportQuad._instance;
                useViewportQuad = true;
            }
            else
            {
                geom = new core.Geometry().addAttribute('aVertexPosition', vertices).addIndex(indices);
            }

            super(geom, material);

            this.blendMode = constants.BLEND_MODES.ADD;

            this.drawMode = useViewportQuad ? constants.DRAW_MODES.TRIANGLE_STRIP : constants.DRAW_MODES.TRIANGLES;

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
             * By default the light uses a viewport sized quad as the mesh.
             */
            this.useViewportQuad = useViewportQuad;

            // compatibility with old version and its ols bugs :)
            if (color === null)
            {
                color = 0x4d4d59;
            }

            // color and brightness are exposed through setters
            this.tint = color;
            this.brightness = brightness;
            this.parentGroup = lightGroup;
        }

        /**
         * The color of the lighting.
         *
         * @member {number}
         * @memberof Light#
         */
        get color()
        {
            return this.tint;
        }
        set color(val)
        {
            this.tint = val;
        }

        get falloff()
        {
            return this.material.uniforms.uLightFalloff;
        }

        set falloff(value)
        {
            this.material.uniforms.uLightFalloff[0] = value[0];
            this.material.uniforms.uLightFalloff[1] = value[1];
            this.material.uniforms.uLightFalloff[2] = value[2];
        }

        

        syncShader(renderer)
        {
            const { uniforms } = this.shader;

            // TODO: actually pass UV's of screen instead of size
            uniforms.uViewSize[0] = renderer.screen.width;
            uniforms.uViewSize[1] = renderer.screen.height;
            uniforms.uViewPixels[0] = renderer.view.width;
            uniforms.uViewPixels[1] = renderer.view.height;
            uniforms.uFlipY = !renderer.framebuffer.current;
            uniforms.uSampler = LayerFinder._instance.diffuseTexture;
            uniforms.uNormalSampler = LayerFinder._instance.normalTexture;
            uniforms.uUseViewportQuad = this.useViewportQuad;
            uniforms.uBrightness = this.brightness;
        }

        _renderDefault(renderer)
        {
            if (!this._activeParentLayer)
            {
                return;
            }
            LayerFinder._instance.check(this._activeParentLayer);

            const shader = this.shader ;

            shader.alpha = this.worldAlpha;
            if (shader.update)
            {
                shader.update();
            }

            renderer.batch.flush();

            shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
            if (this.useViewportQuad)
            {
                // TODO: pass the viewport (translated screen) instead
                (this.geometry ).update(renderer.screen);
            }

            this.syncShader(renderer);

            renderer.shader.bind(shader);

            renderer.state.set(this.state);

            renderer.geometry.bind(this.geometry, shader);

            renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
        }
    }

    /* eslint-disable @typescript-eslint/no-inferrable-types */
    const combine = `vec3 intensity = diffuse * attenuation;
vec4 diffuseColor = texture2D(uSampler, texCoord);
vec3 finalColor = diffuseColor.rgb * intensity;

gl_FragColor = vec4(finalColor, diffuseColor.a);
`;

    const commonUniforms = `uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform vec2 uViewPixels;   // size of the viewport, in pixels
uniform vec2 uViewSize;     // size of the viewport, in CSS

uniform vec4 uColor;   // light color, alpha channel used for intensity.
uniform float uBrightness;
uniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)
uniform float uLightHeight; // light height above the viewport
uniform float uFlipY;             // whether we use renderTexture, FBO is flipped
`;

    const computeDiffuse = `// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = uColor.rgb * uBrightness * max(dot(N, L), 0.0);
`;

    const computeVertexPosition = `vec2 texCoord = gl_FragCoord.xy / uViewPixels;
texCoord.y = (1.0 - texCoord.y) * uFlipY + texCoord.y * (1.0 - uFlipY); // FBOs positions are flipped.
`;

    const loadNormals = `vec4 normalColor = texture2D(uNormalSampler, texCoord);
normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

// bail out early when normal has no data
if (normalColor.a == 0.0) discard;
`;

    const vert = `attribute vec2 aVertexPosition;

uniform bool uUseViewportQuad;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

void main(void) {
    if (uUseViewportQuad) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
    else
    {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
}
`;

    /**
     * @class
     * @extends PIXI.Shader
     * @memberof PIXI.lights
     * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
     */
    class LightShader extends mesh.MeshMaterial
    {
        constructor(options)
        {
            const uniforms = {
                translationMatrix: math.Matrix.IDENTITY.toArray(true),
                // textures from the previously rendered FBOs
                uNormalSampler: core.Texture.WHITE,
                // size of the renderer viewport, CSS
                uViewSize: new Float32Array(2),
                // same, in PIXELS
                uViewPixels: new Float32Array(2),
                // light falloff attenuation coefficients
                uLightFalloff: new Float32Array([0, 0, 0]),
                // height of the light above the viewport
                uLightHeight: 0.075,
                uBrightness: 1.0,
                uUseViewportQuad: true,
            };

            if (options.uniforms)
            {
                Object.assign(uniforms, options.uniforms);
            }

            super(core.Texture.WHITE, { ...options, uniforms });
        }

        static __initStatic() {this.defaultVertexSrc = vert;}
    } LightShader.__initStatic();

    var fragment$2 = `precision highp float;

${commonUniforms}

void main(void)
{
${computeVertexPosition}
${loadNormals}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uColor.rgb * uBrightness;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;

    /**
     * @class
     * @extends PIXI.lights.LightShader
     * @memberof PIXI.lights
     */
    class AmbientLightShader extends LightShader
    {
        constructor()
        {
            super({
                program: AmbientLightShader._program
            });
        }

        static __initStatic() {this._program= new core.Program(LightShader.defaultVertexSrc, fragment$2);}
    } AmbientLightShader.__initStatic();

    /**
     * Ambient light is drawn using a full-screen quad
     * @class
     * @extends PIXI.lights.Light
     * @memberof PIXI.lights
     *
     * @param [color=0xFFFFFF] {number} The color of the light.
     * @param [brightness=0.5] {number} The brightness of the light.
     */
    class AmbientLight extends Light
    {
        constructor(color = 0xFFFFFF, brightness = 0.5)
        {
            super(color, brightness, new AmbientLightShader());
        }
    }

    var fragment$1 = `precision highp float;

// imports the common uniforms like samplers, and ambient color
${commonUniforms}

uniform float uLightRadius;

void main()
{
${computeVertexPosition}
${loadNormals}

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

${computeDiffuse}

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

${combine}
}
`;

    class PointLightShader extends LightShader
    {
        constructor()
        {
            super({
                program: PointLightShader._program,
                uniforms: {
                    uLightRadius: 1.0
                }
            });
        }

        static __initStatic() {this._program= new core.Program(LightShader.defaultVertexSrc, fragment$1);}
    } PointLightShader.__initStatic();

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
    class PointLight extends Light
    {
        constructor(color = 0xFFFFFF, brightness = 1, radius = Infinity)
        {
            if (radius !== Infinity)
            {
                const shape = new math.Circle(0, 0, radius);
                const { vertices, indices } = getCircleMesh(shape);

                super(color, brightness, new PointLightShader(), vertices, indices);

                this.drawMode = constants.DRAW_MODES.TRIANGLE_FAN;
            }
            else
            {
                super(color, brightness, new PointLightShader());
            }
            this.shaderName = 'pointLightShader';
            this.radius = radius;
        }

        get radius()
        {
            return this.material.uniforms.uLightRadius;
        }

        set radius(value)
        {
            this.material.uniforms.uLightRadius = value;
        }
    }

    var fragment = `precision highp float;

// imports the common uniforms like samplers, and ambient/light color
${commonUniforms}

uniform vec2 uLightDirection;

void main()
{
${computeVertexPosition}
${loadNormals}

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

${computeDiffuse}

    // calculate attenuation
    float attenuation = 1.0;

${combine}
}
`;

    /**
     * @class
     * @extends PIXI.Shader
     * @memberof PIXI.lights
     */
    class DirectionalLightShader extends LightShader
    {
        constructor()
        {
            super({
                program: PointLightShader._program,
                uniforms: {
                    uLightRadius: 1.0,
                    uLightDirection: new math.Point()
                }
            });
        }

        static __initStatic() {this._program= new core.Program(LightShader.defaultVertexSrc, fragment);}
    } DirectionalLightShader.__initStatic();

    /**
     * @class
     * @extends PIXI.lights.Light
     * @memberof PIXI.lights
     *
     * @param [color=0xFFFFFF] {number} The color of the light.
     * @param [brightness=1] {number} The intensity of the light.
     * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
     */
    class DirectionalLight extends Light
    {
        

        constructor(color = 0xFFFFFF, brightness = 1, target)
        {
            super(color, brightness, new DirectionalLightShader());

            this.target = target;
        }

        syncShader(renderer)
        {
            super.syncShader(renderer);

            const shader = this.material;

            const vec = shader.uniforms.uLightDirection;
            const wt = this.worldTransform;
            const twt = (this.target ).worldTransform;

            let tx;
            let ty;

            if (twt)
            {
                tx = twt.tx;
                ty = twt.ty;
            }
            else
            {
                tx = this.target.x;
                ty = this.target.y;
            }

            // calculate direction from this light to the target
            vec.x = wt.tx - tx;
            vec.y = wt.ty - ty;

            // normalize
            const len = Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));

            vec.x /= len;
            vec.y /= len;
        }
    }

    exports.AmbientLight = AmbientLight;
    exports.AmbientLightShader = AmbientLightShader;
    exports.DirectionalLight = DirectionalLight;
    exports.DirectionalLightShader = DirectionalLightShader;
    exports.LayerFinder = LayerFinder;
    exports.Light = Light;
    exports.LightShader = LightShader;
    exports.PointLight = PointLight;
    exports.PointLightShader = PointLightShader;
    exports.ViewportQuad = ViewportQuad;
    exports.diffuseGroup = diffuseGroup;
    exports.lightGroup = lightGroup;
    exports.normalGroup = normalGroup;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof pixi_lights !== 'undefined') { Object.assign(this.PIXI.lights, pixi_lights); }
//# sourceMappingURL=pixi-lights.umd.js.map
