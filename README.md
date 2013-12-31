# mixing

Functions to mix objects.

[![NPM version](https://badge.fury.io/js/mixing.png)](http://badge.fury.io/js/mixing)

## Installation

### Node

    npm install mixing

### [Component](https://github.com/component/component)

    component install gamtiq/mixing

### [Jam](http://jamjs.org)

    jam install mixing

### [Bower](http://bower.io)

    bower install mixing

### AMD, script tag

Use `dist/mixing.js` or `dist/mixing.min.js` (minified version).

## Usage

### Node, Component

```js
var mixin = require("mixing");
...
```

### Jam

```js
require(["mixing"], function(mixin) {
    ...
});
```

### AMD

```js
define(["path/to/dist/mixing.js"], function(mixin) {
    ...
});
```

### Bower, script tag

```html
<!-- Use bower_components/mixing/dist/mixing.js if the library was installed via Bower -->
<script type="text/javascript" src="path/to/dist/mixing.js"></script>
<script type="text/javascript">
    // mixing is available via mixing field of window object
    var mixin = mixing;
    ...
</script>
```

### Example

```js
var copy = mixin({}, source);   // Make a shallow copy of source
var result = mixin({a: 1, b: 2}, {c: 3, d: 4});   // result is {a: 1, b: 2, c: 3, d: 4}
mixin({a: 1, b: 2}, {a: "a", b: {}, c: 3, d: 4});   // Returns {a: 1, b: 2, c: 3, d: 4}
mixin({a: 1, b: 2, z: 100}, {a: "a", b: {}, c: 3, d: 4}, {overwrite: true});   // Returns {a: "a", b: {}, c: 3, d: 4, z: 100}
```

## API

See `doc` directory for details.

### mixing(destination: Object, source: Array | Object, [settings: Object]);

Copy/add all fields and functions from `source` object(s) into the `destination` object.
As a result the `destination` object may be modified.

Several settings are supported (see `doc/module-mixing.html` for details):

* `copyFunc`: `Boolean` - Should functions be copied?
* `funcToProto`: `Boolean` - Should functions be copied into `prototype` of the `destination` object's `constructor`?
* `overwrite`: `Boolean` - Should a field/function be overwritten when it exists in the `destination` object?
* `recursive`: `Boolean` - Should this function be called recursively when field's value of the `destination` and `source` object is an object?
* `oneSource`: `Boolean` - Should `source` array be interpreted directly as copied object instead of list of source objects?
* `except`: `Array | Object | String` - Name(s) of fields/functions that shouldn't be copied.
* `otherName`: `Object` - Defines "renaming table" for copied elements.

### .mix(source: Array | Object, [settings: Object]);

Copy/add all fields and functions from source objects into `this` object.
As a result `this` object may be modified.
This function can be transferred to an object to use as a method.
For example:
```js
SomeClass.prototype.mix = mixing.mix;
...
var obj = new SomeClass();
...
obj.mix([obj1, obj2]);
```

## Licence

MIT
