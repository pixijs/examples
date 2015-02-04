var PIXI    = require('pixi.js'),
    domready = require('domready'),
    Stats   = require('stats-js'),
    lz      = require('lz-string'),
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
                renderer: PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, options),
                root: new PIXI.DisplayObjectContainer(),
                tick: null,
                animate: null,
                stats: new Stats(),
                gui: new DatGui({ load: decodeGuiFromHash() }),
                onResize: null,
                deltaTime: 0,
                lastTime: Date.now()
            };

            // style stats and add to document
            app.stats.domElement.style.position = 'absolute';
            app.stats.domElement.style.bottom = '0';
            app.stats.domElement.style.right = '0';

            document.body.appendChild(app.stats.domElement);

            // serialize gui when it changes
            app.gui.domElement.addEventListener('click', saveGuiToHash.bind(null, app.gui));
            app.gui.domElement.addEventListener('tap', saveGuiToHash.bind(null, app.gui));

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

        var now = Date.now();

        // start timer for next loop
        requestAnimationFrame(app.animate);

        if (app.tick) {
            app.tick(app.deltaTime / 1000);

            app.deltaTime = now - app.lastTime;
            app.lastTime = now;
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

        if (apps[i].onResize) {
            apps[i].onResize();
        }
    }
}


function decodeGuiFromHash() {
    if (location.hash) {
        return JSON.parse(lz.decompressFromBase64(location.hash.substr(1)));
    }
}

function encodeGuiToHash(gui) {
    return lz.compressToBase64(JSON.stringify(gui.getSaveObject()));
}

function saveGuiToHash(gui) {
    window.location.hash = '#' + encodeGuiToHash(gui);
}
