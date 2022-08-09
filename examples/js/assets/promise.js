const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Start loading right away and create a promise
const texturePromise = PIXI.Assets.load('examples/assets/bunny.png');

// When the promise resolves, we have the texture!
texturePromise.then((resolvedTexture) => {
    // create a new Sprite from the resolved loaded Texture
    const bunny = PIXI.Sprite.from(resolvedTexture);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);
});
