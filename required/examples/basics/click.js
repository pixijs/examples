var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

var sprite = PIXI.Sprite.fromImage('required/assets/basics/bunny.png');

// Scale mode for pixelation
sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

// Set the initial position
sprite.x = 230
sprite.y = 264;

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
