var renderer = PIXI.autoDetectRenderer(800, 600, { transparent: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create a video texture from a path
var texture = PIXI.Texture.fromVideo('testVideo.mp4');

// create a new Sprite using the video texture (yes it's that easy)
var moveSprite = new PIXI.Sprite(texture);

moveSprite.width = renderer.width;
moveSprite.height = renderer.height;

// center the sprites anchor point
moveSprite.anchor.x = 0.5;
moveSprite.anchor.y = 0.5;

// move the sprite to the center of the screen
moveSprite.position.x = renderer.width / 2;
moveSprite.position.y = renderer.height / 2;

stage.addChild(moveSprite);

var text = new PIXI.Text('DEUS', {fill:'white', font:'bold 444px Arial'});
//stage.addChild(text);

text.anchor.set(0.5);

text.x = renderer.width / 2;
text.y = renderer.height / 2;

text.scale.set((renderer.width * 0.2) / text.texture.width);

requestAnimationFrame(animate);

function animate()
{
    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}
