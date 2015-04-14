var renderer = PIXI.autoDetectRenderer(800, 600, { transparent: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create a video texture from a path
var texture = PIXI.Texture.fromVideo('_assets/testVideo.mp4');

// create a new Sprite using the video texture (yes it's that easy)
var videoSprite = new PIXI.Sprite(texture);

videoSprite.width = renderer.width;
videoSprite.height = renderer.height;

stage.addChild(videoSprite);

animate();

function animate(){

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}
