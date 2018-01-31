import { autoinject } from "aurelia-framework";
import { Repository, LoginState } from "@sensenet/client-core";

//import {computedFrom} from 'aurelia-framework';

@autoinject
export class Welcome {
  isLoggedIn: boolean;
  constructor(private readonly repository: Repository) {
    this.repository.authentication.state.subscribe(state => {
      this.isLoggedIn = state === LoginState.Authenticated;
    }, true)
  }
}

export class UpperValueConverter {
  toView(value: string): string {
    return value && value.toUpperCase();
  }
}
