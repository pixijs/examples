var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var bol = false;

// create a texture from an image path
var texture = PIXI.Texture.fromImage('_assets/flowerTop.png');

// create a second texture
var secondTexture = PIXI.Texture.fromImage('_assets/eggHead.png');

// create a new Sprite using the texture
var dude = new PIXI.Sprite(texture);

// center the sprites anchor point
dude.anchor.set(0.5);

// move the sprite to the center of the screen
dude.position.x = renderer.width / 2;
dude.position.y = renderer.height / 2;

stage.addChild(dude);

// make the sprite interactive
dude.interactive = true;

dude.on('click', function ()
{
    bol = !bol;

    if(bol)
    {
        dude.texture = secondTexture;
    }
    else
    {
        dude.texture = texture;
    }
});

animate();

function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    dude.rotation += 0.1;

    // render the stage
    renderer.render(stage);
}
