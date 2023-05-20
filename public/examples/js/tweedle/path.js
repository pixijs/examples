// Interpolations Documentation: https://miltoncandelero.github.io/tweedle.js/variables/Interpolation.html

const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

// Update the shared group
app.ticker.add(() => TWEEDLE.Group.shared.update());

// Create a new texture
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// time animation in miliseconds!
const time = 10000;

const xTargets = [100, 500, 100, 300, 700, 0];
const yTargets = [200, 100, 500, 100, 500, 0];

// Linear bunny
const bunny1 = new PIXI.Sprite(texture);
bunny1.tint = 0xFF0000;
app.stage.addChild(bunny1);

new TWEEDLE.Tween(bunny1).to({ x: xTargets, y: yTargets }, time)
    .repeat(Infinity)
    .start();

// catmullRom bunny
const bunny2 = new PIXI.Sprite(texture);
bunny2.tint = 0x00FF00;
app.stage.addChild(bunny2);

new TWEEDLE.Tween(bunny2).to({ x: xTargets, y: yTargets }, time)
    .repeat(Infinity)
    .interpolation(TWEEDLE.Interpolation.Geom.CatmullRom)
    .start();

const auxGraphics = new PIXI.Graphics();
auxGraphics.lineStyle(2, 0xFFFFFF, 1);
for (let i = 0; i < xTargets.length; i++) {
    auxGraphics.lineTo(xTargets[i], yTargets[i]);
    auxGraphics.drawCircle(xTargets[i], yTargets[i], 5);
}
app.stage.addChild(auxGraphics);
