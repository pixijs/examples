var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create a background...
var background = PIXI.Sprite.fromImage('_assets/button_test_BG.jpg');
background.width = renderer.width;
background.height = renderer.height;

// add background to stage...
stage.addChild(background);

// create some textures from an image path
var textureButton = PIXI.Texture.fromImage('_assets/button.png');
var textureButtonDown = PIXI.Texture.fromImage('_assets/buttonDown.png');
var textureButtonOver = PIXI.Texture.fromImage('_assets/buttonOver.png');

var buttons = [];

var buttonPositions = [
    175, 75,
    655, 75,
    410, 325,
    150, 465,
    685, 445
];

var noop = function () {
	console.log('click');
};

for (var i = 0; i < 5; i++)
{
    var button = new PIXI.Sprite(textureButton);
    button.buttonMode = true;

    button.anchor.set(0.5);

    button.position.x = buttonPositions[i*2];
    button.position.y = buttonPositions[i*2 + 1];

    // make the button interactive...
    button.interactive = true;
	
	

    button
        // set the mousedown and touchstart callback...
        .on('mousedown', onButtonDown)
        .on('touchstart', onButtonDown)

        // set the mouseup and touchend callback...
        .on('mouseup', onButtonUp)
        .on('touchend', onButtonUp)
        .on('mouseupoutside', onButtonUp)
        .on('touchendoutside', onButtonUp)

        // set the mouseover callback...
        .on('mouseover', onButtonOver)

        // set the mouseout callback...
        .on('mouseout', onButtonOut)


        // you can also listen to click and tap events :
        //.on('click', noop)
        
	button.tap = noop;
	button.click = noop;
    // add it to the stage
    stage.addChild(button);

    // add button to array
    buttons.push(button);
}

// set some silly values...
buttons[0].scale.set(1.2);

buttons[2].rotation = Math.PI / 10;

buttons[3].scale.set(0.8);

buttons[4].scale.set(0.8,1.2);
buttons[4].rotation = Math.PI;


animate();

function animate() {
    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}

function onButtonDown()
{
    this.isdown = true;
    this.texture = textureButtonDown;
    this.alpha = 1;
}

function onButtonUp()
{
    this.isdown = false;

    if (this.isOver)
    {
        this.texture = textureButtonOver;
    }
    else
    {
        this.texture = textureButton;
    }
}

function onButtonOver()
{
    this.isOver = true;

    if (this.isdown)
    {
        return;
    }

    this.texture = textureButtonOver;
}

function onButtonOut()
{
    this.isOver = false;

    if (this.isdown)
    {
        return;
    }

    this.texture = textureButton;
}
