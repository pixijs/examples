var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var count = 0;

// build a rope!
var ropeLength = 918 / 20;
var ropeLength = 45;

var points = [];

for (var i = 0; i < 25; i++)
{
    points.push(new PIXI.Point(i * ropeLength, 0));
}

var strip = new PIXI.mesh.Rope(PIXI.Texture.fromImage('_assets/snake.png'), points);

strip.position.x = -40;
strip.position.y = 300;

stage.addChild(strip);

var g = new PIXI.Graphics();

g.x = strip.x;
g.y = strip.y;
stage.addChild(g);

// start animating
animate();

function animate() {

    count += 0.1;

    // make the snake
    for (var i = 0; i < points.length; i++) {

        points[i].y = Math.sin((i * 0.5) + count) * 30;

        points[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 20;

    }

    // render the stage
    renderer.render(stage);

    renderPoints();

    requestAnimationFrame(animate);
}

function renderPoints () {

    g.clear();

    g.lineStyle(2,0xffc2c2);
    g.moveTo(points[0].x,points[0].y);

    for (var i = 1; i < points.length; i++) {
        g.lineTo(points[i].x,points[i].y);
    };

    for (var i = 1; i < points.length; i++) {
        g.beginFill(0xff0022);
        g.drawCircle(points[i].x,points[i].y,10);
        g.endFill();
    };
}
