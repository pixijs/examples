require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({2:[function(require,module,exports){
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
    AsciiFilter: function (folder) {
        var filter = new PIXI.filters.AsciiFilter();

        folder.add(filter, 'size', 1, 25).step(1).name('Letter Size');

        return filter;
    },
    BloomFilter: function (folder) {
        var filter = new PIXI.filters.BloomFilter();

        folder.add(filter, 'blur', 0, 32).name('Blur Factor');

        return filter;
    },
    BlurFilter: function (folder) {
        var filter = new PIXI.filters.BlurFilter();

        folder.add(filter, 'blurX', 0, 32).name('Blur Factor X');
        folder.add(filter, 'blurY', 0, 32).name('Blur Factor Y');

        return filter;
    },
    /*
    TODO (cengler) - How to model the matrix in dat.gui?

    ColorMatrixFilter: function (folder) {
        var filter = new PIXI.filters.ColorMatrixFilter();

        folder.add(filter, 'step', 1, 100);

        return filter;
    },
    */
    ColorStepFilter: function (folder) {
        var filter = new PIXI.filters.ColorStepFilter();

        folder.add(filter, 'step', 1, 100).name('Color Step');

        return filter;
    },
    ConvolutionFilter: function () {
        var kernel = [
                1, 2, 1,
                2, 0, 2,
                1, 2, 1
            ],
            filter = new PIXI.filters.ConvolutionFilter(kernel, 256, 256);

        return filter;
    },
    CrossHatchFilter: function () {
        var filter = new PIXI.filters.CrossHatchFilter();

        return filter;
    },
    DisplacementFilter: function (folder) {
        var filter = new PIXI.filters.DisplacementFilter(PIXI.Texture.fromImage('img/displacement_map.jpg'));

        filter.scale.x = filter.scale.y = 75;

        folder.add(filter.scale, 'x', 1, 200).name('Scale Factor (x)');
        folder.add(filter.scale, 'y', 1, 200).name('Scale Factor (y)');

        return filter;
    },
    DotScreenFilter: function (folder) {
        var filter = new PIXI.filters.DotScreenFilter();

        folder.add(filter, 'angle', 0, PIXI.math.PI_2).name('Dot Angle');
        folder.add(filter, 'scale', 0, 1).name('Dot Scale');

        return filter;
    },
    GrayFilter: function (folder) {
        var filter = new PIXI.filters.GrayFilter();

        folder.add(filter, 'gray', 0, 1).name('Grayscale');

        return filter;
    },
    InvertFilter: function (folder) {
        var filter = new PIXI.filters.InvertFilter();

        folder.add(filter, 'invert', 0, 1).name('Invert Strength');

        return filter;
    },
    NoiseFilter: function (folder) {
        var filter = new PIXI.filters.NoiseFilter();

        folder.add(filter, 'noise', 0, 2).name('Amount of Noise');

        return filter;
    },
    /*
    TODO (cengler) - Need a normal map for the fishies, and setup lighting code for this one.

    NormalMapFilter: function (folder) {
        var filter = new PIXI.filters.NormalMapFilter(PIXI.Texture.fromImage('...'));

        folder.add(filter.scale, 'x', 0, 64).name('Scale (x)');
        folder.add(filter.scale, 'y', 0, 64).name('Scale (y)');

        return filter;
    },
    */
    PixelateFilter: function (folder) {
        var filter = new PIXI.filters.PixelateFilter();

        folder.add(filter.size, 'x', 0, 32).name('Block Size (x)');
        folder.add(filter.size, 'y', 0, 32).name('Block Size (y)');

        return filter;
    },
    RGBSplitFilter: function () {
        return new PIXI.filters.RGBSplitFilter();
    },
    ShockwaveFilter: function (folder) {
        var filter = new PIXI.filters.ShockwaveFilter();

        folder.add(filter.center, 'x', 0, 1).name('Center Point (x)');
        folder.add(filter.center, 'y', 0, 1).name('Center Point (y)');

        folder.add(filter.params, 'x', 0, 25).name('Strength (x)');
        folder.add(filter.params, 'y', 0, 10).name('Strength (y)');
        folder.add(filter.params, 'z', 0, 2).name('Strength (z)');

        return filter;
    },
    SepiaFilter: function (folder) {
        var filter = new PIXI.filters.SepiaFilter();

        folder.add(filter, 'sepia', 0, 1).name('Sepia Factor');

        return filter;
    },
    SmartBlurFilter: function () {
        return new PIXI.filters.SmartBlurFilter();
    },
    TiltShiftFilter: function (folder) {
        var filter = new PIXI.filters.TiltShiftFilter();

        folder.add(filter, 'blur', 0, 200).name('Blur Factor');
        folder.add(filter, 'gradientBlur', 0, 2000).name('Blur Gradient');

        // folder.add(filter.start, 'x', 0, 32).name('Start (x)');
        // folder.add(filter.start, 'y', 0, 32).name('Start (y)');

        // folder.add(filter.end, 'x', 0, 32).name('End (x)');
        // folder.add(filter.end, 'y', 0, 32).name('End (y)');

        return filter;
    },
    TwistFilter: function (folder) {
        var filter = new PIXI.filters.TwistFilter();

        folder.add(filter, 'angle', 0, 15).name('Angle');
        folder.add(filter, 'radius', 0, 1).name('Radius');

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

    // initialize all the filters!
    filterNames.forEach(function (filterName) {
        if (setup[filterName]) {
            switches.push(false);

            var folder = app.gui.addFolder(filterName);

            folder.add(switches, switches.length - 1).name('enable');

            var filter = setup[filterName](folder);

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

},{"../_shared/js":102,"pixi.js":94}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcZmFjdG9yLWJ1bmRsZVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxmaWx0ZXJzXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpLFxuICAgIGNvbW1vbiA9IHJlcXVpcmUoJy4uL19zaGFyZWQvanMnKTtcblxuLy8gVE9ETyAoY2VuZ2xlcik6XG4vLyAtIEFzY2lpIGZpbHRlciBmbGlwcyBvbiBZXG4vLyAtIENvbnZvbHV0aW9uIGZpbHRlciBsb29rcyB3ZWlyZFxuLy8gLSBEaXNwbGFjZW1lbnQgZmlsdGVyIHNjcm9sbHMgb2Zmc2NyZWVuIHdoZW4gaW5jcmVhc2luZyBvZmZzZXRcbi8vIC0gTm9pc2UgZmlsdGVyIHNob3VsZCBtb3ZlIGxpa2UgVFYgbm9pc2Vcbi8vIC0gU21hcnRCbHVyIGFuZCBCbG9vbSBhcmUgdG9vIHN0cm9uZy4uLlxuXG4vLyByZWdpc3RlciBlYWNoIGZpbHRlclxudmFyIHNldHVwID0ge1xuICAgIEFzY2lpRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkFzY2lpRmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzaXplJywgMSwgMjUpLnN0ZXAoMSkubmFtZSgnTGV0dGVyIFNpemUnKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgQmxvb21GaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuQmxvb21GaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2JsdXInLCAwLCAzMikubmFtZSgnQmx1ciBGYWN0b3InKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgQmx1ckZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5CbHVyRmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdibHVyWCcsIDAsIDMyKS5uYW1lKCdCbHVyIEZhY3RvciBYJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnYmx1clknLCAwLCAzMikubmFtZSgnQmx1ciBGYWN0b3IgWScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICAvKlxuICAgIFRPRE8gKGNlbmdsZXIpIC0gSG93IHRvIG1vZGVsIHRoZSBtYXRyaXggaW4gZGF0Lmd1aT9cblxuICAgIENvbG9yTWF0cml4RmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkNvbG9yTWF0cml4RmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzdGVwJywgMSwgMTAwKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgKi9cbiAgICBDb2xvclN0ZXBGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuQ29sb3JTdGVwRmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdzdGVwJywgMSwgMTAwKS5uYW1lKCdDb2xvciBTdGVwJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIENvbnZvbHV0aW9uRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBrZXJuZWwgPSBbXG4gICAgICAgICAgICAgICAgMSwgMiwgMSxcbiAgICAgICAgICAgICAgICAyLCAwLCAyLFxuICAgICAgICAgICAgICAgIDEsIDIsIDFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkNvbnZvbHV0aW9uRmlsdGVyKGtlcm5lbCwgMjU2LCAyNTYpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBDcm9zc0hhdGNoRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkNyb3NzSGF0Y2hGaWx0ZXIoKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgRGlzcGxhY2VtZW50RmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkRpc3BsYWNlbWVudEZpbHRlcihQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X21hcC5qcGcnKSk7XG5cbiAgICAgICAgZmlsdGVyLnNjYWxlLnggPSBmaWx0ZXIuc2NhbGUueSA9IDc1O1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnNjYWxlLCAneCcsIDEsIDIwMCkubmFtZSgnU2NhbGUgRmFjdG9yICh4KScpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5zY2FsZSwgJ3knLCAxLCAyMDApLm5hbWUoJ1NjYWxlIEZhY3RvciAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgRG90U2NyZWVuRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkRvdFNjcmVlbkZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnYW5nbGUnLCAwLCBQSVhJLm1hdGguUElfMikubmFtZSgnRG90IEFuZ2xlJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnc2NhbGUnLCAwLCAxKS5uYW1lKCdEb3QgU2NhbGUnKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgR3JheUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5HcmF5RmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdncmF5JywgMCwgMSkubmFtZSgnR3JheXNjYWxlJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIEludmVydEZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5JbnZlcnRGaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2ludmVydCcsIDAsIDEpLm5hbWUoJ0ludmVydCBTdHJlbmd0aCcpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBOb2lzZUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Ob2lzZUZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnbm9pc2UnLCAwLCAyKS5uYW1lKCdBbW91bnQgb2YgTm9pc2UnKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgLypcbiAgICBUT0RPIChjZW5nbGVyKSAtIE5lZWQgYSBub3JtYWwgbWFwIGZvciB0aGUgZmlzaGllcywgYW5kIHNldHVwIGxpZ2h0aW5nIGNvZGUgZm9yIHRoaXMgb25lLlxuXG4gICAgTm9ybWFsTWFwRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLk5vcm1hbE1hcEZpbHRlcihQSVhJLlRleHR1cmUuZnJvbUltYWdlKCcuLi4nKSk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2NhbGUsICd4JywgMCwgNjQpLm5hbWUoJ1NjYWxlICh4KScpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5zY2FsZSwgJ3knLCAwLCA2NCkubmFtZSgnU2NhbGUgKHkpJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgICovXG4gICAgUGl4ZWxhdGVGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuUGl4ZWxhdGVGaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5zaXplLCAneCcsIDAsIDMyKS5uYW1lKCdCbG9jayBTaXplICh4KScpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5zaXplLCAneScsIDAsIDMyKS5uYW1lKCdCbG9jayBTaXplICh5KScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBSR0JTcGxpdEZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFBJWEkuZmlsdGVycy5SR0JTcGxpdEZpbHRlcigpO1xuICAgIH0sXG4gICAgU2hvY2t3YXZlRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLlNob2Nrd2F2ZUZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLmNlbnRlciwgJ3gnLCAwLCAxKS5uYW1lKCdDZW50ZXIgUG9pbnQgKHgpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLmNlbnRlciwgJ3knLCAwLCAxKS5uYW1lKCdDZW50ZXIgUG9pbnQgKHkpJyk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIucGFyYW1zLCAneCcsIDAsIDI1KS5uYW1lKCdTdHJlbmd0aCAoeCknKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIucGFyYW1zLCAneScsIDAsIDEwKS5uYW1lKCdTdHJlbmd0aCAoeSknKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIucGFyYW1zLCAneicsIDAsIDIpLm5hbWUoJ1N0cmVuZ3RoICh6KScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBTZXBpYUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5TZXBpYUZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnc2VwaWEnLCAwLCAxKS5uYW1lKCdTZXBpYSBGYWN0b3InKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgU21hcnRCbHVyRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUElYSS5maWx0ZXJzLlNtYXJ0Qmx1ckZpbHRlcigpO1xuICAgIH0sXG4gICAgVGlsdFNoaWZ0RmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLlRpbHRTaGlmdEZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnYmx1cicsIDAsIDIwMCkubmFtZSgnQmx1ciBGYWN0b3InKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdncmFkaWVudEJsdXInLCAwLCAyMDAwKS5uYW1lKCdCbHVyIEdyYWRpZW50Jyk7XG5cbiAgICAgICAgLy8gZm9sZGVyLmFkZChmaWx0ZXIuc3RhcnQsICd4JywgMCwgMzIpLm5hbWUoJ1N0YXJ0ICh4KScpO1xuICAgICAgICAvLyBmb2xkZXIuYWRkKGZpbHRlci5zdGFydCwgJ3knLCAwLCAzMikubmFtZSgnU3RhcnQgKHkpJyk7XG5cbiAgICAgICAgLy8gZm9sZGVyLmFkZChmaWx0ZXIuZW5kLCAneCcsIDAsIDMyKS5uYW1lKCdFbmQgKHgpJyk7XG4gICAgICAgIC8vIGZvbGRlci5hZGQoZmlsdGVyLmVuZCwgJ3knLCAwLCAzMikubmFtZSgnRW5kICh5KScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBUd2lzdEZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Ud2lzdEZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnYW5nbGUnLCAwLCAxNSkubmFtZSgnQW5nbGUnKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdyYWRpdXMnLCAwLCAxKS5uYW1lKCdSYWRpdXMnKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5vZmZzZXQsICd4JywgMCwgMSkubmFtZSgnUG9zaXRpb24gKHgpJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLm9mZnNldCwgJ3knLCAwLCAxKS5uYW1lKCdQb3NpdGlvbiAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH1cbn07XG5cbi8vIFNldHVwIGFuZCBydW4gdGhlIGV4YW1wbGUgYXBwXG5jb21tb24uc2V0dXAoZnVuY3Rpb24gKGFwcCkge1xuICAgIHZhciBmaWx0ZXJOYW1lcyA9IE9iamVjdC5rZXlzKFBJWEkuZmlsdGVycyksXG4gICAgICAgIGZpbHRlcnMgPSBbXSxcbiAgICAgICAgZmlsdGVyTWFwID0ge30sXG4gICAgICAgIHN3aXRjaGVzID0gW107XG5cbiAgICAvLyBpbml0aWFsaXplIGFsbCB0aGUgZmlsdGVycyFcbiAgICBmaWx0ZXJOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWx0ZXJOYW1lKSB7XG4gICAgICAgIGlmIChzZXR1cFtmaWx0ZXJOYW1lXSkge1xuICAgICAgICAgICAgc3dpdGNoZXMucHVzaChmYWxzZSk7XG5cbiAgICAgICAgICAgIHZhciBmb2xkZXIgPSBhcHAuZ3VpLmFkZEZvbGRlcihmaWx0ZXJOYW1lKTtcblxuICAgICAgICAgICAgZm9sZGVyLmFkZChzd2l0Y2hlcywgc3dpdGNoZXMubGVuZ3RoIC0gMSkubmFtZSgnZW5hYmxlJyk7XG5cbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSBzZXR1cFtmaWx0ZXJOYW1lXShmb2xkZXIpO1xuXG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goZmlsdGVyKTtcbiAgICAgICAgICAgIGZpbHRlck1hcFtmaWx0ZXJOYW1lXSA9IGZpbHRlcjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBiYWNrZ3JvdW5kXG4gICAgdmFyIGJnID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X2JnLmpwZycpO1xuICAgIGFwcC5yb290LmFkZENoaWxkKGJnKTtcblxuICAgIGJnLnRleHR1cmUuYmFzZVRleHR1cmUub25jZSgnbG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBhcHAub25SZXNpemUoKTtcbiAgICB9KTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgZmlzaGllcywgdXNlIGEgY29udGFpbmVyIGZvciBlYWNoIGZpc2ggdGV4dHVyZSBzbyB0aGV5IGFyZSBiYXRjaGVkXG4gICAgdmFyIGNvbnRhaW5lcnMgPSBbXG4gICAgICAgICAgICBhcHAucm9vdC5hZGRDaGlsZChuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKCkpLFxuICAgICAgICAgICAgYXBwLnJvb3QuYWRkQ2hpbGQobmV3IFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lcigpKSxcbiAgICAgICAgICAgIGFwcC5yb290LmFkZENoaWxkKG5ldyBQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIoKSksXG4gICAgICAgICAgICBhcHAucm9vdC5hZGRDaGlsZChuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKCkpXG4gICAgICAgIF0sXG4gICAgICAgIHRleHR1cmVzID0gW1xuICAgICAgICAgICAgUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnaW1nL2Rpc3BsYWNlbWVudF9maXNoMS5wbmcnKSxcbiAgICAgICAgICAgIFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoJ2ltZy9kaXNwbGFjZW1lbnRfZmlzaDIucG5nJyksXG4gICAgICAgICAgICBQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X2Zpc2gzLnBuZycpLFxuICAgICAgICAgICAgUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnaW1nL2Rpc3BsYWNlbWVudF9maXNoNC5wbmcnKVxuICAgICAgICBdLFxuICAgICAgICBmaXNoaWVzID0gW10sXG4gICAgICAgIHBhZGRpbmcgPSAxMDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI4OyBpKyspIHtcbiAgICAgICAgdmFyIGZpc2hJZCA9IGkgJSA0O1xuXG4gICAgICAgIHZhciBmaXNoID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmVzW2Zpc2hJZF0pO1xuXG4gICAgICAgIGZpc2guYW5jaG9yLnggPSBmaXNoLmFuY2hvci55ID0gMC41O1xuXG4gICAgICAgIGNvbnRhaW5lcnNbZmlzaElkXS5hZGRDaGlsZChmaXNoKTtcblxuICAgICAgICBmaXNoLmRpcmVjdGlvbiA9IE1hdGgucmFuZG9tKCkgKiBQSVhJLm1hdGguUElfMjtcbiAgICAgICAgZmlzaC5zcGVlZCA9IDIgKyBNYXRoLnJhbmRvbSgpICogMjtcbiAgICAgICAgZmlzaC50dXJuU3BlZWQgPSBNYXRoLnJhbmRvbSgpIC0gMC44O1xuXG4gICAgICAgIGZpc2gucG9zaXRpb24ueCA9IE1hdGgucmFuZG9tKCkgKiAoYXBwLnJlbmRlcmVyLndpZHRoICsgcGFkZGluZyk7XG4gICAgICAgIGZpc2gucG9zaXRpb24ueSA9IE1hdGgucmFuZG9tKCkgKiAoYXBwLnJlbmRlcmVyLmhlaWdodCArIHBhZGRpbmcpO1xuXG4gICAgICAgIGZpc2guc2NhbGUuc2V0KDAuOCArIE1hdGgucmFuZG9tKCkgKiAwLjMpO1xuXG4gICAgICAgIGZpc2hpZXMucHVzaChmaXNoKTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgdGhlIG92ZXJsYXlcbiAgICB2YXIgd2F2ZVRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvemVsZGFXYXZlcy5wbmcnKTtcbiAgICB2YXIgb3ZlcmxheSA9IG5ldyBQSVhJLmV4dHJhcy5UaWxpbmdTcHJpdGUod2F2ZVRleHR1cmUsIGFwcC5yZW5kZXJlci53aWR0aCwgYXBwLnJlbmRlcmVyLmhlaWdodCk7XG5cbiAgICBvdmVybGF5LmFscGhhID0gMC4xO1xuXG4gICAgYXBwLnJvb3QuYWRkQ2hpbGQob3ZlcmxheSk7XG5cbiAgICB2YXIgY291bnQgPSAwLjA7XG5cbiAgICAvLyBzZXR1cCB0aGUgdGljayBtZXRob2QuXG4gICAgYXBwLnRpY2sgPSBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgdmFyIGZpbHRlcnNUb0FwcGx5ID0gZmlsdGVycy5maWx0ZXIoY2hlY2tGaWx0ZXIpO1xuXG4gICAgICAgIGFwcC5yb290LmZpbHRlcnMgPSBmaWx0ZXJzVG9BcHBseS5sZW5ndGggPiAwID8gZmlsdGVyc1RvQXBwbHkgOiBudWxsO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlzaGllcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGZpc2ggPSBmaXNoaWVzW2ldO1xuXG4gICAgICAgICAgICBmaXNoLmRpcmVjdGlvbiArPSBmaXNoLnR1cm5TcGVlZCAqIDAuMDE7XG4gICAgICAgICAgICBmaXNoLnBvc2l0aW9uLnggKz0gTWF0aC5zaW4oZmlzaC5kaXJlY3Rpb24pICogZmlzaC5zcGVlZDtcbiAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueSArPSBNYXRoLmNvcyhmaXNoLmRpcmVjdGlvbikgKiBmaXNoLnNwZWVkO1xuXG4gICAgICAgICAgICBmaXNoLnJvdGF0aW9uID0gLWZpc2guZGlyZWN0aW9uIC0gTWF0aC5QSS8yO1xuXG4gICAgICAgICAgICAvLyB3cmFwLi5cbiAgICAgICAgICAgIGlmIChmaXNoLnBvc2l0aW9uLnggPCAtcGFkZGluZykge1xuICAgICAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueCArPSBhcHAucmVuZGVyZXIud2lkdGggKyAocGFkZGluZyAqIDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlzaC5wb3NpdGlvbi54ID4gKGFwcC5yZW5kZXJlci53aWR0aCArIHBhZGRpbmcpKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi54IC09IGFwcC5yZW5kZXJlci53aWR0aCArIChwYWRkaW5nICogMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaXNoLnBvc2l0aW9uLnkgPCAtcGFkZGluZykge1xuICAgICAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueSArPSBhcHAucmVuZGVyZXIuaGVpZ2h0ICsgKHBhZGRpbmcgKiAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpc2gucG9zaXRpb24ueSA+IChhcHAucmVuZGVyZXIuaGVpZ2h0ICsgcGFkZGluZykpIHtcbiAgICAgICAgICAgICAgICBmaXNoLnBvc2l0aW9uLnkgLT0gYXBwLnJlbmRlcmVyLmhlaWdodCArIChwYWRkaW5nICogMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb3VudCArPSAwLjE7XG5cbiAgICAgICAgLy8gZmlsdGVyTWFwLkRpc3BsYWNlbWVudEZpbHRlci5vZmZzZXQueCA9IGNvdW50ICogMTA7XG4gICAgICAgIC8vIGZpbHRlck1hcC5EaXNwbGFjZW1lbnRGaWx0ZXIub2Zmc2V0LnkgPSBjb3VudCAqIDEwO1xuXG4gICAgICAgIGlmIChmaWx0ZXJNYXAuU2hvY2t3YXZlRmlsdGVyLnRpbWUgPiAxKSB7XG4gICAgICAgICAgICBmaWx0ZXJNYXAuU2hvY2t3YXZlRmlsdGVyLnRpbWUgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsdGVyTWFwLlNob2Nrd2F2ZUZpbHRlci50aW1lICs9IGR0O1xuICAgICAgICB9XG5cbiAgICAgICAgb3ZlcmxheS50aWxlUG9zaXRpb24ueCA9IGNvdW50ICogLTEwO1xuICAgICAgICBvdmVybGF5LnRpbGVQb3NpdGlvbi55ID0gY291bnQgKiAtMTA7XG4gICAgfTtcblxuICAgIGFwcC5vblJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYmcud2lkdGggPSBhcHAucmVuZGVyZXIud2lkdGg7XG4gICAgICAgIGJnLmhlaWdodCA9IGFwcC5yZW5kZXJlci5oZWlnaHQ7XG4gICAgfTtcblxuICAgIHdpbmRvdy5maWx0ZXJNYXAgPSBmaWx0ZXJNYXA7XG5cbiAgICAvLyBraWNrb2ZmIHRoZSBhbmltYXRpb25cbiAgICBhcHAuYW5pbWF0ZSgpO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tGaWx0ZXIoZmlsdGVyLCBpKSB7XG4gICAgICAgIHJldHVybiBzd2l0Y2hlc1tpXTtcbiAgICB9XG59KTtcbiJdfQ==
