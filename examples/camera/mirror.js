//in this example there are only two bunnies. There are 2 extra cameras.

// create a renderer, detecting automatically which one to create between Canvas and WebGL
var renderer = new PIXI.CanvasRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
var up = new PIXI.Container();
stage.addChild(up);
var bunnies = new PIXI.Container();
up.addChild(bunnies);
var camera2 = new PIXI.Camera2d();
camera2.position.x = 800;
camera2.rotation = Math.PI/2;
up.addChild(camera2);
var camera3 = new PIXI.Camera2d();
camera3.position.x = 800;
camera3.position.y = 600;
camera3.rotation = Math.PI;
stage.addChild(camera3);


// create a texture from an image path
var texture = PIXI.Texture.fromImage('_assets/bunny.png');

// create a new Sprite using the texture
var bunnyLeft = new PIXI.Sprite(texture);

// move the sprite to the center of the screen
bunnyLeft.position.x = 200;
bunnyLeft.position.y = 150;

// create another one and change its anchor point
var bunnyCenter = new PIXI.Sprite(texture);

// move the sprite
bunnyCenter.position.x = 200;
bunnyCenter.position.y = 230;

// center the sprite's anchor point
bunnyCenter.anchor.x = 0.5;
bunnyCenter.anchor.y = 0.5;

// now add both sprites to the scene and see how they differ
bunnies.addChild(bunnyLeft);
bunnies.addChild(bunnyCenter);

function resize(event) {
    var target = event.target;
    target.scale.x = 2.5 - target.scale.x;
    target.scale.y = 2.5 - target.scale.y;
}
bunnyLeft.interactive = true;
bunnyCenter.interactive = true;
bunnyLeft.on('click', resize);
bunnyCenter.on('click', resize);


// start animating
animate();

function animate() {
    requestAnimationFrame(animate);

    // rotate both sprites and see the effect of the anchor
    bunnyLeft.rotation += 0.08;
    bunnyCenter.rotation += 0.08;

    camera2.proxyContainer(bunnies);
    camera3.proxyContainer(up);
    // render the container
    renderer.render(stage);
}
