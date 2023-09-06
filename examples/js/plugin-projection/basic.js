const app = new PIXI.Application({ backgroundColor: 0x103322 });
document.body.appendChild(app.view);

const squareX = new PIXI.Sprite(PIXI.Texture.WHITE);
squareX.tint = 0xff0000;
squareX.factor = 1;
squareX.anchor.set(0.5);
squareX.position.set(app.screen.width - 100, app.screen.height / 2);

const squareY = new PIXI.Sprite(PIXI.Texture.WHITE);
squareY.tint = 0xff0000;
squareY.factor = 1;
squareY.anchor.set(0.5);
squareY.position.set(app.screen.width / 2, app.screen.height - 100);

// create a new Sprite from an image path
const container = new PIXI.projection.Container2d();
container.position.set(app.screen.width / 2, app.screen.height / 2);

app.stage.addChild(container);
app.stage.addChild(squareX);
app.stage.addChild(squareY);

// add sprite itself

const bunny = new PIXI.projection.Sprite2d(PIXI.Texture.from('examples/assets/flowerTop.png'));
bunny.anchor.set(0.5);
bunny.scale.set(0.7);
container.addChild(bunny);

// illuminate the sprite from two points!
const lightY = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
lightY.anchor.set(0.5, 0.1);
lightY.scale.set(15, 200);
lightY.alpha = 0.2;
container.addChildAt(lightY, 0);

const lightX = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
lightX.anchor.set(0.1, 0.5);
lightX.scale.set(200, 15);
lightX.alpha = 0.2;
container.addChildAt(lightX, 1);

// Listen for animate update
app.ticker.add((delta) => {
    // now we can get local coords for points of perspective
    const posX = container.toLocal(squareX.position, undefined, undefined, undefined, PIXI.projection.TRANSFORM_STEP.BEFORE_PROJ);
    const posY = container.toLocal(squareY.position, undefined, undefined, undefined, PIXI.projection.TRANSFORM_STEP.BEFORE_PROJ);
    container.proj.setAxisX(posX, squareX.factor);
    container.proj.setAxisY(posY, squareY.factor);
});

addInteraction(squareX);
addInteraction(squareY);
// move the bunny too!
addInteraction(bunny);

// === CLICKS AND SNAP ===

// changes axis factor
function toggle(obj) {
    if (obj !== bunny) {
        obj.factor = 1.0 - obj.factor;
        obj.tint = obj.factor ? 0xff0033 : 0x00ff00;
    }
}

function snap(obj) {
    if (obj === bunny) {
        obj.position.set(0);
    } else {
        obj.position.x = Math.min(Math.max(obj.position.x, 0), app.screen.width);
        obj.position.y = Math.min(Math.max(obj.position.y, 0), app.screen.height);
    }
}

// === INTERACTION CODE  ===

function addInteraction(obj) {
    obj.interactive = true;
    obj
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);
}

function onDragStart(event) {
    const obj = event.currentTarget;
    obj.dragData = event.data;
    obj.dragging = 1;
    obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
    obj.dragObjStart = new PIXI.Point();
    obj.dragObjStart.copyFrom(obj.position);
    obj.dragGlobalStart = new PIXI.Point();
    obj.dragGlobalStart.copyFrom(event.data.global);
}

function onDragEnd(event) {
    const obj = event.currentTarget;
    if (!obj.dragging) return;
    if (obj.dragging === 1) {
        toggle(obj);
    } else {
        snap(obj);
    }

    obj.dragging = 0;
    obj.dragData = null;
    // set the interaction data to null
}

function onDragMove(event) {
    const obj = event.currentTarget;
    if (!obj.dragging) return;
    const data = obj.dragData; // it can be different pointer!
    if (obj.dragging === 1) {
    // click or drag?
        if (Math.abs(data.global.x - obj.dragGlobalStart.x)
            + Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3) {
            // DRAG
            obj.dragging = 2;
        }
    }
    if (obj.dragging === 2) {
        const dragPointerEnd = data.getLocalPosition(obj.parent);
        // DRAG
        obj.position.set(
            obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x),
            obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y),
        );
    }
}
