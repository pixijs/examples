var app = new PIXI.Application(800, 600, { transparent: true });
document.body.appendChild(app.view);

// create a new Sprite from an image path.
var bunny = PIXI.Sprite.fromImage('required/assets/bunny.png');

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.x = app.renderer.width / 2;
bunny.y = app.renderer.height / 2;

app.stage.addChild(bunny);

app.ticker.add(function() {

    // just for fun, let's rotate mr rabbit a little
    bunny.rotation += 0.1;
});
