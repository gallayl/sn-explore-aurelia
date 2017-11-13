import { BaseRepository } from "sn-client-js/dist/src/Repository";
import { autoinject } from "aurelia-framework";
import { Authentication } from "sn-client-js";

//import {computedFrom} from 'aurelia-framework';

@autoinject
export class Welcome {
  isLoggedIn: boolean;
  constructor(private readonly BaseRepository: BaseRepository) {
    this.BaseRepository.Authentication.State.subscribe(state => {
      this.isLoggedIn = state === Authentication.LoginState.Authenticated;
    })
  }
}

export class UpperValueConverter {
  toView(value: string): string {
    return value && value.toUpperCase();
  }
}
