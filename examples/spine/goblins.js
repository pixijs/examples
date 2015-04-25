var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// load spine data
PIXI.loader
    .add('goblins', '_assets/spine/goblins.json')
    .load(onAssetsLoaded);

stage.interactive = true;

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

    stage.addChild(goblin);

    stage.on('click', function ()
    {
        // change current skin
        var currentSkinName = goblin.skeleton.skin.name;
        var newSkinName = (currentSkinName === 'goblin' ? 'goblingirl' : 'goblin');
        goblin.skeleton.setSkinByName(newSkinName);
        goblin.skeleton.setSlotsToSetupPose();
    });
}

requestAnimationFrame(animate);

function animate()
{
    requestAnimationFrame( animate );
    renderer.render(stage);
}
