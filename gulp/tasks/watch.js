var gulp    = require('gulp'),
    path    = require('path'),
    gutil   = require('gulp-util'),
    connect = require('gulp-connect'),
    bundle  = require('../util/bundle');

gulp.task('watch', function () {
    gulp.watch(paths.assets, ['assets'])
        .on('change', logChanges);

    gulp.watch(paths.styles, ['styles'])
        .on('change', logChanges);

    gulp.watch(paths.hbs, ['html'])
        .on('change', logChanges);

    gulp.watch(paths.scripts, ['jshint'])
        .on('change', logChanges);

    return bundle.watch(connect.reload);
});

function logChanges(event) {
    gutil.log(
        gutil.colors.green('File ' + event.type + ': ') +
        gutil.colors.magenta(path.basename(event.path))
    );
}
