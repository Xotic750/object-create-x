function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import attempt from 'attempt-x';
import isPrimitive from 'is-primitive';
import defineProperties from 'object-define-properties-x';
import toBoolean from 'to-boolean-x';
var ObjectCtr = {}.constructor;
var nCreate = ObjectCtr.create;
var nativeCreate = typeof nCreate === 'function' && nCreate;
var isWorking;

if (nativeCreate) {
  var res = attempt(nativeCreate, null);
  isWorking = res.threw === false && res.value && _typeof(res.value) === 'object';

  if (isWorking) {
    /* eslint-disable-next-line guard-for-in,no-restricted-syntax,no-unused-vars */
    // noinspection LoopStatementThatDoesntLoopJS
    for (var _ in res.value) {
      isWorking = false;
      break;
    }
  }

  if (isWorking) {
    res = attempt(nativeCreate, null, {
      test: {
        value: true
      }
    });
    isWorking = res.threw === false && res.value && _typeof(res.value) === 'object' && res.value.test === true;
  }

  if (isWorking) {
    // Shape - superclass
    var Shape = function Shape() {
      // noinspection JSUnusedGlobalSymbols
      this.x = 0; // noinspection JSUnusedGlobalSymbols

      this.y = 0;
    }; // superclass method


    Shape.prototype.move = function move(x, y) {
      // noinspection JSUnusedGlobalSymbols
      this.x += x; // noinspection JSUnusedGlobalSymbols

      this.y += y;
      return 'Shape moved.';
    }; // Rectangle - subclass


    var Rectangle = function Rectangle() {
      Shape.call(this); // call super constructor.
    };

    res = attempt(nativeCreate, Shape.prototype);
    isWorking = res.threw === false && res.value && _typeof(res.value) === 'object';

    if (isWorking) {
      // subclass extends superclass
      Rectangle.prototype = res.value;
      Rectangle.prototype.constructor = Rectangle;
      var rect = new Rectangle();
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


var $create;

if (isWorking) {
  $create = nativeCreate;
} else {
  var doc = typeof document !== 'undefined' && document; // Contributed by Brandon Benvie, October, 2012

  var createEmpty;
  var supportsProto = !({
    __proto__: null
  } instanceof ObjectCtr); // the following produces false positives
  // in Opera Mini => not a reliable check
  // Object.prototype.__proto__ === null

  if (supportsProto || toBoolean(doc) === false) {
    createEmpty = function $createEmpty() {
      return {
        __proto__: null
      };
    };
  } else {
    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var shouldUseActiveX = function shouldUseActiveX() {
      // return early if document.domain not set
      if (toBoolean(doc.domain) === false) {
        return false;
      }

      var result = attempt(function attemptee() {
        /* eslint-disable-next-line no-undef */
        return new ActiveXObject('htmlfile');
      });
      return result.threw === false && Boolean(result.value);
    }; // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346


    var getEmptyViaActiveX = function getEmptyViaActiveX() {
      /* eslint-disable-next-line no-undef */
      var xDoc = new ActiveXObject('htmlfile');
      /* eslint-disable-next-line no-useless-escape,prettier/prettier */

      xDoc.write('<script><\/script>');
      xDoc.close(); // noinspection JSUnresolvedVariable

      var empty = xDoc.parentWindow.Object.prototype;
      xDoc = null;
      return empty;
    }; // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150


    var getEmptyViaIFrame = function getEmptyViaIFrame() {
      var iframe = doc.createElement('iframe');
      iframe.style.display = 'none';
      /* eslint-disable-next-line no-script-url */

      iframe.src = 'javascript:';
      var parent = doc.body || doc.documentElement;
      parent.appendChild(iframe);
      var empty = iframe.contentWindow.Object.prototype;
      parent.removeChild(iframe);
      iframe = null;
      return empty;
    }; // In old IE __proto__ can't be used to manually set `null`, nor does
    // any other method exist to make an object that inherits from nothing,
    // aside from Object.prototype itself. Instead, create a new global
    // object and *steal* its Object.prototype and strip it bare. This is
    // used as the prototype to create nullary objects.


    createEmpty = function $createEmpty() {
      // Determine which approach to use
      // see https://github.com/es-shims/es5-shim/issues/150
      var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();
      delete empty.constructor;
      delete empty.hasOwnProperty;
      delete empty.propertyIsEnumerable;
      delete empty.isPrototypeOf;
      delete empty.toLocaleString;
      delete empty.toString;
      delete empty.valueOf;
      /* eslint-disable-next-line lodash/prefer-noop */

      var E = function Empty() {};

      E.prototype = empty; // short-circuit future calls

      createEmpty = function $$createEmpty() {
        return new E();
      };

      return new E();
    };
  }

  $create = function create(prototype, properties) {
    var object;
    /* eslint-disable-next-line lodash/prefer-noop */

    var T = function Type() {}; // An empty constructor.


    if (prototype === null) {
      object = createEmpty();
    } else {
      if (isPrimitive(prototype)) {
        // In the native implementation `parent` can be `null`
        // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
        // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
        // like they are in modern browsers. Using `Object.create` on DOM elements
        // is...err...probably inappropriate, but the native version allows for it.
        throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
      }

      T.prototype = prototype;
      object = new T(); // IE has no built-in implementation of `Object.getPrototypeOf`
      // neither `__proto__`, but this manually setting `__proto__` will
      // guarantee that `Object.getPrototypeOf` will work as expected with
      // objects created using `Object.create`

      /* eslint-disable-next-line no-proto */

      object.__proto__ = prototype;
    }

    if (typeof properties !== 'undefined') {
      defineProperties(object, properties);
    }

    return object;
  };
}

var create = $create;
export default create;

//# sourceMappingURL=object-create-x.esm.js.map