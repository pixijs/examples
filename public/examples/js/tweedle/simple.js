// Tween Documentation: https://miltoncandelero.github.io/tweedle.js/classes/Tween.html

const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// Update the shared group
app.ticker.add(() => TWEEDLE.Group.shared.update());

// Create a new texture
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// time animation in miliseconds!
const time = 2000;

const bunny1 = new PIXI.Sprite(texture);
app.stage.addChild(bunny1);

new TWEEDLE.Tween(bunny1).to({ x: 500 }, time)
    .repeat(Infinity)
    .yoyo(true)
    .start();

const bunny2 = new PIXI.Sprite(texture);
bunny2.y = 100;
app.stage.addChild(bunny2);

new TWEEDLE.Tween(bunny2).to({ alpha: 0.0 }, time)
    .repeat(Infinity)
    .yoyo(true)
    .start();

const bunny3 = new PIXI.Sprite(texture);
bunny3.y = 200;
app.stage.addChild(bunny3);

new TWEEDLE.Tween(bunny3).to({ scale: { x: 2.0, y: 2.0 } }, time)
    .repeat(Infinity)
    .yoyo(true)
    .start();

const bunny4 = new PIXI.Sprite(texture);
bunny4.y = 350;
bunny4.x = 100;
bunny4.anchor.set(0.5, 0.5);
app.stage.addChild(bunny4);

new TWEEDLE.Tween(bunny4).to({ rotation: 2 * Math.PI }, time)
    .repeat(Infinity)
    .yoyo(true)
    .start();

let colorBunny = null;
createNewBunny();

function createNewBunny() {
    if (colorBunny) {
        app.stage.removeChild(colorBunny);
    }

    colorBunny = new PIXI.Sprite(texture);
    colorBunny.y = 500;
    colorBunny.x = 50;
    colorBunny.tint = `0x${Math.floor(Math.random() * 16777215).toString(16)}`;
    app.stage.addChild(colorBunny);

    new TWEEDLE.Tween(colorBunny).to({ x: 500 }, time)
        .onComplete(createNewBunny)
        .start();
}
