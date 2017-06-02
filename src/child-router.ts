import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';

export class ChildRouter {
  router: Router;

  heading = 'Child Router';

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: ['', 'welcome'], name: 'welcome',      moduleId: PLATFORM.moduleName('./welcome'),      settings: {roles: []}, nav: true, title: 'Welcome' },
      { route: 'users',         name: 'users',        moduleId: PLATFORM.moduleName('./users'),        settings: {roles: []}, nav: true, title: 'Github Users' },
      { route: 'child-router',  name: 'child-router', moduleId: PLATFORM.moduleName('./child-router'), settings: {roles: []}, nav: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
}
