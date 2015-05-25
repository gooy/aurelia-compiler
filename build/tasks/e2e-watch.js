var gulp = require('gulp');
var paths = require('../paths');
var browserSync = require('browser-sync');

// outputs changes to files to the console
function reportChange(event){
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

// this task wil watch for changes
// to js, html, and css files and call the
// reportChange method. Also, by depending on the
// serve task, it will instantiate a browserSync session
gulp.task('e2e-watch', ['e2e-serve'], function() {
  gulp.watch(paths.source, ['build-system', browserSync.reload]).on('change', reportChange);
  gulp.watch(paths.e2e_app_source, ['e2e-build-system', browserSync.reload]).on('change', reportChange);
  gulp.watch(paths.e2e_app_html, ['e2e-build-html', browserSync.reload]).on('change', reportChange);
  gulp.watch(paths.e2e_app_style, browserSync.reload).on('change', reportChange);
});
