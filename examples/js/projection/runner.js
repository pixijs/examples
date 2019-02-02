// this example uses both pixi-spine and pixi-projection
// it doesnt use projection-spine bridge because it uses only 2d version of spine object

var app = new PIXI.Application(800, 600, {resolution: 1, autoStart: false });
document.body.appendChild(app.view);

app.stop();

var loader = app.loader;

// load spine data
loader
    .add('pixie', 'examples/assets/pixi-spine/pixie.json')
    .add('bg', 'examples/assets/pixi-spine/iP4_BGtile.jpg')
    .add('fg', 'examples/assets/pixi-spine/iP4_ground.png')
    .load(onAssetsLoaded);

var objs = [], pixie;

app.stage.interactive = true;

// 1 earth and 2 parallax layers

var camera = new PIXI.projection.Camera3d();
camera.setPlanes(300, 10, 1000, false);
camera.position.set(app.screen.width / 2, 0);
camera.position3d.y = -500; // camera is above the ground
app.stage.addChild(camera);

var groundLayer = new PIXI.projection.Container3d();
groundLayer.euler.x = Math.PI / 2;
camera.addChild(groundLayer);

// Those two layers can have 2d objects inside
// because they return everything to affine space

var bgLayer = new PIXI.projection.Container3d();
bgLayer.proj.affine = PIXI.projection.AFFINE.AXIS_X;
camera.addChild(bgLayer);
bgLayer.position3d.z = 80;

var mainLayer = new PIXI.projection.Container3d();
mainLayer.proj.affine = PIXI.projection.AFFINE.AXIS_X;
camera.addChild(mainLayer);

var repeats = 3;

function onAssetsLoaded(loader,res) {

    for (var i=0; i<repeats; i++) {
        // simple 2d sprite on back
        var bg = new PIXI.Sprite(res['bg'].texture);
        bgLayer.addChild(bg);
        bg.position.x = bg.texture.width * i;
        bg.anchor.y = 1;
        objs.push(bg);
    }

    for (var i=0; i<repeats; i++) {
        // 3d sprite on floor
        var fg = new PIXI.projection.Sprite3d(res['fg'].texture);
        groundLayer.addChild(fg);
        fg.anchor.set(0, 0.5);
        // use position or position3d here, its not important,
        // unless you need Z - then you need position3d
        fg.position.x = fg.texture.width * i;
        objs.push(fg);
    }

    pixie = new PIXI.spine.Spine(res['pixie'].spineData);
    pixie.position.set(300, 0);
    pixie.scale.set(0.3);

    mainLayer.addChild(pixie);

    pixie.stateData.setMix('running', 'jump', 0.2);
    pixie.stateData.setMix('jump', 'running', 0.4);

    pixie.state.setAnimation(0, 'running', true);

    app.stage.on('pointerdown', onTouchStart);

    function onTouchStart() {
        pixie.state.setAnimation(0, 'jump', false);
        pixie.state.addAnimation(0, 'running', true, 0);
    }

    app.start();
}

app.ticker.add((delta) => {
    pixie.position.x += 10 * delta;

    // camera looks on pixi!
    camera.position3d.x = pixie.position.x;

    objs.forEach((obj) => {
        if (obj.position.x + obj.texture.width < pixie.position.x - 500) {
            obj.position.x += repeats * obj.texture.width;
        }
    });
});
