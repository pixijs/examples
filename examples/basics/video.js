
    // create an new instance of a pixi stage
    var stage = new PIXI.Container();

    // create a renderer instance
    var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0x66FF99});

    // add the renderer's view element to the DOM
    document.getElementById('example').appendChild(renderer.view);



    // create a video texture from a path
    var texture = PIXI.Texture.fromVideo("testVideo.mp4");

    // create a new Sprite using the video texture (yes it's that easy)
    var moveSprite = new PIXI.Sprite(texture);

    // center the sprites anchor point
    moveSprite.anchor.x = 0.5;
    moveSprite.anchor.y = 0.5;

    // move the sprite to the center of the screen
    moveSprite.position.x = window.innerWidth/2;
    moveSprite.position.y = window.innerHeight/2;



    // var colorMatrix =  [1,0,0,0,
    //                     0,1,0,0,
    //                     0,0,1,0,
    //                     0,0,0,1];

    // var filter = new PIXI.ColorMatrixFilter();

    // moveSprite.shader = filter;

    // moveSprite.width = window.innerWidth;
    // moveSprite.height = window.innerHeight;

    stage.addChild(moveSprite);

    count = 0;

    var text = new PIXI.Text("DEUS", {fill:"white", font:"bold 444px Arial"});
    //stage.addChild(text);

    text.anchor.set(0.5);
    text.x = window.innerWidth/2;
    text.y = window.innerHeight/2;

    requestAnimationFrame(animate);

    function animate() {



        // count += 0.1;

        // colorMatrix[1] = Math.sin(count) * 3;
        // colorMatrix[2] = Math.cos(count);
        // colorMatrix[3] = Math.cos(count) * 1.5;
        // colorMatrix[4] = Math.sin(count / 3) * 2;
        // colorMatrix[5] = Math.sin(count / 2);
        // colorMatrix[6] = Math.sin(count / 4);
        // filter.matrix = colorMatrix;
        // filter.syncUniforms();

        // render the stage
        renderer.render(stage);

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize',onResize,false);

    function onResize(){

    	renderer.resize(window.innerWidth, window.innerHeight);
        moveSprite.width = window.innerWidth;
        moveSprite.height = window.innerHeight;

        text.scale.set( (window.innerWidth * 0.2) /text.texture.width);

        text.x = window.innerWidth/2;
        text.y = window.innerHeight/2;

            // move the sprite to the center of the screen
        moveSprite.position.x = window.innerWidth/2;
        moveSprite.position.y = window.innerHeight/2;
    }

    onResize();
