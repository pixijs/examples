var app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
PIXI.loader
    .add('goblins', 'required/assets/spine/goblins.json')
    .load(onAssetsLoaded);

app.stage.interactive = true;

function onAssetsLoaded(loader, res)
{
    var goblin = new PIXI.spine.Spine(res.goblins.spineData);

    // set current skin
    goblin.skeleton.setSkinByName('goblin');
    goblin.skeleton.setSlotsToSetupPose();

    // set the position
    goblin.position.x = 400;
    goblin.position.y = 600;

    goblin.scale.set(1.5);

    // play animation
    goblin.state.setAnimationByName(0, 'walk', true);

    app.stage.addChild(goblin);

    app.stage.on('click', function ()
    {
        // change current skin
        var currentSkinName = goblin.skeleton.skin.name;
        var newSkinName = (currentSkinName === 'goblin' ? 'goblingirl' : 'goblin');
        goblin.skeleton.setSkinByName(newSkinName);
        goblin.skeleton.setSlotsToSetupPose();
    });
}
