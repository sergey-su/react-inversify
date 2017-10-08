var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('build', function(done) {
    var b = browserify({
        debug: true,
        entries: 'src/app.jsx'
    });
    
    return b
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'));
});
