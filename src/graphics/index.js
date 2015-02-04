var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    var g = new PIXI.Graphics();

    app.root.addChild(g);

    g.beginFill(0xFF00FF);

    g.drawRect(randX(), randY(), 32, 32);

    g.arc(randX(), randY(), 32, 0, Math.PI);

    app.animate();

    function randX() {
        return ~~(Math.random() * app.renderer.width);
    }

    function randY() {
        return ~~(Math.random() * app.renderer.height);
    }
});
