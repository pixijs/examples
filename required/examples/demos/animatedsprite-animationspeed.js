var app = new PIXI.Application();
document.body.appendChild(app.view);

app.stop();

PIXI.loader
    .add('spritesheet', 'required/assets/0123456789.json')
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, resources) {

    // create an array to store the textures
    var textures = [],
        i;

    for (i = 0; i < 10; i++) {
         var framekey = '0123456789 ' + i + '.ase';
         var texture = PIXI.Texture.fromFrame(framekey);
         var time = resources.spritesheet.data.frames[framekey].duration;
         textures.push({ texture, time });
    }

    var scaling = 4;

    // create a slow AnimatedSprite
    var slow = new PIXI.extras.AnimatedSprite(textures);
    slow.anchor.set(0.5);
    slow.scale.set(scaling);
    slow.animationSpeed = 0.5;
    slow.x = (app.screen.width - slow.width) / 2;
    slow.y = app.screen.height / 2;
    slow.play();
    app.stage.addChild(slow);

    // create a fast AnimatedSprite
    var fast = new PIXI.extras.AnimatedSprite(textures);
    fast.anchor.set(0.5);
    fast.scale.set(scaling);
    fast.x = (app.screen.width + fast.width) / 2;
    fast.y = app.screen.height / 2;
    fast.play();
    app.stage.addChild(fast);

    // start animating
    app.start();
}
