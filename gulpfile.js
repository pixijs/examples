/*
 *  gulpfile.js
 *  ===========
 *
 *  Rather than manage one giant configuration file responsible
 *  for creating multiple tasks, each task has been broken out into
 *  its own file in gulp/tasks. Any files in that directory get
 *  automatically required below.
 *
 *  To add a new task, simply add a new task file in that directory.
 *  gulp/tasks/default.js specifies the default set of tasks to run
 *  when you run `gulp`.
 *
 */

var gulp        = require('gulp'),
    glob        = require('glob'),
    path        = require('path'),
    requireDir  = require('require-dir'),
    runSeq      = require('run-sequence');


// Specify game project paths for tasks.
global.paths = {
    src: './src',
    out: './dist',

    get scripts () { return this.src + '/**/*.js'; },
    get styles  () { return this.src + '/**/*.less'; },

    get apps        () { return this.src + '/!(_shared)'; },
    get appTemplates() { return this.apps + '/index.hbs'; },
    get appStyles   () { return this.apps + '/index.less'; }
};

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp/tasks', { recurse: true });

// default task
gulp.task('default', function (done) {
    runSeq('build', 'serve', done);
});

gulp .task('dev', function (done) {
    runSeq('build', 'serve', 'watch', done);
});
