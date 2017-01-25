var app = new PIXI.Application(800, 600, { transparent: true });
document.body.appendChild(app.view);

// Create play button that can be used to trigger the video
var button = new PIXI.Graphics()
    .beginFill(0x0, 0.5)
    .drawRoundedRect(0, 0, 100, 100, 10)
    .endFill()
    .beginFill(0xffffff)
    .moveTo(36, 30)
    .lineTo(36, 70)
    .lineTo(70, 50);

// Position the button
button.x = (app.renderer.width - button.width) / 2;
button.y = (app.renderer.height - button.height) / 2;

// Enable interactivity on the button
button.interactive = true;
button.buttonMode = true;

// Add to the stage
app.stage.addChild(button);

// Listen for a click/tap event to start playing the video
// this is useful for some mobile platforms
button.on('pointertap', onPlayVideo);

function onPlayVideo() {

    // Don't need the button anymore
    button.destroy();

    // create a video texture from a path
    var texture = PIXI.Texture.fromVideo('required/assets/testVideo.mp4');

    // create a new Sprite using the video texture (yes it's that easy)
    var videoSprite = new PIXI.Sprite(texture);

    // Stetch the fullscreen
    videoSprite.width = app.renderer.width;
    videoSprite.height = app.renderer.height;

    app.stage.addChild(videoSprite); 
}
