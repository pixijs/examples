// pixi-picture.js is REQUIRED for this demo
// plain, basic version of pixi-picture you can see at https://github.com/pixijs/pixi-plugin-example/

// ivan: border artifact example is not ready yet :)

var renderer = new PIXI.CanvasRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.loader.add('bunny', '_assets/bunny.png');
PIXI.loader.load(function(loader, resources) {
	var pic = new PIXI.extras.PictureSprite(resources.bunny.texture);
	pic.position.set(200,200);
	stage.addChild(pic);
	
	animate();
});

function animate() {
    requestAnimationFrame(animate);
    // render the container
    renderer.render(stage);
}
