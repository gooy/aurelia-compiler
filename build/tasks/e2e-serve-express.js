var gulp = require('gulp');
var express = require('express');
var compression = require('compression');
var serveStatic = require('serve-static');
var paths = require('../paths');

gulp.task('e2e-serve-express',['e2e-build'], function(done){

  var app = express();
  app.use(compression());
  app.use(serveStatic(".", {
    'index': ['index.html'], setHeaders: function(res, path, stat){
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  }));
  app.listen(9000);

});
