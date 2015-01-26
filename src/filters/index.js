var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    var filterNames = Object.keys(PIXI.filters),
        filters = [],
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
    var overlay = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage('img/zeldaWaves.png'), app.renderer.width, app.renderer.height);
    overlay.alpha = 0.1;
    app.root.addChild(overlay);

    var count = 0.0;

    // setup the tick method.
    app.tick = function () {
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

        // displacementFilter.offset.x = count * 10;
        // displacementFilter.offset.y = count * 10;

        overlay.tilePosition.x = count * -10;
        overlay.tilePosition.y = count * -10;
    };

    app.onResize = function () {
        bg.width = app.renderer.width;
        bg.height = app.renderer.height;
    };

    // kickoff the animation
    app.animate();

    function checkFilter(filter, i) {
        return switches[i];
    }
});

var setup = {
    AsciiFilter: function (folder) {
        var filter = new PIXI.filters.AsciiFilter();

        folder.add(filter, 'size', 1, 32).name('size');

        return filter;
    },
    BloomFilter: function (folder) {
        var filter = new PIXI.filters.BloomFilter();

        folder.add(filter, 'blur', 0, 32).name('blur');

        return filter;
    },
    BlurFilter: function (folder) {
        var filter = new PIXI.filters.BlurFilter();

        folder.add(filter, 'blurX', 0, 32).name('blurX');
        folder.add(filter, 'blurY', 0, 32).name('blurY');

        return filter;
    },
    GrayFilter: function (folder) {
        var filter = new PIXI.filters.GrayFilter();

        folder.add(filter, 'gray', 0, 1).name('gray');

        return filter;
    }
};
