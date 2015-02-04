require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/spritesheet/index.js":[function(require,module,exports){
var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    PIXI.loaders.loader
        .add('sheet', 'img/sheet.json')
        .load(function (loader, res) {
            var sword = new PIXI.Sprite(res.sheet.textures['sword.png']);
            var banner = new PIXI.Sprite(res.sheet.textures['lore_img1.png']);

            sword.position.set(128);
            banner.position.set(128, 64);

            app.root.addChild(sword);
            app.root.addChild(banner);
        });

    app.animate();
});

},{"../_shared/js":"c:\\Users\\Chad\\repos\\pixijs\\examples\\src\\_shared\\js\\index.js","pixi.js":"c:\\Users\\Chad\\repos\\pixijs\\examples\\node_modules\\pixi.js\\src\\index.js"}]},{},["./src/spritesheet/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcZmFjdG9yLWJ1bmRsZVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxzcHJpdGVzaGVldFxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpLFxuICAgIGNvbW1vbiA9IHJlcXVpcmUoJy4uL19zaGFyZWQvanMnKTtcblxuY29tbW9uLnNldHVwKGZ1bmN0aW9uIChhcHApIHtcbiAgICBQSVhJLmxvYWRlcnMubG9hZGVyXG4gICAgICAgIC5hZGQoJ3NoZWV0JywgJ2ltZy9zaGVldC5qc29uJylcbiAgICAgICAgLmxvYWQoZnVuY3Rpb24gKGxvYWRlciwgcmVzKSB7XG4gICAgICAgICAgICB2YXIgc3dvcmQgPSBuZXcgUElYSS5TcHJpdGUocmVzLnNoZWV0LnRleHR1cmVzWydzd29yZC5wbmcnXSk7XG4gICAgICAgICAgICB2YXIgYmFubmVyID0gbmV3IFBJWEkuU3ByaXRlKHJlcy5zaGVldC50ZXh0dXJlc1snbG9yZV9pbWcxLnBuZyddKTtcblxuICAgICAgICAgICAgc3dvcmQucG9zaXRpb24uc2V0KDEyOCk7XG4gICAgICAgICAgICBiYW5uZXIucG9zaXRpb24uc2V0KDEyOCwgNjQpO1xuXG4gICAgICAgICAgICBhcHAucm9vdC5hZGRDaGlsZChzd29yZCk7XG4gICAgICAgICAgICBhcHAucm9vdC5hZGRDaGlsZChiYW5uZXIpO1xuICAgICAgICB9KTtcblxuICAgIGFwcC5hbmltYXRlKCk7XG59KTtcbiJdfQ==
