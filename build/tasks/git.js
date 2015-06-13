var gulp = require('gulp');
var git = require('gulp-git');
var shell = require('child-process-promise');


// Run git init
// src is the root folder for git to initialize
gulp.task('git-init', function(){
  git.init(function (err) {
    if (err) throw err;
  });
});

gulp.task('git-add', function(){
  return gulp.src('./*')
  .pipe(git.add());
});


gulp.task('git-remote-add', function(){
  git.addRemote('origin', 'https://github.com/gooy/'+gulp.pkg.name, function (err) {
    if (err) throw err;
  });
});

gulp.task('git-push-master', function(){
  git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});

gulp.task('git-push-tags', function(){
  git.push('origin', '',{args: '--tags'}, function (err) {
    if (err) throw err;
  });
});

gulp.task('git-pull', function(){
  git.pull('origin', 'master', {args: '--rebase'}, function (err) {
    if (err) throw err;
  });
});

gulp.task('git-fetch', function(){
  git.fetch('origin', '', function (err) {
    if (err) throw err;
  });
});

gulp.task('git-tag', function(){
  git.tag(gulp.pkg.version, 'release version '+ gulp.pkg.version, function (err) {
    if (err) throw err;
  });
});

gulp.task('git-status', function(){
  git.status({args: '--porcelain'}, function (err, stdout) {
    if (err) throw err;
  });
});

gulp.task('git-repush-tag', function(){
  return shell.exec("git tag -d "+gulp.pkg.version).then(function(){
      return shell.exec("git push origin :refs/tags/"+gulp.pkg.version)
    }).then(function(){
      return shell.exec("git tag "+gulp.pkg.version)
    }).then(function(){
      return shell.exec("git push --tags")
    });
});
