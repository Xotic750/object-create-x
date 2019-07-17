import create from '../src/object-create-x';

describe('create', function() {
  it('should create objects with no properties when called as `Object.create(null)`', function() {
    expect.assertions(10);
    const obj = create(null);

    expect('constructor' in obj).toBe(false);
    expect('hasOwnProperty' in obj).toBe(false);
    expect('propertyIsEnumerable' in obj).toBe(false);
    expect('isPrototypeOf' in obj).toBe(false);
    expect('toLocaleString' in obj).toBe(false);
    expect('toString' in obj).toBe(false);
    expect('valueOf' in obj).toBe(false);

    let prop;
    /* eslint-disable-next-line guard-for-in,no-restricted-syntax */
    for (prop in obj) {
      prop = false;
      break;
    }

    expect(prop).toBe(void 0);

    let protoIsEnumerable = false;
    /* eslint-disable-next-line no-restricted-syntax */
    for (prop in obj) {
      if (prop === '__proto__') {
        protoIsEnumerable = true;
      }
    }

    expect(protoIsEnumerable).toBe(false);

    expect(obj instanceof Object).toBe(false);
  });

  it('should create properties', function() {
    expect.assertions(1);
    const obj = create(null, {test: {value: true}});

    expect(obj.test).toBe(true);
  });

  it('classical inheritance', function() {
    expect.assertions(3); // Shape - superclass
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
