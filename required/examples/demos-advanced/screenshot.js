var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// Bunny texture
var texture = PIXI.Texture.fromImage('required/assets/basics/bunny.png');

// Text style object
var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontWeight: 'bold',
    fill: ['#ffffff', '#476bff'], // gradient
    stroke: '#000dff',
    strokeThickness: 5,
    wordWrap: true,
    wordWrapWidth: 440,
});

// Create containers
//// Container for Bunnies
var bunnyContainer = new PIXI.Container();
bunnyContainer.pivot.set(0.5, 0.5);

//// Create a 5x5 grid of bunnies
for (var i = 0; i < 25; i++) {
    var bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    bunnyContainer.addChild(bunny);
}

//// Position bunnies in the right place
bunnyContainer.x = 200;
bunnyContainer.y = (app.screen.height - bunnyContainer.height) / 2;

//// Center bunny sprite in local container coordinates
bunnyContainer.pivot.x = bunnyContainer.width / 2;
bunnyContainer.pivot.y = bunnyContainer.height / 2;

//// Container that we'll take an image from
var screenContainer = new PIXI.Container();
screenContainer.addChild( bunnyContainer );
app.stage.addChild(screenContainer);

// Create the sprite that the screenshot will appear on
var screenShot = new PIXI.Sprite();
screenShot.position.set( 500, 300 );
app.stage.addChild(screenShot);

// Set up text object
var screenshotText = new PIXI.Text('Click To Take Screenshot', style);
screenshotText.x = Math.round((app.screen.width - screenshotText.width) / 2);
screenshotText.y = Math.round(screenshotText.height / 2);
app.stage.addChild(screenshotText);

screenshotText.interactive = true;
screenshotText.buttonMode = true;

// Generates a texture object from a container, then give that texture to our sprite object
// Note that we're not doing this with our 'bunnyContainer' because it'll just be a straight shot of the bunnies
// and won't copy the rotations of the bunnies. Try putting in the bunnyContainer instead to see what I mean.
var takeScreenshot = function () {
    var screenTexture = app.renderer.generateTexture( screenContainer, PIXI.SCALE_MODES.LINEAR );
    screenShot.texture = screenTexture;
    app.renderer.extract.canvas(screenContainer).toBlob(function(b){
        var a = document.createElement('a');
        document.body.append(a);
        a.download = 'screenshot';
        a.href = URL.createObjectURL(b);
        a.click();
        a.remove();
    }, 'image/png');
};

// Wire that up to our text button
screenshotText.addListener('pointerdown', takeScreenshot );

// Listen for animate update
app.ticker.add(function(delta) {
    // Just so that screenshots look different every time, lets spin the bunnies around
    bunnyContainer.rotation += 0.05 * delta;
});
