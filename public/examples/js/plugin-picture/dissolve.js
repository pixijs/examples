// Dissolve blending shader part
const DISSOLVE_FULL = `
    // Noise function that generates a random number between 0 and 1
    float rand = fract(sin(dot(
        vTextureCoord.xy ,vec2(12.9898,78.233))) * 43758.5453);

    if (rand < b_src.a) {
        b_res = b_src;
    }
`;

// Create a globally shared instance of the dissolve blending filter
const dissolveFilter = new PIXI.picture.BlendFilter({
    blendCode: DISSOLVE_FULL,
});

// Setup app - autoStart false since we will render only once
// to save battery life
const app = new PIXI.Application({
    autoStart: false,
    backgroundAlpha: 0, // REQUIRED by picture
});

document.body.appendChild(app.view);

// Load assets
PIXI.Assets.load('examples/assets/bg_plane.jpg').then(main);

// Setup scene and then render once
function main(tex) {
    const left = makeBlendSubscene(tex);
    const right = makeBlendSubscene(tex);

    // Add dissolve filter
    left.fg.filters = [dissolveFilter];

    // Move right column
    right.container.x = app.renderer.screen.width / 2;

    // Render scence once
    app.render();
}

function makeBlendSubscene(tex) {
    // Black background
    const bg = new PIXI.Sprite(tex);

    // Translucent white layer on top
    const fg = new PIXI.Sprite(PIXI.Texture.WHITE);

    bg.width = fg.width = app.renderer.screen.width / 2;
    bg.height = fg.height = app.renderer.screen.height;
    fg.alpha = 0.3;

    const container = new PIXI.Container();

    container.addChild(bg, fg);
    app.stage.addChild(container);

    return { container, bg, fg };
}
