/**
 * Build the application used for e2e testing
 * @type {Gulp|exports}
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var paths = require('../paths');
var compilerOptions = require('../babel-options');
var assign = Object.assign || require('object.assign');
var del = require('del');
var vinylPaths = require('vinyl-paths');

gulp.task('e2e-build-system', function () {
  return gulp.src(paths.e2e_app_source)
  .pipe(plumber())
  .pipe(changed(paths.e2e_app_output, {extension: '.js'}))
  .pipe(sourcemaps.init())
  .pipe(babel(assign({}, compilerOptions, {modules:'system'})))
  .pipe(sourcemaps.write()
  .pipe(gulp.dest(paths.e2e_app_output)));
});

gulp.task('e2e-build-html', function () {
  return gulp.src(paths.e2e_app_html)
  .pipe(changed(paths.e2e_app_output, {extension: '.html'}))
  .pipe(gulp.dest(paths.e2e_app_output));
});

gulp.task('e2e-build', function(callback) {
  return runSequence('e2e-clean',['e2e-build-system','e2e-build-html'],callback);
});

// deletes all files in the output path
gulp.task('e2e-clean', function() {
  return gulp.src([paths.e2e_app_output])
  .pipe(vinylPaths(del));
});
