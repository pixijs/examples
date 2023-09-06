/**
 * All sprites are in separate container that is filtered / masked
 * with this setting, ADD blendMode works through that filter and affect background
 * also ADD batches together with NORMAL
 */

PIXI.heaven.settings.BLEND_ADD_UNITY = true;

const app = new PIXI.Application({ backgroundAlpha: 0 });
document.body.appendChild(app.view);

// create a new background sprite
const background = PIXI.Sprite.from('examples/assets/bg_rotate.jpg');
background.width = app.screen.width / 2;
background.height = app.screen.height;

const background2 = PIXI.Sprite.from('examples/assets/bg_rotate.jpg');
background2.width = app.screen.width / 2;
background2.height = app.screen.height;
background2.position.set(app.screen.width / 2, 0);
background2.alpha = 0.5;

app.stage.addChild(background, background2);

// create an array to store a reference to the dudes
const dudeArray = [];

const totaldudes = 20;

const dudeContainer = new PIXI.Container();
dudeContainer.filterArea = app.screen;
dudeContainer.filters = [new PIXI.filters.AlphaFilter()];
app.stage.addChild(dudeContainer);

for (let i = 0; i < totaldudes; i++) {
    // create a new Sprite that uses the image name that we just generated as its source
    const dude = new PIXI.heaven.SpriteH(PIXI.Texture.from('examples/assets/flowerTop.png'));

    dude.anchor.set(0.5);

    // set a random scale for the dude
    dude.scale.set(0.8 + Math.random() * 0.3);

    // finally let's set the dude to be at a random position...
    dude.x = Math.floor(Math.random() * app.screen.width);
    dude.y = Math.floor(Math.random() * app.screen.height);

    // The important bit of this example, this is how you change the default blend mode of the sprite
    if (Math.random() < 0.5) {
        dude.blendMode = PIXI.BLEND_MODES.ADD;
    }

    // create some extra properties that will control movement
    dude.direction = Math.random() * Math.PI * 2;

    // this number will be used to modify the direction of the dude over time
    dude.turningSpeed = Math.random() - 0.8;

    // create a random speed for the dude between 0 - 2
    dude.speed = 2 + Math.random() * 2;

    // finally we push the dude into the dudeArray so it it can be easily accessed later
    dudeArray.push(dude);

    dudeContainer.addChild(dude);
}

// create a bounding box for the little dudes
const dudeBoundsPadding = 100;

const dudeBounds = new PIXI.Rectangle(
    -dudeBoundsPadding,
    -dudeBoundsPadding,
    app.screen.width + dudeBoundsPadding * 2,
    app.screen.height + dudeBoundsPadding * 2,
);

app.ticker.add(() => {
    // iterate through the dudes and update the positions
    for (let i = 0; i < dudeArray.length; i++) {
        const dude = dudeArray[i];
        dude.direction += dude.turningSpeed * 0.01;
        dude.x += Math.sin(dude.direction) * dude.speed;
        dude.y += Math.cos(dude.direction) * dude.speed;
        dude.rotation = -dude.direction - Math.PI / 2;

        // wrap the dudes by testing their bounds...
        if (dude.x < dudeBounds.x) {
            dude.x += dudeBounds.width;
        } else if (dude.x > dudeBounds.x + dudeBounds.width) {
            dude.x -= dudeBounds.width;
        }

        if (dude.y < dudeBounds.y) {
            dude.y += dudeBounds.height;
        } else if (dude.y > dudeBounds.y + dudeBounds.height) {
            dude.y -= dudeBounds.height;
        }
    }
});
