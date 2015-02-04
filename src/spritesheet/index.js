var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    PIXI.loaders.loader
        .add('sheet', 'img/sheet.json')
        .load(function (res) {
            var sword = new PIXI.Sprite(res.sheet.textures['sword.png']);
            var banner = new PIXI.Sprite(res.sheet.textures['lore_img1.png']);

            sword.position.set(128);
            banner.position.set(128, 64);

            app.root.addChild(sword);
            app.root.addChild(banner);
        });

    app.animate();
});
