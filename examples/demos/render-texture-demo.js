var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create two render textures... these dynamic textures will be used to draw the scene into itself
var renderTexture = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);
var renderTexture2 = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);
var currentTexture = renderTexture;

// create a new sprite that uses the render texture we created above
var outputSprite = new PIXI.Sprite(currentTexture);

// align the sprite
outputSprite.position.x = 400;
outputSprite.position.y = 300;
outputSprite.anchor.set(0.5);

// add to stage
stage.addChild(outputSprite);

var stuffContainer = new PIXI.Container();

stuffContainer.position.x = 400;
stuffContainer.position.y = 300;

stage.addChild(stuffContainer);

// create an array of image ids..
var fruits = [
    '_assets/spinObj_01.png',
    '_assets/spinObj_02.png',
    '_assets/spinObj_03.png',
    '_assets/spinObj_04.png',
    '_assets/spinObj_05.png',
    '_assets/spinObj_06.png',
    '_assets/spinObj_07.png',
    '_assets/spinObj_08.png'
];

// create an array of items
var items = [];

// now create some items and randomly position them in the stuff container
for (var i = 0; i < 20; i++)
{
    var item = PIXI.Sprite.fromImage(fruits[i % fruits.length]);
    item.position.x = Math.random() * 400 - 200;
    item.position.y = Math.random() * 400 - 200;

    item.anchor.set(0.5);

    stuffContainer.addChild(item);

    items.push(item);
}

// used for spinning!
var count = 0;

animate();

function animate()
{
    requestAnimationFrame(animate);

    for (var i = 0; i < items.length; i++)
    {
        // rotate each item
        var item = items[i];
        item.rotation += 0.1;
    }

    count += 0.01;

    // swap the buffers ...
    var temp = renderTexture;
    renderTexture = renderTexture2;
    renderTexture2 = temp;

    // set the new texture
    outputSprite.texture = renderTexture;

    // twist this up!
    stuffContainer.rotation -= 0.01;
    outputSprite.scale.set(1 + Math.sin(count) * 0.2);

    // render the stage to the texture
    // the 'true' clears the texture before the content is rendered
    renderTexture2.render(stage, null, false);

    // and finally render the stage
    renderer.render(stage);
}
