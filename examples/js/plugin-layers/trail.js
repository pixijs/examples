const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

app.stage = new PIXI.layers.Stage();

const layer = new PIXI.layers.Layer();
layer.useRenderTexture = true;
// this flag is required, or you'll get
// "glDrawElements: Source and destination textures of the draw are the same."
layer.useDoubleBuffer = true;

const trailSprite = new PIXI.Sprite(layer.getRenderTexture());
trailSprite.alpha = 0.6;

layer.addChild(trailSprite);

app.stage.addChild(layer);
const showLayer = new PIXI.Sprite(layer.getRenderTexture());
app.stage.addChild(showLayer);

const bunnyTex = PIXI.Texture.from('examples/assets/bunny.png');
const bunnies = [];
for (let i = 0; i < 5; i++) {
    bunnies[i] = new PIXI.Container();
    bunnies[i].position.set(app.screen.width / 2, app.screen.height / 2);
    bunnies[i].rotation = (i / 5) * (Math.PI * 2);
    bunnies[i].pivot.set(0, -200);

    const sprite = new PIXI.Sprite(bunnyTex);
    bunnies[i].addChild(sprite);
    sprite.anchor.set(0.5);
    sprite.scale.set(2 + Math.random());

    layer.addChild(bunnies[i]);
}

// Listen for animate update
app.ticker.add((delta) => {
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent transformation
    for (let i = 0; i < bunnies.length; i++) {
        bunnies[i].rotation += 0.05 * delta;
        bunnies[i].children[0].rotation += 0.1 * delta;
    }
});
