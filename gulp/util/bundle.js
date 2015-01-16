var path        = require('path'),
    glob        = require('glob'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    uglify      = require('gulp-uglify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    factor      = require('factor-bundle'),
    mkdirp      = require('mkdirp'),
    handleErrors = require('../util/handleErrors');

var files = glob.sync(paths.apps + '/index.js'),
    outFiles = files.map(function (p) {
        return p.replace(paths.src, paths.out);
    });

function rebundle() {
    return this.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source('common.js'))
        .pipe(gulp.dest(paths.out));
}

function createBundler(args) {
    args = args || {};
    args.debug = true;
    args.entries = files;

    outFiles.forEach(function (p) {
        mkdirp(path.dirname(p));
    });

    return browserify(args)
        .plugin(factor, {
            o: outFiles
        });
}

function watch(onUpdate) {
    var bundler = watchify(createBundler(watchify.args));

    bundler.on('update', function () {
        var bundle = rebundle.call(this);

        if (onUpdate) {
            bundle.on('end', onUpdate);
        }
    });

    return rebundle.call(bundler);
}

module.exports = function bundle() {
    return rebundle.call(createBundler());
};

module.exports.watch = watch;
module.exports.rebundle = rebundle;
module.exports.createBundler = createBundler;
