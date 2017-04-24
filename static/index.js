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

// Modifies the old BeforeInstallPromptEvent.prompt() API (which resolves with
// void) to match the new specification (resolves with the user choice).
(function() {
  // Only apply the polyfill if BeforeInstallPromptEvent has a prompt method and
  // userChoice attribute (this is the old API that we are wrapping over).
  if (BeforeInstallPromptEvent === undefined ||
      !BeforeInstallPromptEvent.prototype.hasOwnProperty('prompt') ||
      !BeforeInstallPromptEvent.prototype.hasOwnProperty('userChoice')) {
    return;
  }

  const oldPrompt = BeforeInstallPromptEvent.prototype.prompt;

  BeforeInstallPromptEvent.prototype.prompt = async function() {
    oldPrompt.apply(this);
    const { outcome } = await this.userChoice;
    return {userChoice: outcome};
  }
})();

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

window.addEventListener("load", event => {
  installButton = document.querySelector("#installButton");
});

window.addEventListener("beforeinstallprompt", event => {
  // Suppress automatic prompting.
  event.preventDefault();

  // Show the (disabled-by-default) install button. This button
  // resolves the installButtonClicked promise when clicked.
  installButton.disabled = false;

  // Wait for the user to click the button.
  installButton.addEventListener("click", async e => {
    // The prompt() method can only be used once.
    installButton.disabled = true;

    // Show the prompt.
    const { userChoice } = await event.prompt();
    console.info(`user choice was: ${userChoice}`);
  });
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
    logs.logMessage('getInstalledRelatedApps error: ' + error, true);
    return;
  }
  logs.logMessage('Installed related apps:');
  for (let i = 0; i < relatedApps.length; i++) {
    let app = relatedApps[i];
    text = `id: ${JSON.stringify(app.id)}, `
           + `platform: ${JSON.stringify(app.platform)}, `
           + `url: ${JSON.stringify(app.url)}`;
    logs.logMessage(text);
  }
}

window.addEventListener('load', e => {
  showInstalledRelatedApps();
});
