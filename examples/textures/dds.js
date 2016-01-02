var renderer = PIXI.autoDetectRenderer(800, 600, { resolution: window.devicePixelRatio || 1 });
renderer.view.style.width = "800px";
renderer.view.style.height = "600px";
document.body.appendChild(renderer.view);

// use empty array if you dont want to use detect feature
var extensions = PIXI.compressedTextures.detectExtensions(renderer);

var loader = new PIXI.loaders.Loader();
loader.before(PIXI.compressedTextures.extensionChooser(extensions));
// use @2x texture if resolution is 2, use dds format if its windows
var textureOptions1 = { metadata: {choice: ["@2x.png", ".dds", "@2x.dds"]} };
// use dds format if its windows but dont care for retina
var textureOptions2 = { metadata: {choice: [".dds"]} };
// while loading atlas, choose resolution for atlas and choose format for image
var atlasOptions = { metadata: { choice: ["@2x.json"], imageMetadata: { choice: [".dds"]} } };

var stage = new PIXI.Container();

loader.add('building1', '_assets/compressed/building1.png', textureOptions1)
    .add('building2', '_assets/compressed/building2.png', textureOptions2)
    .add('atlas1', '_assets/compressed/buildings.json', atlasOptions )
    .load(function(loader, resources) {
        // You have to preload all compressed textures into videomemory, pixi renderer cant do that for you.
        // You also can specify different renderer or set in that function
        // and this thing doesnt work for canvas
        if (renderer.type == PIXI.RENDERER_TYPE.WEBGL)
            renderer.plugins.compressedTextureManager.updateAllTextures(resources, true);

        var spr1 = new PIXI.Sprite(resources.building1.texture);
        var spr2 = new PIXI.Sprite(resources.building2.texture);
        var spr3 = new PIXI.Sprite.fromImage('goldmine_10_5.png');
        var spr4 = new PIXI.Sprite.fromImage('wind_extractor_10.png');
        spr1.position.y = spr3.position.y = 150;
        spr2.position.y = spr4.position.y = 350;
        spr1.position.x = spr2.position.x = 250;
        spr3.position.x = spr4.position.x = 450;
        stage.addChild(spr1);
        stage.addChild(spr2);
        stage.addChild(spr3);
        stage.addChild(spr4);
    });

animate();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}
