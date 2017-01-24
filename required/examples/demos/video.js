var app = new PIXI.Application(800, 600, { transparent: true });
document.body.appendChild(app.view);

// create a video texture from a path
var texture = PIXI.Texture.fromVideo('testVideo.mp4');

// create a new Sprite using the video texture (yes it's that easy)
var moveSprite = new PIXI.Sprite(texture);

moveSprite.width = app.renderer.width;
moveSprite.height = app.renderer.height;

// center the sprites anchor point
moveSprite.anchor.set(0.5);

// move the sprite to the center of the screen
moveSprite.x = app.renderer.width / 2;
moveSprite.y = app.renderer.height / 2;

app.stage.addChild(moveSprite);

var text = new PIXI.Text('DEUS', {
    fill:'white',
    fontFamily:'Arial',
    fontSize:'444px',
    fontWeight:'bold'
});
//app.stage.addChild(text);

text.anchor.set(0.5);

text.x = app.renderer.width / 2;
text.y = app.renderer.height / 2;

text.scale.set((app.renderer.width * 0.2) / text.texture.width);
