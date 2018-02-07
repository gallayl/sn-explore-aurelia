/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
import 'font-awesome/css/font-awesome.css';
import '../static/styles.css';

import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

import { Repository } from '@sensenet/client-core';
import { JwtService } from "@sensenet/authentication-jwt"
import { addGoogleAuth, GoogleOauthProvider } from '@sensenet/authentication-google';
import { localStorageLastRepoKey } from 'account/login';



const repo = new Repository(
  {
    sessionLifetime: 'expiration',
    repositoryUrl: localStorage.getItem(localStorageLastRepoKey)
  });

const jwtService = new JwtService(repo);
repo.authentication = jwtService;
const googleAuthProvider = addGoogleAuth(jwtService, {
    clientId: '590484552404-d6motta5d9qeh0ln81in80fn6mqf608e.apps.googleusercontent.com',
})

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature(PLATFORM.moduleName('components/index'))
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('@sensenet/controls-aurelia'));

  // Uncomment the line below to enable animation.
  aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  aurelia.container.registerSingleton(Repository, () => repo);
  aurelia.container.registerSingleton(JwtService, () => jwtService);
  aurelia.container.registerSingleton(GoogleOauthProvider, ()=>googleAuthProvider)

  await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}
