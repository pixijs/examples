// This examples is hard
// To understand it, you have to carefully read all readme`s and other examples of respective plugins
// Be ready to study the plugins code. Please use latest version of those libs
// Used plugins: pixi-spine, pixi-projection (+spine), pixi-display

const app = new PIXI.Application({ autoStart: false });
document.body.appendChild(app.view);
app.stage = new PIXI.display.Stage();

// apply mixin to spine class, otherwise objects might not be projected
PIXI.projection.applySpine3dMixin(PIXI.spine.Spine.prototype);

const { loader } = app;

// create a new loader
loader.add('spritesheet', 'examples/assets/pixi-projection/dudes.json');
loader.add('back', 'examples/assets/pixi-projection/back.png');
loader.add('pixie', 'examples/assets/pixi-spine/pixie.json');
// begin load
loader.load(onAssetsLoaded);

// holder to store aliens
const alienFrames = ['eggHead.png', 'flowerTop.png', 'helmlok.png', 'skully.png'];

// create an empty container
const camera = new PIXI.projection.Camera3d();
camera.position.set(app.screen.width / 2, app.screen.height / 2);
camera.setPlanes(1000, 10, 10000, true);
app.stage.addChild(camera);

const alienContainer = new PIXI.projection.Container3d();
const earthContainer = new PIXI.projection.Container3d();
camera.addChild(earthContainer);
camera.addChild(alienContainer);

const sortGroup = new PIXI.display.Group(1, ((plane) => {
    plane.zOrder = -plane.getDepth();
}));
app.stage.addChild(new PIXI.display.Layer(sortGroup));
const debugGraphics = new PIXI.Graphics();
app.stage.addChild(debugGraphics);

function spawnAlien(d) {
    let sprite1;
    if (d < 4) {
        const frameName = alienFrames[d];
        // if you want to use 3d transform for object, either create Sprite3d/Container3d
        sprite1 = new PIXI.projection.Sprite3d(PIXI.Texture.from(frameName));
        sprite1.anchor.set(0.5, 1.0);
        sprite1.scale3d.set(0.5);
    } else {
        sprite1 = new PIXI.spine.Spine(loader.resources.pixie.spineData);
        sprite1.scale3d.set(0.1);
        sprite1.state.setAnimation(0, 'running', true);
    }

    // Sprite belongs to plane, and plane is vertical in world coordinates.
    const spritePlane = new PIXI.projection.Container3d();
    spritePlane.alwaysFront = true;
    spritePlane.addChild(sprite1);
    spritePlane.interactive = true;
    spritePlane.parentGroup = sortGroup;

    return spritePlane;
}

const filter = new PIXI.filters.BlurFilter();
filter.blur = 2;

function onAssetsLoaded() {
    const earth = new PIXI.projection.Sprite3d(loader.resources.back.texture);
    // because earth is Sprite3d, we can access its euler angles
    earth.euler.x = Math.PI / 2;
    earth.anchor.x = earth.anchor.y = 0.5;
    earthContainer.addChild(earth);

    for (let i = 0; i < 30; i++) {
        const d = Math.random() * 6 | 0;

        const spritePlane = spawnAlien(d);
        spritePlane.position3d.x = (Math.random() * 2 - 1) * 500.0;
        spritePlane.position3d.z = (Math.random() * 2 - 1) * 500.0;

        alienContainer.addChild(spritePlane);
    }

    earthContainer.interactive = true;
    earthContainer.on('click', (event) => {
        const p = new PIXI.Point();
        event.data.getLocalPosition(earth, p, event.data.global);

        const sp = spawnAlien(4);
        sp.position3d.x = p.x;
        sp.position3d.z = p.y;
        alienContainer.addChild(sp);
    });

    // start animating
    app.start();
}

let ang = 0;

app.ticker.add(() => {
    debugGraphics.clear();
    debugGraphics.lineStyle(2, 0xffffff, 1.0);
    alienContainer.children.forEach((alien) => {
        const rect = alien.getBounds();
        if (rect !== PIXI.Rectangle.EMPTY) debugGraphics.drawShape(rect);
        if (alien.trackedPointers[1] && alien.trackedPointers[1].over) {
            if (!alien.filters) {
                alien.filters = [filter];
            }
        } else {
            alien.filters = null;
        }
    });

    ang += 0.01;
    camera.euler.y = ang;
    camera.euler.x = -Math.PI / 6;

    alienContainer.children.forEach((plane) => {
        if (plane.alwaysFront) {
            // 1. rotate sprite plane to the camera
            plane.children[0].euler.x = -Math.PI / 6;
            // 2. rotate sprite to the camera
            plane.euler.y = ang;
        }
    });
    // We are gonna sort and show correct side of card,
    // so we need updateTransform BEFORE the sorting will be called.
    // otherwise this part will be tardy by one frame
    camera.updateTransform();
});
