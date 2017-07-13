/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
import '../static/styles.css';
import 'font-awesome/css/font-awesome.css';

import 'sn-controls-aurelia';
import 'aurelia-validation';

import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import { Repository } from 'sn-client-js';
import { waitForMaterialize } from 'utils';

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature(PLATFORM.moduleName('components/index'))
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('sn-controls-aurelia'))
    .plugin(PLATFORM.moduleName('aurelia-resize'));

  // Uncomment the line below to enable animation.
  aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  aurelia.container.registerSingleton(Repository.BaseRepository, () => new Repository.SnRepository(
    {
      JwtTokenPersist: 'expiration',
      RepositoryUrl: 'https://sn-local'
    }));

  await waitForMaterialize();

  await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}
