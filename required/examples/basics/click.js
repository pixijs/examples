var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// Scale mode for all textures, will retain pixelation
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var sprite = PIXI.Sprite.fromImage('required/assets/basics/bunny.png');

// Set the initial position
sprite.anchor.set(0.5);
sprite.x = app.renderer.width / 2;
sprite.y = app.renderer.height / 2;

// Opt-in to interactivity
sprite.interactive = true;

// Shows hand cursor
sprite.buttonMode = true;

// Pointers normalize touch and mouse
sprite.on('pointerdown', onClick);

// Alternatively, use the mouse & touch events:
// sprite.on('click', onClick); // mouse-only
// sprite.on('tap', onClick); // touch-only

app.stage.addChild(sprite);

function onClick () {
    sprite.scale.x *= 1.25;
    sprite.scale.y *= 1.25;
}
