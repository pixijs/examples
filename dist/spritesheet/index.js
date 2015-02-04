require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({4:[function(require,module,exports){
var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    PIXI.loaders.loader
        .add('img/sheet.json')
        .load(function (resources) {
            var sprite = new PIXI.Sprite(resources[0].textures['sword.png']);
            var graphics = new PIXI.Graphics();

            sprite.position.set(128);

            graphics.lineStyle(1, 0xff00ff, 1);
            graphics.drawRect(0, 0, sprite.width, sprite.height);

            sprite.addChild(graphics);

            app.root.addChild(sprite);
        });

    app.animate();
});

},{"../_shared/js":127,"pixi.js":109}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcZmFjdG9yLWJ1bmRsZVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxzcHJpdGVzaGVldFxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpLFxuICAgIGNvbW1vbiA9IHJlcXVpcmUoJy4uL19zaGFyZWQvanMnKTtcblxuY29tbW9uLnNldHVwKGZ1bmN0aW9uIChhcHApIHtcbiAgICBQSVhJLmxvYWRlcnMubG9hZGVyXG4gICAgICAgIC5hZGQoJ2ltZy9zaGVldC5qc29uJylcbiAgICAgICAgLmxvYWQoZnVuY3Rpb24gKHJlc291cmNlcykge1xuICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZShyZXNvdXJjZXNbMF0udGV4dHVyZXNbJ3N3b3JkLnBuZyddKTtcbiAgICAgICAgICAgIHZhciBncmFwaGljcyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cbiAgICAgICAgICAgIHNwcml0ZS5wb3NpdGlvbi5zZXQoMTI4KTtcblxuICAgICAgICAgICAgZ3JhcGhpY3MubGluZVN0eWxlKDEsIDB4ZmYwMGZmLCAxKTtcbiAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHNwcml0ZS53aWR0aCwgc3ByaXRlLmhlaWdodCk7XG5cbiAgICAgICAgICAgIHNwcml0ZS5hZGRDaGlsZChncmFwaGljcyk7XG5cbiAgICAgICAgICAgIGFwcC5yb290LmFkZENoaWxkKHNwcml0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgYXBwLmFuaW1hdGUoKTtcbn0pO1xuIl19
