const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// Add the assets to load
PIXI.Assets.add('flowerTop', 'examples/assets/flowerTop.png');
PIXI.Assets.add('eggHead', 'examples/assets/eggHead.png');

// Allow the assets to load in the background
PIXI.Assets.backgroundLoad(['flowerTop', 'eggHead']);

// If the background load hasn't loaded this asset yet, calling load forces this asset to load now.
PIXI.Assets.load('eggHead').then((texture) => {
    // auxiliar flag for toggling the texture
    let isEggHead = true;

    // create a new Sprite from the resolved loaded texture
    const character = new PIXI.Sprite(texture);
    character.anchor.set(0.5);
    character.x = app.screen.width / 2;
    character.y = app.screen.height / 2;
    character.interactive = true;
    character.cursor = 'pointer';

    app.stage.addChild(character);

    character.on('pointertap', async () => {
        isEggHead = !isEggHead;
        // These promise are already resolved in the cache.
        character.texture = await PIXI.Assets.load(isEggHead ? 'eggHead' : 'flowerTop');
    });
});
