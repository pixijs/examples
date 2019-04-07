const app = new PIXI.Application();
document.body.appendChild(app.view);

// create two render textures... these dynamic textures will be used to draw the scene into itself
let renderTexture = PIXI.RenderTexture.create(
    app.screen.width,
    app.screen.height,
);
let renderTexture2 = PIXI.RenderTexture.create(
    app.screen.width,
    app.screen.height,
);
const currentTexture = renderTexture;

// create a new sprite that uses the render texture we created above
const outputSprite = new PIXI.Sprite(currentTexture);

// align the sprite
outputSprite.x = 400;
outputSprite.y = 300;
outputSprite.anchor.set(0.5);

// add to stage
app.stage.addChild(outputSprite);

const stuffContainer = new PIXI.Container();

stuffContainer.x = 400;
stuffContainer.y = 300;

app.stage.addChild(stuffContainer);

// create an array of image ids..
const fruits = [
    'examples/assets/rt_object_01.png',
    'examples/assets/rt_object_02.png',
    'examples/assets/rt_object_03.png',
    'examples/assets/rt_object_04.png',
    'examples/assets/rt_object_05.png',
    'examples/assets/rt_object_06.png',
    'examples/assets/rt_object_07.png',
    'examples/assets/rt_object_08.png',
];

// create an array of items
const items = [];

// now create some items and randomly position them in the stuff container
for (let i = 0; i < 20; i++) {
    const item = PIXI.Sprite.fromImage(fruits[i % fruits.length]);
    item.x = Math.random() * 400 - 200;
    item.y = Math.random() * 400 - 200;
    item.anchor.set(0.5);
    stuffContainer.addChild(item);
    items.push(item);
}

// used for spinning!
let count = 0;

app.ticker.add(() => {
    for (let i = 0; i < items.length; i++) {
    // rotate each item
        const item = items[i];
        item.rotation += 0.1;
    }

    count += 0.01;

    // swap the buffers ...
    const temp = renderTexture;
    renderTexture = renderTexture2;
    renderTexture2 = temp;

    // set the new texture
    outputSprite.texture = renderTexture;

    // twist this up!
    stuffContainer.rotation -= 0.01;
    outputSprite.scale.set(1 + Math.sin(count) * 0.2);

    // render the stage to the texture
    // the 'true' clears the texture before the content is rendered
    app.renderer.render(app.stage, renderTexture2, false);
});
