const W = 800;
const H = 600;
const resolution = 1;
const WIDTH = W / resolution;
const HEIGHT = H / resolution;

// LAYERS plugin is here: https://github.com/pixijs/pixi-display/tree/layers
// LIGHTS plugin is here: https://github.com/pixijs/pixi-lights/tree/v4.x

const app = new PIXI.Application({ width: WIDTH, height: HEIGHT, resolution });
document.body.appendChild(app.view);

const stage = app.stage = new PIXI.display.Stage();

// bg is first, its not lighted
const bg = new PIXI.TilingSprite(PIXI.Texture.from('examples/assets/p2.jpeg'), WIDTH, HEIGHT);
bg.tint = 0x808080;
stage.addChild(bg);

// put all layers for deferred rendering of normals
const diffuseLayer = new PIXI.display.Layer(PIXI.lights.diffuseGroup);
stage.addChild(diffuseLayer);
const diffuseBlackSprite = new PIXI.Sprite(diffuseLayer.getRenderTexture());
diffuseBlackSprite.tint = 0;
// without the black sprite, lighted elements will be transparent to background. Try remove that line
stage.addChild(diffuseBlackSprite);
stage.addChild(new PIXI.display.Layer(PIXI.lights.normalGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.lightGroup));

const sortGroup = new PIXI.display.Group(0, true);
sortGroup.on('sort', (sprite) => {
    // green bunnies go down
    sprite.zOrder = -sprite.y;
});
// the group will process all of its members children after the sort
sortGroup.sortPriority = 1;
stage.addChild(new PIXI.display.Layer(sortGroup));

const dragGroup = new PIXI.display.Group(0, true);
// dragged objects has to processed after sorted, so we need a flag here too
dragGroup.sortPriority = 1;
stage.addChild(new PIXI.display.Layer(dragGroup));

// LIGHT and its movement
stage.addChild(new PIXI.lights.AmbientLight(null, 0.6));
const light = new PIXI.lights.PointLight(0xffffff, 1);
light.position.set(525, 160);
stage.addChild(light);
app.ticker.add(() => {
    light.position.copyFrom(app.renderer.plugins.interaction.mouse.global);
});

const lightLoader = new app.loaders.Loader();
lightLoader.baseUrl = 'https://cdn.rawgit.com/pixijs/pixi-lights/b7fd7924fdf4e6a6b913ff29161402e7b36f0c0f/';
lightLoader
    .add('block_diffuse', 'test/block.png')
    .add('block_normal', 'test/blockNormalMap.png')
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, res) {
    for (let i = 0; i < 8; i += 2) {
        stage.addChild(createBlock(100 + i * 50, 100 + i * 30));
    }
    for (let i = 1; i < 8; i += 2) {
        stage.addChild(createBlock(100 + i * 50, 100 + i * 30));
    }
}

function createBlock(x, y) {
    const container = new PIXI.Container();
    // we need to sort them before children go to respective layers
    container.parentGroup = sortGroup;
    container.position.set(x, y);
    const diffuseSprite = new PIXI.Sprite(lightLoader.resources.block_diffuse.texture);
    diffuseSprite.parentGroup = PIXI.lights.diffuseGroup;
    diffuseSprite.anchor.set(0.5);
    const normalSprite = new PIXI.Sprite(lightLoader.resources.block_normal.texture);
    normalSprite.parentGroup = PIXI.lights.normalGroup;
    normalSprite.anchor.set(0.5);
    container.addChild(diffuseSprite);
    container.addChild(normalSprite);

    subscribe(container);

    return container;
}

// / === DRAG ZONE ===
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
