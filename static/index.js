// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(registration => {
    // Registration was successful
    console.log('ServiceWorker registration successful with scope: ',    registration.scope);
  }).catch(err => {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });
}

// Creates a promise that resolves after a given number of milliseconds.
function sleep(milliseconds) {
  return new Promise((resolve, reject) => {
      window.setTimeout(resolve, milliseconds);
  });
}

// Creates a new <div> for logs relating to a particular function.
function createLogSection(title) {
  return new LogSection(document.querySelector('#logs'), title);
}

async function logUserChoice(section, e) {
  section.logMessage('userChoice is: ', prettyPrint(e.userChoice));
  await sleep(1000);
  if (!e) {
    section.logError('No event????');
    return;
  }

  section.logMessage('Timer time!');
  try {
    let result = await e.userChoice;
    section.logMessage('userChoice resolved with: ', prettyPrint(result));
  } catch (e) {
    section.logError('userChoice rejected with: ', prettyPrint(e));
  }
}

window.addEventListener('beforeinstallprompt', async e => {
  let logs = createLogSection('beforeinstallprompt');
  logs.logMessage('Got beforeinstallprompt: ', prettyPrint(e));
  logs.logMessage('Should I cancel it? Hmmmm .... ');

  if (Math.random() > 0.5) {
    logs.logMessage('Yeah why not. Cancelled!');
    e.preventDefault();
    await logs.logClickableLink('Show the prompt after all.');
    try {
      let result = await e.prompt();
      logs.logMessage('prompt() resolved with: ', prettyPrint(result));
    } catch (ex) {
      logs.logError('prompt() rejected with: ', prettyPrint(ex));
    }
    logUserChoice(logs, e);
    return;
  }

  logs.logMessage('No, let\'s see the banner');
  logUserChoice(logs, e);
});

window.addEventListener('appinstalled', e => {
  let logs = createLogSection('appinstalled');
  logs.logMessage('Got appinstalled!!!');
});

async function showInstalledRelatedApps() {
  let logs = createLogSection('getInstalledRelatedApps');
  if (navigator.getInstalledRelatedApps === undefined) {
    logs.logMessage('navigator.getInstalledRelatedApps is undefined');
    return;
  }

  let relatedApps;
  try {
    relatedApps = await navigator.getInstalledRelatedApps();
  } catch (error) {
    logs.logError('getInstalledRelatedApps error: ', prettyPrint(error));
    return;
  }
  logs.logMessage('getInstalledRelatedApps returned: ',
                  prettyPrint(relatedApps));
}

window.addEventListener('load', e => {
  showInstalledRelatedApps();

  // Set "continue" URL for POST-and-redirect button.
  let continueUrl = new URL(document.location);
  continueUrl.hash = '';
  document.querySelector('#continue_field').value = continueUrl;

  if (document.location.hash == '#cameBack') {
    document.querySelector('#cameback').style.display = 'block';
  }
});
