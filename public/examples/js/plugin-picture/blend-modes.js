const app = new PIXI.Application({
    autoDensity: true,
    autoStart: false,
    backgroundColor: 0,
    resolution: devicePixelRatio,
    transparent: true,
    // forceCanvas: true, // uncomment and check that canvas2d works the same
});
const { stage, renderer } = app;

document.body.appendChild(renderer.view);

const SUPPORTED_BLEND_MODES = [
    'NORMAL',
    'ADD',
    'SUBTRACT',
    'MULTIPLY',
    'XOR',
    'SRC_IN',
    'SRC_OUT',
    'SRC_ATOP',
    'DST_OVER',
    'DST_IN',
    'DST_OUT',
    'DST_ATOP',
    'SCREEN',
    'OVERLAY',
    'SOFT_LIGHT',
    'HARD_LIGHT',
];

const BLEND_MODES = SUPPORTED_BLEND_MODES.map((modeName) => [modeName, PIXI.BLEND_MODES[modeName]]);
const R = 36;
const COLOR_DESTINATION = 0xe91e63;
const TEXTURE_DESTINATION = PIXI.RenderTexture.create({ width: 2 * R, height: 2 * R, resolution: renderer.resolution });
const COLOR_SOURCE = 0x2196f3;
const TEXTURE_SOURCE = PIXI.RenderTexture.create({ width: 2 * R, height: 2 * R, resolution: renderer.resolution });

TEXTURE_DESTINATION.baseTexture.framebuffer.multisample = PIXI.MSAA_QUALITY.HIGH;

renderer.render(
    new PIXI.Graphics()
        .beginFill(COLOR_DESTINATION, 1)
        .drawCircle(R, R, R)
        .endFill(),
    {
        renderTexture: TEXTURE_DESTINATION,
    },
);
if (renderer.framebuffer) {
    renderer.framebuffer.blit();
}

renderer.render(
    new PIXI.Graphics()
        .beginFill(COLOR_SOURCE, 0.8)
        .drawRect(0, 0, 2 * R, 2 * R),
    {
        renderTexture: TEXTURE_SOURCE,
    },
);

for (let i = 0, blendModeIndex = 0; i < BLEND_MODES.length; i++) {
    const [blendModeName, blendMode] = BLEND_MODES[i];
    const item = new PIXI.Container();
    const destination = item.addChild(new PIXI.picture.Sprite(TEXTURE_DESTINATION));
    const source = item.addChild(new PIXI.picture.Sprite(TEXTURE_SOURCE));
    const label = item.addChild(new PIXI.Text(blendModeName, {
        fill: 0xffffff,
        fontSize: 12,
    }));

    destination.position.set(-R, -R);
    source.position.set(-2 * R, 0);
    label.position.set(-2 * R, -1.5 * R);

    // Set blend-mode!
    source.blendMode = blendMode;

    const index = blendModeIndex++;
    const xIndex = Math.floor(index / 4);
    const yIndex = (index % 4);

    item.x = (3 + 6 * xIndex) * R;
    item.y = (2 + yIndex * 4) * R;

    stage.addChild(item);
}

app.render();
