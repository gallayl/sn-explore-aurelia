import {browser, by, element, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObjectWelcome {
  public getGreeting() {
    return element(by.tagName('h2')).getText();
  }

  public getFirstnameElement() {
    return element(by.valueBind('firstName'));
  }

  public setFirstname(value) {
    const firstName = this.getFirstnameElement();
    return firstName.clear().then(() => firstName.sendKeys(value));
  }

  public getLastnameElement() {
    return element(by.valueBind('lastName'));
  }

  public setLastname(value) {
    const lastName = this.getLastnameElement();
    return lastName.clear().then(() => lastName.sendKeys(value));
  }

  public getFullnameElement() {
    return element(by.css('.help-block'));
  }

  public getFullname() {
    return this.getFullnameElement().getText();
  }

  public pressSubmitButton() {
    return element(by.css('button[type="submit"]')).click();
  }

  public async openAlertDialog() {
    await this.pressSubmitButton();

    await browser.wait(ExpectedConditions.alertIsPresent(), 5000);

    try {
      await browser.switchTo().alert().accept();
      return true;
    } catch (e) {
      return false;
    }
  }
}
