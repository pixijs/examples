// the plugin is here: https://github.com/gameofbombs/pixi-heaven/tree/master

const app = new PIXI.Application();
document.body.appendChild(app.view);

PIXI.heaven.applySpineMixin(PIXI.spine.Spine.prototype);

// load spine data
app.loader
    .add('spineboypro', 'examples/assets/pixi-spine/spineboy-pro.json')
    .load(onAssetsLoaded);

app.stage.interactive = true;

function onAssetsLoaded(loader, res) {
    // create a spine boy
    const spineBoyPro = new PIXI.spine.Spine(res.spineboypro.spineData);

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

    let phase = 0;
    app.ticker.add(() => {
        phase += 0.1;
        const x = Math.sin(phase) * 0.25 + 0.25;
        spineBoyPro.color.setDark(x, x, x);
    });
}
