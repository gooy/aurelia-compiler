'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aureliaFramework = require('aurelia-framework');

var _aureliaLoaderDefault = require('aurelia-loader-default');

var _aureliaLoader = require('aurelia-loader');

var _aureliaTemplating = require('aurelia-templating');

var Compiler = (function () {
  function Compiler(viewCompiler, compositionEngine, viewEngine, resources, container, loader) {
    _classCallCheck(this, Compiler);

    this.viewCompiler = viewCompiler;
    this.viewEngine = viewEngine;
    this.compositionEngine = compositionEngine;
    this.resources = new _aureliaFramework.ViewResources(resources);
    this.container = container;
    this.loader = loader;
  }

  _createClass(Compiler, [{
    key: 'swapView',
    value: function swapView(container, view, transformer) {

      var element = container.get(Element);
      var behavior = element.primaryBehavior;

      if (!behavior.originalFragment) {
        var odata = element.innerHTML;
        if (transformer) odata = transformer(element, element.innerHTML);
        behavior.originalFragment = this.createFragment(odata);
      }

      return this.loadTemplate(view).then(function (entry) {
        var template = entry.template;

        var data = '';
        for (var i = 0, l = template.content.children.length; i < l; i++) {
          var child = template.content.children[i];
          if (child) data += child.outerHTML;
        }

        if (transformer) data = transformer(element, data);

        element.innerHTML = data;

        return behavior;
      });
    }
  }, {
    key: 'createFragment',
    value: function createFragment(element) {
      var fragment = document.createDocumentFragment();

      var c = document.createElement('div');
      c.innerHTML = element instanceof HTMLElement ? element.innerHTML : element;

      var currentChild = c.firstChild,
          nextSibling;
      while (currentChild) {
        nextSibling = currentChild.nextSibling;
        switch (currentChild.nodeType) {
          case 1:
            fragment.appendChild(currentChild);
            break;
        }
        currentChild = nextSibling;
      }

      return fragment;
    }
  }, {
    key: 'processBehavior',
    value: function processBehavior(container, ctx) {
      var element = container.get(Element);

      var behavior = element.primaryBehavior;

      if (!behavior) return;

      if (behavior.viewFactory) return;

      behavior.isAttached = false;

      var viewSlot = container.get(_aureliaFramework.ViewSlot);
      var resources = container.get(_aureliaFramework.ViewResources);

      var fragment = this.createFragment(element);

      var targets = fragment.querySelectorAll('.au-target');
      for (var i = 0, l = targets.length; i < l; i++) {
        var target = targets[i];
        target.classList.remove('au-target');
      }

      var viewFactory = behavior.behavior.viewFactory = this.viewCompiler.compile(fragment, resources);

      element.innerHTML = '';

      var view = viewFactory.create(container, ctx || behavior.executionContext);
      viewSlot.add(view);
      viewSlot.attached();

      behavior.view = view;

      _aureliaTemplating.ContentSelector.applySelectors({ fragment: behavior.originalFragment }, view.contentSelectors, function (contentSelector, group) {
        return contentSelector.add(group);
      });
      behavior.contentView = behavior.originalView;

      return behavior;
    }
  }, {
    key: 'compile',
    value: function compile(element) {
      var ctx = arguments[1] === undefined ? null : arguments[1];
      var viewSlot = arguments[2] === undefined ? null : arguments[2];
      var templateOrFragment = arguments[3] === undefined ? null : arguments[3];

      element.classList.remove('au-target');

      if (!templateOrFragment) {
        var templateOrFragment = document.createDocumentFragment();
        var c = document.createElement('div');
        c.innerHTML = element.innerHTML;
        templateOrFragment.appendChild(c);
      }
      var view = this.viewCompiler.compile(templateOrFragment, this.resources).create(this.container, ctx);

      if (!viewSlot) viewSlot = new _aureliaFramework.ViewSlot(element, true);

      viewSlot.add(view);
      viewSlot.attached();
      return viewSlot;
    }
  }, {
    key: 'composeElementInstruction',
    value: function composeElementInstruction(element, instruction, ctx) {
      instruction.viewSlot = instruction.viewSlot || new _aureliaFramework.ViewSlot(element, true, ctx);
      return this.processInstruction(ctx, instruction);
    }
  }, {
    key: 'composeBehaviorInstruction',
    value: function composeBehaviorInstruction(container, instruction, ctx) {
      var element = container.get(Element);

      var behavior = element.primaryBehavior;

      element.innerHTML = '';

      if (!behavior) return;
      var viewSlot = container.get(_aureliaFramework.ViewSlot);

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
    value: function loadText(url) {
      return this.loader.loadText(url);
    }
  }, {
    key: 'loadViewFactory',
    value: function loadViewFactory(view) {
      return this.viewEngine.loadViewFactory(view);
    }
  }, {
    key: 'loadTemplate',
    value: function loadTemplate(urlOrRegistryEntry, associatedModuleId) {
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

          return viewRegistryEntry;
        });
      });
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
      instruction.executionContext = instruction.executionContext || ctx || this.executionContext;
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
      return [_aureliaFramework.ViewCompiler, _aureliaFramework.CompositionEngine, _aureliaFramework.ViewEngine, _aureliaFramework.ResourceRegistry, _aureliaFramework.Container, _aureliaLoaderDefault.DefaultLoader];
    }
  }]);

  return Compiler;
})();

exports.Compiler = Compiler;

function ensureRegistryEntry(loader, urlOrRegistryEntry) {
  if (urlOrRegistryEntry instanceof _aureliaLoader.TemplateRegistryEntry) {
    return Promise.resolve(urlOrRegistryEntry);
  }

  return loader.loadTemplate(urlOrRegistryEntry);
}
//# sourceMappingURL=index.js.map