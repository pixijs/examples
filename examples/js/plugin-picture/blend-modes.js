const renderer = new PIXI.Renderer({
    autoDensity: true,
    backgroundColor: 0,
    resolution: devicePixelRatio,
});
const stage = new PIXI.Container();
const snapshot = new PIXI.Sprite();

document.body.appendChild(renderer.view);

const SUPPORTED_BLEND_MODES = [
    'NORMAL',
    'ADD',
    // 'MULTIPLY',
    'SCREEN',
    'OVERLAY',
    'SOFT_LIGHT',
    'HARD_LIGHT',
];

const BLEND_MODES = Object.entries(PIXI.BLEND_MODES).filter(([key]) => SUPPORTED_BLEND_MODES.includes(key));
const R = 48;
const COLOR_DESTINATION = 0xe91e63;
const TEXTURE_DESTINATION = PIXI.RenderTexture.create({ width: 2 * R, height: 2 * R, resolution: renderer.resolution });
const COLOR_SOURCE = 0x2196f3;
const TEXTURE_SOURCE = PIXI.RenderTexture.create({ width: 2 * R, height: 2 * R, resolution: renderer.resolution });
const TEXTURE_FRAMEBUFFER = PIXI.RenderTexture.create({ width: renderer.screen.width, height: renderer.screen.height, resolution: renderer.resolution });

TEXTURE_DESTINATION.baseTexture.framebuffer.multisample = PIXI.MSAA_QUALITY.HIGH;

snapshot.texture = TEXTURE_FRAMEBUFFER;

renderer.render(
    new PIXI.Graphics()
        .beginFill(COLOR_DESTINATION, 1)
        .drawCircle(R, R, R)
        .endFill(),
    {
        renderTexture: TEXTURE_DESTINATION,
    },
);
renderer.framebuffer.blit();

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
    label.position.set(R + 12, -label.height / 2);

    // Set blend-mode!
    source.blendMode = blendMode;

    const index = blendModeIndex++;
    const xIndex = Math.floor(index / 3);
    const yIndex = (index % 3);

    item.x = (3 + 10 * xIndex) * R;
    item.y = (1.5 + yIndex * 4) * R;

    stage.addChild(item);
}

PIXI.Ticker.shared.addOnce(() => {
    renderer.renderTexture.bind(TEXTURE_FRAMEBUFFER);
    renderer.renderTexture.clear([0, 0, 0, 0]);

    renderer.render(stage, { renderTexture: TEXTURE_FRAMEBUFFER, clear: false });

    renderer.renderTexture.bind(null);
    renderer.render(snapshot);
});
