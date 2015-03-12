
    var viewWidth = 800;
    var viewHeight = 600;

    // Create a pixi renderer
    var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);

    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

    // create an new instance of a pixi stage
    var stage = new PIXI.Container();

    var sprites = new PIXI.ParticleContainer(10000, [true, true,true,true,true]);
    stage.addChild(sprites);

    var tints = [0xFFFFFF, 0xFFFBEE, 0xFFEEEE, 0xFADEED, 0xE8D4CD];

    // create an array to store all the sprites
    var maggots = [];

    var totalSprites = renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;

    for (var i = 0; i < totalSprites; i++)
    {
        // create a new Sprite
        var dude = PIXI.Sprite.fromImage("_assets/tinyMaggot.png");

        dude.tint = Math.random() * 0xE8D4CD;

        // set the anchor point so the texture is centerd on the sprite
        dude.anchor.set(0.5);

        // different maggots, different sizes
        dude.scale.set(0.8 + Math.random() * 0.3);

        // scatter them all
        dude.x = Math.random() * viewWidth;
        dude.y = Math.random() * viewHeight;

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
                                        viewWidth + dudeBoundsPadding * 2,
                                        viewHeight + dudeBoundsPadding * 2);

    var tick = 0;

    requestAnimationFrame(animate);

    function animate() {

        // iterate through the sprites and update their position
        for (var i = 0; i < maggots.length; i++)
        {
            var dude = maggots[i];
            dude.scale.y = 0.95 + Math.sin(tick + dude.offset) * 0.05
            dude.direction += dude.turningSpeed * 0.01;
            dude.position.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
            dude.position.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);
            dude.rotation = -dude.direction + Math.PI;

            // wrap the maggots
            if (dude.position.x < dudeBounds.x)
                dude.position.x += dudeBounds.width;
            else if (dude.position.x > dudeBounds.x + dudeBounds.width)
                dude.position.x -= dudeBounds.width;

            if (dude.position.y < dudeBounds.y)
                dude.position.y += dudeBounds.height;
            else if (dude.position.y > dudeBounds.y + dudeBounds.height)
                dude.position.y -= dudeBounds.height;
        }

        // increment the ticker
        tick += 0.1;

        // time to render the stage !
        renderer.render(stage);

        // request another animation frame...
        requestAnimationFrame(animate);
    }
