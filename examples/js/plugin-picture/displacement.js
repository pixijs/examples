// This is demo of pixi-picture.js, https://github.com/pixijs/pixi-picture
// This is pixijs DisplacementFilter improvement, using a backdrop

const shaderVert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vTextureCoord = aTextureCoord;
}
`;

const shaderFrag = `
varying vec2 vTextureCoord;

uniform vec2 scale;

uniform sampler2D uSampler;
uniform sampler2D backdropSampler;
uniform vec2 backdropSampler_flipY;

uniform highp vec4 inputSize;
uniform vec4 inputClamp;

void main(void)
{
  vec4 map =  texture2D(uSampler, vTextureCoord);

  map -= 0.5;
  map.xy *= scale * inputSize.zw;

  vec2 dis = clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw);
  // required to take backdrop from screen without extra drawcall
  dis.y = dis.y * backdropSampler_flipY.y + backdropSampler_flipY.x;

  gl_FragColor = texture2D(backdropSampler, dis);
}
`;

class DisplacementFilter extends PIXI.Filter {
    constructor(scale) {
        super(
            shaderVert,
            shaderFrag,
        );

        this.uniforms.scale = { x: 1, y: 1 };

        if (scale === null || scale === undefined) {
            scale = 20;
        }

        this.scale = new PIXI.Point(scale, scale);

        this.backdropUniformName = 'backdropSampler';
    }

    apply(filterManager, input, output, clearMode) {
        this.uniforms.scale.x = this.scale.x;
        this.uniforms.scale.y = this.scale.y;

        // draw the filter...
        filterManager.applyFilter(this, input, output, clearMode);

        this.clearColor = [0.5, 0.5, 0.5, 1.0];
    }
}


const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

app.stage.interactive = true;

const container = new PIXI.Container();
app.stage.addChild(container);

const padding = 100;
const bounds = new PIXI.Rectangle(
    -padding,
    -padding,
    app.screen.width + padding * 2,
    app.screen.height + padding * 2,
);
const doges = [];

for (let i = 0; i < 20; i++) {
    const doge = PIXI.Sprite.from('examples/assets/pixi_doge.png');
    doge.anchor.set(0.5);
    container.addChild(doge);

    doge.direction = Math.random() * Math.PI * 2;
    doge.speed = 1;
    doge.turnSpeed = Math.random() - 0.8;

    doge.x = Math.random() * bounds.width;
    doge.y = Math.random() * bounds.height;

    doge.scale.set(1 + Math.random() * 0.3);
    doge.original = new PIXI.Point();
    doge.original.copyFrom(doge.scale);
    doges.push(doge);
}
const displacementContainer = new PIXI.Container();
const displacementTexture = PIXI.Texture.from('https://pixijs.io/examples/examples/assets/pixi-filters/displace.png');
for (let i = -1; i <= 1; i += 2) {
    const sprite1 = new PIXI.Sprite(displacementTexture);
    sprite1.position.set(100 * i, 0);
    sprite1.anchor.set(0.5);
    displacementContainer.addChild(sprite1);
}
app.stage.addChild(displacementContainer);

const displacementFilter = new DisplacementFilter();
displacementContainer.filters = [displacementFilter];
displacementFilter.scale.x = 110;
displacementFilter.scale.y = 110;
// displacementFilter.padding = 0;


const ringTexture = PIXI.Texture.from('https://pixijs.io/examples/examples/assets/pixi-filters/ring.png');
const rings = new PIXI.Container();
for (let i = -1; i <= 1; i += 2) {
    const sprite1 = new PIXI.Sprite(ringTexture);
    sprite1.position.set(100 * i, 0);
    sprite1.anchor.set(0.5);
    rings.addChild(sprite1);
}
rings.visible = false;

app.stage.addChild(rings);

const bg = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bg_grass.jpg');
bg.width = app.screen.width;
bg.height = app.screen.height;

bg.alpha = 1;

app.stage.addChildAt(bg, 0);

app.stage
    .on('mousemove', onPointerMove)
    .on('touchmove', onPointerMove);

function onPointerMove(eventData) {
    rings.visible = true;

    displacementContainer.position.set(eventData.data.global.x, eventData.data.global.y);
    rings.position.copyFrom(displacementContainer.position);
}

let count = 0;

app.ticker.add(() => {
    count += 0.05;

    for (let i = 0; i < doges.length; i++) {
        const doge = doges[i];

        doge.direction += doge.turnSpeed * 0.01;
        doge.x += Math.sin(doge.direction) * doge.speed;
        doge.y += Math.cos(doge.direction) * doge.speed;

        doge.rotation = -doge.direction - Math.PI / 2;
        doge.scale.x = doge.original.x + Math.sin(count) * 0.2;

        // wrap the doges around as the crawl
        if (doge.x < bounds.x) {
            doge.x += bounds.width;
        } else if (doge.x > bounds.x + bounds.width) {
            doge.x -= bounds.width;
        }

        if (doge.y < bounds.y) {
            doge.y += bounds.height;
        } else if (doge.y > bounds.y + bounds.height) {
            doge.y -= bounds.height;
        }
    }
});
