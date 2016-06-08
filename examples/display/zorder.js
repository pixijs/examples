// This is demo of pixi-display.js, https://github.com/gameofbombs/pixi-display
// Drag the rabbits to understand what's going on

var renderer = new PIXI.WebGLRenderer(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var root = new PIXI.Container();
//specify display list component
root.displayList = new PIXI.DisplayList();

// z-index = 0, sorting = true;
var greenLayer = new PIXI.DisplayGroup(0, true);
greenLayer.on('add', function (sprite) {
    //green bunnies go down
    sprite.zOrder = -sprite.position.y;
});

// z-index = 1, sorting = true, we can provide zOrder function directly in constructor
var blueLayer = new PIXI.DisplayGroup(1, function (sprite) {
    //blue bunnies go up
    sprite.zOrder = +sprite.position.y;
});

// Drag is the best layer, dragged element is above everything else
var dragLayer = new PIXI.DisplayGroup(2, false);

// Shadows are the lowest
var shadowLayer = new PIXI.DisplayGroup(-1, false);


var blurFilter = new PIXI.filters.BlurFilter();
blurFilter.blur = 0.5;

// create a texture from an image path
var texture_green = PIXI.Texture.fromImage('_assets2/bunnies/square_green.png');
var texture_blue = PIXI.Texture.fromImage('_assets2/bunnies/square_blue.png');

var bunniesOdd = new PIXI.Container();
var bunniesEven = new PIXI.Container();
var bunniesBlue = new PIXI.Container();
root.addChild(bunniesOdd);
root.addChild(bunniesBlue);
root.addChild(bunniesEven);

var ind = [];
for (var i = 0; i < 15; i++) {
    var bunny = new PIXI.Sprite(texture_green);
    bunny.width = 50;
    bunny.height = 50;
    bunny.position.set(100 + 20 * i, 100 + 20 * i);
    bunny.anchor.set(0.5);
    // that thing is required
    bunny.displayGroup = greenLayer;
    if (i % 2 == 0) {
        bunniesEven.addChild(bunny);
    } else {
        bunniesOdd.addChild(bunny);
    }
    subscribe(bunny);
    addShadow(bunny);
}

for (var i = 9; i >= 0; i--) {
    var bunny = new PIXI.Sprite(texture_blue);
    bunny.width = 50;
    bunny.height = 50;
    bunny.position.set(400 + 20 * i, 400 - 20 * i);
    bunny.anchor.set(0.5);
    // that thing is required
    bunny.displayGroup = blueLayer;
    bunniesBlue.addChild(bunny);
    subscribe(bunny);
    addShadow(bunny);
}

function subscribe(obj) {
    obj.interactive = true;
    obj.on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
}

function addShadow(obj) {
    var gr = new PIXI.Graphics();
    gr.beginFill(0x0, 1);
    //yes , I know bunny size, I'm sorry for this hack
    var scale = 1.1;
    gr.drawRect(-25/2 * scale, -36/2 * scale, 25 * scale, 36 * scale);
    gr.endFill();
    gr.filters = [blurFilter];

    gr.displayGroup = shadowLayer;
    obj.addChild(gr);
}

function onDragStart(event) {
    if (!this.dragging) {
        this.data = event.data;
        this.oldGroup = this.displayGroup;
        this.displayGroup = dragLayer;
        this.dragging = true;

        this.scale.x *= 1.1;
        this.scale.y *= 1.1;
        this.dragPoint = event.data.getLocalPosition(this.parent);
        this.dragPoint.x -= this.position.x;
        this.dragPoint.y -= this.position.y;
    }
}

function onDragEnd() {
    if (this.dragging) {
        this.dragging = false;
        this.displayGroup = this.oldGroup;
        this.scale.x /= 1.1;
        this.scale.y /= 1.1;
        // set the interaction data to null
        this.data = null;
    }
}

function onDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x = newPosition.x - this.dragPoint.x;
        this.position.y = newPosition.y - this.dragPoint.y;
    }
}

// start animating
var ticker = new PIXI.ticker.Ticker();

ticker.add(function (deltaTime) {
    renderer.render(root);
});

ticker.start();
