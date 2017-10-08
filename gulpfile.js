var gulp = require('gulp');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');
var tasks = requireDir('./build');

gulp.task('build', function(done) {
    runSequence('package', done);
});
