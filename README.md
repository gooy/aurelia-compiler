# Aurelia Compiler

A compiler service that compiles an HTML element with aurelia behaviors.

## Installation

    jspm install github:gooy/aurelia-compiler

## Usage

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
