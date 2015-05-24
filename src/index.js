import {ViewCompiler,CompositionEngine,ViewResources,ViewSlot,ViewEngine, ResourceRegistry, Container} from 'aurelia-framework';

import {DefaultLoader} from 'aurelia-loader-default';

/**
 * Compiler service
 *
 * compiles an HTML element with aurelia
 */
export class Compiler {
  static inject() {return [ViewCompiler, CompositionEngine,ViewEngine,ResourceRegistry, Container,DefaultLoader]}
  constructor(viewCompiler, compositionEngine,viewEngine, resources, container,loader) {
    this.viewCompiler = viewCompiler;
    this.viewEngine = viewEngine;
    this.compositionEngine = compositionEngine;
    this.resources = new ViewResources(resources);
    this.container = container;
    this.loader = loader;
  }

  composeElement(element,ctx, instruction) {
    instruction.viewSlot = instruction.viewSlot ||new ViewSlot(element, true,ctx);
    return this.processInstruction(ctx,instruction);
  }

  /**
   * Compile an element
   * the element should be available in the main resource registry or
   * in the registry of the execution context passed as the second parameter.
   *
   * @param element
   * @param ctx
   * @returns {ViewSlot}
   */
  compile(element, ctx = null) {
    element.classList.remove('au-target');
    let slot = new ViewSlot(element.parentNode||element, true);
    let tpl = templateFromElement(element);
    var view = this.viewCompiler.compile(tpl, this.resources).create(this.container, ctx);
    slot.add(view);
    slot.attached();
    return slot;
  }

  /**
   * Loads a view model and it's resources.
   *
   * @param moduleId
   * @returns {Promise}
   */
  loadVM(moduleId){
    var entry = this.loader.moduleRegistry[moduleId];
    if(!entry){
      return this.viewEngine.importViewResources([moduleId], [], this.resources).then(resources=>{
        return this.viewEngine.importViewModelResource(moduleId);
      });
    }else{
      return Promise.resolve(entry);
    }
  }

  processInstruction(ctx, instruction){

    instruction.container = instruction.container||ctx.container||this.container;
    instruction.executionContext = instruction.executionContext||ctx.executionContext||ctx||this.executionContext;
    instruction.viewSlot = instruction.viewSlot||ctx.viewSlot||this.viewSlot;
    instruction.viewResources = instruction.viewResources||ctx.viewResources||this.viewResources;
    instruction.currentBehavior = instruction.currentBehavior||ctx.currentBehavior||this.currentBehavior;

    return this.compositionEngine.compose(instruction).then(next => {
      ctx.currentBehavior = next;
      ctx.currentViewModel = next ? next.executionContext : null;
    });
  }

}

/**
 * Create a template from a regular element.
 *
 * @param element
 * @returns {*}
 */
function templateFromElement(element) {
  var tpl = document.createElement('template');
  tpl.content.appendChild(element);
  return tpl;
}
