var app = new PIXI.Application(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

var w = app.screen.width/2, h = app.screen.height/2;

function createSquare(x, y) {
    var square = new PIXI.Sprite(PIXI.Texture.WHITE);
    square.tint = 0xff0000;
    square.factor = 1;
    square.anchor.set(0.5);
    square.position.set(x, y);
    return square;
}

var squares = [
    createSquare(w-150, h-150),
    createSquare(w+150, h-150),
    createSquare(w+150, h+150),
    createSquare(w-150, h+150)
];

var quad = squares.map(function(s) { return s.position });

//add sprite itself
var containerSprite = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage('required/assets/SceneRotate.jpg'));
containerSprite.anchor.set(0.5);

app.stage.addChild(containerSprite);
squares.forEach(function(s) { app.stage.addChild(s); });

// Listen for animate update
app.ticker.add(function (delta) {
    containerSprite.proj.mapSprite(containerSprite, quad);
});

squares.forEach(function(s) { addInteraction(s); });

// let us add sprite to make it more funny

var bunny = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage('required/assets/flowerTop.png'));
bunny.anchor.set(0.5);
containerSprite.addChild(bunny);

addInteraction(bunny);

// === INTERACTION CODE  ===

function toggle(obj) {
}

function snap(obj) {
    if (obj == bunny) {
        obj.position.set(0);
    } else {
        obj.position.x = Math.min(Math.max(obj.position.x, 0), app.screen.width);
        obj.position.y = Math.min(Math.max(obj.position.y, 0), app.screen.height);
    }
}

function addInteraction(obj) {
    obj.interactive = true;
    obj
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);
}

function onDragStart(event) {
    var obj = event.currentTarget;
    obj.dragData = event.data;
    obj.dragging = 1;
    obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
    obj.dragObjStart = new PIXI.Point();
    obj.dragObjStart.copy(obj.position);
    obj.dragGlobalStart = new PIXI.Point();
    obj.dragGlobalStart.copy(event.data.global);
}

function onDragEnd(event) {
    var obj = event.currentTarget;
    if (obj.dragging == 1) {
        toggle(obj);
    } else {
        snap(obj);
    }
    obj.dragging = 0;
    obj.dragData = null;
    // set the interaction data to null
}

function onDragMove(event) {
    var obj = event.currentTarget;
    if (!obj.dragging) return;
    var data = obj.dragData; // it can be different pointer!
    if (obj.dragging == 1) {
        // click or drag?
        if (Math.abs(data.global.x - obj.dragGlobalStart.x) +
            Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3) {
            // DRAG
            obj.dragging = 2;
        }
    }
    if (obj.dragging == 2) {
        var dragPointerEnd = data.getLocalPosition(obj.parent);
        // DRAG
        obj.position.set(
            obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x),
            obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y)
        );
    }
}
