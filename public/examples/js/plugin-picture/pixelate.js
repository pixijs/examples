/**
 Based on discussion: http://www.html5gamedevs.com/topic/42199-how-to-make-pixelatefilter-take-effects-in-a-specific-area-of-a-pixisprite/

 How to modify PixelateFilter

 1. put PixelateFilter in the example

 2. add backdropSampler, that'll be our background, and take color from it , not from the uSampler

 3. take only alpha channel of uSampler, without pixelation , multiply result by it

 4. in renderer constructor manually specify two uniforms - backdropSampler, and size. pixi-picture doesn't work if we dont specify it manually :(

 5. put a fullscreen filter on stage. pixi-picture requires that background is rendered inside a framebuffer, i mean Filter or RenderTexture, otherwise "copySubTexImage2D" wont work.
 */

const app = new PIXI.Application({
    backgroundAlpha: 0, // REQUIRED by picture
});
document.body.appendChild(app.view);

const fragment = `
varying vec2 vTextureCoord;

uniform vec2 size;
uniform sampler2D uSampler, backdropSampler;
uniform vec2 backdropSampler_flipY;
uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;

vec2 mapCoord( vec2 coord )
{
    return coord * inputSize.xy + outputFrame.xy;
}

vec2 unmapCoord( vec2 coord )
{
    return (coord - outputFrame.xy) * inputSize.zw;
}

vec2 pixelate(vec2 coord, vec2 size)
{
    return floor( coord / size ) * size;
}

void main(void)
{
    vec2 coord = mapCoord(vTextureCoord);
    coord = pixelate(coord, size);
    coord = unmapCoord(coord);
    // required to take backdrop from screen without extra drawcall
    coord.y = coord.y * backdropSampler_flipY.y + backdropSampler_flipY.x;

    vec4 color = texture2D(backdropSampler, coord);
    vec4 multiplier = texture2D(uSampler, vTextureCoord);

    gl_FragColor = color * multiplier.a;
}`;

class PixelateFilter extends PIXI.Filter {
    constructor(size = 10) {
        super(undefined, fragment, {
            backdropSampler: PIXI.Texture.WHITE.baseTexture,
            uBackdrop_flipY: new Float32Array(2),
            size: new Float32Array(2),
        });
        this.size = size;
        this.backdropUniformName = 'backdropSampler';
    }

    get size() {
        return this.uniforms.size;
    }

    set size(value) {
        if (typeof value === 'number') {
            value = [value, value];
        }
        this.uniforms.size = value;
    }
}

PIXI.Assets.addBundle('bundle', {
    flowerTop: 'examples/assets/flowerTop.png',
    bg_rotate: 'examples/assets/bg_rotate.jpg',
});
PIXI.Assets.loadBundle('bundle').then(complete);

function complete(bundle) {
// create a new background sprite
    const background = new PIXI.Sprite(bundle.bg_rotate);
    background.width = 800;
    background.height = 600;
    app.stage.addChild(background);

    const dude = new PIXI.Sprite(bundle.flowerTop);
    dude.position.set(100);
    dude.filters = [new PixelateFilter()];
    app.stage.addChild(dude);
}
