// for this example you have to move mouse

const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);
const stage = app.stage;

PIXI.loader.add('t1', 'examples/assets/bg_grass.jpg');
PIXI.loader.load(setup);

function setup(loader, resources) {
    let background = new PIXI.Sprite(resources['t1'].texture);
    stage.addChild(background);
    background.width = app.screen.width;
    background.height = app.screen.height;

    // Dimension
    let radius = 150;
    let offset = 10; // depends on blur factor.

    let circle = new PIXI.Graphics();
    circle.beginFill(0xFF0000);
    circle.drawCircle(radius + offset, radius + offset, radius);
    circle.endFill();

    // Filters
    circle.filters = [new PIXI.filters.BlurFilter()];

    let rect = new PIXI.Rectangle(0, 0, (radius + offset) * 2, (radius + offset) * 2);
    let texture = app.renderer.generateTexture(circle, PIXI.SCALE_MODES.NEAREST, 1, rect);

    focus = new PIXI.Sprite(texture);

    stage.addChild(focus);
    background.mask = focus;

    app.stage.interactive = true;
    app.stage.on('mousemove', pointerMove);

    function pointerMove(event)
    {
        focus.position.x = event.data.global.x - focus.width * 0.5;
        focus.position.y = event.data.global.y - focus.height * 0.5;
    }
}
