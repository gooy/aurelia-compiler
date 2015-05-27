System.register(['aurelia-framework', 'aurelia-loader-default', 'aurelia-loader'], function (_export) {
  'use strict';

  var ViewCompiler, CompositionEngine, ViewResources, ViewSlot, ViewEngine, ResourceRegistry, Container, DefaultLoader, TemplateRegistryEntry, Compiler;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function ensureRegistryEntry(loader, urlOrRegistryEntry) {
    if (urlOrRegistryEntry instanceof TemplateRegistryEntry) {
      return Promise.resolve(urlOrRegistryEntry);
    }

    return loader.loadTemplate(urlOrRegistryEntry);
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
    }, function (_aureliaLoader) {
      TemplateRegistryEntry = _aureliaLoader.TemplateRegistryEntry;
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
            instruction.viewSlot = instruction.viewSlot || new ViewSlot(element, true, ctx);
            return this.processInstruction(ctx, instruction);
          }
        }, {
          key: 'loadTemplate',
          value: function loadTemplate(urlOrRegistryEntry, associatedModuleId, data) {
            var _this = this;

            return ensureRegistryEntry(this.loader, urlOrRegistryEntry).then(function (viewRegistryEntry) {
              if (viewRegistryEntry.isReady) {
                return viewRegistryEntry.factory;
              }

              return _this.viewEngine.loadTemplateResources(viewRegistryEntry, associatedModuleId).then(function (resources) {
                if (viewRegistryEntry.isReady) {
                  return viewRegistryEntry.factory;
                }

                viewRegistryEntry.setResources(resources);

                return { template: viewRegistryEntry.template, data: data };
              });
            });
          }
        }, {
          key: 'composeBehavior',
          value: function composeBehavior(container, instruction, ctx) {
            var element = container.get(Element);

            var behavior = element.primaryBehavior;

            element.innerHTML = '';

            if (!behavior) return;
            var viewSlot = container.get(ViewSlot);

            instruction.viewSlot = viewSlot;
            instruction.viewModel = behavior;
            var context = ctx || container.executionContext;
            instruction.executionContext = context;

            return this.processInstruction(context, instruction).then(function (viewFactory) {
              behavior.behavior.viewFactory = viewFactory;
              viewSlot.bind(context);
            });
          }
        }, {
          key: 'loadText',
          value: function loadText(view) {
            return this.loader.loadText(view);
          }
        }, {
          key: 'loadViewFactory',
          value: function loadViewFactory(view) {
            return this.viewEngine.loadViewFactory(view);
          }
        }, {
          key: 'composeViewFactory',
          value: function composeViewFactory(container, ctx, viewFactory) {
            var viewSlot = container.get(ViewSlot);
            viewSlot.removeAll();
            viewSlot.swap(viewFactory.create(container, ctx));
          }
        }, {
          key: 'processElementContents',
          value: function processElementContents(element) {
            var behavior = this.element.primaryBehavior;

            if (!behavior) return;

            if (behavior.viewFactory) return;

            var fragment = document.createDocumentFragment();
            var c = document.createElement('div');
            c.innerHTML = this.element.innerHTML;
            fragment.appendChild(c);

            this.element.innerHTML = '';

            var viewFactory = this.viewCompiler.compile(fragment, this.resources);
            behavior.behavior.viewFactory = viewFactory;

            var view = viewFactory.create(this.container, behavior.executionContext);

            this.viewSlot.add(view);
            this.viewAttached();
          }
        }, {
          key: 'processBehavior',
          value: function processBehavior(container) {
            var element = container.get(Element);

            var i, l;

            var behavior = element.primaryBehavior;

            if (!behavior) return;

            if (behavior.viewFactory) return;

            var viewSlot = container.get(ViewSlot);
            var resources = container.get(ViewResources);

            var fragment = document.createDocumentFragment();

            var c = document.createElement('div');
            c.innerHTML = element.innerHTML;

            for (i = 0, l = c.children.length; i < l; i++) {
              var child = c.children[i];
              if (child) fragment.appendChild(child);
            }

            var targets = fragment.querySelectorAll('.au-target');
            for (i = 0, l = targets.length; i < l; i++) {
              var target = targets[i];
              target.classList.remove('au-target');
            }

            element.innerHTML = '';

            var viewFactory = this.viewCompiler.compile(fragment, resources);
            behavior.behavior.viewFactory = viewFactory;

            var view = viewFactory.create(container, behavior.executionContext.executionContext || behavior.executionContext);
            viewSlot.add(view);
          }
        }, {
          key: 'compile',
          value: function compile(element) {
            var ctx = arguments[1] === undefined ? null : arguments[1];

            element.classList.remove('au-target');
            var slot = new ViewSlot(element, true);

            var fragment = document.createDocumentFragment();
            var c = document.createElement('div');
            c.innerHTML = element.innerHTML;
            fragment.appendChild(c);

            var view = this.viewCompiler.compile(fragment, this.resources).create(this.container, ctx);
            slot.add(view);
            slot.attached();
            return slot;
          }
        }, {
          key: 'compile2',
          value: function compile2(element) {
            var ctx = arguments[1] === undefined ? null : arguments[1];
            var viewSlot = arguments[2] === undefined ? null : arguments[2];
            var template = arguments[3] === undefined ? null : arguments[3];

            element.classList.remove('au-target');
            var view = this.viewCompiler.compile(template, this.resources).create(this.container, ctx);
            viewSlot.add(view);
            if (ctx.viewAttached) ctx.viewAttached();
            return viewSlot;
          }
        }, {
          key: 'loadVM',
          value: function loadVM(moduleId) {
            var _this2 = this;

            var entry = this.loader.moduleRegistry[moduleId];
            if (!entry) {
              return this.viewEngine.importViewResources([moduleId], [], this.resources).then(function (resources) {
                return _this2.viewEngine.importViewModelResource(moduleId);
              });
            } else {
              return Promise.resolve(entry);
            }
          }
        }, {
          key: 'processInstruction',
          value: function processInstruction(ctx, instruction) {

            instruction.container = instruction.container || ctx.container || this.container;
            instruction.executionContext = instruction.executionContext || ctx.executionContext || ctx || this.executionContext;
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