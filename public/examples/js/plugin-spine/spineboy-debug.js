const app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
PIXI.Assets.load(['examples/assets/pixi-spine/spineboy-pro.json', 'examples/assets/pixi-spine/spineboy.json']).then(onAssetsLoaded);

function onAssetsLoaded(spineAssets) {
    app.stage.interactive = true;

    const spineboyProAsset = spineAssets['examples/assets/pixi-spine/spineboy-pro.json'];
    const spineboyAsset = spineAssets['examples/assets/pixi-spine/spineboy.json'];

    // create a spine boy pro
    const spineBoyPro = new PIXI.spine.Spine(spineboyProAsset.spineData);

    // set the position
    spineBoyPro.x = app.screen.width * 0.25;
    spineBoyPro.y = app.screen.height * 0.9;

    spineBoyPro.scale.set(0.5);

    app.stage.addChild(spineBoyPro);

    const singleAnimations = ['aim', 'death', 'jump', 'portal'];
    const loopAnimations = ['hoverboard', 'idle', 'run', 'shoot', 'walk'];
    const allAnimations = [].concat(singleAnimations, loopAnimations);

    let lastAnimation = '';

    // create a spine boy
    const spineBoy = new PIXI.spine.Spine(spineboyAsset.spineData);

    // set the position
    spineBoy.x = app.screen.width * 0.75;
    spineBoy.y = app.screen.height * 0.9;

    spineBoy.scale.set(1.5);

    // set up the mixes!
    spineBoy.stateData.setMix('walk', 'jump', 0.2);
    spineBoy.stateData.setMix('jump', 'walk', 0.4);

    // play animation
    spineBoy.state.setAnimation(0, 'walk', true);

    app.stage.addChild(spineBoy);

    app.stage.on('pointerdown', () => {

    });

    // Press the screen to play a random animation
    app.stage.on('pointerdown', () => {
        let animation = '';
        do {
            animation = allAnimations[Math.floor(Math.random() * allAnimations.length)];
        } while (animation === lastAnimation);

        spineBoyPro.state.setAnimation(0, animation, loopAnimations.includes(animation));

        lastAnimation = animation;

        spineBoy.state.setAnimation(0, 'jump', false);
        spineBoy.state.addAnimation(0, 'walk', true, 0);
    });

    // ENABLE THE DEBUG!
    spineBoy.debug = new PIXI.spine.SpineDebugRenderer();
    spineBoyPro.debug = new PIXI.spine.SpineDebugRenderer();
}
