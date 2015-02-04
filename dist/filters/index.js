require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({2:[function(require,module,exports){
var PIXI = require('pixi.js'),
    common = require('../_shared/js');

// TODO (cengler):
// - Ascii filter flips on Y
// - Convolution filter looks weird
// - Displacement filter scrolls offscreen when increasing offset
// - Noise filter should move like TV noise
// - SmartBlur and Bloom are too strong...
//
// Bugs:
// - resizing seems broken for some filters
// - some filter combos produce broken output (dimensions broken?)

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

},{"../_shared/js":129,"pixi.js":111}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcZmFjdG9yLWJ1bmRsZVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxmaWx0ZXJzXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFBJWEkgPSByZXF1aXJlKCdwaXhpLmpzJyksXG4gICAgY29tbW9uID0gcmVxdWlyZSgnLi4vX3NoYXJlZC9qcycpO1xuXG4vLyBUT0RPIChjZW5nbGVyKTpcbi8vIC0gQXNjaWkgZmlsdGVyIGZsaXBzIG9uIFlcbi8vIC0gQ29udm9sdXRpb24gZmlsdGVyIGxvb2tzIHdlaXJkXG4vLyAtIERpc3BsYWNlbWVudCBmaWx0ZXIgc2Nyb2xscyBvZmZzY3JlZW4gd2hlbiBpbmNyZWFzaW5nIG9mZnNldFxuLy8gLSBOb2lzZSBmaWx0ZXIgc2hvdWxkIG1vdmUgbGlrZSBUViBub2lzZVxuLy8gLSBTbWFydEJsdXIgYW5kIEJsb29tIGFyZSB0b28gc3Ryb25nLi4uXG4vL1xuLy8gQnVnczpcbi8vIC0gcmVzaXppbmcgc2VlbXMgYnJva2VuIGZvciBzb21lIGZpbHRlcnNcbi8vIC0gc29tZSBmaWx0ZXIgY29tYm9zIHByb2R1Y2UgYnJva2VuIG91dHB1dCAoZGltZW5zaW9ucyBicm9rZW4/KVxuXG4vLyByZWdpc3RlciBlYWNoIGZpbHRlclxudmFyIHNldHVwID0ge1xuICAgIEFzY2lpRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyLCBndWkpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuQXNjaWlGaWx0ZXIoKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzaXplJywgMSwgMjUpLnN0ZXAoMSkubmFtZSgnTGV0dGVyIFNpemUnKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgQmxvb21GaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5CbG9vbUZpbHRlcigpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2JsdXInLCAwLCAzMikubmFtZSgnQmx1ciBGYWN0b3InKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgQmx1ckZpbHRlcjogZnVuY3Rpb24gKGZvbGRlciwgZ3VpKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkJsdXJGaWx0ZXIoKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdibHVyWCcsIDAsIDMyKS5uYW1lKCdCbHVyIEZhY3RvciBYJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnYmx1clknLCAwLCAzMikubmFtZSgnQmx1ciBGYWN0b3IgWScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICAvKlxuICAgIFRPRE8gKGNlbmdsZXIpIC0gSG93IHRvIG1vZGVsIHRoZSBtYXRyaXggaW4gZGF0Lmd1aT9cblxuICAgIENvbG9yTWF0cml4RmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyLCBndWkpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuQ29sb3JNYXRyaXhGaWx0ZXIoKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzdGVwJywgMSwgMTAwKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgKi9cbiAgICBDb2xvclN0ZXBGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Db2xvclN0ZXBGaWx0ZXIoKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzdGVwJywgMSwgMTAwKS5uYW1lKCdDb2xvciBTdGVwJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIENvbnZvbHV0aW9uRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUElYSS5maWx0ZXJzLkNvbnZvbHV0aW9uRmlsdGVyKFtcbiAgICAgICAgICAgICAgICAxLCAyLCAxLFxuICAgICAgICAgICAgICAgIDIsIDAsIDIsXG4gICAgICAgICAgICAgICAgMSwgMiwgMVxuICAgICAgICAgICAgXSwgMjU2LCAyNTYpO1xuICAgIH0sXG4gICAgQ3Jvc3NIYXRjaEZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFBJWEkuZmlsdGVycy5Dcm9zc0hhdGNoRmlsdGVyKCk7XG4gICAgfSxcbiAgICBEaXNwbGFjZW1lbnRGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5EaXNwbGFjZW1lbnRGaWx0ZXIoUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnaW1nL2Rpc3BsYWNlbWVudF9tYXAuanBnJykpO1xuXG4gICAgICAgIGZpbHRlci5zY2FsZS54ID0gZmlsdGVyLnNjYWxlLnkgPSA3NTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyLnNjYWxlKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2NhbGUsICd4JywgMSwgMjAwKS5uYW1lKCdTY2FsZSBGYWN0b3IgKHgpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnNjYWxlLCAneScsIDEsIDIwMCkubmFtZSgnU2NhbGUgRmFjdG9yICh5KScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBEb3RTY3JlZW5GaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Eb3RTY3JlZW5GaWx0ZXIoKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdhbmdsZScsIDAsIFBJWEkubWF0aC5QSV8yKS5uYW1lKCdEb3QgQW5nbGUnKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzY2FsZScsIDAsIDEpLm5hbWUoJ0RvdCBTY2FsZScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBHcmF5RmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyLCBndWkpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuR3JheUZpbHRlcigpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2dyYXknLCAwLCAxKS5uYW1lKCdHcmF5c2NhbGUnKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgSW52ZXJ0RmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyLCBndWkpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuSW52ZXJ0RmlsdGVyKCk7XG5cbiAgICAgICAgZ3VpLnJlbWVtYmVyKGZpbHRlcik7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnaW52ZXJ0JywgMCwgMSkubmFtZSgnSW52ZXJ0IFN0cmVuZ3RoJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIE5vaXNlRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyLCBndWkpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuTm9pc2VGaWx0ZXIoKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdub2lzZScsIDAsIDIpLm5hbWUoJ0Ftb3VudCBvZiBOb2lzZScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICAvKlxuICAgIFRPRE8gKGNlbmdsZXIpIC0gTmVlZCBhIG5vcm1hbCBtYXAgZm9yIHRoZSBmaXNoaWVzLCBhbmQgc2V0dXAgbGlnaHRpbmcgY29kZSBmb3IgdGhpcyBvbmUuXG5cbiAgICBOb3JtYWxNYXBGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Ob3JtYWxNYXBGaWx0ZXIoUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnLi4uJykpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIuc2NhbGUpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5zY2FsZSwgJ3gnLCAwLCA2NCkubmFtZSgnU2NhbGUgKHgpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnNjYWxlLCAneScsIDAsIDY0KS5uYW1lKCdTY2FsZSAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgKi9cbiAgICBQaXhlbGF0ZUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlciwgZ3VpKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLlBpeGVsYXRlRmlsdGVyKCk7XG5cbiAgICAgICAgZ3VpLnJlbWVtYmVyKGZpbHRlci5zaXplKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2l6ZSwgJ3gnLCAwLCAzMikubmFtZSgnQmxvY2sgU2l6ZSAoeCknKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2l6ZSwgJ3knLCAwLCAzMikubmFtZSgnQmxvY2sgU2l6ZSAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgUkdCU3BsaXRGaWx0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQSVhJLmZpbHRlcnMuUkdCU3BsaXRGaWx0ZXIoKTtcbiAgICB9LFxuICAgIFNob2Nrd2F2ZUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlciwgZ3VpKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLlNob2Nrd2F2ZUZpbHRlcigpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIuY2VudGVyKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuY2VudGVyLCAneCcsIDAsIDEpLm5hbWUoJ0NlbnRlciBQb2ludCAoeCknKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuY2VudGVyLCAneScsIDAsIDEpLm5hbWUoJ0NlbnRlciBQb2ludCAoeSknKTtcblxuICAgICAgICBndWkucmVtZW1iZXIoZmlsdGVyLnBhcmFtcyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnBhcmFtcywgJ3gnLCAwLCAyNSkubmFtZSgnU3RyZW5ndGggKHgpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnBhcmFtcywgJ3knLCAwLCAxMCkubmFtZSgnU3RyZW5ndGggKHkpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnBhcmFtcywgJ3onLCAwLCAyKS5uYW1lKCdTdHJlbmd0aCAoeiknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgU2VwaWFGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5TZXBpYUZpbHRlcigpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ3NlcGlhJywgMCwgMSkubmFtZSgnU2VwaWEgRmFjdG9yJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIFNtYXJ0Qmx1ckZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFBJWEkuZmlsdGVycy5TbWFydEJsdXJGaWx0ZXIoKTtcbiAgICB9LFxuICAgIFRpbHRTaGlmdEZpbHRlcjogZnVuY3Rpb24gKGZvbGRlciwgZ3VpKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLlRpbHRTaGlmdEZpbHRlcigpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2JsdXInLCAwLCAyMDApLm5hbWUoJ0JsdXIgRmFjdG9yJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnZ3JhZGllbnRCbHVyJywgMCwgMjAwMCkubmFtZSgnQmx1ciBHcmFkaWVudCcpO1xuXG4gICAgICAgIC8vIGZvbGRlci5hZGQoZmlsdGVyLnN0YXJ0LCAneCcsIDAsIDMyKS5uYW1lKCdTdGFydCAoeCknKTtcbiAgICAgICAgLy8gZm9sZGVyLmFkZChmaWx0ZXIuc3RhcnQsICd5JywgMCwgMzIpLm5hbWUoJ1N0YXJ0ICh5KScpO1xuXG4gICAgICAgIC8vIGZvbGRlci5hZGQoZmlsdGVyLmVuZCwgJ3gnLCAwLCAzMikubmFtZSgnRW5kICh4KScpO1xuICAgICAgICAvLyBmb2xkZXIuYWRkKGZpbHRlci5lbmQsICd5JywgMCwgMzIpLm5hbWUoJ0VuZCAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgVHdpc3RGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIsIGd1aSkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Ud2lzdEZpbHRlcigpO1xuXG4gICAgICAgIGd1aS5yZW1lbWJlcihmaWx0ZXIpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2FuZ2xlJywgMCwgMTUpLm5hbWUoJ0FuZ2xlJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAncmFkaXVzJywgMCwgMSkubmFtZSgnUmFkaXVzJyk7XG5cbiAgICAgICAgZ3VpLnJlbWVtYmVyKGZpbHRlci5vZmZzZXQpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5vZmZzZXQsICd4JywgMCwgMSkubmFtZSgnUG9zaXRpb24gKHgpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLm9mZnNldCwgJ3knLCAwLCAxKS5uYW1lKCdQb3NpdGlvbiAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH1cbn07XG5cbi8vIFNldHVwIGFuZCBydW4gdGhlIGV4YW1wbGUgYXBwXG5jb21tb24uc2V0dXAoZnVuY3Rpb24gKGFwcCkge1xuICAgIHZhciBmaWx0ZXJOYW1lcyA9IE9iamVjdC5rZXlzKFBJWEkuZmlsdGVycyksXG4gICAgICAgIGZpbHRlcnMgPSBbXSxcbiAgICAgICAgZmlsdGVyTWFwID0ge30sXG4gICAgICAgIHN3aXRjaGVzID0gW107XG5cbiAgICBhcHAuZ3VpLnJlbWVtYmVyKHN3aXRjaGVzKTtcblxuICAgIC8vIGluaXRpYWxpemUgYWxsIHRoZSBmaWx0ZXJzIVxuICAgIGZpbHRlck5hbWVzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlck5hbWUpIHtcbiAgICAgICAgaWYgKHNldHVwW2ZpbHRlck5hbWVdKSB7XG4gICAgICAgICAgICBzd2l0Y2hlcy5wdXNoKGZhbHNlKTtcblxuICAgICAgICAgICAgdmFyIGZvbGRlciA9IGFwcC5ndWkuYWRkRm9sZGVyKGZpbHRlck5hbWUpO1xuXG4gICAgICAgICAgICBmb2xkZXIuYWRkKHN3aXRjaGVzLCBzd2l0Y2hlcy5sZW5ndGggLSAxKS5uYW1lKCdlbmFibGUnKTtcblxuICAgICAgICAgICAgdmFyIGZpbHRlciA9IHNldHVwW2ZpbHRlck5hbWVdKGZvbGRlciwgYXBwLmd1aSk7XG5cbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChmaWx0ZXIpO1xuICAgICAgICAgICAgZmlsdGVyTWFwW2ZpbHRlck5hbWVdID0gZmlsdGVyO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGJhY2tncm91bmRcbiAgICB2YXIgYmcgPSBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UoJ2ltZy9kaXNwbGFjZW1lbnRfYmcuanBnJyk7XG4gICAgYXBwLnJvb3QuYWRkQ2hpbGQoYmcpO1xuXG4gICAgYmcudGV4dHVyZS5iYXNlVGV4dHVyZS5vbmNlKCdsb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFwcC5vblJlc2l6ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBmaXNoaWVzLCB1c2UgYSBjb250YWluZXIgZm9yIGVhY2ggZmlzaCB0ZXh0dXJlIHNvIHRoZXkgYXJlIGJhdGNoZWRcbiAgICB2YXIgY29udGFpbmVycyA9IFtcbiAgICAgICAgICAgIGFwcC5yb290LmFkZENoaWxkKG5ldyBQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIoKSksXG4gICAgICAgICAgICBhcHAucm9vdC5hZGRDaGlsZChuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKCkpLFxuICAgICAgICAgICAgYXBwLnJvb3QuYWRkQ2hpbGQobmV3IFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lcigpKSxcbiAgICAgICAgICAgIGFwcC5yb290LmFkZENoaWxkKG5ldyBQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIoKSlcbiAgICAgICAgXSxcbiAgICAgICAgdGV4dHVyZXMgPSBbXG4gICAgICAgICAgICBQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X2Zpc2gxLnBuZycpLFxuICAgICAgICAgICAgUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnaW1nL2Rpc3BsYWNlbWVudF9maXNoMi5wbmcnKSxcbiAgICAgICAgICAgIFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoJ2ltZy9kaXNwbGFjZW1lbnRfZmlzaDMucG5nJyksXG4gICAgICAgICAgICBQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X2Zpc2g0LnBuZycpXG4gICAgICAgIF0sXG4gICAgICAgIGZpc2hpZXMgPSBbXSxcbiAgICAgICAgcGFkZGluZyA9IDEwMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjg7IGkrKykge1xuICAgICAgICB2YXIgZmlzaElkID0gaSAlIDQ7XG5cbiAgICAgICAgdmFyIGZpc2ggPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZXNbZmlzaElkXSk7XG5cbiAgICAgICAgZmlzaC5hbmNob3IueCA9IGZpc2guYW5jaG9yLnkgPSAwLjU7XG5cbiAgICAgICAgY29udGFpbmVyc1tmaXNoSWRdLmFkZENoaWxkKGZpc2gpO1xuXG4gICAgICAgIGZpc2guZGlyZWN0aW9uID0gTWF0aC5yYW5kb20oKSAqIFBJWEkubWF0aC5QSV8yO1xuICAgICAgICBmaXNoLnNwZWVkID0gMiArIE1hdGgucmFuZG9tKCkgKiAyO1xuICAgICAgICBmaXNoLnR1cm5TcGVlZCA9IE1hdGgucmFuZG9tKCkgLSAwLjg7XG5cbiAgICAgICAgZmlzaC5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSAqIChhcHAucmVuZGVyZXIud2lkdGggKyBwYWRkaW5nKTtcbiAgICAgICAgZmlzaC5wb3NpdGlvbi55ID0gTWF0aC5yYW5kb20oKSAqIChhcHAucmVuZGVyZXIuaGVpZ2h0ICsgcGFkZGluZyk7XG5cbiAgICAgICAgZmlzaC5zY2FsZS5zZXQoMC44ICsgTWF0aC5yYW5kb20oKSAqIDAuMyk7XG5cbiAgICAgICAgZmlzaGllcy5wdXNoKGZpc2gpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSB0aGUgb3ZlcmxheVxuICAgIHZhciB3YXZlVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoJ2ltZy96ZWxkYVdhdmVzLnBuZycpO1xuICAgIHZhciBvdmVybGF5ID0gbmV3IFBJWEkuZXh0cmFzLlRpbGluZ1Nwcml0ZSh3YXZlVGV4dHVyZSwgYXBwLnJlbmRlcmVyLndpZHRoLCBhcHAucmVuZGVyZXIuaGVpZ2h0KTtcblxuICAgIG92ZXJsYXkuYWxwaGEgPSAwLjE7XG5cbiAgICBhcHAucm9vdC5hZGRDaGlsZChvdmVybGF5KTtcblxuICAgIHZhciBjb3VudCA9IDAuMDtcblxuICAgIC8vIHNldHVwIHRoZSB0aWNrIG1ldGhvZC5cbiAgICBhcHAudGljayA9IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICB2YXIgZmlsdGVyc1RvQXBwbHkgPSBmaWx0ZXJzLmZpbHRlcihjaGVja0ZpbHRlcik7XG5cbiAgICAgICAgYXBwLnJvb3QuZmlsdGVycyA9IGZpbHRlcnNUb0FwcGx5Lmxlbmd0aCA+IDAgPyBmaWx0ZXJzVG9BcHBseSA6IG51bGw7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaXNoaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZmlzaCA9IGZpc2hpZXNbaV07XG5cbiAgICAgICAgICAgIGZpc2guZGlyZWN0aW9uICs9IGZpc2gudHVyblNwZWVkICogMC4wMTtcbiAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueCArPSBNYXRoLnNpbihmaXNoLmRpcmVjdGlvbikgKiBmaXNoLnNwZWVkO1xuICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi55ICs9IE1hdGguY29zKGZpc2guZGlyZWN0aW9uKSAqIGZpc2guc3BlZWQ7XG5cbiAgICAgICAgICAgIGZpc2gucm90YXRpb24gPSAtZmlzaC5kaXJlY3Rpb24gLSBNYXRoLlBJLzI7XG5cbiAgICAgICAgICAgIC8vIHdyYXAuLlxuICAgICAgICAgICAgaWYgKGZpc2gucG9zaXRpb24ueCA8IC1wYWRkaW5nKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi54ICs9IGFwcC5yZW5kZXJlci53aWR0aCArIChwYWRkaW5nICogMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaXNoLnBvc2l0aW9uLnggPiAoYXBwLnJlbmRlcmVyLndpZHRoICsgcGFkZGluZykpIHtcbiAgICAgICAgICAgICAgICBmaXNoLnBvc2l0aW9uLnggLT0gYXBwLnJlbmRlcmVyLndpZHRoICsgKHBhZGRpbmcgKiAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpc2gucG9zaXRpb24ueSA8IC1wYWRkaW5nKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi55ICs9IGFwcC5yZW5kZXJlci5oZWlnaHQgKyAocGFkZGluZyAqIDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlzaC5wb3NpdGlvbi55ID4gKGFwcC5yZW5kZXJlci5oZWlnaHQgKyBwYWRkaW5nKSkge1xuICAgICAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueSAtPSBhcHAucmVuZGVyZXIuaGVpZ2h0ICsgKHBhZGRpbmcgKiAyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvdW50ICs9IDAuMTtcblxuICAgICAgICAvLyBmaWx0ZXJNYXAuRGlzcGxhY2VtZW50RmlsdGVyLm9mZnNldC54ID0gY291bnQgKiAxMDtcbiAgICAgICAgLy8gZmlsdGVyTWFwLkRpc3BsYWNlbWVudEZpbHRlci5vZmZzZXQueSA9IGNvdW50ICogMTA7XG5cbiAgICAgICAgaWYgKGZpbHRlck1hcC5TaG9ja3dhdmVGaWx0ZXIudGltZSA+IDEpIHtcbiAgICAgICAgICAgIGZpbHRlck1hcC5TaG9ja3dhdmVGaWx0ZXIudGltZSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWx0ZXJNYXAuU2hvY2t3YXZlRmlsdGVyLnRpbWUgKz0gZHQ7XG4gICAgICAgIH1cblxuICAgICAgICBvdmVybGF5LnRpbGVQb3NpdGlvbi54ID0gY291bnQgKiAtMTA7XG4gICAgICAgIG92ZXJsYXkudGlsZVBvc2l0aW9uLnkgPSBjb3VudCAqIC0xMDtcbiAgICB9O1xuXG4gICAgYXBwLm9uUmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBiZy53aWR0aCA9IGFwcC5yZW5kZXJlci53aWR0aDtcbiAgICAgICAgYmcuaGVpZ2h0ID0gYXBwLnJlbmRlcmVyLmhlaWdodDtcbiAgICB9O1xuXG4gICAgd2luZG93LmZpbHRlck1hcCA9IGZpbHRlck1hcDtcblxuICAgIC8vIGtpY2tvZmYgdGhlIGFuaW1hdGlvblxuICAgIGFwcC5hbmltYXRlKCk7XG5cbiAgICBmdW5jdGlvbiBjaGVja0ZpbHRlcihmaWx0ZXIsIGkpIHtcbiAgICAgICAgcmV0dXJuIHN3aXRjaGVzW2ldO1xuICAgIH1cbn0pO1xuIl19
