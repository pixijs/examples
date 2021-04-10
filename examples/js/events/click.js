// In this a example, you can click on a bunny and the more you click at
// a time the bigger it becomes. If you click outside of the bunny or
// lose your clicking speed, the bunny resets.

// Disable interaction plugin (for PixiJS 6)
// eslint-disable-next-line no-underscore-dangle
delete PIXI.Renderer.__plugins.interaction;

// Create app
const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    backgroundColor: 0x1099bb,
    resolution: devicePixelRatio,
});
document.body.appendChild(app.view);

// Install EventSystem, if not already
// (PixiJS 6 doesn't add it by default)
if (!('events' in app.renderer)) {
    app.renderer.addSystem(PIXI.EventSystem, 'events');
}

const title = app.stage.addChild(new PIXI.Text(
    'Click on the bunny as fast as you can!\nClick outside to reset!', {
        fontSize: 12,
    },
));

title.x = 12;
title.y = 12;

// Create bunny
const bunny = app.stage.addChild(PIXI.Sprite.from('examples/assets/bunny.png'));

// Prevent blurry bunny
bunny.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

// Position the bunny
bunny.anchor.set(0.5, 0.5);
bunny.scale.set(3);
bunny.position.set(
    app.renderer.screen.width / 2,
    app.renderer.screen.height / 2,
);

// Make this bunny interactive
bunny.interactive = true;

// Make stage interactive so you can click on it too
app.stage.interactive = true;
app.stage.hitArea = app.renderer.screen;

// Listen for clicks
app.stage.addEventListener('click', (e) => {
    if (e.target === bunny) {
        // For click events, the detail specifies the number of clicks
        // done in a 200ms interval
        const clicks = e.detail;

        // Make the bunny larger as the user clicks faster!
        bunny.scale.set(3 * (clicks ** 0.34));
    } else {
        // Reset when you click outside of the bunny
        bunny.scale.set(3);
    }
});
