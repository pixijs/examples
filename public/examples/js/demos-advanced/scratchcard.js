// for this example you have to use mouse or touchscreen

const app = new PIXI.Application();
document.body.appendChild(app.view);
const { stage } = app;

// prepare circle texture, that will be our brush
const brush = new PIXI.Graphics();
brush.beginFill(0xffffff);
brush.drawCircle(0, 0, 50);
brush.endFill();

PIXI.Assets.add('t1', 'examples/assets/bg_grass.jpg');
PIXI.Assets.add('t2', 'examples/assets/bg_rotate.jpg');
PIXI.Assets.load(['t1', 't2']).then(setup);

function setup() {
    const background = PIXI.Sprite.from('t1');
    stage.addChild(background);
    background.width = app.screen.width;
    background.height = app.screen.height;

    const imageToReveal = PIXI.Sprite.from('t2');
    stage.addChild(imageToReveal);
    imageToReveal.width = app.screen.width;
    imageToReveal.height = app.screen.height;

    const renderTexture = PIXI.RenderTexture.create({
        width: app.screen.width, height: app.screen.height,
    });

    const renderTextureSprite = new PIXI.Sprite(renderTexture);
    stage.addChild(renderTextureSprite);
    imageToReveal.mask = renderTextureSprite;

    app.stage.interactive = true;
    app.stage.on('pointerdown', pointerDown);
    app.stage.on('pointerup', pointerUp);
    app.stage.on('pointermove', pointerMove);

    let dragging = false;

    function pointerMove(event) {
        if (dragging) {
            brush.position.copyFrom(event.data.global);
            app.renderer.render(brush, {
                renderTexture,
                clear: false,
                transform: null,
                skipUpdateTransform: false,
            });
        }
    }

    function pointerDown(event) {
        dragging = true;
        pointerMove(event);
    }

    function pointerUp(event) {
        dragging = false;
    }
}
