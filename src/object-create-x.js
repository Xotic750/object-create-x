import attempt from 'attempt-x';
import isPrimitive from 'is-primitive-x';
import defineProperties from 'object-define-properties-x';
import toBoolean from 'to-boolean-x';

const ObjectCtr = {}.constructor;
const nCreate = ObjectCtr.create;
const nativeCreate = typeof nCreate === 'function' && nCreate;

const test1 = function test1() {
  const res = attempt(nativeCreate, null);

  return res.threw === false && res.value && typeof res.value === 'object';
};

const test2 = function test2() {
  const res = attempt(nativeCreate, null);

  // noinspection LoopStatementThatDoesntLoopJS
  for (const _ in res.value) /* eslint-disable-line guard-for-in,no-restricted-syntax */ {
    return false;
  }

  return true;
};

const test3 = function test3() {
  const res = attempt(nativeCreate, null, {test: {value: true}});

  return res.threw === false && res.value && typeof res.value === 'object' && res.value.test === true;
};

const getShapes = function getShapes() {
  // Shape - superclass
  const Shape = function Shape() {
    // noinspection JSUnusedGlobalSymbols
    this.x = 0;
    // noinspection JSUnusedGlobalSymbols
    this.y = 0;
  };

  // superclass method
  Shape.prototype.move = function move(x, y) {
    // noinspection JSUnusedGlobalSymbols
    this.x += x;
    // noinspection JSUnusedGlobalSymbols
    this.y += y;

    return 'Shape moved.';
  };

  // Rectangle - subclass
  const Rectangle = function Rectangle() {
    Shape.call(this); // call super constructor.
  };

  return {Shape, Rectangle};
};

const test4 = function test4() {
  const {Shape} = getShapes();
  const res = attempt(nativeCreate, Shape.prototype);

  return res.threw === false && res.value && typeof res.value === 'object';
};

const test5 = function test5() {
  const {Shape, Rectangle} = getShapes();
  const res = attempt(nativeCreate, Shape.prototype);
  // subclass extends superclass
  Rectangle.prototype = res.value;
  Rectangle.prototype.constructor = Rectangle;

  const rect = new Rectangle();

  return rect instanceof Rectangle;
};

const test6 = function test6() {
  const {Shape, Rectangle} = getShapes();
  const res = attempt(nativeCreate, Shape.prototype);
  // subclass extends superclass
  Rectangle.prototype = res.value;
  Rectangle.prototype.constructor = Rectangle;

  const rect = new Rectangle();

  return rect instanceof Shape;
};

const test7 = function test7() {
  const {Shape, Rectangle} = getShapes();
  const res = attempt(nativeCreate, Shape.prototype);
  // subclass extends superclass
  Rectangle.prototype = res.value;
  Rectangle.prototype.constructor = Rectangle;

  const rect = new Rectangle();

  return rect.move(1, 1) === 'Shape moved.';
};

const isWorking = toBoolean(nativeCreate) && test1() && test2() && test3() && test4() && test5() && test6() && test7();

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
const doc = typeof document !== 'undefined' && document;
const supportsProto = toBoolean({__proto__: null} instanceof ObjectCtr) === false;

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
const shouldUseActiveX = function shouldUseActiveX() {
  // return early if document.domain not set
  if (toBoolean(doc.domain) === false) {
    return false;
  }

  const result = attempt(function attemptee() {
    /* eslint-disable-next-line no-undef */
    return new ActiveXObject('htmlfile');
  });

  return result.threw === false && Boolean(result.value);
};

// This supports IE8 when document.domain is used
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
const getEmptyViaActiveX = function getEmptyViaActiveX() {
  /* eslint-disable-next-line no-undef */
  let xDoc = new ActiveXObject('htmlfile');
  /* eslint-disable-next-line no-useless-escape,prettier/prettier */
  xDoc.write('<script><\/script>');
  xDoc.close();

  // noinspection JSUnresolvedVariable
  const empty = xDoc.parentWindow.Object.prototype;
  xDoc = null;

  return empty;
};

// The original implementation using an iframe
// before the activex approach was added
// see https://github.com/es-shims/es5-shim/issues/150
const getEmptyViaIFrame = function getEmptyViaIFrame() {
  let iframe = doc.createElement('iframe');
  iframe.style.display = 'none';
  /* eslint-disable-next-line no-script-url */
  iframe.src = 'javascript:';

  const parent = doc.body || doc.documentElement;
  parent.appendChild(iframe);

  const empty = iframe.contentWindow.Object.prototype;
  parent.removeChild(iframe);
  iframe = null;

  return empty;
};

// the following produces false positives
// in Opera Mini => not a reliable check
// Object.prototype.__proto__ === null
const createEmptyProto = function createEmpty() {
  return {__proto__: null};
};

// In old IE __proto__ can't be used to manually set `null`, nor does
// any other method exist to make an object that inherits from nothing,
// aside from Object.prototype itself. Instead, create a new global
// object and *steal* its Object.prototype and strip it bare. This is
// used as the prototype to create nullary objects.
let createEmptyNoProto = function createEmpty() {
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

  /* eslint-disable-next-line lodash/prefer-noop */
  const E = function Empty() {};

  E.prototype = empty;
  // short-circuit future calls
  createEmptyNoProto = function createEmptyShortCircuit() {
    return new E();
  };

  return new E();
};

// Contributed by Brandon Benvie, October, 2012
const createEmpty = supportsProto || toBoolean(doc) === false ? createEmptyProto : createEmptyNoProto;

export const implementation = function create(prototype, properties) {
  let object;
  /* eslint-disable-next-line lodash/prefer-noop */
  const T = function Type() {}; // An empty constructor.

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
    object = new T();
    // IE has no built-in implementation of `Object.getPrototypeOf`
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

const $create = isWorking ? nativeCreate : implementation;

export default $create;
