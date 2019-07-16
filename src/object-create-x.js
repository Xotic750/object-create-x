/* global ActiveXObject */

import attempt from 'attempt-x';

const nativeCreate = typeof Object.create === 'function' && Object.create;

let isWorking;

if (nativeCreate) {
  let res = attempt(nativeCreate, null);
  isWorking = res.threw === false && res.value && typeof res.value === 'object';

  if (isWorking) {
    // eslint-disable-next-line no-restricted-syntax,no-unused-vars
    for (const _ in res.value) {
      isWorking = false;
      // eslint-disable-next-line no-restricted-syntax
      break;
    }
  }

  if (isWorking) {
    res = attempt(nativeCreate, null, {test: {value: true}});
    isWorking = res.threw === false && res.value && typeof res.value === 'object' && res.value.test === true;
  }

  if (isWorking) {
    // Shape - superclass
    const Shape = function() {
      this.x = 0;
      this.y = 0;
    };

    // superclass method
    Shape.prototype.move = function(x, y) {
      this.x += x;
      this.y += y;

      return 'Shape moved.';
    };

    // Rectangle - subclass
    const Rectangle = function() {
      Shape.call(this); // call super constructor.
    };

    res = attempt(nativeCreate, Shape.prototype);
    isWorking = res.threw === false && res.value && typeof res.value === 'object';

    if (isWorking) {
      // subclass extends superclass
      Rectangle.prototype = res.value;
      Rectangle.prototype.constructor = Rectangle;

      const rect = new Rectangle();

      isWorking = rect instanceof Rectangle;

      if (isWorking) {
        isWorking = rect instanceof Shape;
      }

      if (isWorking) {
        isWorking = rect.move(1, 1) === 'Shape moved.';
      }
    }
  }
}

let $create;

if (isWorking) {
  $create = nativeCreate;
} else {
  const isPrimitive = require('is-primitive');
  const isUndefined = require('validate.io-undefined');
  const isNull = require('lodash.isnull');
  const isFalsey = require('is-falsey-x');
  const defineProperties = require('object-define-properties-x');
  const doc = typeof document !== 'undefined' && document;

  // Contributed by Brandon Benvie, October, 2012
  let createEmpty;
  const supportsProto = {__proto__: null} instanceof Object === false;
  // the following produces false positives
  // in Opera Mini => not a reliable check
  // Object.prototype.__proto__ === null

  if (supportsProto || isFalsey(doc)) {
    createEmpty = function() {
      return {__proto__: null};
    };
  } else {
    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    const shouldUseActiveX = function _shouldUseActiveX() {
      // return early if document.domain not set
      if (isFalsey(doc.domain)) {
        return false;
      }

      const result = attempt(function() {
        return new ActiveXObject('htmlfile');
      });

      return result.threw === false && Boolean(result.value);
    };

    // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    const getEmptyViaActiveX = function _getEmptyViaActiveX() {
      let xDoc = new ActiveXObject('htmlfile');
      xDoc.write('<script></script>');
      xDoc.close();

      const empty = xDoc.parentWindow.Object.prototype;
      xDoc = null;

      return empty;
    };

    // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150
    const getEmptyViaIFrame = function _getEmptyViaIFrame() {
      let iframe = doc.createElement('iframe');
      iframe.style.display = 'none';
      // eslint-disable-next-line no-script-url
      iframe.src = 'javascript:';

      const parent = doc.body || doc.documentElement;
      parent.appendChild(iframe);

      const empty = iframe.contentWindow.Object.prototype;
      parent.removeChild(iframe);
      iframe = null;

      return empty;
    };

    // In old IE __proto__ can't be used to manually set `null`, nor does
    // any other method exist to make an object that inherits from nothing,
    // aside from Object.prototype itself. Instead, create a new global
    // object and *steal* its Object.prototype and strip it bare. This is
    // used as the prototype to create nullary objects.
    createEmpty = function() {
      // Determine which approach to use
      // see https://github.com/es-shims/es5-shim/issues/150
      const empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

      delete empty.constructor;
      delete empty.hasOwnProperty;
      delete empty.propertyIsEnumerable;
      delete empty.isPrototypeOf;
      delete empty.toLocaleString;
      delete empty.toString;
      delete empty.valueOf;

      const E = function Empty() {};

      E.prototype = empty;
      // short-circuit future calls
      createEmpty = function() {
        return new E();
      };

      return new E();
    };
  }

  $create = function create(prototype, properties) {
    let object;
    const T = function Type() {}; // An empty constructor.

    if (isNull(prototype)) {
      object = createEmpty();
    } else {
      if (isNull(prototype) === false && isPrimitive(prototype)) {
        // In the native implementation `parent` can be `null`
        // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
        // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
        // like they are in modern browsers. Using `Object.create` on DOM elements
        // is...err...probably inappropriate, but the native version allows for it.
        throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
      }

      T.prototype = prototype;
      object = new T();
      // IE has no built-in implementation of `Object.getPrototypeOf`
      // neither `__proto__`, but this manually setting `__proto__` will
      // guarantee that `Object.getPrototypeOf` will work as expected with
      // objects created using `Object.create`
      // eslint-disable-next-line no-proto
      object.__proto__ = prototype;
    }

    if (isUndefined(properties) === false) {
      defineProperties(object, properties);
    }

    return object;
  };
}

/**
 * This method method creates a new object with the specified prototype object and properties.
 *
 * @param {*} prototype - The object which should be the prototype of the newly-created object.
 * @param {*} [properties] - If specified and not undefined, an object whose enumerable own properties
 * (that is, those properties defined upon itself and not enumerable properties along its prototype chain)
 * specify property descriptors to be added to the newly-created object, with the corresponding property names.
 * @throws {TypeError} If the properties parameter isn't null or an object.
 * @returns {boolean} A new object with the specified prototype object and properties.
 */
export default $create;
