var app = new PIXI.Application(800, 600, {backgroundColor: 0x103322});
document.body.appendChild(app.view);

// === FIRST PART ===
// just simple rotation

var sprite = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage('examples/assets/flowerTop.png'));
sprite.anchor.set(0.5, 1.0);
sprite.proj.affine = PIXI.projection.AFFINE.AXIS_X; // return to affine after rotating
sprite.position.set(app.screen.width * 1/8, app.screen.height/2);
app.stage.addChild(sprite);

var step = 0;

app.ticker.add((delta) => {
    step += delta;
    sprite.rotation = step * 0.1;
});

// === SECOND PART ===
// lets also add scaling container

var scalingContainer = new PIXI.Container();
scalingContainer.scale.y = 0.3; // adjust scale by Y - that will change "perspective" a bit
scalingContainer.position.set(app.screen.width * 3/8, app.screen.height/2);
app.stage.addChild(scalingContainer);

var sprite2 = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage('examples/assets/flowerTop.png'));
sprite2.anchor.set(0.5, 1.0);
sprite2.proj.affine = PIXI.projection.AFFINE.AXIS_X;
scalingContainer.addChild(sprite2);

app.ticker.add(() => {
    sprite2.rotation = step * 0.1;
});

// === THIRD PART ===
// Better isometry plane.
// We can even rotate it if you want!

var isoScalingContainer = new PIXI.Container();
isoScalingContainer.scale.y = 0.5; // isometry can be achieved by setting scaleY 0.5 or tan(30 degrees)
isoScalingContainer.position.set(app.screen.width * 6/8, app.screen.height/2);
app.stage.addChild(isoScalingContainer);

var isometryPlane = new PIXI.Graphics();
isometryPlane.rotation = Math.PI/4;
isoScalingContainer.addChild(isometryPlane);

isometryPlane.lineStyle(2, 0xffffff);
for (var i=-100;i<=100; i+=50) {
    isometryPlane.moveTo(-150, i);
    isometryPlane.lineTo(150, i);
    isometryPlane.moveTo(i, -150);
    isometryPlane.lineTo(i, 150);
}

isometryPlane.drawCircle(0, 0, 100);

var sprite3 = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage('examples/assets/eggHead.png'));
sprite3.anchor.set(0.5, 1.0);
sprite3.proj.affine = PIXI.projection.AFFINE.AXIS_X;
sprite3.scale.set(0.3, 0.5); //make it small but tall!
//not-proportional scale can't work without special flag `scaleAfterAffine`
//fortunately, its `true` by default
isometryPlane.addChild(sprite3);

app.ticker.add(() => {
    sprite3.rotation = step * 0.05;
    var radius = 100, speed = 0.005;
    sprite3.position.set(Math.cos(step * speed) * radius, Math.sin(step * speed) * radius);
});
