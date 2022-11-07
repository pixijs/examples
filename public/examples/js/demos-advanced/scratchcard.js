const app = new PIXI.Application();
document.body.appendChild(app.view);

// prepare circle texture, that will be our brush
const brush = new PIXI.Graphics()
    .beginFill(0xffffff)
    .drawCircle(0, 0, 50);

// Create a line that will interpolate the drawn points
const line = new PIXI.Graphics();

PIXI.Assets.add('t1', 'examples/assets/bg_grass.jpg');
PIXI.Assets.add('t2', 'examples/assets/bg_rotate.jpg');
PIXI.Assets.load(['t1', 't2']).then(setup);

function setup() {
    const { width, height } = app.screen;
    const stageSize = { width, height };

    const background = Object.assign(PIXI.Sprite.from('t1'), stageSize);
    const imageToReveal = Object.assign(PIXI.Sprite.from('t2'), stageSize);
    const renderTexture = PIXI.RenderTexture.create(stageSize);
    const renderTextureSprite = new PIXI.Sprite(renderTexture);

    imageToReveal.mask = renderTextureSprite;

    app.stage.addChild(
        background,
        imageToReveal,
        renderTextureSprite,
    );

    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    app.stage
        .on('pointerdown', pointerDown)
        .on('pointerup', pointerUp)
        .on('pointerupoutside', pointerUp)
        .on('pointermove', pointerMove);

    let dragging = false;
    let lastDrawnPoint = null;
    function pointerMove({ global: { x, y } }) {
        if (dragging) {
            brush.position.set(x, y);
            app.renderer.render(brush, {
                renderTexture,
                clear: false,
                skipUpdateTransform: false,
            });
            // Smooth out the drawing a little bit to make it look nicer
            // this connects the previous drawn point to the current one
            // using a line
            if (lastDrawnPoint) {
                line
                    .clear()
                    .lineStyle({ width: 100, color: 0xffffff })
                    .moveTo(lastDrawnPoint.x, lastDrawnPoint.y)
                    .lineTo(x, y);
                app.renderer.render(line, {
                    renderTexture,
                    clear: false,
                    skipUpdateTransform: false,
                });
            }
            lastDrawnPoint = lastDrawnPoint || new PIXI.Point();
            lastDrawnPoint.set(x, y);
        }
    }

    function pointerDown(event) {
        dragging = true;
        pointerMove(event);
    }

    function pointerUp(event) {
        dragging = false;
        lastDrawnPoint = null;
    }
}
