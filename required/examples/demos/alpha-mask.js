var app = new PIXI.Application();
document.body.appendChild(app.view);

app.stage.interactive = true;

var bg = PIXI.Sprite.fromImage('required/assets/bkg.jpg');

app.stage.addChild(bg);

var cells = PIXI.Sprite.fromImage('required/assets/cells.png');

cells.scale.set(1.5,1.5);

var mask = PIXI.Sprite.fromImage('required/assets/flowerTop.png');
mask.anchor.set(0.5);
mask.position.x = 310;
mask.position.y = 190;

cells.mask = mask;

app.stage.addChild(mask, cells);

var target = new PIXI.Point();

reset();

function reset () {
    target.x = Math.floor(Math.random() * 550);
    target.y = Math.floor(Math.random() * 300);
}

app.ticker.add(function() {

    mask.position.x += (target.x - mask.x) * 0.1;
    mask.position.y += (target.y - mask.y) * 0.1;

    if(Math.abs(mask.x - target.x) < 1)
    {
        reset();
    }
});
