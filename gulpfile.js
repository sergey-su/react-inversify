var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var ts = require('gulp-typescript');
var jest = require('gulp-jest').default;

gulp.task('build', function(done) {
    runSequence('build-src', 'build-dts', done);
});

var sourcesTemplate = 'src/**/*.tsx';
var packageOutDir = 'dist';

gulp.task('build-src', function() {
    return gulp.src(sourcesTemplate)
        .pipe(ts.createProject('tsconfig.json')())
        .pipe(gulp.dest(packageOutDir));
});

gulp.task("build-dts", function() {
    return gulp.src(sourcesTemplate)
        .pipe(ts.createProject("tsconfig.json", {
            declaration: true,
            noResolve: false
        })())
        .pipe(gulp.dest(packageOutDir));
});

gulp.task("clean", function() {
    return del([
        packageOutDir
    ]);
});

gulp.task('jest', function () {
  return gulp.src('tests').pipe(jest({
    config: {
      "preprocessorIgnorePatterns": [
        "<rootDir>/dist/", "<rootDir>/node_modules/"
      ],
      "automock": false
    }
  }));
});
