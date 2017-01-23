var app = new PIXI.Application(800, 600, { antialias: true });
document.body.appendChild(app.view);

app.stage.interactive = true;

var bg = PIXI.Sprite.fromImage('required/assets/BGrotate.jpg');

bg.anchor.x = 0.5;
bg.anchor.y = 0.5;

bg.position.x = app.renderer.width / 2;
bg.position.y = app.renderer.height / 2;

app.stage.addChild(bg);

var container = new PIXI.Container();
container.position.x = app.renderer.width / 2;
container.position.y = app.renderer.height / 2;

// add a bunch of sprites

var bgFront = PIXI.Sprite.fromImage('required/assets/SceneRotate.jpg');
bgFront.anchor.x = 0.5;
bgFront.anchor.y = 0.5;

container.addChild(bgFront);

var light2 = PIXI.Sprite.fromImage('required/assets/LightRotate2.png');
light2.anchor.x = 0.5;
light2.anchor.y = 0.5;
container.addChild(light2);

var light1 = PIXI.Sprite.fromImage('required/assets/LightRotate1.png');
light1.anchor.x = 0.5;
light1.anchor.y = 0.5;
container.addChild(light1);

var panda =  PIXI.Sprite.fromImage('required/assets/panda.png');
panda.anchor.x = 0.5;
panda.anchor.y = 0.5;

container.addChild(panda);

app.stage.addChild(container);

// let's create a moving shape
var thing = new PIXI.Graphics();
app.stage.addChild(thing);
thing.position.x = app.renderer.width / 2;
thing.position.y = app.renderer.height / 2;
thing.lineStyle(0);


container.mask = thing;

var count = 0;

app.stage.on('click', onClick);
app.stage.on('tap', onClick);

function onClick()
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

var help = new PIXI.Text('Click to turn masking on / off.', { fontFamily:'Arial', fontSize:'12pt', fontWeight:'bold', fill: 'white' });
help.position.y = app.renderer.height - 26;
help.position.x = 10;
app.stage.addChild(help);

app.ticker.add(function()
{
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
});
