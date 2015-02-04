var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    PIXI.loaders.loader
        .add('img/sheet.json')
        .load(function (resources) {
            var sprite = new PIXI.Sprite(resources[0].textures['sword.png']);
            var graphics = new PIXI.Graphics();

            sprite.position.set(128);

            graphics.lineStyle(1, 0xff00ff, 1);
            graphics.drawRect(0, 0, sprite.width, sprite.height);

            sprite.addChild(graphics);

            app.root.addChild(sprite);
        });

    app.animate();
});
