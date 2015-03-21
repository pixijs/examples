var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// load spine data
PIXI.loader
    .add('pixie', '_assets/spine/Pixie.json')
    .load(onAssetsLoaded);

var postition = 0,
    background,
    background2,
    foreground,
    foreground2;

stage.interactive = true;

function onAssetsLoaded(loader,res)
{
    background = PIXI.Sprite.fromImage('_assets/spine/iP4_BGtile.jpg');
    background2 = PIXI.Sprite.fromImage('_assets/spine/iP4_BGtile.jpg');
    stage.addChild(background);
    stage.addChild(background2);

    foreground = PIXI.Sprite.fromImage('_assets/spine/iP4_ground.png');
    foreground2 = PIXI.Sprite.fromImage('_assets/spine/iP4_ground.png');
    stage.addChild(foreground);
    stage.addChild(foreground2);
    foreground.position.y = foreground2.position.y = 640 - foreground2.height;

    var pixie = new PIXI.spine.Spine(res.pixie.spineData);

    var scale = 0.3;

    pixie.position.x = 1024 / 3;
    pixie.position.y = 500;

    pixie.scale.x = pixie.scale.y = scale;

    stage.addChild(pixie);

    pixie.stateData.setMixByName('running', 'jump', 0.2);
    pixie.stateData.setMixByName('jump', 'running', 0.4);

    pixie.state.setAnimationByName(0, 'running', true);

    stage.on('mousedown', onTouchStart);
    stage.on('touchstart', onTouchStart);

    function onTouchStart()
    {
        pixie.state.setAnimationByName(0, 'jump', false);
        pixie.state.addAnimationByName(0, 'running', true, 0);
    }

    animate();
}

function animate()
{
    postition += 10;

    background.position.x = -(postition * 0.6);
    background.position.x %= 1286 * 2;
    if(background.position.x < 0)
    {
        background.position.x += 1286 * 2;
    }
    background.position.x -= 1286;

    background2.position.x = -(postition * 0.6) + 1286;
    background2.position.x %= 1286 * 2;
    if(background2.position.x < 0)
    {
        background2.position.x += 1286 * 2;
    }
    background2.position.x -= 1286;

    foreground.position.x = -postition;
    foreground.position.x %= 1286 * 2;
    if(foreground.position.x < 0)
    {
        foreground.position.x += 1286 * 2;
    }
    foreground.position.x -= 1286;

    foreground2.position.x = -postition + 1286;
    foreground2.position.x %= 1286 * 2;
    if(foreground2.position.x < 0)
    {
        foreground2.position.x += 1286 * 2;
    }
    foreground2.position.x -= 1286;

    requestAnimationFrame(animate);

    renderer.render(stage);
}
