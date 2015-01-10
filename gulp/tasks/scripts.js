var gulp    = require('gulp'),
    bundle  = require('../util/bundle');

gulp.task('scripts', ['jshint'], function () {
    return bundle();
});
