// This demo uses canvas2d gradient API
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
// You can use `rgba(255,255,255,0.5)` notation in color stops

var app = new PIXI.Application(800, 600, { antialias: true });
document.body.appendChild(app.view);

function createGradTexture() {
    // adjust it if somehow you need better quality for very very big images
    var quality = 256;
    var canvas = document.createElement('canvas');
    canvas.width = quality;
    canvas.height = 1;

    var ctx = canvas.getContext('2d');

    // use canvas2d API to create gradient
    var grd = ctx.createLinearGradient(0, 0, quality, 0);
    grd.addColorStop(0, 'red');
    grd.addColorStop(1, 'white');

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, quality, 1);

    return PIXI.Texture.fromCanvas(canvas);
}

var gradTexture = createGradTexture();

var sprite = new PIXI.Sprite(gradTexture);
sprite.position.set(100, 100);
sprite.rotation = Math.PI / 8;
sprite.width = 300;
sprite.height = 50;
app.stage.addChild(sprite);
