
# Aurelia Dialog

This is a generic dialog component that works with any markup or style.


## Demo

- [View demo](demo)



### Load VM and compile it
    
    this.compiler.loadVM(vm).then(viewModel=>{
    
      return this.injectElement(viewModel.metadata.elementName,refNode);
      
    });
    
    injectElement(elementName,target) {
      var el = document.createElement(elementName);
      el = target.appendChild(el);
      return this.compiler.compile(el);
    }
    
    
### Load VM and create it

    this.compiler.loadVM(vm).then(viewModel=>{
        
      var behaviorInstance = viewModel.metadata.create(this.container,{},element);
      
    });
        
        
        
### compile template from string

    constructor(viewCompiler, viewSlot, viewResources) {
        this.viewCompiler = viewCompiler;
        this.viewSlot = viewSlot;
        this.viewResources = viewResources;
        this.html = 'hello world ${props.exampleProperty}';
        this.props = {
            exampleProperty: 'from gav'
        };
    }
    
    this.template = this.makeTemplateFromString(this.html);
    this.viewFactory = this.viewCompiler.compile(this.template, this.viewResources);
    this.view = this.viewFactory.create(null, this);
    this.viewSlot.add(this.view);
    
    
## Create view from viewFactory and add all children

    var view = viewModel.metadata.viewFactory.create(,viewModel.value());
    
    for(var i = 0, l = view.fragment.children.length; i < l; i++){
      var child = view.fragment.children[i];
      
      if(child && child instanceof Node) {
        el.appendChild(child);
        i--;
      }
    }
    
    
## Load template and add it's children

  
    promise = this.compiler.loadTemplate(view,el).then((result)=> {
      let {template,el:data} = result;

      refNode.innerHTML = "";
      for(var i = 0, l = template.content.children.length; i < l; i++){
        var child = template.content.children[i];

        if(child && child instanceof Node) {
          refNode.appendChild(child);
          i--;
        }
      }
      //var data = [0].outerHTML;
      //el.innerHTML = data;
    });
