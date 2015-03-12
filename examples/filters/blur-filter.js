

    var renderer = PIXI.autoDetectRenderer(630, 410);

    // create an new instance of a pixi stage
    var stage = new PIXI.Container();

    var bg = PIXI.Sprite.fromImage("_assets/depth_blur_BG.jpg");
    stage.addChild(bg);

    var littleDudes = PIXI.Sprite.fromImage("_assets/depth_blur_dudes.jpg");
    littleDudes.position.y = 100;
    stage.addChild(littleDudes);

    var littleRobot = PIXI.Sprite.fromImage("_assets/depth_blur_moby.jpg");
    littleRobot.position.x = 120;
    stage.addChild(littleRobot);

    var blurFilter1 = new PIXI.BlurFilter();
    var blurFilter2 = new PIXI.BlurFilter();

    littleDudes.filters = [blurFilter1];
    littleRobot.filters = [blurFilter2];

    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

    var count = 0;

    /*
     * Add a pixi Logo!
     */
    var logo = PIXI.Sprite.fromImage("../../logo_small.png")
    stage.addChild(logo);

    logo.anchor.x = 1;
    logo.anchor.y = 1;

    logo.position.x = 630
    logo.scale.x = logo.scale.y = 0.5;
    logo.position.y = 400;
    logo.interactive = true;
    logo.buttonMode = true;

    logo.click = logo.tap = function()
    {
        window.open("https://github.com/GoodBoyDigital/pixi.js", "_blank")
    }


    requestAnimationFrame(animate);

    function animate() {

        count += 0.005;

        var blurAmount = Math.cos(count) ;
        var blurAmount2 = Math.sin(count) ;


        blurFilter1.blur = 20 * (blurAmount);
        blurFilter2.blur = 20 * (blurAmount2);
        renderer.render(stage);
        requestAnimationFrame( animate );
    }

