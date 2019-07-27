// the plugin is here: https://github.com/gameofbombs/pixi-heaven/tree/master

const app = new PIXI.Application({backgroundColor : 0x1099bb, autoStart: false});
document.body.appendChild(app.view);

var container = new PIXI.Container();
app.stage.addChild(container);

app.loader.add('dudes', 'examples/assets/polygon/dudes.json');
app.loader.load(function(loader, resources) {
    var keys = Object.keys(resources.dudes.textures);
    var textures = keys.map(function(x) { return resources.dudes.textures[x] });

// Create a 5x5 grid of bunnies
    for (var i = 0; i < 25; i++) {
        var bunny = new PIXI.heaven.Sprite(textures[i % textures.length]);
        bunny.scale.set(0.5);
        bunny.x = (i % 5) * 80;
        bunny.y = Math.floor(i / 5) * 80;
        container.addChild(bunny);
    }


// Move container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    app.start();
});

// Listen for animate update
app.ticker.add(function(delta) {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});
