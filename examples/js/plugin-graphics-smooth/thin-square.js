const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x0
});

document.body.appendChild(app.view);

const graphics = new PIXI.smooth.SmoothGraphics();
graphics.pivot = { x: 300, y: 300 };
graphics.position = { x: 300, y: 300 };

// Rectangle
graphics.lineStyle(0.2, 0xffffff, 1);

graphics.drawRect(150, 150, 300, 300);
graphics.endFill();

app.stage.addChild(graphics);

app.ticker.add((delta) => {
    graphics.rotation -= 0.004 * delta;
});
