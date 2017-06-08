import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';

export class Demo {
    router: Router;

    heading = 'Demo Contents';

    configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            { route: ['', 'task'], name: 'task', moduleId: PLATFORM.moduleName('./task'), settings: { roles: [], show: true }, nav: true, title: 'Task' },
            { route: ['user'], name: 'user', moduleId: PLATFORM.moduleName('./user'), settings: { roles: [], show: true }, nav: true, title: 'User' },

        ]);

        this.router = router;
    }
}