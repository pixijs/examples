var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// holder to store the aliens
var aliens = [];

var totalDudes = 20;

for (var i = 0; i < totalDudes; i++)
{
    // create a new Sprite that uses the image name that we just generated as its source
    var dude =  PIXI.Sprite.fromImage('_assets/eggHead.png');

    // set the anchor point so the texture is centerd on the sprite
    dude.anchor.set(0.5);

    // set a random scale for the dude - no point them all being the same size!
    dude.scale.set(0.8 + Math.random() * 0.3);

    // finally lets set the dude to be at a random position..
    dude.position.x = Math.random() * renderer.width;
    dude.position.y = Math.random() * renderer.height;

    dude.tint = Math.random() * 0xFFFFFF;

    // create some extra properties that will control movement :
    // create a random direction in radians. This is a number between 0 and PI*2 which is the equivalent of 0 - 360 degrees
    dude.direction = Math.random() * Math.PI * 2;

    // this number will be used to modify the direction of the dude over time
    dude.turningSpeed = Math.random() - 0.8;

    // create a random speed for the dude between 0 - 2
    dude.speed = 2 + Math.random() * 2;

    // finally we push the dude into the aliens array so it it can be easily accessed later
    aliens.push(dude);

    stage.addChild(dude);
}

// create a bounding box for the little dudes
var dudeBoundsPadding = 100;
var dudeBounds = new PIXI.Rectangle(-dudeBoundsPadding,
                                    -dudeBoundsPadding,
                                    renderer.width + dudeBoundsPadding * 2,
                                    renderer.height + dudeBoundsPadding * 2);

var tick = 0;

requestAnimationFrame(animate);

function animate() {

    // iterate through the dudes and update their position
    for (var i = 0; i < aliens.length; i++)
    {
        var dude = aliens[i];
        dude.direction += dude.turningSpeed * 0.01;
        dude.position.x += Math.sin(dude.direction) * dude.speed;
        dude.position.y += Math.cos(dude.direction) * dude.speed;
        dude.rotation = -dude.direction - Math.PI / 2;

        // wrap the dudes by testing their bounds...
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

    // time to render the stage!
    renderer.render(stage);

    // request another animation frame...
    requestAnimationFrame(animate);
}
