// the plugin is here: https://github.com/gameofbombs/pixi-heaven/tree/master

const app = new PIXI.Application({ background: '#1099bb', autoStart: false });
document.body.appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

app.loader.add('dudes', 'examples/assets/polygon/dudes.json');
app.loader.load((loader, resources) => {
    const keys = Object.keys(resources.dudes.textures);
    const textures = keys.map((x) => resources.dudes.textures[x]);

    // Create a 5x5 grid of bunnies
    for (let i = 0; i < 25; i++) {
        const bunny = new PIXI.heaven.SpriteH(textures[i % textures.length]);

        const graphics = new PIXI.Graphics();
        genWireframe(bunny, graphics);
        bunny.addChild(graphics);

        bunny.scale.set(0.5);
        bunny.x = (i % 5) * 90;
        bunny.y = Math.floor(i / 5) * 100;

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

function genWireframe(sprite, graphics) {
    sprite.calculateVertices();

    const indices = sprite.indices;
    const vertices = sprite.vertexData;

    graphics.lineStyle(4.0, Math.random() * 0xffffff | 0);
    // generating it in current sprite world coords.
    // they are local if sprite wasnt added yet
    console.log(indices);
    console.log(vertices);
    for (let i = 0; i < indices.length; i += 3) {
        let ind = indices[i + 2];
        graphics.moveTo(vertices[ind * 2], vertices[ind * 2 + 1]);
        for (let j = 0; j < 3; j++) {
            ind = indices[i + j];
            graphics.lineTo(vertices[ind * 2], vertices[ind * 2 + 1]);
        }
    }

    return graphics;
}

// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});
