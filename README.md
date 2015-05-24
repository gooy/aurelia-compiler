# Aurelia Compiler

A compiler service that compiles an HTML element with aurelia behaviors.

## Installation

    jspm install github:gooy/aurelia-compiler

## Usage


### compile function

Inject the service and use it.

```javascript
import {Compiler} from 'gooy/aurelia-compiler';

export class Test(){
  static inject = [Element,Compiler];
  constructor(element,compiler) {
    this.element = element;
    var markdown = document.createElement("markdown");
    this.element.appendChild(markdown);
    compiler.compile(markdown);
  }
}
```

### composeElement function

This function allows you to compose an existing element with a new instruction.

It can be used to create View Models without a view (@noView) and then specify a view for it dynamically.

Below as an example of one of it's use cases:


```markup
<modal view="foundation-modal.html"></modal>
```

The markup is just a modal custom element, but you can specify the `view` that will be used for it.
The view is composed using an instruction that attaches itself to the existing VM.


```javascript
import {bindable,noView} from 'aurelia-framework';
import {Compiler} from 'gooy/aurelia-compiler';

@noView
export class ModalCustomElement{
    @bindable view = "bootstrap-modal.html";

    static inject = [Compiler,Element];
    constructor(compiler,element) {
        this.compiler = compiler;
        this.element = element;
    }
    
    attached(){
      this.compiler.composeElement(this.element,this,{view:this.view});
    }
}
```

Note: It's best to compose the element in the `attached` handler.

There are multiple ways the `composeElement` function can be used, more use examples of it will be added later.
