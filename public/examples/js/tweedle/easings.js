// See all available easings at https://miltoncandelero.github.io/tweedle.js/variables/Easing.html

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
    .easing(TWEEDLE.Easing.Elastic.Out)
    .start();

const bunny2 = new PIXI.Sprite(texture);
bunny2.y = 100;
app.stage.addChild(bunny2);

new TWEEDLE.Tween(bunny2).to({ x: 500 }, time)
    .repeat(Infinity)
    .easing(TWEEDLE.Easing.Quadratic.Out)
    .start();

const bunny3 = new PIXI.Sprite(texture);
bunny3.y = 200;
app.stage.addChild(bunny3);

new TWEEDLE.Tween(bunny3).to({ x: 500 }, time)
    .repeat(Infinity)
    .easing(TWEEDLE.Easing.Bounce.Out)
    .start();

const bunny4 = new PIXI.Sprite(texture);
bunny4.y = 300;
app.stage.addChild(bunny4);

new TWEEDLE.Tween(bunny4).to({ x: 500 }, time)
    .repeat(Infinity)
    .easing(TWEEDLE.Easing.Cubic.In)
    .start();

const bunny5 = new PIXI.Sprite(texture);
bunny5.y = 400;
app.stage.addChild(bunny5);

new TWEEDLE.Tween(bunny5).to({ x: 500 }, time)
    .repeat(Infinity)
    .easing(TWEEDLE.Easing.Linear.None)
    .start();

const bunny6 = new PIXI.Sprite(texture);
bunny6.y = 500;
app.stage.addChild(bunny6);

new TWEEDLE.Tween(bunny6).to({ x: 500 }, time)
    .repeat(Infinity)
    .easing(TWEEDLE.Easing.Step.None)
    .start();
