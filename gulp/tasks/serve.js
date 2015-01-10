var gulp    = require('gulp'),
    connect = require('gulp-connect');

gulp.task('serve', function () {
    return connect.server({
        root: paths.out,
        port: process.env.PORT || 9000,
        livereload: true
    });
});
