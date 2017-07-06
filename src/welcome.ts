//import {computedFrom} from 'aurelia-framework';

export class Welcome {
  heading: string = 'Welcome to the sensenet ECM';
}

export class UpperValueConverter {
  toView(value: string): string {
    return value && value.toUpperCase();
  }
}
