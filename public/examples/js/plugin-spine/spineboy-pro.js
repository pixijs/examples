const app = new PIXI.Application();
document.body.appendChild(app.view);

// load spine data
PIXI.Assets.load('examples/assets/pixi-spine/spineboy-pro.json').then(onAssetsLoaded);

function onAssetsLoaded(spineboyAsset) {
    app.stage.interactive = true;

    // create a spine boy
    const spineBoyPro = new PIXI.spine.Spine(spineboyAsset.spineData);

    // set the position
    spineBoyPro.x = app.screen.width / 2;
    spineBoyPro.y = app.screen.height;

    spineBoyPro.scale.set(0.5);

    app.stage.addChild(spineBoyPro);

    const singleAnimations = ['aim', 'death', 'jump', 'portal'];
    const loopAnimations = ['hoverboard', 'idle', 'run', 'shoot', 'walk'];
    const allAnimations = [].concat(singleAnimations, loopAnimations);

    let lastAnimation = '';

    // Press the screen to play a random animation
    app.stage.on('pointerdown', () => {
        let animation = '';
        do {
            animation = allAnimations[Math.floor(Math.random() * allAnimations.length)];
        } while (animation === lastAnimation);

        spineBoyPro.state.setAnimation(0, animation, loopAnimations.includes(animation));

        lastAnimation = animation;
    });
}
