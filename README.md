# Aurelia Compiler

A compiler service that compiles an HTML element with aurelia behaviors.

This is used for various methods of dynamically compiling strings, behaviors and instructions with Aurelia.

## Installation

    jspm install github:gooy/aurelia-compiler

## Usage

Please look at the source code to gain an understanding of how this library works.

Below is some examples and explanation on how some of the methods work.


### compile

This allows an element to be dynamically created and compiled with Aurelia.

```javascript
import {Compiler} from 'gooy/aurelia-compiler';

export class Test{
   
   static inject = [Element,Compiler]
   constructor(element,compiler){
     this.element = element;
     this.compiler = compiler;
   }
   
   attached(){
     var el = document.createElement("my-custom-element");
     el.setAttribute("some-option",value);
     this.element.appendChild(el);
     this.compiler.compile(el);
   }
}
```

Note: make sure the custom element is available in the current execution context either by using `<require>` or `aurelia.globalizeResources`

Please refer to [this issue](https://github.com/gooy/aurelia-compiler/issues/3#issuecomment-112182705) for some more insight.

### swapView

Loads in a new view for a VM and swaps it with the current view in the viewslot.

```javascript
import {Compiler} from 'gooy/aurelia-compiler';

export class TestCustomElement{
   
   static inject = [Element,Compiler]
   constructor(element,compiler){
     this.element = element;
     this.compiler = compiler;
   }
   
   attached(){
     this.compiler.swapView("some-other-view.html");
   }
}

```

Note: you will most likely want to compile the new view after it has been swapped.
use the `processBehavior` to do that.

### processBehavior

Create a new View from an element's innerHTML and add swap it with current viewslot contents.

```javascript
import {Compiler} from 'gooy/aurelia-compiler';
import {Container} from 'aurelia-framework';

export class TestCustomElement{
   
   static inject = [Element,Compiler,Container]
   constructor(element,compiler){
     this.element = element;
     this.compiler = compiler;
   }
   
   attached(){
     this.compiler.swapView("some-other-view.html").then(behavior=>{
        this.compiler.processBehavior(this.container,this);
     });
   }
}
```

### composeElementInstruction

Allows an element to be compiled with an instruction.


A use case for this is to allow the user to specify through the templating which view to use with a custom element.

For example:
```markup
<test view="some-other-view.html"></test>
```

The code for the custom element would look like this.

```javascript
import {bindable,noView} from 'aurelia-framework';
import {Compiler} from 'gooy/aurelia-compiler';

@noView
export class TestCustomElement{
   
   @bindable view = "default-view.html";
   
   static inject = [Element,Compiler]
   constructor(element,compiler){
     this.element = element;
     this.compiler = compiler;
   }
   
   attached(){
        this.compiler.composeElementInstruction(this.element,{ view:this.view},this);
   }
}
```

A similar function is available called `composeBehaviorInstruction` which allows you to pass a container and ommit the execution context.

Please have a look at the jsdoc blocks in the source code for more details on the arguments.


## Helper functions

### Create Fragment

Create a fragment from an HTMLElement or String

```javascript
import {Compiler} from 'gooy/aurelia-compiler';

export class Test{
   
   static inject = [Element,Compiler]
   constructor(element,compiler){
     this.element = element;
     this.compiler = compiler;
   }
   
   attached(){
        //create fragment from an element
        var documentFragment = this.compiler.createFragment(this.element);
        
        //create fragment from a string
        var documentFragment = this.compiler.createFragment("<div></div>");
   }
}
```


### loadText

Uses the Aurelia loader to load in some text.

```
var data = compiler.loadText("some-view.html");

var googleData = compiler.loadText("http://www.google.com");
```


### loadViewFactory

loads in a module and creates a viewFactory from it

```
var viewFactory = compiler.loadViewFactory("some-view.html");
```

### loadTemplate

loads in a module, register it as a template and return the viewRegistryEntry

```
var registryEntry = compiler.loadTemplate("some-view.html");
```

### loadVM

loads in a module and it's resources and return the registry entry.

```
var registryEntry = compiler.loadVM("some-view-model");
```
