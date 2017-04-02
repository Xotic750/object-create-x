/* eslint strict: 1, max-statements: 1, max-nested-callbacks: 1, no-restricted-syntax: 1 */

/* global JSON:true, expect, module, require, describe, it, returnExports */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var create;
  if (typeof module === 'object' && module.exports) {
    require('es5-shim');
    require('es5-shim/es5-sham');
    if (typeof JSON === 'undefined') {
      JSON = {};
    }
    require('json3').runInContext(null, JSON);
    require('es6-shim');
    var es7 = require('es7-shim');
    Object.keys(es7).forEach(function (key) {
      var obj = es7[key];
      if (typeof obj.shim === 'function') {
        obj.shim();
      }
    });
    create = require('../../index.js');
  } else {
    create = returnExports;
  }

  describe('create', function () {
    it('should create objects with no properties when called as `Object.create(null)`', function () {
      var obj = create(null);

      expect('hasOwnProperty' in obj).toBe(false);
      expect('toString' in obj).toBe(false);
      expect('constructor' in obj).toBe(false);

      var protoIsEnumerable = false;
      for (var k in obj) {
        if (k === '__proto__') {
          protoIsEnumerable = true;
        }
      }
      expect(protoIsEnumerable).toBe(false);

      expect(obj instanceof Object).toBe(false);
    });
  });
}());
