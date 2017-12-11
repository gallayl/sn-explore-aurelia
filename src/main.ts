/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
import '../static/styles.css';
import 'font-awesome/css/font-awesome.css';

import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';

import { AddGoogleAuth } from 'sn-client-auth-google';
import { SnRepository, BaseRepository } from 'sn-client-js/dist/src/Repository';
import { ContentTypes } from 'sn-client-js';
import { User } from 'sn-client-js/dist/src/ContentTypes';

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature(PLATFORM.moduleName('components/index'))
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('sn-controls-aurelia'));

  // Uncomment the line below to enable animation.
  aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  aurelia.container.registerSingleton(BaseRepository, () => {
    const repo = new SnRepository(
      {
        JwtTokenPersist: 'expiration',
        RepositoryUrl: 'https://sn-local',
      });
    AddGoogleAuth(repo, {
      ClientId: '590484552404-d6motta5d9qeh0ln81in80fn6mqf608e.apps.googleusercontent.com',
    });
    

    return repo;
  });

  await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}
