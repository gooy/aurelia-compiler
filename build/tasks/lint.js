/*jshint node:true*/
/**
 * JShint
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('lint', function () {
  return gulp.src(['./src/**/*.js', './test/**/*.js', './gulpfile.js'])
  .pipe(jshint())
  .pipe(jshint.reporter(stylish))
  .pipe(jshint.reporter('fail'))
    ;
});
