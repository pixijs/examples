//in this example there are only two bunnies. There are 2 extra cameras.

// create a renderer, detecting automatically which one to create between Canvas and WebGL
var renderer = new PIXI.CanvasRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var camera = new PIXI.Camera2d();
camera.enableDisplayList = true;

// create a texture from an image path
var texture = PIXI.Texture.fromImage('_assets/bunny_square.png');

function resize(event) {
    var target = event.target;
    target.scale.x = 2.5 - target.scale.x;
    target.scale.y = 2.5 - target.scale.y;
}

var bunniesOdd = new PIXI.Container();
var bunniesEven = new PIXI.Container();
camera.addChild(bunniesOdd);
camera.addChild(bunniesEven);

var ind = [];
for (var i=0;i<15;i++) {
    var bunny = new PIXI.Sprite(texture);
    bunny.size.x = 50;
    bunny.size.y = 50;
    bunny.position.x = 100+20*i;
    bunny.position.y = 100+20*i;
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;
    //either use that
    //bunny.zIndex = i;
    bunny.interactive = true;
    bunny.on('click', resize);
    if (i%2==0) {
        bunniesEven.addChild(bunny);
    } else {
        bunniesOdd.addChild(bunny);
    }
}
//either that
camera.onZOrder = function(sprite) {
    sprite.zOrder = -sprite.position.y;
};

// start animating
animate();

function animate() {
    requestAnimationFrame(animate);
    // render the container
    renderer.render(camera);
}
