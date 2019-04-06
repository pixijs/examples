// This examples is hard
// To understand it, you have to carefully read all readme`s and other examples of respective plugins
// Be ready to study the plugins code. Please use latest version of those libs
// Used plugins: pixi-spine, pixi-projection (+spine), pixi-display

var app = new PIXI.Application(800, 600, {resolution: 1, autoStart: false });
document.body.appendChild(app.view);
app.stage = new PIXI.display.Stage();

var loader = app.loader;

// create a new loader
loader.add('spritesheet', 'examples/assets/pixi-projection/dudes.json');
loader.add('back', 'examples/assets/pixi-projection/back.png');
loader.add('pixie', 'examples/assets/pixi-spine/pixie.json');
//begin load
loader.load(onAssetsLoaded);

// holder to store aliens
var aliens = [];
var alienFrames = ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"];

// create an empty container
var camera = new PIXI.projection.Camera3d();
camera.position.set(app.screen.width/2, app.screen.height/2);
camera.setPlanes(1000, 10, 10000, true);
app.stage.addChild(camera);

var alienContainer = new PIXI.projection.Container3d();
var earthContainer = new PIXI.projection.Container3d();
camera.addChild(earthContainer);
camera.addChild(alienContainer);

var sortGroup = new PIXI.display.Group(1, function (plane) {
    plane.zOrder = plane.getDepth();
});
app.stage.addChild(new PIXI.display.Layer(sortGroup));
var debugGraphics = new PIXI.Graphics();
app.stage.addChild(debugGraphics);

function spawnAlien(d) {
    if (d < 4) {
        var frameName = alienFrames[d];
        //if you want to use 3d transform for object, either create Sprite3d/Container3d
        var sprite1 = new PIXI.projection.Sprite3d(PIXI.Texture.fromFrame(frameName));
        sprite1.anchor.set(0.5, 1.0);
        sprite1.scale3d.set(0.5);
    } else {
        var sprite1 = new PIXI.projection.Spine3d(loader.resources.pixie.spineData);
        sprite1.scale3d.set(0.1);
        sprite1.state.setAnimation(0, "running", true);
        //sprite1.alpha = 0.5;
    }

    //Sprite belongs to plane, and plane is vertical in world coordinates.
    var spritePlane = new PIXI.projection.Container3d();
    spritePlane.alwaysFront = true;
    spritePlane.addChild(sprite1);
    spritePlane.interactive = true;
    spritePlane.parentGroup = sortGroup;

    return spritePlane;
}

var filter = new PIXI.filters.BlurFilter();
filter.blur = 2;

function onAssetsLoaded() {
    var earth = new PIXI.projection.Sprite3d(loader.resources.back.texture);
    //because earth is Sprite3d, we can access its euler angles
    earth.euler.x = Math.PI / 2;
    earth.anchor.x = earth.anchor.y = 0.5;
    earthContainer.addChild(earth);

    for (var i = 0; i < 30; i++) {
        var d = Math.random() * 6 | 0;

        var spritePlane = spawnAlien(d);
        spritePlane.position3d.x = (Math.random() * 2 - 1) * 500.0;
        spritePlane.position3d.z = (Math.random() * 2 - 1) * 500.0;

        alienContainer.addChild(spritePlane);
    }

    earthContainer.interactive = true;
    earthContainer.on('click', function (event) {
        var p = new PIXI.Point();
        event.data.getLocalPosition(earth, p, event.data.global);

        var sp = spawnAlien(4);
        sp.position3d.x = p.x;
        sp.position3d.z = p.y;
        alienContainer.addChild(sp);
    });

    // start animating
    app.start();
}

var ang = 0;

app.ticker.add(() => {
    debugGraphics.clear();
    debugGraphics.lineStyle(2, 0xffffff, 1.0);
    alienContainer.children.forEach(function (alien) {
        var rect = alien.getBounds();
        if (rect !== PIXI.Rectangle.EMPTY)
            debugGraphics.drawShape(rect);
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

    alienContainer.children.forEach(function (plane) {
        if (plane.alwaysFront) {
            //1. rotate sprite plane to the camera
            plane.children[0].euler.x = -Math.PI/6;
            //2. rotate sprite to the camera
            plane.euler.y = ang;
        }
    });
    // We are gonna sort and show correct side of card,
    // so we need updateTransform BEFORE the sorting will be called.
    // otherwise this part will be tardy by one frame
    camera.updateTransform();
});
