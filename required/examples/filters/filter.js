var app = new PIXI.Application();
document.body.appendChild(app.view);

app.stage.interactive = true;

var bg = PIXI.Sprite.fromImage('required/assets/BGrotate.jpg');
bg.anchor.set(0.5);

bg.position.x = app.renderer.width / 2;
bg.position.y = app.renderer.height / 2;

var filter = new PIXI.filters.ColorMatrixFilter();

var container = new PIXI.Container();
container.position.x = app.renderer.width / 2;
container.position.y = app.renderer.height / 2;

var bgFront = PIXI.Sprite.fromImage('required/assets/SceneRotate.jpg');
bgFront.anchor.set(0.5);

container.addChild(bgFront);

var light2 = PIXI.Sprite.fromImage('required/assets/LightRotate2.png');
light2.anchor.set(0.5);
container.addChild(light2);

var light1 = PIXI.Sprite.fromImage('required/assets/LightRotate1.png');
light1.anchor.set(0.5);
container.addChild(light1);

var panda =  PIXI.Sprite.fromImage('required/assets/panda.png');
panda.anchor.set(0.5);

container.addChild(panda);

app.stage.addChild(container);

app.stage.filters = [filter];

var count = 0;
var switchy = false;

app.stage.on('click', onClick);
app.stage.on('tap', onClick);

function onClick()
{
    switchy = !switchy;

    if (!switchy)
    {
        app.stage.filters = [filter];
    }
    else
    {
        app.stage.filters = null;
    }
}

var help = new PIXI.Text('Click to turn filters on / off.', { fontFamily:'Arial', fontSize:'12pt', fontWeight:'bold', fill: 'white' });
help.position.y = app.renderer.height - 25;
help.position.x = 10;

app.stage.addChild(help);

app.ticker.add(function() {
    bg.rotation += 0.01;
    bgFront.rotation -= 0.01;

    light1.rotation += 0.02;
    light2.rotation += 0.01;

    panda.scale.x = 1 + Math.sin(count) * 0.04;
    panda.scale.y = 1 + Math.cos(count) * 0.04;

    count += 0.1;

    var matrix = filter.matrix;

    matrix[1] = Math.sin(count) * 3;
    matrix[2] = Math.cos(count);
    matrix[3] = Math.cos(count) * 1.5;
    matrix[4] = Math.sin(count / 3) * 2;
    matrix[5] = Math.sin(count / 2);
    matrix[6] = Math.sin(count / 4);
});
