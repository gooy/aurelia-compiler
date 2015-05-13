# Aurelia Compiler

A compiler service that compiles an HTML element with aurelia behaviors.

## Installation

    jspm install gooy/aurelia-compiler

## Usage

inject the service and use it.

```javascript
import {Compiler} from 'gooy/aurelia-compiler';

export class Test(){
  static inject = [Compiler];
  constructor(compiler) {
    
    compiler.compile(el);
  }
}
```
