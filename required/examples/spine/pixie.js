var app = new PIXI.Application();
document.body.appendChild(app.view);

app.stop();

// load spine data
PIXI.loader
    .add('pixie', 'required/assets/spine/Pixie.json')
    .load(onAssetsLoaded);

var postition = 0,
    background,
    background2,
    foreground,
    foreground2;

app.stage.interactive = true;

function onAssetsLoaded(loader,res)
{
    background = PIXI.Sprite.fromImage('required/assets/spine/iP4_BGtile.jpg');
    background2 = PIXI.Sprite.fromImage('required/assets/spine/iP4_BGtile.jpg');
    app.stage.addChild(background);
    app.stage.addChild(background2);

    foreground = PIXI.Sprite.fromImage('required/assets/spine/iP4_ground.png');
    foreground2 = PIXI.Sprite.fromImage('required/assets/spine/iP4_ground.png');
    app.stage.addChild(foreground);
    app.stage.addChild(foreground2);
    foreground.y = foreground2.y = 640 - foreground2.height;

    var pixie = new PIXI.spine.Spine(res.pixie.spineData);

    var scale = 0.3;

    pixie.x = 1024 / 3;
    pixie.y = 500;

    pixie.scale.x = pixie.scale.y = scale;

    app.stage.addChild(pixie);

    pixie.stateData.setMixByName('running', 'jump', 0.2);
    pixie.stateData.setMixByName('jump', 'running', 0.4);

    pixie.state.setAnimationByName(0, 'running', true);

    app.stage.on('mousedown', onTouchStart);
    app.stage.on('touchstart', onTouchStart);

    function onTouchStart()
    {
        pixie.state.setAnimationByName(0, 'jump', false);
        pixie.state.addAnimationByName(0, 'running', true, 0);
    }

    app.start();
}

app.ticker.add(function()
{
    postition += 10;

    background.x = -(postition * 0.6);
    background.x %= 1286 * 2;
    if(background.x < 0)
    {
        background.x += 1286 * 2;
    }
    background.x -= 1286;

    background2.x = -(postition * 0.6) + 1286;
    background2.x %= 1286 * 2;
    if(background2.x < 0)
    {
        background2.x += 1286 * 2;
    }
    background2.x -= 1286;

    foreground.x = -postition;
    foreground.x %= 1286 * 2;
    if(foreground.x < 0)
    {
        foreground.x += 1286 * 2;
    }
    foreground.x -= 1286;

    foreground2.x = -postition + 1286;
    foreground2.x %= 1286 * 2;
    if(foreground2.x < 0)
    {
        foreground2.x += 1286 * 2;
    }
    foreground2.x -= 1286;
});
