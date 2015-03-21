var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var bg = PIXI.Sprite.fromImage('_assets/depth_blur_BG.jpg');
bg.width = renderer.width;
bg.height = renderer.height;
stage.addChild(bg);

var littleDudes = PIXI.Sprite.fromImage('_assets/depth_blur_dudes.jpg');
littleDudes.position.x = (renderer.width / 2) - 315;
littleDudes.position.y = 200;
stage.addChild(littleDudes);

var littleRobot = PIXI.Sprite.fromImage('_assets/depth_blur_moby.jpg');
littleRobot.position.x = (renderer.width / 2) - 200;
littleRobot.position.y = 100;
stage.addChild(littleRobot);

var blurFilter1 = new PIXI.filters.BlurFilter();
var blurFilter2 = new PIXI.filters.BlurFilter();

littleDudes.filters = [blurFilter1];
littleRobot.filters = [blurFilter2];

var count = 0;

requestAnimationFrame(animate);

function animate() {

    count += 0.005;

    var blurAmount = Math.cos(count) ;
    var blurAmount2 = Math.sin(count) ;


    blurFilter1.blur = 20 * (blurAmount);
    blurFilter2.blur = 20 * (blurAmount2);
    renderer.render(stage);
    requestAnimationFrame( animate );
}

