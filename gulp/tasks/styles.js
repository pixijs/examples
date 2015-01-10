var gulp        = require('gulp'),
    less        = require('gulp-less'),
    rename      = require('gulp-rename'),
    connect     = require('gulp-connect'),
    handleErrors = require('../util/handleErrors');

gulp.task('styles', ['styles:common'], function () {
    return gulp.src(paths.appStyles)
        .pipe(handleErrors())
        .pipe(less())
        .pipe(gulp.dest(paths.out))
        .pipe(connect.reload());
});

gulp.task('styles:common', function () {
    return gulp.src(paths.src + '/_shared/less/index.less')
        .pipe(handleErrors())
        .pipe(less())
        .pipe(rename('common.css'))
        .pipe(gulp.dest(paths.out))
        .pipe(connect.reload());
})
