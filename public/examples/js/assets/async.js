const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// await can only be used inside an async function
async function init() {
    const texture = await PIXI.Assets.load('examples/assets/bunny.png');

    // create a new Sprite from the awaited loaded Texture
    const bunny = PIXI.Sprite.from(texture);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);
}

// Call that async function
init();
