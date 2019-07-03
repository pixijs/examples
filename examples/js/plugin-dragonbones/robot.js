const app = new PIXI.Application({ antialias: true });
document.body.appendChild(app.view);

app.stop();

// load spine data
PIXI.Loader.shared
    .add('skeleton', 'examples/assets/pixi-dragonbones/robot/mecha_1002_101d_show_ske.json')
    .add('texture_json', 'examples/assets/pixi-dragonbones/robot/mecha_1002_101d_show_tex.json')
    .add('texture_png', 'examples/assets/pixi-dragonbones/robot/mecha_1002_101d_show_tex.png')
    .load(onAssetsLoaded);

function onAssetsLoaded(loader, res) {
    const factory = dragonBones.PixiFactory.factory;

    factory.parseDragonBonesData(res.skeleton.data);
    factory.parseTextureAtlasData(res.texture_json.data, res.texture_png.texture);

    const armatureDisplay = factory.buildArmatureDisplay('mecha_1002_101d', 'mecha_1002_101d_show');
    armatureDisplay.animation.play('idle');
    armatureDisplay.x = 400.0;
    armatureDisplay.y = 500.0;

    app.stage.addChild(armatureDisplay);

    app.start();
}
