const app = new PIXI.Application();
document.body.appendChild(app.view);

app.stage.position.set(400, 300);

const outlineFilterGreen = new PIXI.filters.OutlineFilter(2, 0x99ff99);
const outlineFilterRed = new PIXI.filters.GlowFilter({
    distance: 15,
    outerStrength: 2,
    innerStrength: 1,
    color: 0xff9999,
    quality: 0.5,
});

function filterOn() {
    this.filters = [outlineFilterRed];
}

function filterOff() {
    this.filters = [outlineFilterGreen];
}

for (let i = 0; i < 20; i++) {
    const bunny = PIXI.Sprite.from('examples/assets/bunny.png');
    bunny.interactive = true;
    bunny.position.set((Math.random() * 2 - 1) * 300 | 0, (Math.random() * 2 - 1) * 200 | 0);
    bunny.scale.x = (Math.random() * 3 | 0 * 0.1) + 1;
    bunny.on('pointerover', filterOn)
        .on('pointerout', filterOff);
    filterOff.call(bunny);
    app.stage.addChild(bunny);
}
