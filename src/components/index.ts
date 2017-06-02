import { FrameworkConfiguration } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
require('./route-nav.html')

export function configure(config: FrameworkConfiguration) {
    config.globalResources([
        PLATFORM.moduleName('./route-nav.html')
    ]);
}
