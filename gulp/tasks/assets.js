var gulp        = require('gulp'),
    handleErrors = require('../util/handleErrors');

gulp.task('assets', function () {
    return gulp.src(paths.src + '/_shared/favicon.ico')
        .pipe(handleErrors())
        .pipe(gulp.dest(paths.out));
});
