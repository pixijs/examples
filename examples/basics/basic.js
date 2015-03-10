// create an new instance of a pixi stage
var root = new PIXI.Container();

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0x66FF99 });

// add the renderer view element to the DOM
document.getElementById('example').appendChild(renderer.view);

// create a texture from an image path
var texture = PIXI.Texture.fromImage('_assets/basics/bunny.png');

// create a new Sprite using the texture
var bunny = new PIXI.Sprite(texture);

// center the sprite's anchor point
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

// move the sprite to the center of the screen
bunny.position.x = 200;
bunny.position.y = 150;

root.addChild(bunny);

// start animating
requestAnimationFrame(animate);
function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    bunny.rotation += 0.1;

    // render the container
    renderer.render(root);
}
