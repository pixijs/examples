var app = new PIXI.Application();
document.body.appendChild(app.view);

var bol = false;

// create a texture from an image path
var texture = PIXI.Texture.fromImage('required/assets/flowerTop.png');

// create a second texture
var secondTexture = PIXI.Texture.fromImage('required/assets/eggHead.png');

// create a new Sprite using the texture
var dude = new PIXI.Sprite(texture);

// center the sprites anchor point
dude.anchor.set(0.5);

// move the sprite to the center of the screen
dude.position.x = app.renderer.width / 2;
dude.position.y = app.renderer.height / 2;

app.stage.addChild(dude);

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

app.ticker.add(function() {
    // just for fun, let's rotate mr rabbit a little
    dude.rotation += 0.1;
});
