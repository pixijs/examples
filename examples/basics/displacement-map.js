
    var renderer = PIXI.autoDetectRenderer(600, 400);

    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

    // create an new instance of a pixi stage
    var stage = new PIXI.Container();

    stage.interactive = true;

    var container = new PIXI.Container();
    stage.addChild(container);

    var padding = 100;
    var bounds = new PIXI.Rectangle(-padding, -padding, 630 + padding * 2, 410 + padding * 2)
    var maggots = [];

    for (var i = 0; i < 20; i++)
    {

        var maggot =  PIXI.Sprite.fromImage("_assets/maggot.png");
        maggot.anchor.set(0.5);
        container.addChild(maggot);

        maggot.direction = Math.random() * Math.PI * 2;
        maggot.speed = 1;
        maggot.turnSpeed = Math.random() - 0.8;

        maggot.position.x = Math.random() * bounds.width;
        maggot.position.y = Math.random() * bounds.height;

        maggot.scale.set(1 + Math.random() * 0.3);
        maggot.original = maggot.scale.clone();
        maggots.push(maggot);

    };


    var displacementSprite = PIXI.Sprite.fromImage("_assets/displace.png");
    var displacementFilter = new PIXI.DisplacementFilter(displacementSprite);


    stage.addChild(displacementSprite);

    container.filters = [displacementFilter];

    displacementFilter.scale.x = 110;
    displacementFilter.scale.y = 110;

    var ring = PIXI.Sprite.fromImage('_assets/ring.png');

    ring.anchor.set(0.5);

    ring.visible = false;

    stage.addChild(ring);

    var bg = PIXI.Sprite.fromImage("_assets/bkg-grass.jpg");
    bg.scale.set(1.3,1);

    bg.alpha = 0.4;

    container.addChild(bg);

    stage.mousemove = stage.touchmove = onPointerMove;

    function onPointerMove (eventData) {

        ring.visible = true;

        displacementSprite.x = eventData.data.global.x - 100;
        displacementSprite.y = eventData.data.global.y - displacementSprite.height /2;

        ring.position.x = eventData.data.global.x - 25;
        ring.position.y = eventData.data.global.y;
    }

    var count = 0;

    /*
     * Add a pixi Logo!
     */
    var logo = PIXI.Sprite.fromImage("../../logo_small.png")
    stage.addChild(logo);

    logo.anchor.set(1);

    logo.position.x = 630
    logo.scale.set(0.5);
    logo.position.y = 400;
    logo.interactive = true;
    logo.buttonMode = true;

    logo.click = logo.tap = function()
    {
        window.open("https://github.com/GoodBoyDigital/pixi.js", "_blank")
    }


    requestAnimationFrame(animate);

    function animate() {

        count += 0.05;


        for (var i = 0; i < maggots.length; i++)
        {
            var maggot = maggots[i];

            maggot.direction += maggot.turnSpeed * 0.01;
            maggot.position.x += Math.sin(maggot.direction) * maggot.speed;
            maggot.position.y += Math.cos(maggot.direction) * maggot.speed;

            maggot.rotation = -maggot.direction - Math.PI/2;

            maggot.scale.x = maggot.original.x + Math.sin(count) * 0.2;

            // wrap..

            if(maggot.position.x < bounds.x)maggot.position.x += bounds.width;
            if(maggot.position.x > bounds.x + bounds.width)maggot.position.x -= bounds.width

            if(maggot.position.y < bounds.y)maggot.position.y += bounds.height;
            if(maggot.position.y > bounds.y + bounds.height)maggot.position.y -= bounds.height
        }


        renderer.render(stage);
        requestAnimationFrame( animate );
    }
