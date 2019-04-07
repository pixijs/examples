const app = new PIXI.Application({ resolution: window.devicePixelRatio || 1 });
document.body.appendChild(app.view);

// use empty array if you dont want to use detect feature
const extensions = PIXI.compressedTextures.detectExtensions(app.renderer);

const loader = new PIXI.loaders.Loader();
loader.pre(PIXI.compressedTextures.extensionChooser(extensions));
// use @2x texture if resolution is 2, use dds format if its windows
const textureOptions1 = { metadata: { choice: ['@2x.png', '.dds', '@2x.dds'] } };
// use dds format if its windows but dont care for retina
const textureOptions2 = { metadata: { choice: ['.dds'] } };
// while loading atlas, choose resolution for atlas and choose format for image
const atlasOptions = { metadata: { choice: ['@2x.json', '@1x.json'], imageMetadata: { choice: ['.dds'] } } };

loader.add('building1', 'examples/assets/pixi-compressed-textures/building1.png', textureOptions1)
    .add('building2', 'examples/assets/pixi-compressed-textures/building2.png', textureOptions2)
    .add('atlas1', 'examples/assets/pixi-compressed-textures/buildings.json', atlasOptions)
    .load((loaderInstance, resources) => {
        const spr1 = new PIXI.Sprite(resources.building1.texture);
        const spr2 = new PIXI.Sprite(resources.building2.texture);
        const spr3 = PIXI.Sprite.from('goldmine_10_5.png');
        const spr4 = PIXI.Sprite.from('wind_extractor_10.png');
        spr1.y = spr3.y = 150;
        spr2.y = spr4.y = 350;
        spr1.x = spr2.x = 250;
        spr3.x = spr4.x = 450;
        app.stage.addChild(spr1, spr2, spr3, spr4);
    });

// ATTENTION: PIXI recognizes resolution of atlas by suffix (@1x, @2x, ... )
// If you dont specify that, resolution of the atlas will be taken from "meta.scale"
// which in our example is 1 and 0.5 instead of 2 and 1. It will shrink everything!
