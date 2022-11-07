const W = 800; const H = 600; const PAD = 80; const
    resolution = 1;
const WIDTH = W / resolution; const
    HEIGHT = H / resolution;

// the plugin is here: https://github.com/pixijs/pixi-layers/tree/master, its WIP

const app = new PIXI.Application({ width: WIDTH, height: HEIGHT, resolution });
document.body.appendChild(app.view);

// create the stage instead of container
app.stage = new PIXI.layers.Stage();

const background = new PIXI.TilingSprite(
    PIXI.Texture.from('examples/assets/p2.jpeg'),
    WIDTH,
    HEIGHT,
);
app.stage.addChild(background);
// make container for bunnies
const bunnyWorld = new PIXI.Container();
app.stage.addChild(bunnyWorld);

const lighting = new PIXI.layers.Layer();
lighting.on('display', (element) => {
    element.blendMode = PIXI.BLEND_MODES.ADD;
});
lighting.useRenderTexture = true;
lighting.clearColor = [0.5, 0.5, 0.5, 1]; // ambient gray

app.stage.addChild(lighting);

const lightingSprite = new PIXI.Sprite(lighting.getRenderTexture());
lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

app.stage.addChild(lightingSprite);

const bunnyTexture = PIXI.Texture.from('examples/assets/bunny.png');
function updateBunny(bunny) {
    bunny.x += bunny.vx;
    bunny.y += bunny.vy;
    if (bunny.x > WIDTH + PAD) {
        bunny.x -= WIDTH + 2 * PAD;
    }
    if (bunny.x < -PAD) {
        bunny.x += WIDTH + 2 * PAD;
    }
    if (bunny.y > HEIGHT + PAD) {
        bunny.y -= HEIGHT + 2 * PAD;
    }
    if (bunny.y < -PAD) {
        bunny.y += HEIGHT + 2 * PAD;
    }
}

function createBunny() {
    const bunny = new PIXI.Sprite(bunnyTexture);
    bunny.update = updateBunny;

    const angle = Math.random() * Math.PI * 2;
    const speed = 200.0; // px per second
    bunny.vx = Math.cos(angle) * speed / 60.0;
    bunny.vy = Math.sin(angle) * speed / 60.0;
    bunny.position.set(Math.random() * WIDTH, Math.random() * HEIGHT);
    bunny.anchor.set(0.5, 0.5);

    const lightbulb = new PIXI.Graphics();
    const rr = Math.random() * 0x80 | 0;
    const rg = Math.random() * 0x80 | 0;
    const rb = Math.random() * 0x80 | 0;
    const rad = 50 + Math.random() * 20;
    lightbulb.beginFill((rr << 16) + (rg << 8) + rb, 1.0);
    lightbulb.drawCircle(0, 0, rad);
    lightbulb.endFill();
    lightbulb.parentLayer = lighting;// <-- try comment it

    bunny.addChild(lightbulb);

    return bunny;
}

for (let i = 0; i < 40; i++) {
    bunnyWorld.addChild(createBunny());
}

app.ticker.add(() => {
    bunnyWorld.children.forEach(updateBunny);
});
