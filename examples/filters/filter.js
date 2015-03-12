
    var renderer = PIXI.autoDetectRenderer(620, 380);

    // create an new instance of a pixi stage
    var stage = new PIXI.Container();

    stage.interactive = true;

    var bg = PIXI.Sprite.fromImage("_assets/BGrotate.jpg");
    bg.anchor.set(0.5);

    bg.position.x = 310;
    bg.position.y = 190;

    var colorMatrix =  [1,0,0,0,
                        0,1,0,0,
                        0,0,1,0,
                        0,0,0,1];

    var filter = new PIXI.ColorMatrixFilter();

    var container = new PIXI.DisplayObjectContainer();
    container.position.x = 310;
    container.position.y = 190;

    var bgFront = PIXI.Sprite.fromImage("_assets/SceneRotate.jpg");
    bgFront.anchor.set(0.5);

    container.addChild(bgFront);

    var light2 = PIXI.Sprite.fromImage("_assets/LightRotate2.png");
    light2.anchor.set(0.5);
    container.addChild(light2);

    var light1 = PIXI.Sprite.fromImage("_assets/LightRotate1.png");
    light1.anchor.set(0.5);
    container.addChild(light1);

    var panda =  PIXI.Sprite.fromImage("_assets/panda.png");
    panda.anchor.set(0.5);

    container.addChild(panda);

    stage.addChild(container);

    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

    stage.filters = [filter];

    var count = 0;
    var switchy = false;

    stage.click = stage.tap = function()
    {
        switchy = !switchy

        if(!switchy)
        {
            stage.filters = [filter];
        }
        else
        {
            stage.filters = null;
        }
    }

    // Add a pixi Logo!
    var logo = PIXI.Sprite.fromImage("../pixi.png");

    logo.anchor.x = 1;
    logo.scale.set(0.5);

    logo.position.x = 620;
    logo.position.y = 320;

    logo.interactive = true;
    logo.buttonMode = true;

    logo.click = logo.tap = function()
    {
        window.open("http://pixijs.com", "_blank");
    }

    var help = new PIXI.Text("Click to turn filters on / off.", { font: "bold 12pt Arial", fill: "white" });
    help.position.y = 350;
    help.position.x = 10;
    stage.addChild(help);

    requestAnimationFrame(animate);

    function animate() {
        bg.rotation += 0.01;
        bgFront.rotation -= 0.01;

        light1.rotation += 0.02;
        light2.rotation += 0.01;

        panda.scale.x = 1 + Math.sin(count) * 0.04;
        panda.scale.y = 1 + Math.cos(count) * 0.04;

        count += 0.1;

        // colorMatrix[1] = Math.sin(count) * 3;
        // colorMatrix[2] = Math.cos(count);
        // colorMatrix[3] = Math.cos(count) * 1.5;
        // colorMatrix[4] = Math.sin(count / 3) * 2;
        // colorMatrix[5] = Math.sin(count / 2);
        // colorMatrix[6] = Math.sin(count / 4);
        // filter.matrix = colorMatrix;

        renderer.render(stage);
        requestAnimationFrame(animate);
    }


