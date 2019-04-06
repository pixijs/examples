var app = new PIXI.Application(800, 600, { backgroundColor : 0x1099bb });
document.body.appendChild(app.view);

var container = new PIXI.Container();
app.stage.addChild(container);

var texture = PIXI.Texture.fromImage('examples/assets/bunny.png');

for (var i = 0; i < 25; i++) {
    var bunny = new PIXI.Sprite(texture);
    bunny.x = (i % 5) * 30;
    bunny.y = Math.floor(i / 5) * 30;
    bunny.rotation = Math.random() * (Math.PI * 2)
    container.addChild(bunny);
}

var brt = new PIXI.BaseRenderTexture(300, 300, PIXI.SCALE_MODES.LINEAR, 1);
var rt = new PIXI.RenderTexture(brt);

var sprite = new PIXI.Sprite(rt);

sprite.x = 450;
sprite.y = 60;
app.stage.addChild(sprite);

/*
 * All the bunnies are added to the container with the addChild method
 * when you do this, all the bunnies become children of the container, and when a container moves,
 * so do all its children.
 * This gives you a lot of flexibility and makes it easier to position elements on the screen
 */
container.x = 100;
container.y = 60;

app.ticker.add(function() {
    app.renderer.render(container, rt);
});
