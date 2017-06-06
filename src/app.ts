import { Aurelia, autoinject } from 'aurelia-framework';
import { Router, RouterConfiguration, PipelineStep, 
  NavigationInstruction, Next, Redirect } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';
import { Repository, Authentication } from 'sn-client-js';

const ROLE_LOGGED_IN: string = 'ROLE_LOGGED_IN';
const ROLE_VISITOR_ONLY: string = 'ROLE_VISITOR_ONLY';

@autoinject
export class App {

  router: Router;
  constructor(private snService: Repository.BaseRepository<any, any>) { }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'sensenet explore';
    config.addAuthorizeStep(SnClientAuthorizeStep);
    config.map([
      { route: ['', 'welcome'], name: 'welcome',      moduleId: PLATFORM.moduleName('./welcome'),     title: 'Welcome',      settings: { show: true, roles: [] },                 nav: true},
      { route: 'demo',          name: 'demo',        moduleId: PLATFORM.moduleName('./demo/demo'),       title: 'Demos',       settings: { show: true, roles: [] }, nav: true},
      { route: 'login',         name: 'login',        moduleId: PLATFORM.moduleName('./account/login'),       title: 'Log in',       settings: { show: true, roles: [ROLE_VISITOR_ONLY] }, nav: true},
      // { route: 'users',         name: 'users',        moduleId: PLATFORM.moduleName('./users'),       title: 'Github Users', settings: { show: true, roles: [ROLE_LOGGED_IN] },   nav: true},
      // { route: 'child-router',  name: 'child-router', moduleId: PLATFORM.moduleName('./child-router'),title: 'Child Router', settings: { show: true, roles: [ROLE_LOGGED_IN] },   nav: true},
      { route: 'logout',        name: 'logout',       moduleId: PLATFORM.moduleName('./account/logout'),      title: 'Log out',      settings: { show: true, roles: [ROLE_LOGGED_IN] },   nav: true},
    ]);

    this.router = router;
  }

  attached(){
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
  }
}

@autoinject
class SnClientAuthorizeStep implements PipelineStep {

  constructor(private snService: Repository.BaseRepository<any, any>) { }

  public run(navigationInstruction: NavigationInstruction, next: Next): Promise<any> {
    const instructions = navigationInstruction.getAllInstructions();
    const authenticationState = this.snService.Authentication.CurrentState;

    if (instructions.some(i => i.config.settings.roles.indexOf(ROLE_LOGGED_IN) !== -1)) {
      if (authenticationState !== Authentication.LoginState.Authenticated) {
        return next.cancel(new Redirect('login'));
      }
    }
    if (instructions.some(i => i.config.settings.roles.indexOf(ROLE_VISITOR_ONLY) !== -1)){
      if (authenticationState !== Authentication.LoginState.Unauthenticated){
        return next.cancel();
      }
    }
    return next();
  }
}