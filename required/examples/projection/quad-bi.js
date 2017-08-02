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
    createSquare(w-100, h-100),
    createSquare(w+100, h-100),
    createSquare(w+100, h+100),
    createSquare(w-100, h+100)
];

var quad = squares.map(function(s) { return s.position });

//add sprite itself
var bunny = new PIXI.projection.Sprite2s(new PIXI.Texture.fromImage('required/assets/SceneRotate.jpg'));

app.stage.addChild(bunny);
squares.forEach(function(s) { app.stage.addChild(s); });

// Listen for animate update
app.ticker.add(function (delta) {
    bunny.proj.mapBilinearSprite(bunny, quad);
});

squares.forEach(function(s) { addInteraction(s); });

// === INTERACTION CODE  ===

function toggle(obj) {
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
        //CLICK!
        toggle(obj);
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
