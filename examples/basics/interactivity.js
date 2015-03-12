
// create an new instance of a pixi stage
var stage = new PIXI.Container();

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(620, 400,{backgroundColor : 0x000000});

// add the renderer view element to the DOM
document.getElementById('example').appendChild(renderer.view);

// create a background...
var background = PIXI.Sprite.fromImage("_assets/button_test_BG.jpg");

// add background to stage...
stage.addChild(background);

// create some textures from an image path
var textureButton = PIXI.Texture.fromImage("_assets/button.png");
var textureButtonDown = PIXI.Texture.fromImage("_assets/buttonDown.png");
var textureButtonOver = PIXI.Texture.fromImage("_assets/buttonOver.png");

var buttons = [];

var buttonPositions = [175,75,
                       455, 75,
                       280, 210,
                       175, 325,
                       485, 305];


    for (var i=0; i < 5; i++)
    {
        var button = new PIXI.Sprite(textureButton);
        button.buttonMode = true;

        button.anchor.set(0.5);

        button.position.x = buttonPositions[i*2];
        button.position.y = buttonPositions[i*2 + 1];

        // make the button interactive...
        button.interactive = true;

        // set the mousedown and touchstart callback...
        button.mousedown = button.touchstart = function(eventData) {
            this.isdown = true;
            this.texture = textureButtonDown;
            this.alpha = 1;
        };

        // set the mouseup and touchend callback...
        button.mouseup = button.touchend = button.mouseupoutside = button.touchendoutside = function(eventData) {
            this.isdown = false;

            if (this.isOver)
            {
                this.texture = textureButtonOver;
            }
            else
            {
                this.texture = textureButton;
            }
        };

        // set the mouseover callback...
        button.mouseover = function(eventData) {

            this.isOver = true;

            if (this.isdown)
                return;

            this.texture = textureButtonOver;
        };

        // set the mouseout callback...
        button.mouseout = function(eventData) {
            this.isOver = false;

            if (this.isdown)
                return;

            this.texture = textureButton;
        };

        // you can also listen to click and tap events :
        button.click = function(eventData) {
            console.log("CLICK!");
        };

        button.tap = function(eventData) {
            console.log("TAP!!");
        };

        // add it to the stage
        stage.addChild(button);

        // add button to array
        buttons.push(button);
    };

    // set some silly values...
    buttons[0].scale.set(1.2);

    buttons[2].rotation = Math.PI / 10;

    buttons[3].scale.set(0.8);

    buttons[4].scale.set(0.8,1.2);
    buttons[4].rotation = Math.PI;


    requestAnimationFrame(animate);

    function animate() {
        // render the stage
        renderer.render(stage);

        requestAnimationFrame(animate);
    }

    // add a logo!
    var pixiLogo = PIXI.Sprite.fromImage("pixi.png");
    stage.addChild(pixiLogo);

    pixiLogo.interactive = true;
    pixiLogo.buttonMode = true;

    pixiLogo.position.x = 564;
    pixiLogo.position.y = 368;

    pixiLogo.click = pixiLogo.tap = function() {
        window.open("http://www.pixijs.com", '_blank');
    };

