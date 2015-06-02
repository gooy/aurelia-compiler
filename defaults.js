module.exports.pkg = require('gulp').pkg = require('deep-extend')({
  basePath: __dirname,
  directories: {
    lib: "src",
    build: "dist",
    deploy: "deploy",
    test: "test",
    unit: "test/unit/src",
    e2e: "test/e2e/src",
    doc: "doc",
    doc_deploy: "deploy",
    doc_output: "docs",
    packages: "jspm_packages",
    node_modules: "node_modules"
  },
  demo:{
    directories: {
      lib: "demo/src",
      build: "demo/dist",
      deploy: "deploy/demo"
    }
  }
},require('./package.json'));
