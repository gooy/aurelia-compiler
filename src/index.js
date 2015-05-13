import {ViewCompiler,ViewResources,ViewSlot,ViewEngine, ResourceRegistry, Container} from 'aurelia-framework';

/**
 * Compiler service
 *
 * Compiles an HTML element with aurelia behaviors
 */
export class Compiler {
  static inject() {return [ViewCompiler, ViewEngine,ResourceRegistry, Container]}
  constructor(compiler, viewEngine, appResources, diContainer) {
    this.compiler = compiler;
    this.viewEngine = viewEngine;
    this.resources = appResources;
    this.container = diContainer;
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
    let containerElement = element.parentNode;
    let slot = new ViewSlot(containerElement, true);
    let tpl = this.templateFromElement(element);

    var view = this.compiler.compile(tpl, this.resources).create(this.container, ctx);
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

  /**
   * Create a template from a regular element.
   *
   * @param element
   * @returns {*}
   */
  templateFromElement(element) {
    var tpl = document.createElement('template');
    tpl.content.appendChild(element);
    return tpl;
  }

}

