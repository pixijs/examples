// Easy way to apply ANY filter on backdrop with a mask

const app = new PIXI.Application({
    width: 800, height: 600,
});
document.body.appendChild(app.view);

app.loader.baseUrl = 'https://pixijs.io/examples/examples/assets';

app.loader.add('bg_rotate.jpg').add('flowerTop.png').load(complete);

const blur = new PIXI.filters.BlurFilter();

function makeEasyWindow() {
    const container = new PIXI.Container();

    //mask the background and blur it
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xffffff, 1.0);
    graphics.drawRoundedRect(-150, -50, 300, 100, 40);
    graphics.filters = [new PIXI.picture.MaskFilter(blur)];

    container.addChild(graphics);

    // blend graphics on top, after everything, with alpha=0.5
    const graphics2 = new PIXI.Graphics();
    graphics2.beginFill(0xffffff, 0.5);
    graphics2.drawRoundedRect(-150, -50, 300, 100, 40);

    container.addChild(graphics2);

    return container;
}


function makeHardWindow() {
    const container = new PIXI.Container();

    const config = new PIXI.picture.MaskConfig();
    config.maskBefore = true;
    // combine with overlay graphics with alpha=0.6, then mask it with same graphics
    config.uniforms.uChannel[3] = 0.6;
    config.blendCode =
        'vec4 overlay = b_src * uChannel.a;' +
        'vec4 mix = b_dest * (1.0-overlay.a) + overlay;' +
        'b_res = mix * b_src.a;';

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xffffff, 1.0);
    graphics.drawRoundedRect(-150, -50, 300, 100, 40);
    graphics.filters = [new PIXI.picture.MaskFilter(blur, config)];
    container.addChild(graphics);
    return container;
}

function complete() {
// create a new background sprite
    const background = new PIXI.Sprite(app.loader.resources['bg_rotate.jpg'].texture);
    background.width = 800;
    background.height = 600;
    app.stage.addChild(background);

    const window1 = makeEasyWindow();
    const window2 = makeHardWindow();
    window1.position.set(250, 150);
    window2.position.set(250, 450);
    app.stage.addChild(window1, window2);

    // do not forget - filter above is required for backdrops to work
    app.stage.filters = [new PIXI.filters.AlphaFilter()];
    app.stage.filterArea = app.screen;

    app.ticker.add((delta) => {
        window1.rotation += 0.01 * delta;
    })
}
