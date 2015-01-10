var gulp        = require('gulp'),
    connect     = require('gulp-connect'),
    assemble    = require('gulp-assemble'),
    map         = require('map-stream');

var options = {
    layout: 'default.hbs',
    layouts: paths.src + '/_shared/templates/layouts',
    partials: paths.src + '/_shared/templates/partials/**/*.hbs',
    helpers: paths.src + '/_shared/helpers.js'
};

// TODO - There *has* to be a better way than this weird queueing system I wrote...
gulp.task('html', ['html:index'], function () {
    var queue = [];

    return gulp.src(paths.appTemplates)
        .pipe(map(function (file, cb) {
            queue.push(file.relative);
            cb(null, file);
        }))
        .pipe(assemble(options))
        .pipe(map(function (file, cb) {
            file.path = queue.shift().replace('.hbs', '.html');
            cb(null, file);
        }))
        .pipe(gulp.dest(paths.out))
        .pipe(connect.reload());
});

gulp.task('html:index', function () {
    return gulp.src(paths.src + '/index.hbs')
        .pipe(assemble(options))
        .pipe(gulp.dest(paths.out))
        .pipe(connect.reload());
});
