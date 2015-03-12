
    // create an new instance of a pixi stage
    var stage = new PIXI.Container();

    // create a renderer instance
    var renderer = PIXI.autoDetectRenderer(800,600,{backgroundColor : 0x97C56E});

    // add the renderer view element to the DOM
    document.getElementById('example').appendChild(renderer.view);


    // create a texture from an image path
    var texture = PIXI.Texture.fromImage('_assets/bunny.png');

    for (var i = 0; i < 10; i++)
    {
        createBunny(Math.floor(Math.random() * 800) , Math.floor(Math.random() * 600))
    };


    function createBunny(x, y)
    {
        // create our little bunny friend..
        var bunny = new PIXI.Sprite(texture);

        // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
        bunny.interactive = true;
        // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
        bunny.buttonMode = true;

        // center the bunny's anchor point
        bunny.anchor.set(0.5);

        // make it a bit bigger, so it's easier to grab
        bunny.scale.set(3);


        // use the mousedown and touchstart
        bunny.mousedown = bunny.touchstart = function(eventData)
        {

            // store a reference to the data
            // the reason for this is because of multitouch
            // we want to track the movement of this particular touch
            this.data = eventData.data;
            this.alpha = 0.9;
            this.dragging = true;

        };

        // set the events for when the mouse is released or a touch is released
        bunny.mouseup = bunny.mouseupoutside = bunny.touchend = bunny.touchendoutside = function(eventData)
        {
            this.alpha = 1;

            this.dragging = false;
            // set the interaction data to null
            this.data = null;
        };

        // set the callbacks for when the mouse or a touch moves
        bunny.mousemove = bunny.touchmove = function(eventData)
        {
            if(this.dragging)
            {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
            }
        }

        // move the sprite to its designated position
        bunny.position.x = x;
        bunny.position.y = y;

        // add it to the stage
        stage.addChild(bunny);
    }

    requestAnimationFrame( animate );

    function animate() {

        requestAnimationFrame(animate);

        // render the stage
        renderer.render(stage);
    }

