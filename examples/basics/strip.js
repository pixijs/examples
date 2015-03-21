var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var count = 0;

// build a rope!
var ropeLength = 918 / 20;

var points = [];

for (var i = 0; i < 20; i++)
{
    points.push(new PIXI.Point(i * ropeLength, 0));
}

var strip = new PIXI.mesh.Rope(PIXI.Texture.fromImage('_assets/snake.png'), points);

strip.x = -459;

var snakeContainer = new PIXI.Container();
snakeContainer.position.x = 400;
snakeContainer.position.y = 300;

snakeContainer.scale.set(800 / 1100);
stage.addChild(snakeContainer);

snakeContainer.addChild(strip);

// start animating
requestAnimationFrame(animate);

function animate() {

    count += 0.1;

    // make the snake
    for (var i = 0; i < points.length; i++) {

        points[i].y = Math.sin((i * 0.5) + count) * 30;

        points[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 20;

    }

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}
