// pixi-picture.js is REQUIRED for this demo
// plain, basic version of pixi-picture you can see at https://github.com/pixijs/pixi-plugin-example/

// ivan: border artifact example is not ready yet :)

var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

app.stop();

PIXI.loader.add('bunny', 'required/assets/bunny.png');
PIXI.loader.load(function(loader, resources) {
	var pic = new PIXI.extras.PictureSprite(resources.bunny.texture);
	pic.position.set(200,200);
	app.stage.addChild(pic);
	app.start();
});