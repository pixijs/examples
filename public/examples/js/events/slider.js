// Create app
const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    background: '#1099bb',
});
document.body.appendChild(app.view);

// Make sure stage covers the whole scene
app.stage.hitArea = app.screen;

// Make the slider
const slider = app.stage.addChild(
    new PIXI.Graphics()
        .beginFill(0x38404e, 0.87)
        .drawRect(
            -2,
            0,
            4,
            app.screen.height,
        )
        .endFill(),
);
slider.position.set(12, 0);
// Add invisible scrolling area that's wider than visible slider.
slider
    .beginFill(0xffffff, 1e-4)
    .drawRect(
        -12,
        0,
        24,
        app.screen.height,
    )
    .endFill();
slider.interactive = true;
slider.addEventListener('wheel', onWheel);

// Draw the handle
const handle = slider.addChild(
    new PIXI.Graphics()
        .beginFill(0xffffff)
        .drawCircle(0, 0, 8)
        .endFill(),
);
handle.interactive = true;
handle.position.set(0, app.screen.height / 2);
handle.addEventListener('pointerdown', onDragStart);
handle.addEventListener('pointerup', onDragEnd);
handle.addEventListener('pointerupoutside', onDragEnd);

// Add bunny whose scale can be changed by user using slider
const bunny = app.stage.addChild(PIXI.Sprite.from('examples/assets/bunny.png'));
bunny.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
bunny.scale.set(3);
bunny.anchor.set(0.5);
bunny.position.set(app.screen.width / 2, app.screen.height / 2);

// Add title
const title = app.stage.addChild(
    new PIXI.Text(
        'Drag the white handle to change the scale of bunny. You can also scroll over the slider!',
        {
            fontSize: 12,
        },
    ),
);
title.position.set(24, 4);

// Listen to pointermove on stage once handle is pressed.
function onDragStart(e) {
    app.stage.interactive = true;
    app.stage.addEventListener('pointermove', onDrag);
}

// Stop dragging feedback once the handle is released.
function onDragEnd(e) {
    app.stage.interactive = false;
    app.stage.removeEventListener('pointermove', onDrag);
}

// Update the handle's position & bunny's scale when the handle is moved.
function onDrag(e) {
    // Set handle y-position to match pointer, clamped to (4, screen.height - 4).
    handle.position.y = Math.max(4,
        Math.min(
            slider.toLocal(e.global).y,
            app.screen.height - 4,
        ));
    onHandleMoved();
}

// Handle wheels too. TODO: PixiJS bug where nativeEvent is not set on wheel events.
function onWheel(e) {
    const deltaY = e.deltaY;

    handle.position.y = Math.max(4,
        Math.min(
            handle.position.y + deltaY,
            app.screen.height - 4,
        ));
    onHandleMoved();

    e.preventDefault();
}

function onHandleMoved() {
    // Normalize handle position between -1 and 1.
    const t = 2 * ((handle.position.y / app.screen.height) - 0.5);

    bunny.scale.set(3 * (1.1 + t));
}
