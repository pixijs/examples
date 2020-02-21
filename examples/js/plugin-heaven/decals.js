// the plugin is here: https://github.com/gameofbombs/pixi-heaven/tree/master

const app = new PIXI.Application({backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

app.loader.add('bunny', 'examples/assets/bunny.png');
app.loader.load(onComplete);

function onComplete(loader, resources) {
    let bunnyTex = resources['bunny'].texture;
    bunnyTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    let bunny = new PIXI.heaven.Sprite(bunnyTex);
    bunny.position.set(100, 100);
    bunny.scale.set(10);

    const W = bunny.width;
    const H = bunny.height;

    let maskRT = PIXI.RenderTexture.create(W, H, 1);
    let blackGraphics = new PIXI.Graphics();
    blackGraphics.beginFill(0);
    blackGraphics.drawRect(0, 0, W, H);

    let whiteBunny = new PIXI.heaven.Sprite(bunnyTex);
    whiteBunny.scale.set(10);
    whiteBunny.color.setDark(1.0, 1.0, 1.0);
    app.renderer.render(blackGraphics, maskRT, false);
    app.renderer.render(whiteBunny, maskRT, false);

    let decalRT = PIXI.RenderTexture.create({ width: W, height: H, scaleMode: PIXI.SCALE_MODES.NEAREST});
    let decals = new PIXI.Container();
    for (let i=0;i<100; i++) {
        let randomBunny = new PIXI.heaven.Sprite(bunnyTex);
        randomBunny.position.set(Math.random() * W | 0, Math.random() * H | 0);
        randomBunny.color.setLight(Math.random(), Math.random(), Math.random());
        randomBunny.color.setDark(Math.random(), Math.random(), Math.random());
        decals.addChild(randomBunny);
    }
    app.renderer.render(decals, decalRT);

    let maskSprite = new PIXI.heaven.Sprite(maskRT);
    let decalSprite = new PIXI.heaven.Sprite(decalRT);

    maskSprite.position = bunny.position;
    decalSprite.position = bunny.position;
    maskSprite.renderable = false;
    //decalSprite.maskSprite = maskSprite;
    //decalSprite.pluginName = 'spriteMasked';
	decalSprite.mask = maskSprite;

    app.stage.addChild(bunny);
    app.stage.addChild(maskSprite);
    app.stage.addChild(decalSprite);
}
