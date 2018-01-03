import {browser, by, element} from 'aurelia-protractor-plugin/protractor';

export class PageObjectSkeleton {
  public getCurrentPageTitle() {
    return browser.getTitle();
  }

  public async navigateTo(href) {
    const navigatingReady = browser.waitForRouterComplete();
    await element(by.css('a[href="' + href + '"]')).click();
    await navigatingReady;
  }
}
