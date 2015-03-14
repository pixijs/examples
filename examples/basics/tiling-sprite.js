var renderer = PIXI.autoDetectRenderer(800, 600);
document.getElementById('example').appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create a texture from an image path
var texture = PIXI.Texture.fromImage('_assets/p2.jpeg');

// create a tiling sprite ...
// requires a texture, a width and a height
// in webGL the texture size should preferably be a power of two
var tilingSprite = new PIXI.TilingSprite(texture, renderer.width, renderer.height);
stage.addChild(tilingSprite);

var count = 0;

requestAnimationFrame(animate);

function animate() {
    count += 0.005;

    tilingSprite.tileScale.x = 2 + Math.sin(count);
    tilingSprite.tileScale.y = 2 + Math.cos(count);

    tilingSprite.tilePosition.x += 1;
    tilingSprite.tilePosition.y += 1;

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}
