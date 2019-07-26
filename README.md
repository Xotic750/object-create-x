<a
  href="https://travis-ci.org/Xotic750/object-create-x"
  title="Travis status">
<img
  src="https://travis-ci.org/Xotic750/object-create-x.svg?branch=master"
  alt="Travis status" height="18">
</a>
<a
  href="https://david-dm.org/Xotic750/object-create-x"
  title="Dependency status">
<img src="https://david-dm.org/Xotic750/object-create-x/status.svg"
  alt="Dependency status" height="18"/>
</a>
<a
  href="https://david-dm.org/Xotic750/object-create-x?type=dev"
  title="devDependency status">
<img src="https://david-dm.org/Xotic750/object-create-x/dev-status.svg"
  alt="devDependency status" height="18"/>
</a>
<a
  href="https://badge.fury.io/js/object-create-x"
  title="npm version">
<img src="https://badge.fury.io/js/object-create-x.svg"
  alt="npm version" height="18">
</a>
<a
  href="https://www.jsdelivr.com/package/npm/object-create-x"
  title="jsDelivr hits">
<img src="https://data.jsdelivr.com/v1/package/npm/object-create-x/badge?style=rounded"
  alt="jsDelivr hits" height="18">
</a>
<a
  href="https://bettercodehub.com/results/Xotic750/object-create-x"
  title="bettercodehub score">
<img src="https://bettercodehub.com/edge/badge/Xotic750/object-create-x?branch=master"
  alt="bettercodehub score" height="18">
</a>

<a name="module_object-create-x"></a>

## object-create-x

Sham for Object.create

<a name="exp_module_object-create-x--module.exports"></a>

### `module.exports` ⇒ <code>boolean</code> ⏏

This method method creates a new object with the specified prototype object and properties.

**Kind**: Exported member  
**Returns**: <code>boolean</code> - A new object with the specified prototype object and properties.  
**Throws**:

- <code>TypeError</code> If the properties parameter isn't null or an object.

| Param        | Type            | Description                                                                                                                                                                                                                                                                                    |
| ------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prototype    | <code>\*</code> | The object which should be the prototype of the newly-created object.                                                                                                                                                                                                                          |
| [properties] | <code>\*</code> | If specified and not undefined, an object whose enumerable own properties (that is, those properties defined upon itself and not enumerable properties along its prototype chain) specify property descriptors to be added to the newly-created object, with the corresponding property names. |

**Example**

```js
import create from 'object-create-x';

// Shape - superclass
function Shape() {
  this.x = 0;
  this.y = 0;
}

// superclass method
Shape.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  console.info('Shape moved.');
};

// Rectangle - subclass
function Rectangle() {
  Shape.call(this); // call super constructor.
}

// subclass extends superclass
Rectangle.prototype = create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

const rect = new Rectangle();

console.log('Is rect an instance of Rectangle?', rect instanceof Rectangle); // true
console.log('Is rect an instance of Shape?', rect instanceof Shape); // true
rect.move(1, 1); // Outputs, 'Shape moved.'
```
