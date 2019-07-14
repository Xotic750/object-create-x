let create;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  create = require('../../index.js');
} else {
  create = returnExports;
}

describe('create', function() {
  it('should create objects with no properties when called as `Object.create(null)`', function() {
    const obj = create(null);

    expect('constructor' in obj).toBe(false);
    expect('hasOwnProperty' in obj).toBe(false);
    expect('propertyIsEnumerable' in obj).toBe(false);
    expect('isPrototypeOf' in obj).toBe(false);
    expect('toLocaleString' in obj).toBe(false);
    expect('toString' in obj).toBe(false);
    expect('valueOf' in obj).toBe(false);

    let prop;
    // eslint-disable-next-line no-restricted-syntax
    for (prop in obj) {
      prop = false;
      // eslint-disable-next-line no-restricted-syntax
      break;
    }

    expect(prop).toBe(void 0);

    let protoIsEnumerable = false;
    // eslint-disable-next-line no-restricted-syntax
    for (prop in obj) {
      if (prop === '__proto__') {
        protoIsEnumerable = true;
      }
    }

    expect(protoIsEnumerable).toBe(false);

    expect(obj instanceof Object).toBe(false);
  });

  it('should create properties', function() {
    const obj = create(null, {test: {value: true}});

    expect(obj.test).toBe(true);
  });

  it('classical inheritance', function() {
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

    // subclass extends superclass
    Rectangle.prototype = create(Shape.prototype);
    Rectangle.prototype.constructor = Rectangle;

    const rect = new Rectangle();

    expect(rect instanceof Rectangle).toBe(true);
    expect(rect instanceof Shape).toBe(true);
    expect(rect.move(1, 1)).toBe('Shape moved.');
  });
});
