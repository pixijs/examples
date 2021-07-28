// Top - smoothed graphics
// Bottom - usual pixi graphics

const app = new PIXI.Application({
    antialias: false,
    width: 800,
    height: 600,
    backgroundColor: 0x0,
});
document.body.appendChild(app.view);

const graphics = new PIXI.smooth.SmoothGraphics();
app.stage.addChild(graphics);

const graphics2 = new PIXI.Graphics();
graphics2.y = 300;
app.stage.addChild(graphics2);

let phase = 0;

function addLine(gfx, y, len, rad, cap) {
    gfx.lineStyle({
        width: 30, color: 0xffffff, alpha: 1, join: PIXI.LINE_JOIN.MITER, cap,
    });
    gfx.moveTo(150 - len, y);
    gfx.lineTo(150, y);
    gfx.lineTo(150 + Math.cos(phase) * rad, y + Math.sin(phase) * rad);

    gfx.lineStyle({
        width: 30, color: 0xffffff, alpha: 1, join: PIXI.LINE_JOIN.BEVEL, cap,
    });
    gfx.moveTo(350 + Math.cos(phase) * rad, y + Math.sin(phase) * rad);
    gfx.lineTo(350, y);
    gfx.lineTo(350 - len, y);

    gfx.lineStyle({
        width: 30, color: 0xffffff, alpha: 1, join: PIXI.LINE_JOIN.ROUND, cap,
    });
    gfx.moveTo(550 - len, y);
    gfx.lineTo(550, y);
    gfx.lineTo(550 + Math.cos(phase) * rad, y + Math.sin(phase) * rad);
}

function makeFigures(gfx) {
    gfx.clear();

    addLine(gfx, 100, 50, 60, PIXI.LINE_CAP.BUTT);
    addLine(gfx, 200, 50, 60, PIXI.LINE_CAP.ROUND);
}

// graphics.rotation = Math.PI * 3 / 2 - 0.0001;
app.ticker.add((delta) => {
    phase -= 0.008 * delta;
    makeFigures(graphics);
    makeFigures(graphics2);
});
