
    var renderer = new PIXI.WebGLRenderer(620, 380,{backgroundColor : 0x090909});

    // create an new instance of a pixi stage
    var stage = new PIXI.Stage();

    stage.interactive = true;

    var bg = PIXI.Sprite.fromImage('_assets/bkg.jpg');

    stage.addChild(bg);

    var cells = PIXI.Sprite.fromImage('_assets/cells.png');

    cells.scale.set(1.5,1.5);

    var mask = PIXI.Sprite.fromImage('_assets/flowerTop.png');
    mask.anchor.set(0.5);
    mask.position.x = 310;
    mask.position.y = 190;

    cells.mask = mask;

    stage.addChild(mask);

    stage.addChild(cells);

    // add render view to DOM
    document.getElementById('example').appendChild(renderer.view);

    var target = new PIXI.Point();

    reset();

    function reset () {
        target.x = Math.floor(Math.random() * 550);
        target.y = Math.floor(Math.random() * 300);
    }

    requestAnimationFrame(animate);


    function animate() {

        mask.position.x += (target.x - mask.x) * 0.1;
        mask.position.y += (target.y - mask.y) * 0.1;

        if(Math.abs(mask.x - target.x) < 1)
        {
            reset();
        }

        renderer.render(stage);
        requestAnimationFrame(animate);
    }

