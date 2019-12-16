// Note: In this example we have two "requestAnimationFrame", PIXI + TweenMax.
// TweeMax coordinate his animations (bunnies).

const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view);

// Create a new texture
const texture = PIXI.Texture.from('examples/assets/bunny.png');

// time animation in seconds
const time = 2.0;

const bunny1 = new PIXI.Sprite(texture);
app.stage.addChild(bunny1);

TweenMax.to(bunny1, time, { x: 500, repeat: -1, yoyo: true });

const bunny2 = new PIXI.Sprite(texture);
bunny2.y = 100;
app.stage.addChild(bunny2);

TweenMax.to(bunny2, time, { alpha: 0.0, repeat: -1, yoyo: true });

const bunny3 = new PIXI.Sprite(texture);
bunny3.y = 200;
app.stage.addChild(bunny3);

TweenMax.to(bunny3.scale, time, {
    x: 2.0, y: 2.0, repeat: -1, yoyo: true,
});

const bunny4 = new PIXI.Sprite(texture);
bunny4.y = 350;
bunny4.x = 100;
bunny4.anchor.set(0.5, 0.5);
app.stage.addChild(bunny4);

TweenMax.to(bunny4, time, { rotation: 2 * Math.PI, repeat: -1, yoyo: true });

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

    TweenMax.to(colorBunny, time, { x: 500, onComplete: createNewBunny });
}
