
    // create a new loader
    var loader = new PIXI.Loader();
    // load spine data
    loader.add('dragon',"_assets/spine/dragon.json");
    // use callback
    loader.once('complete',onAssetsLoaded);

    //begin load
    loader.load();


    // create a new instance of a pixi stage
    var stage = new PIXI.Container();

    var rendererWidth = 800;
    var rendererHeight = 600;

    // create a renderer instance
    var renderer = new PIXI.autoDetectRenderer(rendererWidth, rendererHeight);


    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

	var dragon = null;

    function onAssetsLoaded(loader,res)
    {
		/* instantiate the spine animation */
        dragon = new PIXI.Spine(res.dragon.spineData);
		dragon.skeleton.setToSetupPose();
		dragon.update(0);
		dragon.autoUpdate = false;

		/* create a container for the spine animation and add the animation to it */
		var dragonCage = new PIXI.Container();
		dragonCage.addChild(dragon);

		/* measure the spine animation and position it inside its container to align it to the origin */
		var localRect = dragon.getLocalBounds();
		dragon.position.set(-localRect.x, -localRect.y);

		/* now we can scale, position and rotate the container as any other display object */
		var scale = Math.min((rendererWidth * 0.7) / dragonCage.width, (rendererHeight * 0.7) / dragonCage.height);
		dragonCage.scale.set(scale, scale);
		dragonCage.position.set((rendererWidth - dragonCage.width) * 0.5, (rendererHeight - dragonCage.height) * 0.5);

		/* add the container to the stage */
		stage.addChild(dragonCage);

		/* once position and scaled, set the animation to play */
        dragon.state.setAnimationByName(0, "flying", true);




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

		requestAnimationFrame(animate);

    }


    function animate() {

        requestAnimationFrame( animate );
		/* update the spine animation, only needed if dragon.autoupdate is set to false */
		dragon.update(0.01666666666667); // HARDCODED FRAMERATE!
        renderer.render(stage);
    }
