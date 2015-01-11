var PIXI    = require('pixi.js'),
    domready = require('domready'),
    Stats   = require('stats-js'),
    apps    = [],
    options = {
        backgroundColor: 0xFFFFFF,
        view: null
    };

domready(function () {
    options.view = document.getElementById('view');
});

var common = module.exports = {
    setup: function (cb) {
        domready(function () {
            var app = {
                renderer: new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, options),
                root: new PIXI.DisplayObjectContainer(),
                tick: null,
                animate: null,
                stats: new Stats()
            };

            app.stats.domElement.style.position = 'absolute';
            app.stats.domElement.style.top = '0';
            app.stats.domElement.style.right = '0';

            document.body.appendChild(app.stats.domElement);

            app.animate = common.animate.bind(this, app);

            // TODO - Add stats, add datgui

            apps.push(app);

            window.app = app;

            cb(app);
        });
    },
    animate: function (app) {
        app.stats.begin();

        // start timer for next loop
        requestAnimationFrame(app.animate);

        if (app.tick) {
            app.tick();
        }

        app.renderer.render(app.root);

        app.stats.end();
    }
};

// handle window resize
window.addEventListener('resize', onResize, false);
window.addEventListener('orientationchange', onResize, false);

function onResize() {
    for (var i = 0; i < apps.length; ++i) {
        apps[i].renderer.resize(window.innerWidth, window.innerHeight);
    }
}
