/*jshint node:true*/
/**
 * Link this packages with jspm
 *
 * The package can then be installed from the local cache using:
 * `jspm install --link endpoint:namespace/name@semver`
 *
 */
var gulp = require('gulp');
var shell = require('shell-promise');

gulp.task('jspm-link', ["build"],function () {
  return shell.exec("jspm link -y github:gooy/aurelia-compiler").then(function () {

  });
});
