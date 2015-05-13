System.register(['aurelia-framework', 'aurelia-loader-default'], function (_export) {
  var ViewCompiler, ViewResources, ViewSlot, ViewEngine, ResourceRegistry, Container, DefaultLoader, _classCallCheck, _createClass, Compiler;

  function templateFromElement(element) {
    var tpl = document.createElement('template');
    tpl.content.appendChild(element);
    return tpl;
  }
  return {
    setters: [function (_aureliaFramework) {
      ViewCompiler = _aureliaFramework.ViewCompiler;
      ViewResources = _aureliaFramework.ViewResources;
      ViewSlot = _aureliaFramework.ViewSlot;
      ViewEngine = _aureliaFramework.ViewEngine;
      ResourceRegistry = _aureliaFramework.ResourceRegistry;
      Container = _aureliaFramework.Container;
    }, function (_aureliaLoaderDefault) {
      DefaultLoader = _aureliaLoaderDefault.DefaultLoader;
    }],
    execute: function () {
      'use strict';

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

      _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

      Compiler = (function () {
        function Compiler(compiler, viewEngine, resources, container, loader) {
          _classCallCheck(this, Compiler);

          this.compiler = compiler;
          this.viewEngine = viewEngine;
          this.resources = resources;
          this.container = container;
          this.loader = loader;
        }

        _createClass(Compiler, [{
          key: 'compile',
          value: function compile(element) {
            var ctx = arguments[1] === undefined ? null : arguments[1];

            element.classList.remove('au-target');
            var slot = new ViewSlot(element.parentNode || element, true);
            var tpl = templateFromElement(element);

            var view = this.compiler.compile(tpl, this.resources).create(this.container, ctx);
            slot.add(view);
            slot.attached();
            return slot;
          }
        }, {
          key: 'loadVM',
          value: function loadVM(moduleId) {
            var _this = this;

            var entry = this.loader.moduleRegistry[moduleId];
            if (!entry) {
              return this.viewEngine.importViewResources([moduleId], [], this.resources).then(function (resources) {
                return _this.viewEngine.importViewModelResource(moduleId);
              });
            } else {
              return Promise.resolve(entry);
            }
          }
        }], [{
          key: 'inject',
          value: function inject() {
            return [ViewCompiler, ViewEngine, ResourceRegistry, Container, DefaultLoader];
          }
        }]);

        return Compiler;
      })();

      _export('Compiler', Compiler);
    }
  };
});