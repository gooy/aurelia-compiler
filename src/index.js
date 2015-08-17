import {ViewCompiler,CompositionEngine,ViewResources,ViewSlot,ViewEngine, Container} from 'aurelia-framework';
import {DefaultLoader} from 'aurelia-loader-default';
import {TemplateRegistryEntry} from 'aurelia-loader';
import {ContentSelector} from 'aurelia-templating';

/**
 * Compiler service
 *
 * compiles an HTML element with aurelia
 */
export class Compiler {
  static inject() {return [ViewCompiler, CompositionEngine,ViewEngine, ViewResources, Container,DefaultLoader]}
  constructor(viewCompiler, compositionEngine,viewEngine, resources, container,loader) {
    this.viewCompiler = viewCompiler;
    this.viewEngine = viewEngine;
    this.compositionEngine = compositionEngine;
    this.resources = resources;
    this.container = container;
    this.loader = loader;
  }

  /**
   * Loads in a new view for a VM and swaps it with the current view in the viewslot.
   *
   * The transormer receives an element and should return a string.
   */
  swapView(container,view,transformer){

    let element = container.get(Element);
    let behavior = element.primaryBehavior;

    //store the original content in a document fragment
    if(!behavior.originalFragment) {
      var odata = element.innerHTML;
      if(transformer) odata = transformer(element,element.innerHTML);
      behavior.originalFragment = this.createFragment(odata);
      //var orignalViewFactory = behavior.behavior.originalViewFactory = this.viewCompiler.compile(behavior.originalFragment, resources);
      //behavior.originalView = orignalViewFactory.create(container,behavior.executionContext);
    }

    return this.loadTemplate(view).then(entry=>{
      let template = entry.template;

      var data = "";
      for(var i = 0, l = template.content.children.length; i < l; i++){
        var child = template.content.children[i];
        if(child) data += child.outerHTML;
      }

      if(transformer) data = transformer(element,data);

      //apply the template , clone the nodes as this is a template that is potentially used by many VMs
      element.innerHTML = data;

      return behavior;
    });
  }

  /**
   * Create a fragment from an HTMLElement or String
   *
   * @param element {HTMLElement|String}
   * @return {DocumentFragment}
   */
  createFragment(element){
    //create a new fragment from the current content to pass to the viewCompiler
    var fragment = document.createDocumentFragment();

    var c = document.createElement("div");
    c.innerHTML = (element instanceof HTMLElement)? element.innerHTML : element;

    var currentChild = c.firstChild, nextSibling;
    while(currentChild){
      nextSibling = currentChild.nextSibling;
      switch(currentChild.nodeType){
        case 1:
          fragment.appendChild(currentChild);
          break;
      }
      currentChild = nextSibling;
    }

    return fragment;
  }

  /**
   * Create a new View from an element's innerHTML and add swap it with current viewslot contents.
   *
   * @param container {Container}     DI container of the VM
   * @param ctx {executionContext}    the execution context to bind to (will use the behavior's execution context by default)
   *
   * @return {BehaviorInstance}   The primary behavior associated with the element
   */
  processBehavior(container,ctx){
    //get current element
    var element = container.get(Element);

    var behavior = element.primaryBehavior;

    //skip if element doesn't have a behavior
    if(!behavior) return;
    //skip if element already has a viewFactory
    if(behavior.viewFactory) return;

    behavior.isAttached = false;

    //get associated viewslot and resources
    var viewSlot = container.get(ViewSlot);
    var resources = container.get(ViewResources);

    //var viewFactory = behavior.behavior.viewFactory;

    //create a new viewFactory for the current element contents
    var fragment = this.createFragment(element);

    //clear targets in the current template
    var targets = fragment.querySelectorAll('.au-target');
    for(var i = 0, l = targets.length; i < l; i++){
      var target = targets[i];
      target.classList.remove('au-target');
    }

    //create a new ViewFactory and add it to the element's behavior
    var viewFactory = behavior.behavior.viewFactory = this.viewCompiler.compile(fragment, resources);

    //empty the current contents
    element.innerHTML = "";

    //create a view from the template and add it to the viewslot
    var view = viewFactory.create(container,ctx||behavior.executionContext);
    viewSlot.add(view);
    viewSlot.attached();

    //add view to the behavior
    behavior.view = view;

    //process contentSelectors
    ContentSelector.applySelectors(
      {fragment:behavior.originalFragment},
      view.contentSelectors,
      (contentSelector, group) => contentSelector.add(group)
    );
    behavior.contentView = behavior.originalView;

    return behavior;
  }

  /**
   * Compile an element
   * the element should be available in the main resource registry or
   * in the registry of the execution context passed as the second parameter.
   *
   * @param element {HTMLElement}     element to compile
   * @param ctx {Object}              execution context
   * @param viewSlot {ViewSlot}       viewslot to add the view to (if null a new one will be created)
   * @param templateOrFragment {HTMLTemplateElement|DocumentFragment}
   *        specify what content to use with the element (if null the element's content will be used)
   *
   * @returns {ViewSlot}
   */
  compile(element, ctx = null,viewSlot = null,templateOrFragment=null) {
    element.classList.remove('au-target');

    if(!templateOrFragment){
      var templateOrFragment = document.createDocumentFragment();
      var c = document.createElement("div");
      c.innerHTML = element.innerHTML;
      templateOrFragment.appendChild(c);
    }
    var view = this.viewCompiler.compile(templateOrFragment, this.resources).create(this.container, ctx);

    if(!viewSlot) viewSlot = new ViewSlot(element, true);

    viewSlot.add(view);
    viewSlot.attached();
    return viewSlot;
  }

  //------------------ Composing instructions

  /**
   * compose an alement with a new instruction
   *
   * @param element         an HTMLElement where the instuction will be added to.
   * @param instruction     the instruction to process
   * @param ctx             an exectution context
   * @returns {*}
   */
  composeElementInstruction(element,instruction,ctx) {
    instruction.viewSlot = instruction.viewSlot ||new ViewSlot(element, true,ctx);
    return this.processInstruction(ctx,instruction);
  }

  /**
   * compose an existing behaviour with a new instruction
   *
   * @param container       the DI container of the behavior (the instruction will be added to it's element)
   * @param instruction     the instruction to process
   * @param ctx             the exectution context
   * @returns {*}
   */
  composeBehaviorInstruction(container,instruction,ctx) {

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

  //------------------ Loading helpers

  /**
   * Load a moduleId as plain text
   *
   * @param url      path to a view file
   * @returns {String}
   */
  loadText(url){
    return this.loader.loadText(url);
  }

  /**
   * Load a moduleId as a view factory
   *
   * @param view      path to a view file
   * @returns {ViewFactory}
   */
  loadViewFactory(view){
    return this.viewEngine.loadViewFactory(view);
  }

  /**
   * Load a template and return a view registry entry
   *
   * @param urlOrRegistryEntry
   * @param associatedModuleId
   * @returns {viewRegistryEntry}
   */
  loadTemplate(urlOrRegistryEntry, associatedModuleId){
    return ensureRegistryEntry(this.loader, urlOrRegistryEntry).then(viewRegistryEntry => {
      if(viewRegistryEntry.isReady){
        return viewRegistryEntry.factory;
      }

      return this.viewEngine.loadTemplateResources(viewRegistryEntry, associatedModuleId).then(resources => {
        if(viewRegistryEntry.isReady){
          return viewRegistryEntry.factory;
        }

        viewRegistryEntry.setResources(resources);

        return viewRegistryEntry;
      });
    });
  }

  /**
   * Loads in View and View Model resources and returns the registry entry for the VM
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

  /**
   * Process an instruction
   * @param ctx
   * @param instruction
   * @returns {*}
   */
  processInstruction(ctx, instruction){

    instruction.container = instruction.container||ctx.container||this.container;
    instruction.executionContext = instruction.executionContext||ctx||this.executionContext;
    instruction.viewSlot = instruction.viewSlot||ctx.viewSlot||this.viewSlot;
    instruction.viewResources = instruction.viewResources||ctx.viewResources||this.viewResources;
    instruction.currentBehavior = instruction.currentBehavior||ctx.currentBehavior||this.currentBehavior;

    return this.compositionEngine.compose(instruction).then(next => {
      ctx.currentBehavior = next;
      ctx.currentViewModel = next ? next.executionContext : null;
    });
  }

}

function ensureRegistryEntry(loader, urlOrRegistryEntry){
  if(urlOrRegistryEntry instanceof TemplateRegistryEntry){
    return Promise.resolve(urlOrRegistryEntry);
  }

  return loader.loadTemplate(urlOrRegistryEntry);
}
