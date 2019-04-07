const app = new PIXI.Application();
document.body.appendChild(app.view);

let count = 0;

// build a rope!
const ropeLength = 918 / 20;

const points = [];

for (let i = 0; i < 20; i++) {
    points.push(new PIXI.Point(i * ropeLength, 0));
}

const strip = new PIXI.mesh.Rope(PIXI.Texture.from('examples/assets/snake.png'), points);

strip.x = -459;

const snakeContainer = new PIXI.Container();
snakeContainer.x = 400;
snakeContainer.y = 300;

snakeContainer.scale.set(800 / 1100);
app.stage.addChild(snakeContainer);

snakeContainer.addChild(strip);

app.ticker.add(() => {
    count += 0.1;

    // make the snake
    for (let i = 0; i < points.length; i++) {
        points[i].y = Math.sin((i * 0.5) + count) * 30;
        points[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 20;
    }
});
