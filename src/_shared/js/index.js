var PIXI    = require('pixi.js'),
    domready = require('domready'),
    Stats   = require('stats-js'),
    DatGui  = require('dat-gui').GUI,
    apps    = [],
    options = {
        backgroundColor: 0xFFFFFF,
        view: null
    };

// expose apps so we can use it easily in console
window.apps = apps;

// when dom is ready select the view
domready(function () {
    options.view = document.getElementById('view');
});

var common = module.exports = {
    setup: function (cb) {
        domready(function () {
            // create app object
            var app = {
                renderer: new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, options),
                root: new PIXI.DisplayObjectContainer(),
                tick: null,
                animate: null,
                stats: new Stats(),
                gui: new DatGui()
            };

            // style stats and add to document
            app.stats.domElement.style.position = 'absolute';
            app.stats.domElement.style.bottom = '0';
            app.stats.domElement.style.right = '0';

            document.body.appendChild(app.stats.domElement);

            // bind animate for this app
            app.animate = common.animate.bind(this, app);

            // TODO - add datgui

            // track app for resizing
            apps.push(app);

            // ready to go!
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
