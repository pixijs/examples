// Dissolve blending shader part
const DISSOLVE_FULL = `
    // Noise function that generates a random number between 0 and 1
    float rand = fract(sin(dot(
        vTextureCoord.xy ,vec2(12.9898,78.233))) * 43758.5453);

    if (rand < b_src.a) {
        b_res = b_src / b_src.a;
    }
`;

// Create a globally shared instance of the dissolve blending filter
const dissolveFilter = new PIXI.picture.BlendFilter({
    blendCode: DISSOLVE_FULL,
});

// Setup app - autoStart false since we will render only once
// to save battery life
const app = new PIXI.Application({
    autoDensity: true,
    autoStart: false,
    backgroundColor: 0,
    // devicePixelRatio when PixiJS Picture is fixed cc @ivanpopelyshev
    resolution: 1,
    transparent: true,
});

document.body.appendChild(app.view);

main();

// Setup scene and then render once
function main() {
    const left = makeBlendSubscene();
    const right = makeBlendSubscene();

    // Add dissolve filter
    left.fg.filters = [dissolveFilter];

    // Move right column
    right.container.x = app.renderer.screen.width / 2;

    // Render scence once
    app.render();
}

function makeBlendSubscene() {
    // Black background
    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.tint = 0;

    // Translucent white layer on top
    const fg = new PIXI.Sprite(PIXI.Texture.WHITE);

    bg.width = fg.width = app.renderer.screen.width / 2;
    bg.height = fg.height = app.renderer.screen.height;
    fg.alpha = 0.5;

    const container = new PIXI.Container();

    container.addChild(bg, fg);
    app.stage.addChild(container);

    return { container, bg, fg };
}
