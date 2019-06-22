// This is demo of pixi-layers.js, https://github.com/pixijs/pixi-layers
// Drag the rabbits to understand what's going on

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// META STUFF, groups exist without stage just fine

// z-index = 0, sorting = true;
const greenGroup = new PIXI.display.Group(0, true);
greenGroup.on('sort', (sprite) => {
    // green bunnies go down
    sprite.zOrder = sprite.y;
});

// z-index = 1, sorting = true, we can provide zOrder function directly in constructor
const blueGroup = new PIXI.display.Group(1, ((sprite) => {
    // blue bunnies go up
    sprite.zOrder = -sprite.y;
}));

// Drag is the best layer, dragged element is above everything else
const dragGroup = new PIXI.display.Group(2, false);

// Shadows are the lowest
const shadowGroup = new PIXI.display.Group(-1, false);

// specify display list component
app.stage = new PIXI.display.Stage();
// PixiJS v5 sorting - works on zIndex - and layer gets its zIndex from a group!
app.stage.sortableChildren = true;
// sorry, group cant exist without layer yet :(;
app.stage.addChild(new PIXI.display.Layer(greenGroup));
app.stage.addChild(new PIXI.display.Layer(blueGroup));
app.stage.addChild(new PIXI.display.Layer(dragGroup));
app.stage.addChild(new PIXI.display.Layer(shadowGroup));

const blurFilter = new PIXI.filters.BlurFilter();
blurFilter.blur = 0.5;

// create a texture from an image path
const textureGreen = PIXI.Texture.from('examples/assets/bunny_green.png');
const textureBlue = PIXI.Texture.from('examples/assets/bunny_blue.png');

// make obsolete containers. Why do we need them?
// Just to show that we can do everything without caring of actual parent container
const bunniesOdd = new PIXI.Container();
const bunniesEven = new PIXI.Container();
const bunniesBlue = new PIXI.Container();
app.stage.addChild(bunniesOdd);
app.stage.addChild(bunniesBlue);
app.stage.addChild(bunniesEven);

for (let i = 0; i < 15; i++) {
    const bunny = new PIXI.Sprite(textureGreen);
    bunny.width = 50;
    bunny.height = 50;
    bunny.position.set(100 + 20 * i, 100 + 20 * i);
    bunny.anchor.set(0.5);
    // that thing is required
    bunny.parentGroup = greenGroup;
    if (i % 2 === 0) {
        bunniesEven.addChild(bunny);
    } else {
        bunniesOdd.addChild(bunny);
    }
    subscribe(bunny);
    addShadow(bunny);
}

for (let i = 9; i >= 0; i--) {
    const bunny = new PIXI.Sprite(textureBlue);
    bunny.width = 50;
    bunny.height = 50;
    bunny.position.set(400 + 20 * i, 400 - 20 * i);
    bunny.anchor.set(0.5);
    // that thing is required
    bunny.parentGroup = blueGroup;
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
    const gr = new PIXI.Graphics();
    gr.beginFill(0x0, 1);
    // yes , I know bunny size, I'm sorry for this hack
    const scale = 1.1;
    gr.drawRect(-25 / 2 * scale, -36 / 2 * scale, 25 * scale, 36 * scale);
    gr.endFill();
    gr.filters = [blurFilter];

    gr.parentGroup = shadowGroup;
    obj.addChild(gr);
}

function onDragStart(event) {
    if (!this.dragging) {
        this.data = event.data;
        this.oldGroup = this.parentGroup;
        this.parentGroup = dragGroup;
        this.dragging = true;

        this.scale.x *= 1.1;
        this.scale.y *= 1.1;
        this.dragPoint = event.data.getLocalPosition(this.parent);
        this.dragPoint.x -= this.x;
        this.dragPoint.y -= this.y;
    }
}

function onDragEnd() {
    if (this.dragging) {
        this.dragging = false;
        this.parentGroup = this.oldGroup;
        this.scale.x /= 1.1;
        this.scale.y /= 1.1;
        // set the interaction data to null
        this.data = null;
    }
}

function onDragMove() {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x - this.dragPoint.x;
        this.y = newPosition.y - this.dragPoint.y;
    }
}
