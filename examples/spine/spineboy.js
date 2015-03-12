
    // create a new loader
    var loader = new PIXI.Loader();
    // load spine data
    loader.add('spineboy',"_assets/spine/spineboy.json");
    // use callback
    loader.once('complete',onAssetsLoaded);

    //begin load
    loader.load();

    var rendererWidth = 800;
    var rendererHeight = 600;

    // create a new instance of a pixi stage
    var stage = new PIXI.Container();

    stage.interactive = true;

    // create a renderer instance
    var renderer = new PIXI.autoDetectRenderer(rendererWidth, rendererHeight);

    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

    function onAssetsLoaded(loader,res)
    {
        // create a spine boy
        var spineBoy = new PIXI.Spine(res.spineboy.spineData);

        // set the position
        spineBoy.position.x = rendererWidth/2;
        spineBoy.position.y = rendererHeight;

        spineBoy.scale.set(1.5);

        // set up the mixes!
        spineBoy.stateData.setMixByName("walk", "jump", 0.2);
        spineBoy.stateData.setMixByName("jump", "walk", 0.4);

        // play animation
        spineBoy.state.setAnimationByName(0, "walk", true);


        stage.addChild(spineBoy);

        stage.click = function()
        {
            spineBoy.state.setAnimationByName(0, "jump", false);
            spineBoy.state.addAnimationByName(0, "walk", true, 0);
        }

        var logo = PIXI.Sprite.fromImage("pixi.png")
        stage.addChild(logo);


        logo.anchor.x = 1;
        logo.scale.set(0.5);

        logo.position.x = rendererWidth
        logo.position.y = rendererHeight - 70;

        logo.interactive = true;
        logo.buttonMode = true;

        logo.click = logo.tap = function()
        {
            window.open("https://github.com/GoodBoyDigital/pixi.js", "_blank")
        }
    }



    requestAnimationFrame(animate);

    function animate() {

        requestAnimationFrame( animate );
        renderer.render(stage);
    }
