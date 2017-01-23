var app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
PIXI.loader
    .add('spineboy', 'required/assets/spine/spineboy.json')
    .load(onAssetsLoaded);

app.stage.interactive = true;

function onAssetsLoaded(loader, res)
{
    // create a spine boy
    var spineBoy = new PIXI.spine.Spine(res.spineboy.spineData);

    // set the position
    spineBoy.position.x = app.renderer.width / 2;
    spineBoy.position.y = app.renderer.height;

    spineBoy.scale.set(1.5);

    // set up the mixes!
    spineBoy.stateData.setMixByName('walk', 'jump', 0.2);
    spineBoy.stateData.setMixByName('jump', 'walk', 0.4);

    // play animation
    spineBoy.state.setAnimationByName(0, 'walk', true);

    app.stage.addChild(spineBoy);

    app.stage.on('click', function ()
    {
        spineBoy.state.setAnimationByName(0, 'jump', false);
        spineBoy.state.addAnimationByName(0, 'walk', true, 0);
    });
}
