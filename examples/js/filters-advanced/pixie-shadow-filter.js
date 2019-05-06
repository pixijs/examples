const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb,
});
document.body.appendChild(app.view);

app.stop();

// load spine data
// uncomment this line if you run it from pixi-playground
// app.loader.baseUrl = 'https://pixijs.io/examples';
app.loader
    .add('pixie', 'examples/assets/pixi-spine/pixie.json')
    .load(onAssetsLoaded);

app.stage.interactive = true;

function onAssetsLoaded(loader, res) {
    const pixie = new PIXI.spine.Spine(res.pixie.spineData);

    const scale = 0.3;

    pixie.x = 1024 / 3;
    pixie.y = 500;

    pixie.scale.x = pixie.scale.y = scale;

    app.stage.addChild(pixie);

    pixie.stateData.setMix('running', 'jump', 0.2);
    pixie.stateData.setMix('jump', 'running', 0.4);

    pixie.state.setAnimation(0, 'running', true);

    app.stage.on('pointerdown', onTouchStart);

    function onTouchStart() {
        pixie.state.setAnimation(0, 'jump', false);
        pixie.state.addAnimation(0, 'running', true, 0);
    }

    const filter = new PIXI.Filter(myVertex, myFragment);
    // first is the horizontal shift, positive is to the right
    // second is the same as scaleY
    filter.uniforms.shadowDirection = [0.4, 0.5];
    filter.uniforms.floorY = 0.0;
    // how big is max shadow shift to the side?
    // try to switch that off ;)
    filter.padding = 100;

    pixie.filters = [filter];

    app.ticker.add(() => {
        // take ground Y in screen coords to uniforms
        filter.uniforms.floorY = pixie.toGlobal(new PIXI.Point(0, 0)).y;
    });

    app.start();
}

// That's default v4 vertex shader, just in case
const myVertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const myFragment = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec2 shadowDirection;
uniform float floorY;

void main(void) {
    //1. get the screen coordinate
    vec2 screenCoord = vTextureCoord * inputSize.xy + outputFrame.xy;
    //2. calculate Y shift of our dimension vector
    vec2 shadow;
    //shadow coordinate system is a bit skewed, but it has to be the same for screenCoord.y = floorY
    float paramY = (screenCoord.y - floorY) / shadowDirection.y;
    shadow.y = paramY + floorY;
    shadow.x = screenCoord.x + paramY * shadowDirection.x;
    vec2 bodyFilterCoord = (shadow - outputFrame.xy) * inputSize.zw; // same as / inputSize.xy

    vec4 originalColor = texture2D(uSampler, vTextureCoord);
    vec4 shadowColor = texture2D(uSampler, bodyFilterCoord);
    shadowColor.rgb = vec3(0.0);
    shadowColor.a *= 0.5;

    // normal blend mode coefficients (1, 1-src_alpha)
    // shadow is destination (backdrop), original is source
    gl_FragColor = originalColor + shadowColor * (1.0 - originalColor.a);
}
`;
