// This is demo of pixi-layers.js, https://github.com/pixijs/pixi-layers

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const textureGreen = PIXI.Texture.from('examples/assets/bunny_green.png');
const textureBlue = PIXI.Texture.from('examples/assets/bunny_blue.png');

let blue = new PIXI.Container();
let green = new PIXI.Container();

app.stage = new PIXI.display.Stage();

const topLayer = new PIXI.display.Layer();
app.stage.addChild(blue, green, topLayer);

for (let i = 0; i < 15; i++) {
    const bunny = new PIXI.Sprite(textureGreen);
    bunny.width = 50;
    bunny.height = 50;
    bunny.position.set(100 + 20 * i, 100 + 20 * i);
    bunny.anchor.set(0.5);
  
    green.addChild(bunny);
}

for (let i = 9; i >= 0; i--) {
    const bunny = new PIXI.Sprite(textureBlue);
    bunny.width = 50;
    bunny.height = 50;
    bunny.position.set(100 + 20 * i, 150 + 20 * i);
    bunny.anchor.set(0.5)
  
    if (i == 9) {
      bunny.tint = 0xFF0000;
      bunny.parentLayer = topLayer;
    }
  
    blue.addChild(bunny);
}
