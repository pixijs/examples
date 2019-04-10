const app = new PIXI.Application();
document.body.appendChild(app.view);

app.stage.interactive = true;

const bg = PIXI.Sprite.from('examples/assets/bg_rotate.jpg');
bg.anchor.set(0.5);

bg.x = app.screen.width / 2;
bg.y = app.screen.height / 2;

const filter = new PIXI.filters.ColorMatrixFilter();

const container = new PIXI.Container();
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

const bgFront = PIXI.Sprite.from('examples/assets/bg_scene_rotate.jpg');
bgFront.anchor.set(0.5);

container.addChild(bgFront);

const light2 = PIXI.Sprite.from('examples/assets/light_rotate_2.png');
light2.anchor.set(0.5);
container.addChild(light2);

const light1 = PIXI.Sprite.from('examples/assets/light_rotate_1.png');
light1.anchor.set(0.5);
container.addChild(light1);

const panda = PIXI.Sprite.from('examples/assets/panda.png');
panda.anchor.set(0.5);

container.addChild(panda);

app.stage.addChild(container);

app.stage.filters = [filter];

let count = 0;
let enabled = true;

app.stage.on('pointertap', () => {
    enabled = !enabled;
    app.stage.filters = enabled ? [filter] : null;
});

const help = new PIXI.Text('Click or tap to turn filters on / off.', {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: 'bold',
    fill: 'white',
});
help.y = app.screen.height - 25;
help.x = 10;

app.stage.addChild(help);

app.ticker.add((delta) => {
    bg.rotation += 0.01;
    bgFront.rotation -= 0.01;
    light1.rotation += 0.02;
    light2.rotation += 0.01;

    panda.scale.x = 1 + Math.sin(count) * 0.04;
    panda.scale.y = 1 + Math.cos(count) * 0.04;

    count += 0.1;

    const { matrix } = filter;

    matrix[1] = Math.sin(count) * 3;
    matrix[2] = Math.cos(count);
    matrix[3] = Math.cos(count) * 1.5;
    matrix[4] = Math.sin(count / 3) * 2;
    matrix[5] = Math.sin(count / 2);
    matrix[6] = Math.sin(count / 4);
});
