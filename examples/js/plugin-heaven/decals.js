// the plugin is here: https://github.com/gameofbombs/pixi-heaven/tree/master

const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

app.loader.add('bunny', 'examples/assets/bunny.png');
app.loader.load(onComplete);

function onComplete(loader, resources) {
    const bunnyTex = resources.bunny.texture;
    bunnyTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    const bunny = new PIXI.heaven.SpriteH(bunnyTex);
    bunny.position.set(100, 100);
    bunny.scale.set(10);

    const W = bunny.width;
    const H = bunny.height;

    const maskRT = PIXI.RenderTexture.create(W, H, 1);
    const blackGraphics = new PIXI.Graphics();
    blackGraphics.beginFill(0);
    blackGraphics.drawRect(0, 0, W, H);

    const whiteBunny = new PIXI.heaven.SpriteH(bunnyTex);
    whiteBunny.scale.set(10);
    whiteBunny.color.setDark(1.0, 1.0, 1.0);
    app.renderer.render(blackGraphics, maskRT, false);
    app.renderer.render(whiteBunny, maskRT, false);

    const decalRT = PIXI.RenderTexture.create({ width: W, height: H, scaleMode: PIXI.SCALE_MODES.NEAREST });
    const decals = new PIXI.Container();
    for (let i = 0; i < 100; i++) {
        const randomBunny = new PIXI.heaven.SpriteH(bunnyTex);
        randomBunny.position.set(Math.random() * W | 0, Math.random() * H | 0);
        randomBunny.color.setLight(Math.random(), Math.random(), Math.random());
        randomBunny.color.setDark(Math.random(), Math.random(), Math.random());
        decals.addChild(randomBunny);
    }
    app.renderer.render(decals, decalRT);

    const maskSprite = new PIXI.heaven.SpriteH(maskRT);
    const decalSprite = new PIXI.heaven.SpriteH(decalRT);

    maskSprite.position = bunny.position;
    decalSprite.position = bunny.position;
    maskSprite.renderable = false;
    decalSprite.maskSprite = maskSprite;
    decalSprite.pluginName = 'batchMasked';

    app.stage.addChild(bunny);
    app.stage.addChild(maskSprite);
    app.stage.addChild(decalSprite);
}
