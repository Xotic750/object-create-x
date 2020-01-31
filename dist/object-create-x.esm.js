function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import attempt from 'attempt-x';
import isPrimitive from 'is-primitive-x';
import defineProperties from 'object-define-properties-x';
import toBoolean from 'to-boolean-x';
var ObjectCtr = {}.constructor;
var nCreate = ObjectCtr.create;
var nativeCreate = typeof nCreate === 'function' && nCreate;

var test1 = function test1() {
  var res = attempt(nativeCreate, null);
  return res.threw === false && res.value && _typeof(res.value) === 'object';
};

var test2 = function test2() {
  var res = attempt(nativeCreate, null); // noinspection LoopStatementThatDoesntLoopJS

  for (var _ in res.value)
  /* eslint-disable-line guard-for-in,no-restricted-syntax */
  {
    return false;
  }

  return true;
};

var test3 = function test3() {
  var res = attempt(nativeCreate, null, {
    test: {
      value: true
    }
  });
  return res.threw === false && res.value && _typeof(res.value) === 'object' && res.value.test === true;
};

var getShapes = function getShapes() {
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

  return {
    Shape: Shape,
    Rectangle: Rectangle
  };
};

var test4 = function test4() {
  var _getShapes = getShapes(),
      Shape = _getShapes.Shape;

  var res = attempt(nativeCreate, Shape.prototype);
  return res.threw === false && res.value && _typeof(res.value) === 'object';
};

var test5 = function test5() {
  var _getShapes2 = getShapes(),
      Shape = _getShapes2.Shape,
      Rectangle = _getShapes2.Rectangle;

  var res = attempt(nativeCreate, Shape.prototype); // subclass extends superclass

  Rectangle.prototype = res.value;
  Rectangle.prototype.constructor = Rectangle;
  var rect = new Rectangle();
  return rect instanceof Rectangle;
};

var test6 = function test6() {
  var _getShapes3 = getShapes(),
      Shape = _getShapes3.Shape,
      Rectangle = _getShapes3.Rectangle;

  var res = attempt(nativeCreate, Shape.prototype); // subclass extends superclass

  Rectangle.prototype = res.value;
  Rectangle.prototype.constructor = Rectangle;
  var rect = new Rectangle();
  return rect instanceof Shape;
};

var test7 = function test7() {
  var _getShapes4 = getShapes(),
      Shape = _getShapes4.Shape,
      Rectangle = _getShapes4.Rectangle;

  var res = attempt(nativeCreate, Shape.prototype); // subclass extends superclass

  Rectangle.prototype = res.value;
  Rectangle.prototype.constructor = Rectangle;
  var rect = new Rectangle();
  return rect.move(1, 1) === 'Shape moved.';
};

var isWorking = toBoolean(nativeCreate) && test1() && test2() && test3() && test4() && test5() && test6() && test7();
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

var doc = typeof document !== 'undefined' && document;
var supportsProto = toBoolean({
  __proto__: null
} instanceof ObjectCtr) === false; // Check for document.domain and active x support
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
}; // the following produces false positives
// in Opera Mini => not a reliable check
// Object.prototype.__proto__ === null


var createEmptyProto = function createEmpty() {
  return {
    __proto__: null
  };
}; // In old IE __proto__ can't be used to manually set `null`, nor does
// any other method exist to make an object that inherits from nothing,
// aside from Object.prototype itself. Instead, create a new global
// object and *steal* its Object.prototype and strip it bare. This is
// used as the prototype to create nullary objects.


var createEmptyNoProto = function createEmpty() {
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

  createEmptyNoProto = function createEmptyShortCircuit() {
    return new E();
  };

  return new E();
}; // Contributed by Brandon Benvie, October, 2012


var createEmpty = supportsProto || toBoolean(doc) === false ? createEmptyProto : createEmptyNoProto;
export var implementation = function create(prototype, properties) {
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
var $create = isWorking ? nativeCreate : implementation;
export default $create;

//# sourceMappingURL=object-create-x.esm.js.map