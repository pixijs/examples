const app = new PIXI.Application();
document.body.appendChild(app.view);

app.stop();

// load resources
PIXI.Assets.load('examples/assets/spritesheet/monsters.json')
    .then(onAssetsLoaded);

// holder to store aliens
const aliens = [];
const alienFrames = [
    'eggHead.png',
    'flowerTop.png',
    'helmlok.png',
    'skully.png',
];

let count = 0;

// create an empty container
const alienContainer = new PIXI.Container();
alienContainer.x = 400;
alienContainer.y = 300;

// make the stage interactive
app.stage.interactive = true;
app.stage.addChild(alienContainer);

function onAssetsLoaded() {
    // add a bunch of aliens with textures from image paths
    for (let i = 0; i < 100; i++) {
        const frameName = alienFrames[i % 4];

        // create an alien using the frame name..
        const alien = PIXI.Sprite.from(frameName);
        alien.tint = Math.random() * 0xFFFFFF;

        /*
         * fun fact for the day :)
         * another way of doing the above would be
         * var texture = PIXI.Texture.from(frameName);
         * var alien = new PIXI.Sprite(texture);
         */
        alien.x = Math.random() * 800 - 400;
        alien.y = Math.random() * 600 - 300;
        alien.anchor.x = 0.5;
        alien.anchor.y = 0.5;
        aliens.push(alien);
        alienContainer.addChild(alien);
    }
    app.start();
}

// Combines both mouse click + touch tap
app.stage.on('pointertap', onClick);

function onClick() {
    alienContainer.cacheAsBitmap = !alienContainer.cacheAsBitmap;

    // feel free to play with what's below
    // var sprite = new PIXI.Sprite(alienContainer.generateTexture());
    // app.stage.addChild(sprite);
    // sprite.x = Math.random() * 800;
    // sprite.y = Math.random() * 600;
}

app.ticker.add(() => {
    // let's rotate the aliens a little bit
    for (let i = 0; i < 100; i++) {
        const alien = aliens[i];
        alien.rotation += 0.1;
    }

    count += 0.01;

    alienContainer.scale.x = Math.sin(count);
    alienContainer.scale.y = Math.sin(count);
    alienContainer.rotation += 0.01;
});
