const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

const bg = PIXI.Sprite.fromImage('examples/assets/pixi-filters/bg_depth_blur.jpg');
bg.width = app.screen.width;
bg.height = app.screen.height;
app.stage.addChild(bg);

const littleDudes = PIXI.Sprite.fromImage('examples/assets/pixi-filters/depth_blur_dudes.jpg');
littleDudes.x = (app.screen.width / 2) - 315;
littleDudes.y = 200;
app.stage.addChild(littleDudes);

const littleRobot = PIXI.Sprite.fromImage('examples/assets/pixi-filters/depth_blur_moby.jpg');
littleRobot.x = (app.screen.width / 2) - 200;
littleRobot.y = 100;
app.stage.addChild(littleRobot);

const blurFilter1 = new PIXI.filters.BlurFilter();
const blurFilter2 = new PIXI.filters.BlurFilter();

littleDudes.filters = [blurFilter1];
littleRobot.filters = [blurFilter2];

let count = 0;

app.ticker.add(() => {
    count += 0.005;

    const blurAmount = Math.cos(count);
    const blurAmount2 = Math.sin(count);

    blurFilter1.blur = 20 * (blurAmount);
    blurFilter2.blur = 20 * (blurAmount2);
});
