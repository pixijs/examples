const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// META STUFF, groups exist without stage just fine

// z-index = 0, sorting = true;
const greenGroup = new PIXI.layers.Group(0, true);
greenGroup.on('sort', (sprite) => {
    // green bunnies go down
    sprite.zOrder = sprite.y;
});

// z-index = 1, sorting = true, we can provide zOrder function directly in constructor
const blueGroup = new PIXI.layers.Group(1, ((sprite) => {
    // blue bunnies go up
    sprite.zOrder = -sprite.y;
}));

// Drag is the best layer, dragged element is above everything else
const dragGroup = new PIXI.layers.Group(2, false);

// Shadows are the lowest
const shadowGroup = new PIXI.layers.Group(-1, false);

// specify display list component
app.stage = new PIXI.layers.Stage();
// PixiJS v5 sorting - works on zIndex - and layer gets its zIndex from a group!
app.stage.sortableChildren = true;
app.stage.interactive = true;
app.stage.hitArea = app.screen;
// sorry, group cant exist without layer yet :(;
app.stage.addChild(new PIXI.layers.Layer(greenGroup));
app.stage.addChild(new PIXI.layers.Layer(blueGroup));
app.stage.addChild(new PIXI.layers.Layer(dragGroup));
app.stage.addChild(new PIXI.layers.Layer(shadowGroup));

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
        .on('touchendoutside', onDragEnd);
}

app.stage
    .on('mousemove', onDragMove)
    .on('touchmove', onDragMove);

let dragTarget = null;
const dragPoint = new PIXI.Point();

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
    if (!dragTarget) {
        this.oldGroup = this.parentGroup;
        this.parentGroup = dragGroup;
        this.scale.x *= 1.1;
        this.scale.y *= 1.1;
        this.toLocal(event.global, null, dragPoint);
        dragTarget = this;
    }
}

function onDragEnd() {
    if (dragTarget) {
        this.parentGroup = this.oldGroup;
        this.scale.x /= 1.1;
        this.scale.y /= 1.1;
        dragTarget = null;
    }
}

function onDragMove(event) {
    if (dragTarget) {
        dragTarget.x = event.global.x - dragPoint.x;
        dragTarget.y = event.global.y - dragPoint.y;
    }
}
