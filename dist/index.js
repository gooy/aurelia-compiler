System.register(['aurelia-framework', 'aurelia-loader-default'], function (_export) {
  'use strict';

  var ViewCompiler, CompositionEngine, ViewResources, ViewSlot, ViewEngine, ResourceRegistry, Container, DefaultLoader, Compiler;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function templateFromElement(element) {
    var tpl = document.createElement('template');
    tpl.content.appendChild(element);
    return tpl;
  }
  return {
    setters: [function (_aureliaFramework) {
      ViewCompiler = _aureliaFramework.ViewCompiler;
      CompositionEngine = _aureliaFramework.CompositionEngine;
      ViewResources = _aureliaFramework.ViewResources;
      ViewSlot = _aureliaFramework.ViewSlot;
      ViewEngine = _aureliaFramework.ViewEngine;
      ResourceRegistry = _aureliaFramework.ResourceRegistry;
      Container = _aureliaFramework.Container;
    }, function (_aureliaLoaderDefault) {
      DefaultLoader = _aureliaLoaderDefault.DefaultLoader;
    }],
    execute: function () {
      Compiler = (function () {
        function Compiler(viewCompiler, compositionEngine, viewEngine, resources, container, loader) {
          _classCallCheck(this, Compiler);

          this.viewCompiler = viewCompiler;
          this.viewEngine = viewEngine;
          this.compositionEngine = compositionEngine;
          this.resources = new ViewResources(resources);
          this.container = container;
          this.loader = loader;
        }

        _createClass(Compiler, [{
          key: 'composeElement',
          value: function composeElement(element, ctx, instruction) {
            instruction.viewSlot = instruction.viewSlot || new ViewSlot(element, true);
            return this.processInstruction(ctx, instruction);
          }
        }, {
          key: 'compile',
          value: function compile(element) {
            var ctx = arguments[1] === undefined ? null : arguments[1];

            console.log('Compiler.compile', ctx);
            console.log('Compiler.resources', this.resources);
            element.classList.remove('au-target');
            var slot = new ViewSlot(element.parentNode || element, true);
            var tpl = templateFromElement(element);
            var view = this.viewCompiler.compile(tpl, this.resources).create(this.container, ctx);
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
          key: 'processInstruction',
          value: function processInstruction(ctx, instruction) {

            instruction.container = instruction.container || ctx.container || this.container;
            instruction.executionContext = instruction.executionContext || ctx.executionContext || this.executionContext;
            instruction.viewSlot = instruction.viewSlot || ctx.viewSlot || this.viewSlot;
            instruction.viewResources = instruction.viewResources || ctx.viewResources || this.viewResources;
            instruction.currentBehavior = instruction.currentBehavior || ctx.currentBehavior || this.currentBehavior;

            return this.compositionEngine.compose(instruction).then(function (next) {
              ctx.currentBehavior = next;
              ctx.currentViewModel = next ? next.executionContext : null;
            });
          }
        }], [{
          key: 'inject',
          value: function inject() {
            return [ViewCompiler, CompositionEngine, ViewEngine, ResourceRegistry, Container, DefaultLoader];
          }
        }]);

        return Compiler;
      })();

      _export('Compiler', Compiler);
    }
  };
});