import {ViewCompiler,CompositionEngine,ViewResources,ViewSlot,ViewEngine, ResourceRegistry , Container} from 'aurelia-framework';
import {DefaultLoader} from 'aurelia-loader-default';
import {TemplateRegistryEntry} from 'aurelia-loader';

/**
 * Compiler service
 *
 * compiles an HTML element with aurelia
 */
function ensureRegistryEntry(loader, urlOrRegistryEntry){
  if(urlOrRegistryEntry instanceof TemplateRegistryEntry){
    return Promise.resolve(urlOrRegistryEntry);
  }

  return loader.loadTemplate(urlOrRegistryEntry);
}

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

  loadTemplate(urlOrRegistryEntry, associatedModuleId,data){
    return ensureRegistryEntry(this.loader, urlOrRegistryEntry).then(viewRegistryEntry => {
      if(viewRegistryEntry.isReady){
        return viewRegistryEntry.factory;
      }

      return this.viewEngine.loadTemplateResources(viewRegistryEntry, associatedModuleId).then(resources => {
        if(viewRegistryEntry.isReady){
          return viewRegistryEntry.factory;
        }

        viewRegistryEntry.setResources(resources);

        return {template:viewRegistryEntry.template,data};
      });
    });
  }

  composeBehavior(container,instruction,ctx) {

    //get current element
    var element = container.get(Element);

    var behavior = element.primaryBehavior;

    element.innerHTML = "";

    //skip if element doesn't have a behavior
    if(!behavior) return;
    var viewSlot = container.get(ViewSlot);

    instruction.viewSlot = viewSlot;
    instruction.viewModel = behavior;
    var context = ctx||container.executionContext;
    instruction.executionContext = context;

    return this.processInstruction(context,instruction).then(viewFactory=>{
      behavior.behavior.viewFactory = viewFactory;
      viewSlot.bind(context)
    });
  }

  loadText(view){
    return this.loader.loadText(view);
  }

  loadViewFactory(view){
    return this.viewEngine.loadViewFactory(view);
  }

  composeViewFactory(container,ctx,viewFactory){
    var viewSlot = container.get(ViewSlot);
    viewSlot.removeAll();
    viewSlot.swap(viewFactory.create(container,ctx));
    //viewSlot.bind(container.executionContext);
  }

  /**
   * Dynamically process the contents of a behavior that has @skipContentProcessing
   *
   * @param element
   * @param executionContext
   */
  processElementContents(element){
    var behavior = this.element.primaryBehavior;
    //skip if element doesn't have a behavior
    if(!behavior) return;
    //skip if element already has a viewFactory
    if(behavior.viewFactory) return;

    //create a new fragment to pass to the viewCompiler
    var fragment = document.createDocumentFragment();
    var c = document.createElement("div");
    c.innerHTML = this.element.innerHTML;
    fragment.appendChild(c);

    //empty the current contents
    this.element.innerHTML = "";

    //create a new ViewFactory and add it to the element's behavior
    var viewFactory = this.viewCompiler.compile(fragment, this.resources);
    behavior.behavior.viewFactory = viewFactory;

    var view = viewFactory.create(this.container,behavior.executionContext);

    this.viewSlot.add(view);
    this.viewAttached();
  }

  /**
   * Dynamically process the contents of a behavior that has @skipContentProcessing
   *
   * @param container {Container}    DI container of the VM
   */
  processBehavior(container){
    //get current element
    var element = container.get(Element);

    var i,l;

    var behavior = element.primaryBehavior;
    //skip if element doesn't have a behavior
    if(!behavior) return;
    //skip if element already has a viewFactory
    if(behavior.viewFactory) return;

    //get associated viewslot and resources
    var viewSlot = container.get(ViewSlot);
    var resources = container.get(ViewResources);

    //create a new fragment to pass to the viewCompiler
    var fragment = document.createDocumentFragment();

    var c = document.createElement("div");
    c.innerHTML = element.innerHTML;
    //fragment.appendChild(c);
    for(i = 0, l = c.children.length; i < l; i++){
     var child = c.children[i];
     if(child) fragment.appendChild(child);
    }

    //clone the node (this errors into an endless loop)
    //fragment.appendChild(element.cloneNode(true));


    /*for(i = 0, l = element.children.length; i < l; i++){
      var child = element.children[i];
      console.log('child',child);
      if(child) fragment.appendChild(child);
    }*/

    //clear targets in the current template
    var targets = fragment.querySelectorAll('.au-target');
    for(i = 0, l = targets.length; i < l; i++){
      var target = targets[i];
      target.classList.remove('au-target');
    }

    //empty the current contents
    element.innerHTML = "";

    //create a new ViewFactory and add it to the element's behavior
    var viewFactory = this.viewCompiler.compile(fragment, resources);
    behavior.behavior.viewFactory = viewFactory;
    //viewSlot.isAttached = false;

    //var instructables = fragment.querySelectorAll('.au-target');
    //console.log('instructables', instructables);
    //console.log('instructions', viewFactory.instructions);

    //create the view and add it to the viewslot
    var view = viewFactory.create(container,behavior.executionContext.executionContext||behavior.executionContext);
    viewSlot.add(view);
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
    let slot = new ViewSlot(element, true);

    var fragment = document.createDocumentFragment();
    var c = document.createElement("div");
    c.innerHTML = element.innerHTML;
    fragment.appendChild(c);

    var view = this.viewCompiler.compile(fragment, this.resources).create(this.container, ctx);
    slot.add(view);
    slot.attached();
    return slot;
  }


  compile2(element, ctx = null,viewSlot = null,template=null) {
    element.classList.remove('au-target');
    var view = this.viewCompiler.compile(template, this.resources).create(this.container, ctx);
    viewSlot.add(view);
    if(ctx.viewAttached) ctx.viewAttached();
    return viewSlot;
  }

  /**
   * Loads a view model and it's resources.
   *
   * @param moduleId
   * @returns {Promise} return a registry entry
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
