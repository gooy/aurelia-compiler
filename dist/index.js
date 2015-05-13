System.register(['aurelia-framework'], function (_export) {
  var ViewCompiler, ViewResources, ViewSlot, ViewEngine, ResourceRegistry, Container, _classCallCheck, _createClass, Compiler;

  return {
    setters: [function (_aureliaFramework) {
      ViewCompiler = _aureliaFramework.ViewCompiler;
      ViewResources = _aureliaFramework.ViewResources;
      ViewSlot = _aureliaFramework.ViewSlot;
      ViewEngine = _aureliaFramework.ViewEngine;
      ResourceRegistry = _aureliaFramework.ResourceRegistry;
      Container = _aureliaFramework.Container;
    }],
    execute: function () {
      'use strict';

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

      _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

      Compiler = (function () {
        function Compiler(compiler, viewEngine, appResources, diContainer) {
          _classCallCheck(this, Compiler);

          this.compiler = compiler;
          this.viewEngine = viewEngine;
          this.resources = appResources;
          this.container = diContainer;
        }

        _createClass(Compiler, [{
          key: 'compile',
          value: function compile(element) {
            var ctx = arguments[1] === undefined ? null : arguments[1];

            element.classList.remove('au-target');
            var containerElement = element.parentNode;
            var slot = new ViewSlot(containerElement, true);
            var tpl = this.templateFromElement(element);

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
        }, {
          key: 'templateFromElement',
          value: function templateFromElement(element) {
            var tpl = document.createElement('template');
            tpl.content.appendChild(element);
            return tpl;
          }
        }], [{
          key: 'inject',
          value: function inject() {
            return [ViewCompiler, ViewEngine, ResourceRegistry, Container];
          }
        }]);

        return Compiler;
      })();

      _export('Compiler', Compiler);
    }
  };
});
//# sourceMappingURL=data:application/json;base64,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