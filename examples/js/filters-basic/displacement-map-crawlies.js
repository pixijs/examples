const app = new PIXI.Application();
document.body.appendChild(app.view);

app.stage.interactive = true;

const container = new PIXI.Container();
app.stage.addChild(container);

const padding = 100;
const bounds = new PIXI.Rectangle(
    -padding,
    -padding,
    app.screen.width + padding * 2,
    app.screen.height + padding * 2,
);
const doges = [];

for (let i = 0; i < 20; i++) {
    const doge = PIXI.Sprite.from('examples/assets/pixi_doge.png');
    doge.anchor.set(0.5);
    container.addChild(doge);

    doge.direction = Math.random() * Math.PI * 2;
    doge.speed = 1;
    doge.turnSpeed = Math.random() - 0.8;

    doge.x = Math.random() * bounds.width;
    doge.y = Math.random() * bounds.height;

    doge.scale.set(1 + Math.random() * 0.3);
    doge.original = new PIXI.Point();
    doge.original.copyFrom(doge.scale);
    doges.push(doge);
}

const displacementSprite = PIXI.Sprite.from('examples/assets/pixi-filters/displace.png');
const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

app.stage.addChild(displacementSprite);

container.filters = [displacementFilter];

displacementFilter.scale.x = 110;
displacementFilter.scale.y = 110;
displacementSprite.anchor.set(0.5);

const ring = PIXI.Sprite.from('examples/assets/pixi-filters/ring.png');

ring.anchor.set(0.5);

ring.visible = false;

app.stage.addChild(ring);

const bg = PIXI.Sprite.from('examples/assets/bg_grass.jpg');
bg.width = app.screen.width;
bg.height = app.screen.height;

bg.alpha = 0.4;

container.addChild(bg);

app.stage
    .on('mousemove', onPointerMove)
    .on('touchmove', onPointerMove);

function onPointerMove(eventData) {
    ring.visible = true;

    displacementSprite.position.set(eventData.data.global.x - 25, eventData.data.global.y);
    ring.position.copyFrom(displacementSprite.position);
}

let count = 0;

app.ticker.add(() => {
    count += 0.05;

    for (let i = 0; i < doges.length; i++) {
        const doge = doges[i];

        doge.direction += doge.turnSpeed * 0.01;
        doge.x += Math.sin(doge.direction) * doge.speed;
        doge.y += Math.cos(doge.direction) * doge.speed;

        doge.rotation = -doge.direction - Math.PI / 2;
        doge.scale.x = doge.original.x + Math.sin(count) * 0.2;

        // wrap the doges around as the crawl
        if (doge.x < bounds.x) {
            doge.x += bounds.width;
        } else if (doge.x > bounds.x + bounds.width) {
            doge.x -= bounds.width;
        }

        if (doge.y < bounds.y) {
            doge.y += bounds.height;
        } else if (doge.y > bounds.y + bounds.height) {
            doge.y -= bounds.height;
        }
    }
});
