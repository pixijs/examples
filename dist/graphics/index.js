require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({3:[function(require,module,exports){
var PIXI = require('pixi.js'),
    common = require('../_shared/js');

common.setup(function (app) {
    var g = new PIXI.Graphics();

    app.root.addChild(g);

    g.beginFill(0xFF00FF);

    g.drawRect(randX(), randY(), 32, 32);

    g.arc(randX(), randY(), 32, 0, Math.PI);

    app.animate();

    function randX() {
        return ~~(Math.random() * app.renderer.width);
    }

    function randY() {
        return ~~(Math.random() * app.renderer.height);
    }
});

},{"../_shared/js":129,"pixi.js":111}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcZmFjdG9yLWJ1bmRsZVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjXFxncmFwaGljc1xcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKSxcbiAgICBjb21tb24gPSByZXF1aXJlKCcuLi9fc2hhcmVkL2pzJyk7XG5cbmNvbW1vbi5zZXR1cChmdW5jdGlvbiAoYXBwKSB7XG4gICAgdmFyIGcgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXG4gICAgYXBwLnJvb3QuYWRkQ2hpbGQoZyk7XG5cbiAgICBnLmJlZ2luRmlsbCgweEZGMDBGRik7XG5cbiAgICBnLmRyYXdSZWN0KHJhbmRYKCksIHJhbmRZKCksIDMyLCAzMik7XG5cbiAgICBnLmFyYyhyYW5kWCgpLCByYW5kWSgpLCAzMiwgMCwgTWF0aC5QSSk7XG5cbiAgICBhcHAuYW5pbWF0ZSgpO1xuXG4gICAgZnVuY3Rpb24gcmFuZFgoKSB7XG4gICAgICAgIHJldHVybiB+fihNYXRoLnJhbmRvbSgpICogYXBwLnJlbmRlcmVyLndpZHRoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByYW5kWSgpIHtcbiAgICAgICAgcmV0dXJuIH5+KE1hdGgucmFuZG9tKCkgKiBhcHAucmVuZGVyZXIuaGVpZ2h0KTtcbiAgICB9XG59KTtcbiJdfQ==
