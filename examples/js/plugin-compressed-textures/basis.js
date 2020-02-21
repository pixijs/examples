
// please look in README file of pixi-compressed-textures plugin by the link
// https://github.com/pixijs/pixi-compressed-textures/blob/master/README.md

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50,
});

document.body.appendChild(app.view);

let loading;

init();

function init() {
    loading = new PIXI.Text('Loading!', { stroke: 0xff2200 });
    app.stage.addChild(loading);

    // HACK! disable streaming, server not support WASM streaming
    WebAssembly.instantiateStreaming = undefined;

    // wait before BASIS loads

    BASIS().then(basisLoaded);
}

function basisLoaded(Module) {
    const { BasisFile, initializeBasis } = Module;
    initializeBasis();

    app.renderer.texture.initCompressed();
    const supp = app.renderer.texture.compressedExtensions;

    // BasisFile may be is a proxied to worker, BASIS Loader is asynchonius
    PIXI.compressedTextures.BASISLoader.bindTranscoder(BasisFile, supp);

    app.loader.baseUrl = 'examples/assets/pixi-compressed-textures/basis/';
    app.loader
        .add('tree', 'tree.basis')
        .add('test', 't2k.basis')
        .load(show);
}

function show() {
    const t = app.loader.resources.tree.texture;
    const tree = new PIXI.Sprite(t);

    const tt = app.loader.resources.test.texture;
    const test = new PIXI.Sprite(tt);

    tree.scale.set(1);
    tree.anchor.set(0.5, 1);

    test.scale.set(0.125);
    test.anchor.set(0.5, 0);

    // Move the sprite to the center of the screen
    tree.x = test.x = app.renderer.width / 2;
    tree.y = test.y = app.renderer.height / 2;

    const onLoad = () => {
        loading.text = ` Tree(256):${t.baseTexture.resource.type
        }\nPoster(2048):${tt.baseTexture.resource.type}`;
    };

    // basis use async loading, we need capture when textures was updated
    t.baseTexture.on('update', onLoad);
    tt.baseTexture.on('update', onLoad);


    app.stage.addChild(tree, test);
}
