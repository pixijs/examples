const app = new PIXI.Application(800, 600);
document.body.appendChild(app.view);

app.stop();

PIXI.loader
    .add('spritesheet', 'examples/assets/spritesheet/0123456789.json')
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, resources) {
    // create an array to store the textures
    const textures = [];
    let i;

    for (i = 0; i < 10; i++) {
        const framekey = `0123456789 ${i}.ase`;
        const texture = PIXI.Texture.from(framekey);
        const time = resources.spritesheet.data.frames[framekey].duration;
        textures.push({ texture, time });
    }

    const scaling = 4;

    // create a slow AnimatedSprite
    const slow = new PIXI.extras.AnimatedSprite(textures);
    slow.anchor.set(0.5);
    slow.scale.set(scaling);
    slow.animationSpeed = 0.5;
    slow.x = (app.screen.width - slow.width) / 2;
    slow.y = app.screen.height / 2;
    slow.play();
    app.stage.addChild(slow);

    // create a fast AnimatedSprite
    const fast = new PIXI.extras.AnimatedSprite(textures);
    fast.anchor.set(0.5);
    fast.scale.set(scaling);
    fast.x = (app.screen.width + fast.width) / 2;
    fast.y = app.screen.height / 2;
    fast.play();
    app.stage.addChild(fast);

    // start animating
    app.start();
}
