var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

var bunnyContainer = new PIXI.Container();
var screenContainer = new PIXI.Container();

bunnyContainer.pivot.set(0.5, 0.5);

screenContainer.addChild( bunnyContainer );
app.stage.addChild(screenContainer);

var texture = PIXI.Texture.fromImage('required/assets/basics/bunny.png');

var screenShot = new PIXI.Sprite();
screenShot.position.set( 500, 300 );
app.stage.addChild(screenShot);

// Create a 5x5 grid of bunnies
for (var i = 0; i < 25; i++) {
    var bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    bunnyContainer.addChild(bunny);
}

// Center on the screen
bunnyContainer.x = 200;
bunnyContainer.y = (app.screen.height - bunnyContainer.height) / 2;

// Center bunny sprite in local container coordinates
bunnyContainer.pivot.x = bunnyContainer.width / 2;
bunnyContainer.pivot.y = bunnyContainer.height / 2;

// Add play text
var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
});

var playText = new PIXI.Text('Click To Take Screenshot', style);
playText.x = Math.round((app.screen.width - playText.width) / 2);
playText.y = Math.round(playText.height / 2);
app.stage.addChild(playText);

var takeScreenshot = function () {
    var screenTexture = app.renderer.generateTexture( screenContainer, PIXI.SCALE_MODES.NEAREST );
    screenShot.texture = screenTexture;
};

playText.interactive = true;
playText.buttonMode = true;
playText.addListener('pointerdown', takeScreenshot );

// Listen for animate update
app.ticker.add(function(delta) {
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent transformation
    bunnyContainer.rotation += 0.05 * delta;
});
