var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// create a texture from an image path
var texture = PIXI.Texture.fromImage('required/assets/basics/bunny.png');

// create a new Sprite using the texture
var bunny = new PIXI.Sprite(texture);

// center the sprite's anchor point
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

// move the sprite to the center of the screen
bunny.position.x = 200;
bunny.position.y = 150;

app.stage.addChild(bunny);

// Listen for animate update
app.ticker.add(function() {
    // just for fun, let's rotate mr rabbit a little
    bunny.rotation += 0.1;
});
