// Note: In this example we have two "requestAnimationFrame", PIXI + gsap.
// gsap coordinate his animations (bunnies).

// GSAP documentation: https://greensock.com/docs/v3/Plugins/PixiPlugin

const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
});

document.body.appendChild(app.view);

// Create a new texture
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// time animation in seconds
const time = 2.0;

const bunny1 = new PIXI.Sprite(texture);
bunny1.scale.set(3.0, 3.0);
bunny1.anchor.set(0.5, 0.5);
bunny1.x = app.screen.width / 4;
bunny1.y = app.screen.height / 2;

app.stage.addChild(bunny1);

gsap.to(bunny1, {
    pixi: { tint: 'red' }, duration: time, repeat: -1, yoyo: true,
});

const bunny2 = new PIXI.Sprite(texture);
bunny2.scale.set(3.0, 3.0);
bunny2.anchor.set(0.5, 0.5);
bunny2.x = 2 * app.screen.width / 4;
bunny2.y = app.screen.height / 2;

app.stage.addChild(bunny2);

gsap.to(bunny2, {
    pixi: { tint: '#00FF00' }, duration: time, repeat: -1, yoyo: true,
});

const bunny3 = new PIXI.Sprite(texture);
bunny3.scale.set(3.0, 3.0);
bunny3.anchor.set(0.5, 0.5);
bunny3.x = 3 * app.screen.width / 4;
bunny3.y = app.screen.height / 2;

app.stage.addChild(bunny3);

gsap.to(bunny3, {
    pixi: { tint: 'rgb(0,0,255)' }, duration: time, repeat: -1, yoyo: true,
});
