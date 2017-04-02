(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.returnExports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

  var isPrimitive = _dereq_('is-primitive');
  var isUndefined = _dereq_('validate.io-undefined');
  var isNull = _dereq_('lodash.isnull');
  var $defineProperties = _dereq_('object-define-properties-x');
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

},{"is-primitive":10,"lodash.isnull":12,"object-define-properties-x":13,"validate.io-undefined":20}],2:[function(_dereq_,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = _dereq_('./helpers/isPrimitive');
var isCallable = _dereq_('is-callable');
var isDate = _dereq_('is-date-object');
var isSymbol = _dereq_('is-symbol');

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":3,"is-callable":7,"is-date-object":8,"is-symbol":11}],3:[function(_dereq_,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],4:[function(_dereq_,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],5:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-own-property-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-own-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-own-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-own-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-own-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-own-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-own-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-own-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Used to determine whether an object has an own property with the specified property key.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-hasownproperty|7.3.11 HasOwnProperty (O, P)}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-own-property-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toObject = _dereq_('to-object-x');
  var toPrimitive = _dereq_('es-to-primitive/es6');
  var safeToString = _dereq_('safe-to-string-x');
  var hop = Object.prototype.hasOwnProperty;

  /**
   * The `hasOwnProperty` method returns a boolean indicating whether
   * the `object` has the specified `property`. Does not attempt to fix known
   * issues in older browsers, but does ES6ify the method.
   *
   * @param {!Object} object The object to test.
   * @param {string|Symbol} property The name or Symbol of the property to test.
   * @return {boolean} `true` if the property is set on `object`, else `false`.
   * @example
   * var hasOwnProperty = require('has-own-property-x');
   * var o = {
   *   foo: 'bar'
   * };
   *
   *
   * hasOwnProperty(o, 'bar'); // false
   * hasOwnProperty(o, 'foo'); // true
   * hasOwnProperty(undefined, 'foo');
   *                   // TypeError: Cannot convert undefined or null to object
   */
  module.exports = function hasOwnProperty(object, property) {
    return hop.call(toObject(object), safeToString(toPrimitive(property, String)));
  };
}());

},{"es-to-primitive/es6":2,"safe-to-string-x":18,"to-object-x":19}],6:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-symbol-support-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-symbol-support-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-symbol-support-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-symbol-support-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-symbol-support-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-symbol-support-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-symbol-support-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-symbol-support-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Tests if `Symbol` exists and creates the correct type.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */

/* eslint strict: 1, symbol-description: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  /**
   * Indicates if `Symbol`exists and creates the correct type.
   * `true`, if it exists and creates the correct type, otherwise `false`.
   *
   * @type boolean
   */
  module.exports = typeof Symbol === 'function' && typeof Symbol() === 'symbol';
}());

},{}],7:[function(_dereq_,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],8:[function(_dereq_,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],9:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-nil-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-nil-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-nil-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-nil-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-nil-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-nil-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-nil-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-nil-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Checks if `value` is `null` or `undefined`.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-nil-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isUndefined = _dereq_('validate.io-undefined');
  var isNull = _dereq_('lodash.isnull');

  /**
   * Checks if `value` is `null` or `undefined`.
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
   * @example
   *
   * _.isNil(null);
   * // => true
   *
   * _.isNil(void 0);
   * // => true
   *
   * _.isNil(NaN);
   * // => false
   */
  module.exports = function isNil(value) {
    return isNull(value) || isUndefined(value);
  };
}());

},{"lodash.isnull":12,"validate.io-undefined":20}],10:[function(_dereq_,module,exports){
/*!
 * is-primitive <https://github.com/jonschlinkert/is-primitive>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

// see http://jsperf.com/testing-value-is-primitive/7
module.exports = function isPrimitive(value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],11:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}

},{}],12:[function(_dereq_,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is `null`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * _.isNull(null);
 * // => true
 *
 * _.isNull(void 0);
 * // => false
 */
function isNull(value) {
  return value === null;
}

module.exports = isNull;

},{}],13:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-define-properties-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-define-properties-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-define-properties-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-properties-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-define-properties-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-properties-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-define-properties-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-define-properties-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.defineProperties
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-properties-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module, document */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var forEach = _dereq_('foreach');
  var $keys = _dereq_('object-keys');
  var $defineProperty = _dereq_('object-define-property-x');
  var $defineProperties = Object.defineProperties;

  // ES5 15.2.3.6
  // http://es5.github.com/#x15.2.3.6

  // Patch for WebKit and IE8 standard mode
  // Designed by hax <hax.github.com>
  // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
  // IE8 Reference:
  //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
  //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
  // WebKit Bugs:
  //     https://bugs.webkit.org/show_bug.cgi?id=36423

  var doesDefinePropertyWork = function _doesDefinePropertyWork(object) {
    try {
      $defineProperty(object, 'sentinel', {});
      return 'sentinel' in object;
    } catch (exception) {
      return false;
    }
  };

  // check whether defineProperty works if it's given. Otherwise,
  // shim partially.
  if ($defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertiesFallback = Object.defineProperties;
    }
  }

  // ES5 15.2.3.7
  // http://es5.github.com/#x15.2.3.7
  if (!$defineProperties || definePropertiesFallback) {
    $defineProperties = function defineProperties(object, properties) {
      // make a valiant attempt to use the real defineProperties
      if (definePropertiesFallback) {
        try {
          return definePropertiesFallback.call(Object, object, properties);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      forEach($keys(properties), function (property) {
        if (property !== '__proto__') {
          $defineProperty(object, property, properties[property]);
        }
      });
      return object;
    };
  }

  /**
   * This method defines new or modifies existing properties directly on an object, returning the object.
   *
   * @param {Object} object The object on which to define or modify properties.
   * @param {Object} properties An object whose own enumerable properties constitute descriptors for the
   * properties to be defined or modified.
   * @return {Object} The object that was passed to the function.
   * @example
   * var defineProperties = require('object-define-properties-x');
   *
   * var obj = {};
   * defineProperties(obj, {
   *   'property1': {
   *     value: true,
   *     writable: true
   *   },
   *   'property2': {
   *     value: 'Hello',
   *     writable: true
   *   }
   *   // etc. etc.
   * });
   */
  module.exports = $defineProperties;
}());

},{"foreach":4,"object-define-property-x":14,"object-keys":15}],14:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-define-property-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-define-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-define-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-define-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-define-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-define-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.deineProperty
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-property-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module, document */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isPrimitive = _dereq_('is-primitive');
  var owns = _dereq_('has-own-property-x');
  var $defineProperty = Object.defineProperty;

  var prototypeOfObject = Object.prototype;
  // If JS engine supports accessors creating shortcuts.
  var defineGetter;
  var defineSetter;
  var lookupGetter;
  var lookupSetter;
  var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
  if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle, no-restricted-properties */
    defineGetter = prototypeOfObject.__defineGetter__;
    defineSetter = prototypeOfObject.__defineSetter__;
    lookupGetter = prototypeOfObject.__lookupGetter__;
    lookupSetter = prototypeOfObject.__lookupSetter__;
    /* eslint-enable no-underscore-dangle, no-restricted-properties */
  }

  // ES5 15.2.3.6
  // http://es5.github.com/#x15.2.3.6

  // Patch for WebKit and IE8 standard mode
  // Designed by hax <hax.github.com>
  // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
  // IE8 Reference:
  //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
  //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
  // WebKit Bugs:
  //     https://bugs.webkit.org/show_bug.cgi?id=36423

  var doesDefinePropertyWork = function _doesDefinePropertyWork(object) {
    try {
      $defineProperty(object, 'sentinel', {});
      return 'sentinel' in object;
    } catch (exception) {
      return false;
    }
  };

  // check whether defineProperty works if it's given. Otherwise,
  // shim partially.
  if ($defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertyFallback = Object.defineProperty;
    }
  }

  if (!$defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

    $defineProperty = function defineProperty(object, property, descriptor) {
      if (isPrimitive(object)) {
        throw new TypeError(ERR_NON_OBJECT_TARGET + object);
      }
      if (isPrimitive(descriptor)) {
        throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
      }
      // make a valiant attempt to use the real defineProperty
      // for I8's DOM elements.
      if (definePropertyFallback) {
        try {
          return definePropertyFallback.call(Object, object, property, descriptor);
        } catch (exception) {
          // try the shim if the real one doesn't work
        }
      }

      // If it's a data property.
      if ('value' in descriptor) {
        // fail silently if 'writable', 'enumerable', or 'configurable'
        // are requested but not supported
        /*
        // alternate approach:
        if ( // can't implement these features; allow false but not true
            ('writable' in descriptor && !descriptor.writable) ||
            ('enumerable' in descriptor && !descriptor.enumerable) ||
            ('configurable' in descriptor && !descriptor.configurable)
        ))
            throw new RangeError(
              'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
            );
        */

        if (supportsAccessors && (lookupGetter.call(object, property) || lookupSetter.call(object, property))) {
          // As accessors are supported only on engines implementing
          // `__proto__` we can safely override `__proto__` while defining
          // a property to make sure that we don't hit an inherited
          // accessor.
          /* eslint-disable no-proto */
          var prototype = object.__proto__;
          object.__proto__ = prototypeOfObject;
          // Deleting a property anyway since getter / setter may be
          // defined on object itself.
          delete object[property];
          object[property] = descriptor.value;
          // Setting original `__proto__` back now.
          object.__proto__ = prototype;
          /* eslint-enable no-proto */
        } else {
          object[property] = descriptor.value;
        }
      } else {
        var hasGetter = 'get' in descriptor;
        var hasSetter = 'set' in descriptor;
        if (!supportsAccessors && (hasGetter || hasSetter)) {
          throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
        }
        // If we got that far then getters and setters can be defined !!
        if (hasGetter) {
          defineGetter.call(object, property, descriptor.get);
        }
        if (hasSetter) {
          defineSetter.call(object, property, descriptor.set);
        }
      }
      return object;
    };
  }

  /**
   * This method defines a new property directly on an object, or modifies an existing property on an object,
   * and returns the object.
   *
   * @param {Object} object The object on which to define the property.
   * @param {string} property The name of the property to be defined or modified.
   * @param {Object} descriptor The descriptor for the property being defined or modified.
   * @return {Object} The object that was passed to the function.
   * @example
   * var defineProperty = require('object-define-property-x');
   *
   * var o = {}; // Creates a new object
   *
   * Object.defineProperty(o, 'a', {
   *   value: 37,
   *   writable: true
   * });
   */
  module.exports = $defineProperty;
}());

},{"has-own-property-x":5,"is-primitive":10}],15:[function(_dereq_,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = _dereq_('./isArguments');
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":16}],16:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],17:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/require-object-coercible-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/require-object-coercible-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/require-object-coercible-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/require-object-coercible-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/require-object-coercible-x#info=devDependencies"
 * title="devDependency status">
 * <img
 * src="https://david-dm.org/Xotic750/require-object-coercible-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a
 * href="https://badge.fury.io/js/require-object-coercible-x"
 * title="npm version">
 * <img src="https://badge.fury.io/js/require-object-coercible-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for RequireObjectCoercible.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-requireobjectcoercible|7.2.1 RequireObjectCoercible ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module require-object-coercible-x
 */

/* eslint strict: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isNil = _dereq_('is-nil-x');

  /**
   * The abstract operation RequireObjectCoercible throws an error if argument
   * is a value that cannot be converted to an Object using ToObject.
   *
   * @param {*} value The `value` to check.
   * @throws {TypeError} If `value` is a `null` or `undefined`.
   * @return {string} The `value`.
   * @example
   * var RequireObjectCoercible = require('require-object-coercible-x');
   *
   * RequireObjectCoercible(); // TypeError
   * RequireObjectCoercible(null); // TypeError
   * RequireObjectCoercible('abc'); // 'abc'
   * RequireObjectCoercible(true); // true
   * RequireObjectCoercible(Symbol('foo')); // Symbol('foo')
   */
  module.exports = function RequireObjectCoercible(value) {
    if (isNil(value)) {
      throw new TypeError('Cannot call method on ' + value);
    }
    return value;
  };
}());

},{"is-nil-x":9}],18:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/safe-to-string-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/safe-to-string-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/safe-to-string-x" title="npm version">
 * <img src="https://badge.fury.io/js/safe-to-string-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 safeToString module. Converts a `Symbol` literal or object to `Symbol()`
 * instead of throwing a `TypeError`. Its primary use is for logging/debugging.
 *
 * Requires ES3 or above.
 *
 * @see {@link https://github.com/Xotic750/to-string-x|to-string-x}
 *
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module safe-to-string-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isSymbol = _dereq_('is-symbol');
  var pToString = _dereq_('has-symbol-support-x') && Symbol.prototype.toString;

  /**
   * The abstract operation `safeToString` converts a `Symbol` literal or
   * object to `Symbol()` instead of throwing a `TypeError`.
   *
   * @param {*} value The value to convert to a string.
   * @return {string} The converted value.
   * @example
   * var safeToString = require('safe-to-string-x');
   *
   * safeToString(); // 'undefined'
   * safeToString(null); // 'null'
   * safeToString('abc'); // 'abc'
   * safeToString(true); // 'true'
   * safeToString(Symbol('foo')); // 'Symbol(foo)'
   * safeToString(Symbol.iterator); // 'Symbol(Symbol.iterator)'
   * safeToString(Object(Symbol.iterator)); // 'Symbol(Symbol.iterator)'
   */
  module.exports = function safeToString(value) {
    return pToString && isSymbol(value) ? pToString.call(value) : String(value);
  };
}());

},{"has-symbol-support-x":6,"is-symbol":11}],19:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-object-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-object-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-object-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-object-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-object-x#info=devDependencies"
 * title="devDependency status">
 * <img
 * src="https://david-dm.org/Xotic750/to-object-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a
 * href="https://badge.fury.io/js/to-object-x"
 * title="npm version">
 * <img src="https://badge.fury.io/js/to-object-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for ToObject.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-toobject|7.1.13 ToObject ( argument )}
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-object-x
 */

/* eslint strict: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $requireObjectCoercible = _dereq_('require-object-coercible-x');

  /**
   * The abstract operation ToObject converts argument to a value of
   * type Object.
   *
   * @param {*} value The `value` to convert.
   * @throws {TypeError} If `value` is a `null` or `undefined`.
   * @return {!Object} The `value` converted to an object.
   * @example
   * var ToObject = require('to-object-x');
   *
   * ToObject(); // TypeError
   * ToObject(null); // TypeError
   * ToObject('abc'); // Object('abc')
   * ToObject(true); // Object(true)
   * ToObject(Symbol('foo')); // Object(Symbol('foo'))
   */
  module.exports = function ToObject(value) {
    return Object($requireObjectCoercible(value));
  };
}());

},{"require-object-coercible-x":17}],20:[function(_dereq_,module,exports){
/**
*
*	VALIDATE: undefined
*
*
*	DESCRIPTION:
*		- Validates if a value is undefined.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isUndefined( value )
*	Validates if a value is undefined.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is undefined
*/
function isUndefined( value ) {
	return value === void 0;
} // end FUNCTION isUndefined()


// EXPORTS //

module.exports = isUndefined;

},{}]},{},[1])(1)
});