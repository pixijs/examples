var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var container = new PIXI.Container();

stage.addChild(container);

for (var j = 0; j < 5; j++) {

    for (var i = 0; i < 5; i++) {
        var bunny = PIXI.Sprite.fromImage('_assets/basics/bunny.png');
        bunny.x = 30 * i;
        bunny.y = 30 * j;
        bunny.rotation = Math.random() * (Math.PI * 2)
        container.addChild(bunny);
    };
};

var brt = new PIXI.BaseRenderTexture(300, 200, PIXI.SCALE_MODES.LINEAR, 0.1);
var rt = new PIXI.RenderTexture(brt);

var sprite = new PIXI.Sprite(rt);

sprite.x = 450;
sprite.y = 60;
stage.addChild(sprite)
/*
 * All the bunnies are added to the container with the addChild method
 * when you do this, all the bunnies become children of the container, and when a container moves,
 * so do all its children.
 * This gives you a lot of flexibility and makes it easier to position elements on the screen
 */
container.x = 100;
container.y = 60;

// start animating
animate();

function animate() {

    renderer.render(container, rt)

    requestAnimationFrame(animate);

    // render the root container
    renderer.render(stage);
}
