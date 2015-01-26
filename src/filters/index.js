var PIXI = require('pixi.js'),
    common = require('../_shared/js');

// TODO (cengler):
// - Ascii filter flips on Y
// - Convolution filter looks weird
// - Displacement filter scrolls offscreen when increasing offset
// - Noise filter should move like TV noise
// - SmartBlur and Bloom are too strong...

// register each filter
var setup = {
    AsciiFilter: function (folder, gui) {
        var filter = new PIXI.filters.AsciiFilter();

        gui.remember(filter);
        folder.add(filter, 'size', 1, 25).step(1).name('Letter Size');

        return filter;
    },
    BloomFilter: function (folder, gui) {
        var filter = new PIXI.filters.BloomFilter();

        gui.remember(filter);
        folder.add(filter, 'blur', 0, 32).name('Blur Factor');

        return filter;
    },
    BlurFilter: function (folder, gui) {
        var filter = new PIXI.filters.BlurFilter();

        gui.remember(filter);
        folder.add(filter, 'blurX', 0, 32).name('Blur Factor X');
        folder.add(filter, 'blurY', 0, 32).name('Blur Factor Y');

        return filter;
    },
    /*
    TODO (cengler) - How to model the matrix in dat.gui?

    ColorMatrixFilter: function (folder, gui) {
        var filter = new PIXI.filters.ColorMatrixFilter();

        gui.remember(filter);
        folder.add(filter, 'step', 1, 100);

        return filter;
    },
    */
    ColorStepFilter: function (folder, gui) {
        var filter = new PIXI.filters.ColorStepFilter();

        gui.remember(filter);
        folder.add(filter, 'step', 1, 100).name('Color Step');

        return filter;
    },
    ConvolutionFilter: function () {
        return new PIXI.filters.ConvolutionFilter([
                1, 2, 1,
                2, 0, 2,
                1, 2, 1
            ], 256, 256);
    },
    CrossHatchFilter: function () {
        return new PIXI.filters.CrossHatchFilter();
    },
    DisplacementFilter: function (folder, gui) {
        var filter = new PIXI.filters.DisplacementFilter(PIXI.Texture.fromImage('img/displacement_map.jpg'));

        filter.scale.x = filter.scale.y = 75;

        gui.remember(filter.scale);
        folder.add(filter.scale, 'x', 1, 200).name('Scale Factor (x)');
        folder.add(filter.scale, 'y', 1, 200).name('Scale Factor (y)');

        return filter;
    },
    DotScreenFilter: function (folder, gui) {
        var filter = new PIXI.filters.DotScreenFilter();

        gui.remember(filter);
        folder.add(filter, 'angle', 0, PIXI.math.PI_2).name('Dot Angle');
        folder.add(filter, 'scale', 0, 1).name('Dot Scale');

        return filter;
    },
    GrayFilter: function (folder, gui) {
        var filter = new PIXI.filters.GrayFilter();

        gui.remember(filter);
        folder.add(filter, 'gray', 0, 1).name('Grayscale');

        return filter;
    },
    InvertFilter: function (folder, gui) {
        var filter = new PIXI.filters.InvertFilter();

        gui.remember(filter);
        folder.add(filter, 'invert', 0, 1).name('Invert Strength');

        return filter;
    },
    NoiseFilter: function (folder, gui) {
        var filter = new PIXI.filters.NoiseFilter();

        gui.remember(filter);
        folder.add(filter, 'noise', 0, 2).name('Amount of Noise');

        return filter;
    },
    /*
    TODO (cengler) - Need a normal map for the fishies, and setup lighting code for this one.

    NormalMapFilter: function (folder, gui) {
        var filter = new PIXI.filters.NormalMapFilter(PIXI.Texture.fromImage('...'));

        gui.remember(filter.scale);
        folder.add(filter.scale, 'x', 0, 64).name('Scale (x)');
        folder.add(filter.scale, 'y', 0, 64).name('Scale (y)');

        return filter;
    },
    */
    PixelateFilter: function (folder, gui) {
        var filter = new PIXI.filters.PixelateFilter();

        gui.remember(filter.size);
        folder.add(filter.size, 'x', 0, 32).name('Block Size (x)');
        folder.add(filter.size, 'y', 0, 32).name('Block Size (y)');

        return filter;
    },
    RGBSplitFilter: function () {
        return new PIXI.filters.RGBSplitFilter();
    },
    ShockwaveFilter: function (folder, gui) {
        var filter = new PIXI.filters.ShockwaveFilter();

        gui.remember(filter.center);
        folder.add(filter.center, 'x', 0, 1).name('Center Point (x)');
        folder.add(filter.center, 'y', 0, 1).name('Center Point (y)');

        gui.remember(filter.params);
        folder.add(filter.params, 'x', 0, 25).name('Strength (x)');
        folder.add(filter.params, 'y', 0, 10).name('Strength (y)');
        folder.add(filter.params, 'z', 0, 2).name('Strength (z)');

        return filter;
    },
    SepiaFilter: function (folder, gui) {
        var filter = new PIXI.filters.SepiaFilter();

        gui.remember(filter);
        folder.add(filter, 'sepia', 0, 1).name('Sepia Factor');

        return filter;
    },
    SmartBlurFilter: function () {
        return new PIXI.filters.SmartBlurFilter();
    },
    TiltShiftFilter: function (folder, gui) {
        var filter = new PIXI.filters.TiltShiftFilter();

        gui.remember(filter);
        folder.add(filter, 'blur', 0, 200).name('Blur Factor');
        folder.add(filter, 'gradientBlur', 0, 2000).name('Blur Gradient');

        // folder.add(filter.start, 'x', 0, 32).name('Start (x)');
        // folder.add(filter.start, 'y', 0, 32).name('Start (y)');

        // folder.add(filter.end, 'x', 0, 32).name('End (x)');
        // folder.add(filter.end, 'y', 0, 32).name('End (y)');

        return filter;
    },
    TwistFilter: function (folder, gui) {
        var filter = new PIXI.filters.TwistFilter();

        gui.remember(filter);
        folder.add(filter, 'angle', 0, 15).name('Angle');
        folder.add(filter, 'radius', 0, 1).name('Radius');

        gui.remember(filter.offset);
        folder.add(filter.offset, 'x', 0, 1).name('Position (x)');
        folder.add(filter.offset, 'y', 0, 1).name('Position (y)');

        return filter;
    }
};

// Setup and run the example app
common.setup(function (app) {
    var filterNames = Object.keys(PIXI.filters),
        filters = [],
        filterMap = {},
        switches = [];

    app.gui.remember(switches);

    // initialize all the filters!
    filterNames.forEach(function (filterName) {
        if (setup[filterName]) {
            switches.push(false);

            var folder = app.gui.addFolder(filterName);

            folder.add(switches, switches.length - 1).name('enable');

            var filter = setup[filterName](folder, app.gui);

            filters.push(filter);
            filterMap[filterName] = filter;
        }
    });

    // create the background
    var bg = PIXI.Sprite.fromImage('img/displacement_bg.jpg');
    app.root.addChild(bg);

    bg.texture.baseTexture.once('loaded', function () {
        app.onResize();
    });

    // create the fishies, use a container for each fish texture so they are batched
    var containers = [
            app.root.addChild(new PIXI.DisplayObjectContainer()),
            app.root.addChild(new PIXI.DisplayObjectContainer()),
            app.root.addChild(new PIXI.DisplayObjectContainer()),
            app.root.addChild(new PIXI.DisplayObjectContainer())
        ],
        textures = [
            PIXI.Texture.fromImage('img/displacement_fish1.png'),
            PIXI.Texture.fromImage('img/displacement_fish2.png'),
            PIXI.Texture.fromImage('img/displacement_fish3.png'),
            PIXI.Texture.fromImage('img/displacement_fish4.png')
        ],
        fishies = [],
        padding = 100;

    for (var i = 0; i < 28; i++) {
        var fishId = i % 4;

        var fish = new PIXI.Sprite(textures[fishId]);

        fish.anchor.x = fish.anchor.y = 0.5;

        containers[fishId].addChild(fish);

        fish.direction = Math.random() * PIXI.math.PI_2;
        fish.speed = 2 + Math.random() * 2;
        fish.turnSpeed = Math.random() - 0.8;

        fish.position.x = Math.random() * (app.renderer.width + padding);
        fish.position.y = Math.random() * (app.renderer.height + padding);

        fish.scale.set(0.8 + Math.random() * 0.3);

        fishies.push(fish);
    }

    // create the overlay
    var waveTexture = PIXI.Texture.fromImage('img/zeldaWaves.png');
    var overlay = new PIXI.extras.TilingSprite(waveTexture, app.renderer.width, app.renderer.height);

    overlay.alpha = 0.1;

    app.root.addChild(overlay);

    var count = 0.0;

    // setup the tick method.
    app.tick = function (dt) {
        var filtersToApply = filters.filter(checkFilter);

        app.root.filters = filtersToApply.length > 0 ? filtersToApply : null;

        for (var i = 0; i < fishies.length; ++i) {
            var fish = fishies[i];

            fish.direction += fish.turnSpeed * 0.01;
            fish.position.x += Math.sin(fish.direction) * fish.speed;
            fish.position.y += Math.cos(fish.direction) * fish.speed;

            fish.rotation = -fish.direction - Math.PI/2;

            // wrap..
            if (fish.position.x < -padding) {
                fish.position.x += app.renderer.width + (padding * 2);
            }

            if (fish.position.x > (app.renderer.width + padding)) {
                fish.position.x -= app.renderer.width + (padding * 2);
            }

            if (fish.position.y < -padding) {
                fish.position.y += app.renderer.height + (padding * 2);
            }

            if (fish.position.y > (app.renderer.height + padding)) {
                fish.position.y -= app.renderer.height + (padding * 2);
            }
        }

        count += 0.1;

        // filterMap.DisplacementFilter.offset.x = count * 10;
        // filterMap.DisplacementFilter.offset.y = count * 10;

        if (filterMap.ShockwaveFilter.time > 1) {
            filterMap.ShockwaveFilter.time = 0;
        } else {
            filterMap.ShockwaveFilter.time += dt;
        }

        overlay.tilePosition.x = count * -10;
        overlay.tilePosition.y = count * -10;
    };

    app.onResize = function () {
        bg.width = app.renderer.width;
        bg.height = app.renderer.height;
    };

    window.filterMap = filterMap;

    // kickoff the animation
    app.animate();

    function checkFilter(filter, i) {
        return switches[i];
    }
});
