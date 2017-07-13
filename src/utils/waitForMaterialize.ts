// Related issue: https://github.com/aurelia-ui-toolkits/aurelia-materialize-bridge/issues/337

export function waitForMaterialize() {
  return new Promise((resolve, reject) => {
    let iterations = 0;
    const handler = window.setInterval(() => {
      iterations++;
      let ma = (window as any).Materialize;
      if (
        ma.elementOrParentIsFixed &&
        ma.escapeHash &&
        ma.fadeInImage &&
        ma.guid &&
        ma.scrollFire &&
        ma.showStaggeredList &&
        ma.toast &&
        ma.updateTextFields
      ) {
        // console.log(`waited ${iterations} iterations for Materialize to finish loading`);
        window.clearInterval(handler);
        resolve();
      }
    }, 1);
  });
}