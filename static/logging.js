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

// Database of known built-in types and the "important" properties to log.
BUILT_IN_PROPERTY_MAP = {
  'BeforeInstallPromptEvent': ['platforms', 'userChoice'],
};

// Determines whether a particular property (key) should be shown for an object.
function shouldShowProperty(object, key) {
  if (!object.constructor)
    return true;

  let name = object.constructor.name;
  let allowedKeys = BUILT_IN_PROPERTY_MAP[name];
  if (allowedKeys === undefined)
    return true;

  return allowedKeys.includes(key);
}

// Pretty-prints a JavaScript value, to a string.
function prettyPrint(value) {
  let type = typeof(value);
  if (value === undefined || value === null || type === 'boolean' ||
      type === 'number' || type === 'string') {
    return JSON.stringify(value);
  }

  if (type === 'function')
    return '<function>';

  if (type !== 'object')
    return value.toString();

  // TODO(mgiuca): Automatically reveal the value of the promise, once it
  // resolves.
  if (value instanceof Promise)
    return '<promise>';

  if (value instanceof Array) {
    let elementStrings = [];
    for (const element of value)
      elementStrings.push(prettyPrint(element));
    return '[' + elementStrings.join(', ') + ']';
  }

  // Treat as a dictionary.
  let elementStrings = [];
  for (const key in value) {
    if (!shouldShowProperty(value, key))
      continue;

    elementStrings.push(key + ': ' + prettyPrint(value[key]));
  }
  elementStrings.sort();
  return '{' + elementStrings.join(', ') + '}';
}

class LogSection {
  // Creates a new <div> for logs relating to a particular function.
  constructor(logsDiv, title) {
    this.div = document.createElement('div');
    logsDiv.appendChild(this.div);
    this.div.className = 'log-section';

    let titleH2 = document.createElement('h2');
    this.div.appendChild(titleH2);
    titleH2.appendChild(document.createTextNode(title));
  }

  // Logs a message to the given section, and console.
  logMessage(message, isError) {
    // Insert a paragraph into the section.
    var p = document.createElement('p');
    this.div.appendChild(p);
    p.appendChild(document.createTextNode(message));
    if (isError)
      p.className = 'error';

    // Also log to the console.
    if (isError)
      console.error(message);
    else
      console.log(message);
  }

  // Logs a clickable link to the given section. Returns a promise that resolves
  // when the user clicks the link.
  logClickableLink(text) {
    // Insert a paragraph into the section.
    var p = document.createElement('p');
    this.div.appendChild(p);
    var a = document.createElement('a');
    p.appendChild(a);
    a.setAttribute('href', '');
    a.appendChild(document.createTextNode(text));

    return new Promise((resolve, reject) => {
      a.addEventListener('click', e => {
        e.preventDefault();
        resolve()
      });
    });
  }
}
