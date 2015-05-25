var appRoot = 'src/';
var outputRoot = 'dist/';

var e2eAppRoot = 'test/app/src/';
var e2eAppOutputRoot = 'test/app/dist/';

var e2eRoot = 'test/app/src/';
var e2eOutputRoot = 'test/app/dist/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.js',
  html: appRoot + '**/*.html',
  style: 'styles/**/*.css',

  output: outputRoot,

  e2e_app_source: e2eAppRoot + '**/*.js',
  e2e_app_html: e2eAppRoot + '**/*.html',
  e2e_app_style: 'test/app/styles/**/*.css',
  e2e_app_output: e2eOutputRoot,

  doc:'./doc',
  e2eSpecsSrc: e2eRoot + '*.js',
  e2eSpecsDist: e2eOutputRoot
};
