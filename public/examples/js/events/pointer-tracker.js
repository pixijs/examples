// In this a example, a circle will follow the pointer wherever it
// moves over the canvas.

// Create app
const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    background: '#1099bb',
});
document.body.appendChild(app.view);

// Create the circle
const circle = app.stage.addChild(new PIXI.Graphics()
    .beginFill(0xffffff)
    .lineStyle({ color: 0x111111, alpha: 0.87, width: 1 })
    .drawCircle(0, 0, 8)
    .endFill());
circle.position.set(app.screen.width / 2, app.screen.height / 2);

// Enable interactivity!
app.stage.interactive = true;

// Make sure the whole canvas area is interactive, not just the circle.
app.stage.hitArea = app.screen;

// Follow the pointer
app.stage.addEventListener('pointermove', (e) => {
    circle.position.copyFrom(e.global);
});
