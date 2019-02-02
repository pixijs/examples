var app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

var bg = PIXI.Sprite.fromImage('examples/assets/pixi-filters/bg_depth_blur.jpg');
bg.width = app.screen.width;
bg.height = app.screen.height;
app.stage.addChild(bg);

var littleDudes = PIXI.Sprite.fromImage('examples/assets/pixi-filters/depth_blur_dudes.jpg');
littleDudes.x = (app.screen.width / 2) - 315;
littleDudes.y = 200;
app.stage.addChild(littleDudes);

var littleRobot = PIXI.Sprite.fromImage('examples/assets/pixi-filters/depth_blur_moby.jpg');
littleRobot.x = (app.screen.width / 2) - 200;
littleRobot.y = 100;
app.stage.addChild(littleRobot);

var blurFilter1 = new PIXI.filters.BlurFilter();
var blurFilter2 = new PIXI.filters.BlurFilter();

littleDudes.filters = [blurFilter1];
littleRobot.filters = [blurFilter2];

var count = 0;

app.ticker.add(function() {

    count += 0.005;

    var blurAmount = Math.cos(count);
    var blurAmount2 = Math.sin(count);

    blurFilter1.blur = 20 * (blurAmount);
    blurFilter2.blur = 20 * (blurAmount2);
});
