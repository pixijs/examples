require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/filters/index.js":[function(require,module,exports){
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

        var resetTime = function () {
            filter.time = 0;
        };

        folder.add(filter.center, 'x', 0, 1).name('Center Point (x)').onChange(resetTime);
        folder.add(filter.center, 'y', 0, 1).name('Center Point (y)').onChange(resetTime);

        folder.add(filter.params, 'x', 0, 25).name('Strength (x)').onChange(resetTime);
        folder.add(filter.params, 'y', 0, 10).name('Strength (y)').onChange(resetTime);
        folder.add(filter.params, 'z', 0, 2).name('Strength (z)').onChange(resetTime);

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

            filters.push(
                setup[filterName](folder)
            );

            filterMap[filterName] = filters[filters.length - 1];
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

},{"../_shared/js":"c:\\Users\\Chad\\repos\\pixijs\\examples\\src\\_shared\\js\\index.js","pixi.js":"c:\\Users\\Chad\\repos\\pixijs\\examples\\node_modules\\pixi.js\\src\\index.js"}]},{},["./src/filters/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcZmFjdG9yLWJ1bmRsZVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxmaWx0ZXJzXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKSxcbiAgICBjb21tb24gPSByZXF1aXJlKCcuLi9fc2hhcmVkL2pzJyk7XG5cbi8vIFRPRE8gKGNlbmdsZXIpOlxuLy8gLSBBc2NpaSBmaWx0ZXIgZmxpcHMgb24gWVxuLy8gLSBDb252b2x1dGlvbiBmaWx0ZXIgbG9va3Mgd2VpcmRcbi8vIC0gRGlzcGxhY2VtZW50IGZpbHRlciBzY3JvbGxzIG9mZnNjcmVlbiB3aGVuIGluY3JlYXNpbmcgb2Zmc2V0XG4vLyAtIE5vaXNlIGZpbHRlciBzaG91bGQgbW92ZSBsaWtlIFRWIG5vaXNlXG4vLyAtIFNtYXJ0Qmx1ciBhbmQgQmxvb20gYXJlIHRvbyBzdHJvbmcuLi5cblxuLy8gcmVnaXN0ZXIgZWFjaCBmaWx0ZXJcbnZhciBzZXR1cCA9IHtcbiAgICBBc2NpaUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Bc2NpaUZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnc2l6ZScsIDEsIDI1KS5zdGVwKDEpLm5hbWUoJ0xldHRlciBTaXplJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIEJsb29tRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkJsb29tRmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdibHVyJywgMCwgMzIpLm5hbWUoJ0JsdXIgRmFjdG9yJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIEJsdXJGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuQmx1ckZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnYmx1clgnLCAwLCAzMikubmFtZSgnQmx1ciBGYWN0b3IgWCcpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2JsdXJZJywgMCwgMzIpLm5hbWUoJ0JsdXIgRmFjdG9yIFknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgLypcbiAgICBUT0RPIChjZW5nbGVyKSAtIEhvdyB0byBtb2RlbCB0aGUgbWF0cml4IGluIGRhdC5ndWk/XG5cbiAgICBDb2xvck1hdHJpeEZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Db2xvck1hdHJpeEZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnc3RlcCcsIDEsIDEwMCk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgICovXG4gICAgQ29sb3JTdGVwRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkNvbG9yU3RlcEZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnc3RlcCcsIDEsIDEwMCkubmFtZSgnQ29sb3IgU3RlcCcpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBDb252b2x1dGlvbkZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIga2VybmVsID0gW1xuICAgICAgICAgICAgICAgIDEsIDIsIDEsXG4gICAgICAgICAgICAgICAgMiwgMCwgMixcbiAgICAgICAgICAgICAgICAxLCAyLCAxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Db252b2x1dGlvbkZpbHRlcihrZXJuZWwsIDI1NiwgMjU2KTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgQ3Jvc3NIYXRjaEZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Dcm9zc0hhdGNoRmlsdGVyKCk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIERpc3BsYWNlbWVudEZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5EaXNwbGFjZW1lbnRGaWx0ZXIoUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnaW1nL2Rpc3BsYWNlbWVudF9tYXAuanBnJykpO1xuXG4gICAgICAgIGZpbHRlci5zY2FsZS54ID0gZmlsdGVyLnNjYWxlLnkgPSA3NTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5zY2FsZSwgJ3gnLCAxLCAyMDApLm5hbWUoJ1NjYWxlIEZhY3RvciAoeCknKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2NhbGUsICd5JywgMSwgMjAwKS5uYW1lKCdTY2FsZSBGYWN0b3IgKHkpJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIERvdFNjcmVlbkZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5Eb3RTY3JlZW5GaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2FuZ2xlJywgMCwgUElYSS5tYXRoLlBJXzIpLm5hbWUoJ0RvdCBBbmdsZScpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ3NjYWxlJywgMCwgMSkubmFtZSgnRG90IFNjYWxlJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIEdyYXlGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuR3JheUZpbHRlcigpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnZ3JheScsIDAsIDEpLm5hbWUoJ0dyYXlzY2FsZScpO1xuXG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfSxcbiAgICBJbnZlcnRGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuSW52ZXJ0RmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIsICdpbnZlcnQnLCAwLCAxKS5uYW1lKCdJbnZlcnQgU3RyZW5ndGgnKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgTm9pc2VGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuTm9pc2VGaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ25vaXNlJywgMCwgMikubmFtZSgnQW1vdW50IG9mIE5vaXNlJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIFBpeGVsYXRlRmlsdGVyOiBmdW5jdGlvbiAoZm9sZGVyKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLlBpeGVsYXRlRmlsdGVyKCk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2l6ZSwgJ3gnLCAwLCAzMikubmFtZSgnQmxvY2sgU2l6ZSAoeCknKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuc2l6ZSwgJ3knLCAwLCAzMikubmFtZSgnQmxvY2sgU2l6ZSAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgUkdCU3BsaXRGaWx0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQSVhJLmZpbHRlcnMuUkdCU3BsaXRGaWx0ZXIoKTtcbiAgICB9LFxuICAgIFNob2Nrd2F2ZUZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5TaG9ja3dhdmVGaWx0ZXIoKTtcblxuICAgICAgICB2YXIgcmVzZXRUaW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZmlsdGVyLnRpbWUgPSAwO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLmNlbnRlciwgJ3gnLCAwLCAxKS5uYW1lKCdDZW50ZXIgUG9pbnQgKHgpJykub25DaGFuZ2UocmVzZXRUaW1lKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIuY2VudGVyLCAneScsIDAsIDEpLm5hbWUoJ0NlbnRlciBQb2ludCAoeSknKS5vbkNoYW5nZShyZXNldFRpbWUpO1xuXG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLnBhcmFtcywgJ3gnLCAwLCAyNSkubmFtZSgnU3RyZW5ndGggKHgpJykub25DaGFuZ2UocmVzZXRUaW1lKTtcbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIucGFyYW1zLCAneScsIDAsIDEwKS5uYW1lKCdTdHJlbmd0aCAoeSknKS5vbkNoYW5nZShyZXNldFRpbWUpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5wYXJhbXMsICd6JywgMCwgMikubmFtZSgnU3RyZW5ndGggKHopJykub25DaGFuZ2UocmVzZXRUaW1lKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgU2VwaWFGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuU2VwaWFGaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ3NlcGlhJywgMCwgMSkubmFtZSgnU2VwaWEgRmFjdG9yJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9LFxuICAgIFNtYXJ0Qmx1ckZpbHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFBJWEkuZmlsdGVycy5TbWFydEJsdXJGaWx0ZXIoKTtcbiAgICB9LFxuICAgIFRpbHRTaGlmdEZpbHRlcjogZnVuY3Rpb24gKGZvbGRlcikge1xuICAgICAgICB2YXIgZmlsdGVyID0gbmV3IFBJWEkuZmlsdGVycy5UaWx0U2hpZnRGaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2JsdXInLCAwLCAyMDApLm5hbWUoJ0JsdXIgRmFjdG9yJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAnZ3JhZGllbnRCbHVyJywgMCwgMjAwMCkubmFtZSgnQmx1ciBHcmFkaWVudCcpO1xuXG4gICAgICAgIC8vIGZvbGRlci5hZGQoZmlsdGVyLnN0YXJ0LCAneCcsIDAsIDMyKS5uYW1lKCdTdGFydCAoeCknKTtcbiAgICAgICAgLy8gZm9sZGVyLmFkZChmaWx0ZXIuc3RhcnQsICd5JywgMCwgMzIpLm5hbWUoJ1N0YXJ0ICh5KScpO1xuXG4gICAgICAgIC8vIGZvbGRlci5hZGQoZmlsdGVyLmVuZCwgJ3gnLCAwLCAzMikubmFtZSgnRW5kICh4KScpO1xuICAgICAgICAvLyBmb2xkZXIuYWRkKGZpbHRlci5lbmQsICd5JywgMCwgMzIpLm5hbWUoJ0VuZCAoeSknKTtcblxuICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgIH0sXG4gICAgVHdpc3RGaWx0ZXI6IGZ1bmN0aW9uIChmb2xkZXIpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuVHdpc3RGaWx0ZXIoKTtcblxuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlciwgJ2FuZ2xlJywgMCwgMTUpLm5hbWUoJ0FuZ2xlJyk7XG4gICAgICAgIGZvbGRlci5hZGQoZmlsdGVyLCAncmFkaXVzJywgMCwgMSkubmFtZSgnUmFkaXVzJyk7XG5cbiAgICAgICAgZm9sZGVyLmFkZChmaWx0ZXIub2Zmc2V0LCAneCcsIDAsIDEpLm5hbWUoJ1Bvc2l0aW9uICh4KScpO1xuICAgICAgICBmb2xkZXIuYWRkKGZpbHRlci5vZmZzZXQsICd5JywgMCwgMSkubmFtZSgnUG9zaXRpb24gKHkpJyk7XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9XG59O1xuXG4vLyBTZXR1cCBhbmQgcnVuIHRoZSBleGFtcGxlIGFwcFxuY29tbW9uLnNldHVwKGZ1bmN0aW9uIChhcHApIHtcbiAgICB2YXIgZmlsdGVyTmFtZXMgPSBPYmplY3Qua2V5cyhQSVhJLmZpbHRlcnMpLFxuICAgICAgICBmaWx0ZXJzID0gW10sXG4gICAgICAgIGZpbHRlck1hcCA9IHt9LFxuICAgICAgICBzd2l0Y2hlcyA9IFtdO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBhbGwgdGhlIGZpbHRlcnMhXG4gICAgZmlsdGVyTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoZmlsdGVyTmFtZSkge1xuICAgICAgICBpZiAoc2V0dXBbZmlsdGVyTmFtZV0pIHtcbiAgICAgICAgICAgIHN3aXRjaGVzLnB1c2goZmFsc2UpO1xuXG4gICAgICAgICAgICB2YXIgZm9sZGVyID0gYXBwLmd1aS5hZGRGb2xkZXIoZmlsdGVyTmFtZSk7XG5cbiAgICAgICAgICAgIGZvbGRlci5hZGQoc3dpdGNoZXMsIHN3aXRjaGVzLmxlbmd0aCAtIDEpLm5hbWUoJ2VuYWJsZScpO1xuXG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goXG4gICAgICAgICAgICAgICAgc2V0dXBbZmlsdGVyTmFtZV0oZm9sZGVyKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZmlsdGVyTWFwW2ZpbHRlck5hbWVdID0gZmlsdGVyc1tmaWx0ZXJzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGJhY2tncm91bmRcbiAgICB2YXIgYmcgPSBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UoJ2ltZy9kaXNwbGFjZW1lbnRfYmcuanBnJyk7XG4gICAgYXBwLnJvb3QuYWRkQ2hpbGQoYmcpO1xuXG4gICAgYmcudGV4dHVyZS5iYXNlVGV4dHVyZS5vbmNlKCdsb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFwcC5vblJlc2l6ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBmaXNoaWVzLCB1c2UgYSBjb250YWluZXIgZm9yIGVhY2ggZmlzaCB0ZXh0dXJlIHNvIHRoZXkgYXJlIGJhdGNoZWRcbiAgICB2YXIgY29udGFpbmVycyA9IFtcbiAgICAgICAgICAgIGFwcC5yb290LmFkZENoaWxkKG5ldyBQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIoKSksXG4gICAgICAgICAgICBhcHAucm9vdC5hZGRDaGlsZChuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKCkpLFxuICAgICAgICAgICAgYXBwLnJvb3QuYWRkQ2hpbGQobmV3IFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lcigpKSxcbiAgICAgICAgICAgIGFwcC5yb290LmFkZENoaWxkKG5ldyBQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIoKSlcbiAgICAgICAgXSxcbiAgICAgICAgdGV4dHVyZXMgPSBbXG4gICAgICAgICAgICBQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X2Zpc2gxLnBuZycpLFxuICAgICAgICAgICAgUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnaW1nL2Rpc3BsYWNlbWVudF9maXNoMi5wbmcnKSxcbiAgICAgICAgICAgIFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoJ2ltZy9kaXNwbGFjZW1lbnRfZmlzaDMucG5nJyksXG4gICAgICAgICAgICBQSVhJLlRleHR1cmUuZnJvbUltYWdlKCdpbWcvZGlzcGxhY2VtZW50X2Zpc2g0LnBuZycpXG4gICAgICAgIF0sXG4gICAgICAgIGZpc2hpZXMgPSBbXSxcbiAgICAgICAgcGFkZGluZyA9IDEwMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjg7IGkrKykge1xuICAgICAgICB2YXIgZmlzaElkID0gaSAlIDQ7XG5cbiAgICAgICAgdmFyIGZpc2ggPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZXNbZmlzaElkXSk7XG5cbiAgICAgICAgZmlzaC5hbmNob3IueCA9IGZpc2guYW5jaG9yLnkgPSAwLjU7XG5cbiAgICAgICAgY29udGFpbmVyc1tmaXNoSWRdLmFkZENoaWxkKGZpc2gpO1xuXG4gICAgICAgIGZpc2guZGlyZWN0aW9uID0gTWF0aC5yYW5kb20oKSAqIFBJWEkubWF0aC5QSV8yO1xuICAgICAgICBmaXNoLnNwZWVkID0gMiArIE1hdGgucmFuZG9tKCkgKiAyO1xuICAgICAgICBmaXNoLnR1cm5TcGVlZCA9IE1hdGgucmFuZG9tKCkgLSAwLjg7XG5cbiAgICAgICAgZmlzaC5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSAqIChhcHAucmVuZGVyZXIud2lkdGggKyBwYWRkaW5nKTtcbiAgICAgICAgZmlzaC5wb3NpdGlvbi55ID0gTWF0aC5yYW5kb20oKSAqIChhcHAucmVuZGVyZXIuaGVpZ2h0ICsgcGFkZGluZyk7XG5cbiAgICAgICAgZmlzaC5zY2FsZS5zZXQoMC44ICsgTWF0aC5yYW5kb20oKSAqIDAuMyk7XG5cbiAgICAgICAgZmlzaGllcy5wdXNoKGZpc2gpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSB0aGUgb3ZlcmxheVxuICAgIHZhciB3YXZlVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoJ2ltZy96ZWxkYVdhdmVzLnBuZycpO1xuICAgIHZhciBvdmVybGF5ID0gbmV3IFBJWEkuZXh0cmFzLlRpbGluZ1Nwcml0ZSh3YXZlVGV4dHVyZSwgYXBwLnJlbmRlcmVyLndpZHRoLCBhcHAucmVuZGVyZXIuaGVpZ2h0KTtcblxuICAgIG92ZXJsYXkuYWxwaGEgPSAwLjE7XG5cbiAgICBhcHAucm9vdC5hZGRDaGlsZChvdmVybGF5KTtcblxuICAgIHZhciBjb3VudCA9IDAuMDtcblxuICAgIC8vIHNldHVwIHRoZSB0aWNrIG1ldGhvZC5cbiAgICBhcHAudGljayA9IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICB2YXIgZmlsdGVyc1RvQXBwbHkgPSBmaWx0ZXJzLmZpbHRlcihjaGVja0ZpbHRlcik7XG5cbiAgICAgICAgYXBwLnJvb3QuZmlsdGVycyA9IGZpbHRlcnNUb0FwcGx5Lmxlbmd0aCA+IDAgPyBmaWx0ZXJzVG9BcHBseSA6IG51bGw7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaXNoaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZmlzaCA9IGZpc2hpZXNbaV07XG5cbiAgICAgICAgICAgIGZpc2guZGlyZWN0aW9uICs9IGZpc2gudHVyblNwZWVkICogMC4wMTtcbiAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueCArPSBNYXRoLnNpbihmaXNoLmRpcmVjdGlvbikgKiBmaXNoLnNwZWVkO1xuICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi55ICs9IE1hdGguY29zKGZpc2guZGlyZWN0aW9uKSAqIGZpc2guc3BlZWQ7XG5cbiAgICAgICAgICAgIGZpc2gucm90YXRpb24gPSAtZmlzaC5kaXJlY3Rpb24gLSBNYXRoLlBJLzI7XG5cbiAgICAgICAgICAgIC8vIHdyYXAuLlxuICAgICAgICAgICAgaWYgKGZpc2gucG9zaXRpb24ueCA8IC1wYWRkaW5nKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi54ICs9IGFwcC5yZW5kZXJlci53aWR0aCArIChwYWRkaW5nICogMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaXNoLnBvc2l0aW9uLnggPiAoYXBwLnJlbmRlcmVyLndpZHRoICsgcGFkZGluZykpIHtcbiAgICAgICAgICAgICAgICBmaXNoLnBvc2l0aW9uLnggLT0gYXBwLnJlbmRlcmVyLndpZHRoICsgKHBhZGRpbmcgKiAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpc2gucG9zaXRpb24ueSA8IC1wYWRkaW5nKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5wb3NpdGlvbi55ICs9IGFwcC5yZW5kZXJlci5oZWlnaHQgKyAocGFkZGluZyAqIDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlzaC5wb3NpdGlvbi55ID4gKGFwcC5yZW5kZXJlci5oZWlnaHQgKyBwYWRkaW5nKSkge1xuICAgICAgICAgICAgICAgIGZpc2gucG9zaXRpb24ueSAtPSBhcHAucmVuZGVyZXIuaGVpZ2h0ICsgKHBhZGRpbmcgKiAyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvdW50ICs9IDAuMTtcblxuICAgICAgICAvLyBmaWx0ZXJNYXAuRGlzcGxhY2VtZW50RmlsdGVyLm9mZnNldC54ID0gY291bnQgKiAxMDtcbiAgICAgICAgLy8gZmlsdGVyTWFwLkRpc3BsYWNlbWVudEZpbHRlci5vZmZzZXQueSA9IGNvdW50ICogMTA7XG5cbiAgICAgICAgaWYgKGZpbHRlck1hcC5TaG9ja3dhdmVGaWx0ZXIudGltZSA+IDEpIHtcbiAgICAgICAgICAgIGZpbHRlck1hcC5TaG9ja3dhdmVGaWx0ZXIudGltZSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWx0ZXJNYXAuU2hvY2t3YXZlRmlsdGVyLnRpbWUgKz0gZHQ7XG4gICAgICAgIH1cblxuICAgICAgICBvdmVybGF5LnRpbGVQb3NpdGlvbi54ID0gY291bnQgKiAtMTA7XG4gICAgICAgIG92ZXJsYXkudGlsZVBvc2l0aW9uLnkgPSBjb3VudCAqIC0xMDtcbiAgICB9O1xuXG4gICAgYXBwLm9uUmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBiZy53aWR0aCA9IGFwcC5yZW5kZXJlci53aWR0aDtcbiAgICAgICAgYmcuaGVpZ2h0ID0gYXBwLnJlbmRlcmVyLmhlaWdodDtcbiAgICB9O1xuXG4gICAgd2luZG93LmZpbHRlck1hcCA9IGZpbHRlck1hcDtcblxuICAgIC8vIGtpY2tvZmYgdGhlIGFuaW1hdGlvblxuICAgIGFwcC5hbmltYXRlKCk7XG5cbiAgICBmdW5jdGlvbiBjaGVja0ZpbHRlcihmaWx0ZXIsIGkpIHtcbiAgICAgICAgcmV0dXJuIHN3aXRjaGVzW2ldO1xuICAgIH1cbn0pO1xuIl19
