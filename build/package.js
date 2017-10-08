var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('package', function() {
    return gulp.src('src/**/*.tsx')
        .pipe(ts.createProject('tsconfig.json')())
        .pipe(gulp.dest('dist'));
});

