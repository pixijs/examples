var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

var container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
var texture = PIXI.Texture.fromImage('required/assets/basics/bunny.png');

// Create a 5x5 grid of bunnies
for (var i = 0; i < 25; i++) {
    var bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
}

// move container to the center
container.x = app.renderer.width / 2;
container.y = app.renderer.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
app.ticker.add(function(delta) {
    // rotate the container!
    // use delta to create frame-independent tranform
    container.rotation -= 0.01 / delta;
});
