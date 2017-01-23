var app = new PIXI.Application();
document.body.appendChild(app.view);

var sprites = new PIXI.particles.ParticleContainer(10000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
});
app.stage.addChild(sprites);

// create an array to store all the sprites
var maggots = [];

var totalSprites = app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;

for (var i = 0; i < totalSprites; i++)
{
    // create a new Sprite
    var dude = PIXI.Sprite.fromImage('required/assets/tinyMaggot.png');

    dude.tint = Math.random() * 0xE8D4CD;

    // set the anchor point so the texture is centerd on the sprite
    dude.anchor.set(0.5);

    // different maggots, different sizes
    dude.scale.set(0.8 + Math.random() * 0.3);

    // scatter them all
    dude.x = Math.random() * app.renderer.width;
    dude.y = Math.random() * app.renderer.height;

    dude.tint = Math.random() * 0x808080;

    // create a random direction in radians
    dude.direction = Math.random() * Math.PI * 2;

    // this number will be used to modify the direction of the sprite over time
    dude.turningSpeed = Math.random() - 0.8;

    // create a random speed between 0 - 2, and these maggots are slooww
    dude.speed = (2 + Math.random() * 2) * 0.2;

    dude.offset = Math.random() * 100;

    // finally we push the dude into the maggots array so it it can be easily accessed later
    maggots.push(dude);

    sprites.addChild(dude);
}

// create a bounding box box for the little maggots
var dudeBoundsPadding = 100;
var dudeBounds = new PIXI.Rectangle(-dudeBoundsPadding,
                                    -dudeBoundsPadding,
                                    app.renderer.width + dudeBoundsPadding * 2,
                                    app.renderer.height + dudeBoundsPadding * 2);

var tick = 0;

app.ticker.add(function() {

    // iterate through the sprites and update their position
    for (var i = 0; i < maggots.length; i++)
    {
        var dude = maggots[i];
        dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05;
        dude.direction += dude.turningSpeed * 0.01;
        dude.position.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
        dude.position.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);
        dude.rotation = -dude.direction + Math.PI;

        // wrap the maggots
        if (dude.position.x < dudeBounds.x)
        {
            dude.position.x += dudeBounds.width;
        }
        else if (dude.position.x > dudeBounds.x + dudeBounds.width)
        {
            dude.position.x -= dudeBounds.width;
        }

        if (dude.position.y < dudeBounds.y)
        {
            dude.position.y += dudeBounds.height;
        }
        else if (dude.position.y > dudeBounds.y + dudeBounds.height)
        {
            dude.position.y -= dudeBounds.height;
        }
    }

    // increment the ticker
    tick += 0.1;
});
