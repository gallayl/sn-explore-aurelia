import { Aurelia, autoinject, bindable } from 'aurelia-framework';
import {
  Router, RouterConfiguration, PipelineStep,
  NavigationInstruction, Next, Redirect
} from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';
import { Repository, Authentication } from 'sn-client-js';
import { ContentLogger } from "utils";

import { MDCToolbar } from "@material/toolbar";

const ROLE_LOGGED_IN: string = 'ROLE_LOGGED_IN';
const ROLE_VISITOR_ONLY: string = 'ROLE_VISITOR_ONLY';

@autoinject
export class App {

  router: Router;
  constructor(private snService: Repository.BaseRepository, private logger: ContentLogger) { }
  @bindable
  toolbarRef: HTMLElement;


  public darkthemeChanged(newValue: boolean){
    localStorage.setItem('sn-dark-theme', newValue ? 'true' : 'false')
    this.updateTheme();
  }

  public updateTheme(){
    document.documentElement.className = this.darktheme ? "mdc-theme--dark" : "";
    document.documentElement.style.setProperty('--mdc-theme-primary', this.darktheme ? '#004D6E' : '#0393D0');
    document.documentElement.style.setProperty('--mdc-theme-secondary', this.darktheme ? '#165C39' : '#2CB471');
  }

  @bindable
  public darktheme: boolean = localStorage.getItem('sn-dark-theme') === 'true';

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'sensenet explore';
    config.addAuthorizeStep(SnClientAuthorizeStep);
    config.fallbackRoute('');
    config.map([
      { route: ['', 'welcome'], name: 'welcome', moduleId: PLATFORM.moduleName('./welcome'), title: 'Welcome', settings: { show: true, roles: [], icon: 'home' }, nav: true },
      { route: 'demo', name: 'demo', moduleId: PLATFORM.moduleName('./demo/demo'), title: 'Demos', settings: { show: true, roles: [], icon: 'slideshow' }, nav: true },
      { route: 'login', name: 'login', moduleId: PLATFORM.moduleName('./account/login'), title: 'Log in', settings: { show: true, roles: [ROLE_VISITOR_ONLY], icon: 'person' }, nav: true },
      { route: ['explore/*path', 'explore'], href:'#explore', name: 'explore', moduleId: PLATFORM.moduleName('./explore/explore'), title: 'Explore', settings: { show: true, roles: [ROLE_LOGGED_IN], icon: 'apps' }, nav: true },
      { route: 'logout', name: 'logout', moduleId: PLATFORM.moduleName('./account/logout'), title: 'Log out', settings: { show: true, roles: [ROLE_LOGGED_IN], icon: 'exit_to_app' }, nav: true },
    ]);

    this.router = router;
  }

  attached() {
    this.updateTheme();
   
    this.snService.Authentication.State.subscribe(state => {
      this.router.routes.filter(route => route.settings.roles.indexOf(ROLE_LOGGED_IN) > -1)
        .forEach(route => {
          route.settings.show = state === Authentication.LoginState.Authenticated;
        });
      this.router.routes.filter(route => route.settings.roles.indexOf(ROLE_VISITOR_ONLY) > -1)
        .forEach(route => {
          route.settings.show = state === Authentication.LoginState.Unauthenticated;
        })
    })
    const toolbar: MDCToolbar = new MDCToolbar(this.toolbarRef);
  }
}

@autoinject
class SnClientAuthorizeStep implements PipelineStep {

  constructor(private snService: Repository.BaseRepository) { }

  public async run(navigationInstruction: NavigationInstruction, next: Next): Promise<any> {
    const instructions = navigationInstruction.getAllInstructions();
    return new Promise((resolve, reject) => {
      this.snService.Authentication.State
      .skipWhile(state => state === Authentication.LoginState.Pending)
      .subscribe(authenticationState => {
        if (instructions.some(i => i.config.settings.roles.indexOf(ROLE_LOGGED_IN) !== -1)) {
          if (authenticationState !== Authentication.LoginState.Authenticated) {
            return resolve(next.cancel(new Redirect('login')));
          }
        }
        if (instructions.some(i => i.config.settings.roles.indexOf(ROLE_VISITOR_ONLY) !== -1)) {
          if (authenticationState !== Authentication.LoginState.Unauthenticated) {
            return resolve(next.cancel(new Redirect('')));
          }
        }
        return resolve(next());
      });
    })
  }
}