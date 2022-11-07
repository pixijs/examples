const app = new PIXI.Application({ backgroundColor: '#111' });
document.body.appendChild(app.view);

const texture = PIXI.Texture.from('examples/assets/bunny.png');
const bunnyContainer = new PIXI.Container();

async function takeScreenshot() {
    app.stop();
    const url = await app.renderer.extract.base64(bunnyContainer);
    const a = document.createElement('a');
    document.body.append(a);
    a.download = 'screenshot';
    a.href = url;
    a.click();
    a.remove();
    app.start();
}

app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('pointerdown', takeScreenshot);

for (let i = 0; i < 25; i++) {
    const bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    bunnyContainer.addChild(bunny);
}

bunnyContainer.x = 400;
bunnyContainer.y = 300;
bunnyContainer.pivot.x = bunnyContainer.width / 2;
bunnyContainer.pivot.y = bunnyContainer.height / 2;

app.ticker.add((delta) => {
    bunnyContainer.rotation += 0.01 * delta;
});

const style = new PIXI.TextStyle({
    fontFamily: 'Roboto',
    fill: '#999',
});

const screenshotText = new PIXI.Text('Click To Take Screenshot', style);
screenshotText.x = Math.round((app.screen.width - screenshotText.width) / 2);
screenshotText.y = Math.round(screenshotText.height / 2);

app.stage.addChild(screenshotText, bunnyContainer);
