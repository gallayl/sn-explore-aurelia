import { autoinject, bindable } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import {
  NavigationInstruction, Next, PipelineStep,
  Redirect, Router, RouterConfiguration
} from 'aurelia-router';

import { MDCToolbar } from "@material/toolbar";
import { Role, RoleHelper } from 'utils/role-helper';

@autoinject
export class App {

  public router: Router;
  constructor(private roleHelper: RoleHelper) { }
  @bindable
  public toolbarRef: HTMLElement;

  public darkthemeChanged(newValue: boolean) {
    localStorage.setItem('sn-dark-theme', newValue ? 'true' : 'false');
    this.updateTheme();
  }

  public updateTheme() {
    document.documentElement.className = this.darktheme ? "mdc-theme--dark" : "";
    document.documentElement.style.setProperty('--mdc-theme-primary', this.darktheme ? '#004D6E' : '#0393D0');
    document.documentElement.style.setProperty('--mdc-theme-secondary', this.darktheme ? '#165C39' : '#2CB471');
  }

  @bindable
  public darktheme: boolean = localStorage.getItem('sn-dark-theme') === 'true';

  public configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'sensenet explore';
    config.addAuthorizeStep(SnClientAuthorizeStep);
    config.fallbackRoute('');
    config.map([
      { route: ['', 'welcome'], name: 'welcome', moduleId: PLATFORM.moduleName('./welcome', 'welcome'), title: 'Welcome', settings: { show: true, roles: [], icon: 'home' }, nav: true },
      { route: 'demo', name: 'demo', moduleId: PLATFORM.moduleName('./demo/demo', 'demo'), title: 'Demos', settings: { show: true, roles: [], icon: 'slideshow' }, nav: true },
      { route: 'login', name: 'login', moduleId: PLATFORM.moduleName('./account/login', 'login'), title: 'Log in', settings: { show: true, roles: [Role.IsVisitor], icon: 'person' }, nav: true },
      { route: ['explore/*path', 'explore'], href: '#explore', name: 'explore', moduleId: PLATFORM.moduleName('./explore/explore', 'explore'), title: 'Explore', settings: { show: true, roles: [Role.IsExploreUser], icon: 'apps' }, nav: true },
      { route: 'logout', name: 'logout', moduleId: PLATFORM.moduleName('./account/logout', 'logout'), title: 'Log out', settings: { show: true, roles: [Role.IsLoggedIn], icon: 'exit_to_app' }, nav: true },
    ]);

    this.router = router;
  }

  public attached() {
    this.updateTheme();

    this.roleHelper.OnRolesChanged.subscribe(() => {
      this.router.routes.forEach(async (route) => {
        route.settings.show = true;
        for (const role of route.settings.roles) {
          const isInRole = await this.roleHelper.IsInRole(role);
          if (!isInRole) {
            route.settings.show = false;
          }
        }
      });
    });
    // tslint:disable-next-line:no-unused-expression
    new MDCToolbar(this.toolbarRef);
  }
}

@autoinject
class SnClientAuthorizeStep implements PipelineStep {

  constructor(private roleHelper: RoleHelper) { }

  public async run(navigationInstruction: NavigationInstruction, next: Next): Promise<any> {
    const instructions = navigationInstruction.getAllInstructions();
    return new Promise(async (resolve) => {
      for (const role in Role) {
        if (instructions.some((i) => i.config.settings.roles.indexOf(role) !== -1)) {
          const isInRole = await this.roleHelper.IsInRole(role as Role);
          if (!isInRole) {
            return resolve(next.cancel(new Redirect(role === Role.IsLoggedIn ? 'login' : '')));
          }
        }
      }
      return resolve(next());
    });
  }
}
