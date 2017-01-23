var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

var sprite = PIXI.Sprite.fromImage('required/assets/basics/bunny.png');

sprite.position.set(230,264);
sprite.interactive = true;
sprite.buttonMode = true;
sprite.on('mousedown', onDown);
sprite.on('touchstart', onDown);

app.stage.addChild(sprite);

function onDown (eventData) {

    sprite.scale.x += 0.3;
    sprite.scale.y += 0.3;
}
