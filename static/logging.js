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

// TODO: prettyPrintToString should return undefined for promises, arrays and
// objects. prettyPrint should construct them from DOM elements instead of
// string concatenation.

// Pretty-prints a JavaScript value to a string. Only primitives are supported;
// other types must be pretty-printed to a DOM element, and return undefined
// here.
function prettyPrintToString(value) {
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

  return undefined;
}

// Pretty-prints a JavaScript value. Returns a DOM element.
function prettyPrint(value) {
  let prettyPrintedString = prettyPrintToString(value);
  if (prettyPrintedString !== undefined)
    return document.createTextNode(prettyPrintedString);

  let span = document.createElement('span');

  if (value instanceof Array) {
    span.appendChild(document.createTextNode('['));
    for (const element of value) {
      span.appendChild(prettyPrint(element));
      span.appendChild(document.createTextNode(', '));
      // TODO(mgiuca): No comma on last.
    }
    span.appendChild(document.createTextNode(']'));
    return span;
  }

  // Treat as a dictionary.
  // TODO(mgiuca): Sort keys.
  span.appendChild(document.createTextNode('{'));
  for (const key in value) {
    if (!shouldShowProperty(value, key))
      continue;

    span.appendChild(document.createTextNode(key + ': '));
    span.appendChild(prettyPrint(value[key]));
    span.appendChild(document.createTextNode(', '));
  }
  span.appendChild(document.createTextNode('}'));
  return span;
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

  // Low-level log (takes an error param). See logMessage or logError.
  logElements(isError, ...elements) {
    // Insert a paragraph into the section.
    var p = document.createElement('p');
    this.div.appendChild(p);
    for (const element of elements) {
      let node = element;
      if (typeof(element) === 'string')
        node = document.createTextNode(element);

      p.appendChild(node);
    }

    // Also log to the console.
    if (isError)
      console.error(p.textContent);
    else
      console.log(p.textContent);
  }

  // Logs text or DOM elements into the section.
  logMessage(...elements) {
    this.logElements(false, ...elements);
  }

  // Logs text or DOM elements into the section.
  logError(...elements) {
    this.logElements(true, ...elements);
  }

  // Logs a clickable link to the given section. Returns a promise that resolves
  // when the user clicks the link.
  logClickableLink(text) {
    var a = document.createElement('a');
    a.setAttribute('href', '');
    a.appendChild(document.createTextNode(text));

    this.logElements(false, a);

    return new Promise((resolve, reject) => {
      a.addEventListener('click', e => {
        e.preventDefault();
        resolve()
      });
    });
  }
}
