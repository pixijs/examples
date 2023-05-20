// Interpolations Documentation: https://miltoncandelero.github.io/tweedle.js/variables/Interpolation.html

const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// Update the shared group
app.ticker.add(() => TWEEDLE.Group.shared.update());

// Create a new texture
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// time animation in miliseconds!
const time = 2000;

// Angle and Radians supported!

const directRotation = new PIXI.Sprite(texture);
directRotation.anchor.set(0.5);
directRotation.scale.set(3);
directRotation.position.set(100, 100);
app.stage.addChild(directRotation);

const smartAngle = new PIXI.Sprite(texture);
smartAngle.anchor.set(0.5);
smartAngle.scale.set(3);
smartAngle.position.set(300, 100);
app.stage.addChild(smartAngle);

const smartRotation = new PIXI.Sprite(texture);
smartRotation.anchor.set(0.5);
smartRotation.scale.set(3);
smartRotation.position.set(500, 100);
app.stage.addChild(smartRotation);

// RGB

const directTint = new PIXI.Sprite(texture);
directTint.anchor.set(0.5);
directTint.scale.set(3);
directTint.position.set(100, 300);
app.stage.addChild(directTint);

const rgbTint = new PIXI.Sprite(texture);
rgbTint.anchor.set(0.5);
rgbTint.scale.set(3);
rgbTint.position.set(300, 300);
app.stage.addChild(rgbTint);

app.stage.interactive = true;
app.stage.on('pointerdown', () => {
    const randomRadians = Math.random() * Math.PI * 2 * (Math.random() > 0.5 ? 1 : -1);
    const randomDegrees = randomRadians * 180 / Math.PI;
    const randomColor = Math.random() * 0xFFFFFF;

    // Pay attention! Interpolation only works with arrays so we make an array of one element!

    new TWEEDLE.Tween(directRotation).to({ rotation: randomRadians }, time).start();
    new TWEEDLE.Tween(smartRotation).to({ rotation: [randomRadians] }, time).interpolation(TWEEDLE.Interpolation.Angle.Radians).start();
    new TWEEDLE.Tween(smartAngle).to({ angle: [randomDegrees] }, time).interpolation(TWEEDLE.Interpolation.Angle.Degrees).start();

    new TWEEDLE.Tween(directTint).to({ tint: randomColor }, time).start();
    new TWEEDLE.Tween(rgbTint).to({ tint: [randomColor] }, time).interpolation(TWEEDLE.Interpolation.Color.RGB).start();
});
