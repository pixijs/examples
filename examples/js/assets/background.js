const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Add the assets to load
PIXI.Assets.add('flowerTop', 'examples/assets/flowerTop.png');
PIXI.Assets.add('eggHead', 'examples/assets/eggHead.png');

// Allow the assets to load in the background
PIXI.Assets.backgroundLoad(['flowerTop', 'eggHead']);


// If the background load hasn't loaded this asset yet, calling load forces this asset to load now.
PIXI.Assets.load('eggHead').then((texture) => {
    // auxiliar flag for toggling the texture
    let bol = true;

    // create a new Sprite from the resolved loaded texture
    const dude = new PIXI.Sprite(texture);
    dude.anchor.set(0.5);
    dude.x = app.screen.width / 2;
    dude.y = app.screen.height / 2;
    app.stage.addChild(dude);

    dude.interactive = true;
    dude.buttonMode = true;

    dude.on('pointertap', async () => {
        bol = !bol;

        // These promise are already resolved in the cache.
        if (bol) {
            dude.texture = await PIXI.Assets.load('eggHead');
        } else {
            dude.texture = await PIXI.Assets.load('flowerTop');
        }
    });
});
