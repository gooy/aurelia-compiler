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

Below as an example of one of it's use cases:


```markup
<modal view="foundation-modal.html"></modal>
```

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
    bind(){
         this.compiler.composeElement(this.element,this,{view:this.view});
    }
}
```
