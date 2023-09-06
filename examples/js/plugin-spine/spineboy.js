const app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
PIXI.Assets.load('examples/assets/pixi-spine/spineboy.json').then(onAssetsLoaded);

function onAssetsLoaded(spineboyAsset) {
    app.stage.interactive = true;

    // create a spine boy
    const spineBoy = new PIXI.spine.Spine(spineboyAsset.spineData);

    // set the position
    spineBoy.x = app.screen.width / 2;
    spineBoy.y = app.screen.height;

    spineBoy.scale.set(1.5);

    // set up the mixes!
    spineBoy.stateData.setMix('walk', 'jump', 0.2);
    spineBoy.stateData.setMix('jump', 'walk', 0.4);

    // play animation
    spineBoy.state.setAnimation(0, 'walk', true);

    app.stage.addChild(spineBoy);

    app.stage.on('pointerdown', () => {
        spineBoy.state.setAnimation(0, 'jump', false);
        spineBoy.state.addAnimation(0, 'walk', true, 0);
    });
}
