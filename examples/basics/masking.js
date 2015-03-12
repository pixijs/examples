
// create an new instance of a pixi stage
var stage = new PIXI.Container();

stage.interactive = true;

var bg = PIXI.Sprite.fromImage("_assets/BGrotate.jpg");
bg.anchor.x = 0.5;
bg.anchor.y = 0.5;

bg.position.x = 620 / 2;
bg.position.y = 380 / 2;

stage.addChild(bg);

var container = new PIXI.DisplayObjectContainer();
container.position.x = 620 / 2;
container.position.y = 380 / 2;

// add a bunch of sprites

var bgFront = PIXI.Sprite.fromImage("_assets/SceneRotate.jpg");
bgFront.anchor.x = 0.5;
bgFront.anchor.y = 0.5;

container.addChild(bgFront);

var light2 = PIXI.Sprite.fromImage("_assets/LightRotate2.png");
light2.anchor.x = 0.5;
light2.anchor.y = 0.5;
container.addChild(light2);

var light1 = PIXI.Sprite.fromImage("_assets/LightRotate1.png");
light1.anchor.x = 0.5;
light1.anchor.y = 0.5;
container.addChild(light1);

var panda =  PIXI.Sprite.fromImage("_assets/panda.png");
panda.anchor.x = 0.5;
panda.anchor.y = 0.5;

container.addChild(panda);

stage.addChild(container);


var rendererOptions  = { antialias : true};
// create a renderer instance
var renderer = PIXI.autoDetectRenderer(620, 380,rendererOptions);

// add render view to DOM
document.getElementById('example').appendChild(renderer.view);

// let's create a moving shape
var thing = new PIXI.Graphics();
stage.addChild(thing);
thing.position.x = 620 / 2;
thing.position.y = 380 / 2;
thing.lineStyle(0);


container.mask = thing;

var count = 0;

stage.click = stage.tap = function()
{
        if(!container.mask)
        {
            container.mask = thing;
        }
        else
        {
            container.mask = null;
        }
    }

/*
 * Add a pixi Logo!
 */
var logo = PIXI.Sprite.fromImage("_assets/../pixi.png")
stage.addChild(logo);

logo.anchor.x = 1;
logo.position.x = 620;
logo.position.y = 320;
logo.interactive = true;
logo.buttonMode = true;

logo.click = logo.tap = function()
{
    window.open("https://github.com/GoodBoyDigital/pixi.js", "_blank");
}

var help = new PIXI.Text("Click to turn masking on / off.", {font:"bold 12pt Arial", fill:"white"});
help.position.y = 350;
help.position.x = 10;
stage.addChild(help);

requestAnimationFrame(animate);

    function animate() {

        bg.rotation += 0.01;
        bgFront.rotation -= 0.01;

        light1.rotation += 0.02;
        light2.rotation += 0.01;

        panda.scale.x = 1 + Math.sin(count) * 0.04;
        panda.scale.y = 1 + Math.cos(count) * 0.04;

        count += 0.1;

        thing.clear();

        thing.beginFill(0x8bc5ff, 0.4);
        thing.moveTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count)* 20);
        thing.lineTo(-320 + Math.cos(count)* 20, 100 + Math.sin(count)* 20);
        thing.lineTo(120 + Math.cos(count) * 20, -100 + Math.sin(count)* 20);
        thing.lineTo(120 + Math.sin(count) * 20, 100 + Math.cos(count)* 20);
        thing.lineTo(-120 + Math.cos(count)* 20, 100 + Math.sin(count)* 20);
        thing.lineTo(-120 + Math.sin(count) * 20, -300 + Math.cos(count)* 20);
        thing.lineTo(-320 + Math.sin(count) * 20, -100 + Math.cos(count)* 20);
        thing.rotation = count * 0.1;


        renderer.render(stage);
        requestAnimationFrame(animate);
    }
