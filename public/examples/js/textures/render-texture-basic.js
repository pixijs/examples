const app = new PIXI.Application({ background: '#1099bb' });
document.body.appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

const texture = PIXI.Texture.from('examples/assets/bunny.png');

for (let i = 0; i < 25; i++) {
    const bunny = new PIXI.Sprite(texture);
    bunny.x = (i % 5) * 30;
    bunny.y = Math.floor(i / 5) * 30;
    bunny.rotation = Math.random() * (Math.PI * 2);
    container.addChild(bunny);
}

const brt = new PIXI.BaseRenderTexture({
  width: 300,
  height: 300,
  scaleMode: PIXI.SCALE_MODES.LINEAR,
  resolution: 1,
});
const rt = new PIXI.RenderTexture(brt);

const sprite = new PIXI.Sprite(rt);

sprite.x = 450;
sprite.y = 60;
app.stage.addChild(sprite);

/*
 * All the bunnies are added to the container with the addChild method
 * when you do this, all the bunnies become children of the container, and when a container moves,
 * so do all its children.
 * This gives you a lot of flexibility and makes it easier to position elements on the screen
 */
container.x = 100;
container.y = 60;

app.ticker.add(() => {
    app.renderer.render(container, { renderTexture: rt });
});
