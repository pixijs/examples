var app = new PIXI.Application(800, 600, { transparent: true });
document.body.appendChild(app.view);

// create a video texture from a path
var texture = PIXI.Texture.fromVideo('required/assets/testVideo.mp4');

// create a new Sprite using the video texture (yes it's that easy)
var videoSprite = new PIXI.Sprite(texture);

videoSprite.width = app.renderer.width;
videoSprite.height = app.renderer.height;

app.stage.addChild(videoSprite);
