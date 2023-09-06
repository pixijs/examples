const app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
PIXI.Assets.load('examples/assets/pixi-spine/goblins.json').then(onAssetsLoaded);


function onAssetsLoaded(goblinAsset) {
    app.stage.interactive = true;
    app.stage.cursor = 'pointer';

    const goblin = new PIXI.spine.Spine(goblinAsset.spineData);

    // set current skin
    goblin.skeleton.setSkinByName('goblin');
    goblin.skeleton.setSlotsToSetupPose();

    // set the position
    goblin.x = 400;
    goblin.y = 600;

    goblin.scale.set(1.5);

    // play animation
    goblin.state.setAnimation(0, 'walk', true);

    app.stage.addChild(goblin);

    app.stage.on('pointertap', () => {
    // change current skin
        const currentSkinName = goblin.skeleton.skin.name;
        const newSkinName = (currentSkinName === 'goblin' ? 'goblingirl' : 'goblin');
        goblin.skeleton.setSkinByName(newSkinName);
        goblin.skeleton.setSlotsToSetupPose();
    });
}
