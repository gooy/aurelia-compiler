var gulp = require('gulp');
var shell = require('child-process-promise');

/**
 * Link this packages with jspm
 */
gulp.task('jspm-link',['build'], function () {
  return shell.exec("aurelia bundle");
});
