/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-create-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-create-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-create-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-create-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-create-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-create-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-create-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-create-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.create
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-create-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isPrimitive = require('is-primitive');
  var isUndefined = require('validate.io-undefined');
  var isNull = require('lodash.isnull');
  var $defineProperties = require('object-define-properties-x');
  var $create = Object.create;

  // ES5 15.2.3.5
  // http://es5.github.com/#x15.2.3.5
  if (!$create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({ __proto__: null } instanceof Object);
    // the following produces false positives
    // in Opera Mini => not a reliable check
    // Object.prototype.__proto__ === null

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    /* global ActiveXObject */
    var shouldUseActiveX = function _shouldUseActiveX() {
      // return early if document.domain not set
      if (!document.domain) {
        return false;
      }

      try {
        return !!new ActiveXObject('htmlfile');
      } catch (exception) {
        return false;
      }
    };

    // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var getEmptyViaActiveX = function _getEmptyViaActiveX() {
      var empty;
      var xDoc;

      xDoc = new ActiveXObject('htmlfile');

      var script = 'script';
      xDoc.write('<' + script + '></' + script + '>');
      xDoc.close();

      empty = xDoc.parentWindow.Object.prototype;
      xDoc = null;

      return empty;
    };

    // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150
    var getEmptyViaIFrame = function _getEmptyViaIFrame() {
      var iframe = document.createElement('iframe');
      var parent = document.body || document.documentElement;
      var empty;

      iframe.style.display = 'none';
      parent.appendChild(iframe);
      // eslint-disable-next-line no-script-url
      iframe.src = 'javascript:';

      empty = iframe.contentWindow.Object.prototype;
      parent.removeChild(iframe);
      iframe = null;

      return empty;
    };

    /* global document */
    if (supportsProto || typeof document === 'undefined') {
      createEmpty = function () {
        return { __proto__: null };
      };
    } else {
      // In old IE __proto__ can't be used to manually set `null`, nor does
      // any other method exist to make an object that inherits from nothing,
      // aside from Object.prototype itself. Instead, create a new global
      // object and *steal* its Object.prototype and strip it bare. This is
      // used as the prototype to create nullary objects.
      createEmpty = function () {
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

        var E = function Empty() {};
        E.prototype = empty;
        // short-circuit future calls
        createEmpty = function () {
          return new E();
        };
        return new E();
      };
    }

    $create = function create(prototype, properties) {

      var object;
      var T = function Type() {}; // An empty constructor.

      if (isNull(prototype)) {
        object = createEmpty();
      } else {
        if (!isNull(prototype) && isPrimitive(prototype)) {
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

      if (!isUndefined(properties)) {
        $defineProperties(object, properties);
      }

      return object;
    };
  }

  /**
   * This method method creates a new object with the specified prototype object and properties.
   *
   * @param {*} prototype The object which should be the prototype of the newly-created object.
   * @param {*} [properties] If specified and not undefined, an object whose enumerable own properties
   * (that is, those properties defined upon itself and not enumerable properties along its prototype chain)
   * specify property descriptors to be added to the newly-created object, with the corresponding property names.
   * @throws {TypeError} If the properties parameter isn't null or an object.
   * @return {boolean} A new object with the specified prototype object and properties.
   * @example
   * var create = require('object-create-x');
   */
  module.exports = $create;
}());
