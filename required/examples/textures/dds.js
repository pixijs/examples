var app = new PIXI.Application(800, 600, { resolution: window.devicePixelRatio || 1 });
app.view.style.width = "800px";
app.view.style.height = "600px";
document.body.appendChild(app.view);

// use empty array if you dont want to use detect feature
var extensions = PIXI.compressedTextures.detectExtensions(app.renderer);

var loader = new PIXI.loaders.Loader();
loader.pre(PIXI.compressedTextures.extensionChooser(extensions));
// use @2x texture if resolution is 2, use dds format if its windows
var textureOptions1 = { metadata: {choice: ["@2x.png", ".dds", "@2x.dds"]} };
// use dds format if its windows but dont care for retina
var textureOptions2 = { metadata: {choice: [".dds"]} };
// while loading atlas, choose resolution for atlas and choose format for image
var atlasOptions = { metadata: { choice: ["@2x.json"], imageMetadata: { choice: [".dds"]} } };

loader.add('building1', 'required/assets/compressed/building1.png', textureOptions1)
    .add('building2', 'required/assets/compressed/building2.png', textureOptions2)
    .add('atlas1', 'required/assets/compressed/buildings.json', atlasOptions )
    .load(function(loader, resources) {
        var spr1 = new PIXI.Sprite(resources.building1.texture);
        var spr2 = new PIXI.Sprite(resources.building2.texture);
        var spr3 = new PIXI.Sprite.fromImage('goldmine_10_5.png');
        var spr4 = new PIXI.Sprite.fromImage('wind_extractor_10.png');
        spr1.position.y = spr3.position.y = 150;
        spr2.position.y = spr4.position.y = 350;
        spr1.position.x = spr2.position.x = 250;
        spr3.position.x = spr4.position.x = 450;
        app.stage.addChild(spr1);
        app.stage.addChild(spr2);
        app.stage.addChild(spr3);
        app.stage.addChild(spr4);
    });
