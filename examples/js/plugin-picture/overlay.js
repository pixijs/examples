var app = new PIXI.Application();
document.body.appendChild(app.view);

// create a new background sprite
var background = new PIXI.Sprite.fromImage('examples/assets/bg_rotate.jpg');
background.width = 800;
background.height = 600;
app.stage.addChild(background);

//speed up the process, because OVERLAY and HARD_LIGHT will use copyTex instead of readPixels
app.stage.filters = [new PIXI.filters.AlphaFilter()];
app.stage.filterArea = app.screen;

// create an array to store a reference to the dudes
var dudeArray = [];

var totaldudes = 20;
var texture = PIXI.Texture.fromImage('examples/assets/flowerTop.png');

for (var i = 0; i < totaldudes; i++)
{
    // create a new Sprite that uses the image name that we just generated as its source
    var dude = new PIXI.Sprite(texture);
	// setting renderer plugin 'picture', from pixi-picture
	dude.pluginName = 'picture';

    dude.anchor.set(0.5);

    // set a random scale for the dude
    dude.scale.set(0.8 + Math.random() * 0.3);

    // finally let's set the dude to be at a random position...
    dude.x = Math.floor(Math.random() * app.screen.width);
    dude.y = Math.floor(Math.random() * app.screen.height);

    // The important bit of this example, this is how you change the default blend mode of the sprite
    dude.blendMode = Math.random() > 0.5 ?
        PIXI.BLEND_MODES.OVERLAY:
        PIXI.BLEND_MODES.HARD_LIGHT;

    // create some extra properties that will control movement
    dude.direction = Math.random() * Math.PI * 2;

    // this number will be used to modify the direction of the dude over time
    dude.turningSpeed = Math.random() - 0.8;

    // create a random speed for the dude between 0 - 2
    dude.speed = 2 + Math.random() * 2;

    // finally we push the dude into the dudeArray so it it can be easily accessed later
    dudeArray.push(dude);

    app.stage.addChild(dude);
}

// create a bounding box box for the little dudes
var dudeBoundsPadding = 100;

var dudeBounds = new PIXI.Rectangle(
    -dudeBoundsPadding,
    -dudeBoundsPadding,
    app.screen.width + dudeBoundsPadding * 2,
    app.screen.height + dudeBoundsPadding * 2
);

var tick = 0;

app.ticker.add(function() {

    // iterate through the dudes and update the positions
    for (var i = 0; i < dudeArray.length; i++)
    {
        var dude = dudeArray[i];
        dude.direction += dude.turningSpeed * 0.01;
        dude.x += Math.sin(dude.direction) * dude.speed;
        dude.y += Math.cos(dude.direction) * dude.speed;
        dude.rotation = -dude.direction - Math.PI / 2;

        // wrap the dudes by testing their bounds...
        if (dude.x < dudeBounds.x) {
            dude.x += dudeBounds.width;
        }
        else if (dude.x > dudeBounds.x + dudeBounds.width) {
            dude.x -= dudeBounds.width;
        }

        if (dude.y < dudeBounds.y) {
            dude.y += dudeBounds.height;
        }
        else if (dude.y > dudeBounds.y + dudeBounds.height) {
            dude.y -= dudeBounds.height;
        }
    }

    // increment the ticker
    tick += 0.1;
});
