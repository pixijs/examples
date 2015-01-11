var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
        // starting number based on renderer type
    var startingNum = 50,
        // create a texture from an image path
        texture = PIXI.core.Texture.fromImage('bunny2.png'),
        // create a sprite batch to contain our sprites
        container = new PIXI.core.SpriteBatch(),
        // get the counter element so we can update the text
        counter = document.getElementById('counter'),
        // tracker for mouse/touch down state
        isAdding = false,
        // we are going to fake some gravity in the update loop
        gravity = 0.75;

    // use nearest scaling so sprites are crisp and pixely
    PIXI.core.CONST.scaleModes.DEFAULT = PIXI.core.CONST.scaleModes.NEAREST;

    // add our container to the root
    // app.root.addChild(container);
    container = app.root;

    // add the first bunnies!
    createBunnies();

    // setup our tick method called each frame
    app.tick = function () {
        // if we are adding bunnies, then do it!
        if (isAdding) {
            createBunnies();
        }

        // go through each bunny and update it to dance a bit
        for (var j = 0; j < container.children.length; ++j) {
            var bunny = container.children[j];

            bunny.position.x += bunny.speedX;
            bunny.position.y += bunny.speedY;

            bunny.speedY += gravity;

            if (bunny.position.x > app.renderer.width) {
                bunny.speedX *= -1;
                bunny.position.x = app.renderer.width;
            }
            else if (bunny.position.x < 0) {
                bunny.speedX *= -1;
                bunny.position.x = 0;
            }

            if (bunny.position.y > app.renderer.height) {
                bunny.speedY *= -0.85;
                bunny.position.y = app.renderer.height;

                if (Math.random() > 0.5) {
                    bunny.speedY -= Math.random() * 6;
                }
            }
            else if (bunny.position.y < 0) {
                bunny.speedY *= -1;
                bunny.position.y = 0;
            }
        }
    };

    app.animate();

    app.renderer.view.addEventListener('mousedown', startAdd, false);
    app.renderer.view.addEventListener('touchstart', startAdd, false);

    app.renderer.view.addEventListener('mouseup', startEnd, false);
    app.renderer.view.addEventListener('touchend', startEnd, false);

    function startAdd() { isAdding = true; }
    function startEnd() { isAdding = false; }

    function createBunnies(num) {
        num = num || startingNum;

        for (var i = 0; i < num; ++i) {
            var bunny = new PIXI.core.Sprite(texture);

            bunny.speedX = Math.random() * 5;
            bunny.speedY = (Math.random() * 5) - 5;

            bunny.anchor.set(0.5, 1);

            container.addChild(bunny);
        }

        counter.innerHTML = container.children.length + ' bunnies';
    }
});
