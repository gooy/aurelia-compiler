var gulp = require('gulp');
var shell = require('child-process-promise');

/**
 * Link this packages with jspm
 */
gulp.task('jspm-link',['build-system','build-html'], function () {
  return shell.exec("jspm link -y github:gooy/aurelia-compiler");
});
