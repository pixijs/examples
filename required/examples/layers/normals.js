var WIDTH = 800, HEIGHT = 600;

// LAYERS plugin is here: https://github.com/pixijs/pixi-display/tree/layers
// LIGHTS plugin is here: https://github.com/pixijs/pixi-lights/tree/v4.x

var app = new PIXI.Application(WIDTH, HEIGHT);
document.body.appendChild(app.view);

var stage = app.stage = new PIXI.display.Stage();
var light = new PIXI.lights.PointLight(0xffffff, 1);

// put all layers for deferred rendering of normals
stage.addChild(new PIXI.display.Layer(PIXI.lights.diffuseGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.normalGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.lightGroup));

PIXI.loader.baseUrl = 'https://cdn.rawgit.com/pixijs/pixi-lights/b7fd7924fdf4e6a6b913ff29161402e7b36f0c0f/';

PIXI.loader
    .add('bg_diffuse', 'test/BGTextureTest.jpg')
    .add('bg_normal', 'test/BGTextureNORM.jpg')
    .add('block_diffuse', 'test/block.png')
    .add('block_normal', 'test/blockNormalMap.png')
    .load(onAssetsLoaded);

function createPair(diffuseTex, normalTex) {
    var container = new PIXI.Container();
    var diffuseSprite = new PIXI.Sprite(diffuseTex);
    diffuseSprite.parentGroup = PIXI.lights.diffuseGroup;
    var normalSprite = new PIXI.Sprite(normalTex);
    normalSprite.parentGroup = PIXI.lights.normalGroup;
    container.addChild(diffuseSprite);
    container.addChild(normalSprite);
    return container;
}

function onAssetsLoaded(loader, res) {
    var bg = createPair(res.bg_diffuse.texture, res.bg_normal.texture);
    var block = createPair(res.block_diffuse.texture, res.block_normal.texture);
    var block1 = createPair(res.block_diffuse.texture, res.block_normal.texture);
    var block2 = createPair(res.block_diffuse.texture, res.block_normal.texture);

    block.position.set(100, 100);
    block1.position.set(500, 100);
    block2.position.set(300, 400);

    light.position.set(525, 160);
    stage.addChild(bg);
    stage.addChild(block);
    stage.addChild(block1);
    stage.addChild(block2);

    stage.addChild(new PIXI.lights.AmbientLight(null, 0.4));
    stage.addChild(new PIXI.lights.DirectionalLight(null, 1, block1));
    stage.addChild(light);

    bg.interactive = true;
    bg.on('mousemove', function (event) {
        light.position.copy(event.data.global);
    });

    bg.on('pointerdown', function (event) {
        var clickLight = new PIXI.lights.PointLight(0xffffff);
        clickLight.position.copy(event.data.global);
        stage.addChild(clickLight);
    });
}
