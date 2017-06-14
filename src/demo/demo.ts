import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';

export class Demo {
    router: Router;

    configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            { route: ['', 'content-crud'], name: 'content-crud', moduleId: PLATFORM.moduleName('./content-crud'), settings: { roles: [], show: true }, nav: true, title: 'Content CRUD' },
        ]);

        this.router = router;
    }
}