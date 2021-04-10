// In this a example, a circle will follow the pointer wherever it
// moves over the canvas.

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

// Create the circle
const circle = app.stage.addChild(new PIXI.Graphics()
    .beginFill(0xffffff)
    .lineStyle({ color: 0x111111, alpha: 0.87, width: 1 })
    .drawCircle(0, 0, 8)
    .endFill());
circle.position.set(app.renderer.screen.width / 2, app.renderer.screen.height / 2);

// Enable interactivity!
app.stage.interactive = true;

// Make sure the whole canvas area is interactive, not just the circle.
app.stage.hitArea = app.renderer.screen;

// Follow the pointer
app.stage.addEventListener('pointermove', (e) => {
    circle.position.copyFrom(e.global);
});
