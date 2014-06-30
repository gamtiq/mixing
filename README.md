# mixing

Functions to mix, filter, change and copy/clone objects.

[![NPM version](https://badge.fury.io/js/mixing.png)](http://badge.fury.io/js/mixing)
[![Build Status](https://travis-ci.org/gamtiq/mixing.png)](https://travis-ci.org/gamtiq/mixing)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## Installation

### Node

    npm install mixing

### [Ringo](http://ringojs.org)

    ringo-admin install gamtiq/mixing

### [Component](https://github.com/component/component)

    component install gamtiq/mixing

### [Jam](http://jamjs.org)

    jam install mixing

### [Bower](http://bower.io)

    bower install mixing

### AMD, script tag

Use `dist/mixing.js` or `dist/mixing.min.js` (minified version).

## Usage

### Node, Ringo, Component

```js
var mixing = require("mixing");
...
```

### Jam

```js
require(["mixing"], function(mixing) {
    ...
});
```

### AMD

```js
define(["path/to/dist/mixing.js"], function(mixing) {
    ...
});
```

### Bower, script tag

```html
<!-- Use bower_components/mixing/dist/mixing.js if the library was installed via Bower -->
<script type="text/javascript" src="path/to/dist/mixing.js"></script>
<script type="text/javascript">
    // mixing is available via mixing field of window object
    ...
</script>
```

### Examples

```js
var copy = mixing.copy(source);   // Make a shallow copy of source
var result = mixing({a: 1, b: 2}, {c: 3, d: 4});   // result is {a: 1, b: 2, c: 3, d: 4}
mixing({a: 1, b: 2}, {a: "a", b: {}, c: 3, d: 4});   // Returns {a: 1, b: 2, c: 3, d: 4}
mixing({a: 1, b: 2, z: 100}, {a: "a", b: {}, c: 3, d: 4}, {overwrite: true});   // Returns {a: "a", b: {}, c: 3, d: 4, z: 100}

// Mix arrays
mixing([1, 2, 3], ["a", "b", "c", "d"], {overwrite: true, oneSource: true});   // Returns ["a", "b", "c", "d"]
mixing([3, 2, 1, 4, 5], [1, 2, 3], {overwrite: true, oneSource: true});   // Returns [1, 2, 3, 4, 5]

// Filter and change field values
mixing({}, 
       [{a: 1, b: 100}, null, {c: 3, d: new Date(), e: 4}, {f: "str", g: 50}, undefined, {h: 7}], 
       {
           except: ["a", "g"],
           filter: function(field, value, target, source) {
               return typeof value === "number" && value < 10;
           },
           change: function(field, value, target, source) {
               return value > 5 ? value * value : value;
           },
       });   // Returns {c: 3, e: 4, h: 49}

// Clone, filter, map
var obj = {
    a: 1,
    b: 2,
    clone: mixing.clone,
    filter: mixing.filter,
    map: mixing.map
};
var obj2 = obj.clone();   // obj2 is a shallow copy of obj

function isNumericValue(field, value, target, source) {
    return typeof value === "number";
}

var obj3 = obj.filter(isNumericValue);   // {a: 1, b: 2}

var obj4 = obj.map({
    filter: isNumericValue,
    change: function(field, value, target, source) {
        return value + value;
    }
});   // {a: 2, b: 4}
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
* `mixFromArray`: `Boolean` - Should in recursive mode contents of a field of the source object be copied when the field's value is an array?
* `mixToArray`: `Boolean` - Should in recursive mode contents of a field of the source object be copied into a field of the target object when the latest field's value is an array?
* `oneSource`: `Boolean` - Should `source` array be interpreted directly as copied object instead of list of source objects?
* `ownProperty`: `Boolean` - Should only own properties of the source object be copied into the target object?
* `except`: `Array | Object | String` - Name(s) of fields/functions that shouldn't be copied.
* `filter`: `Function` - Allows selecting elements that should be copied.
* `otherName`: `Object` - Defines "renaming table" for copied elements.
* `change`: `Function` - Gives ability to change values that should be copied.

### .copy(source: Array | Object, [settings: Object]);

Make a copy of source object(s).

### .clone([settings: Object]);

Make a copy of `this` object.
This function can be transferred to an object to use as a method.
For example:
```js
SomeClass.prototype.clone = mixing.clone;
...
var obj = new SomeClass();
...
var copy = obj.clone();
```

### .filter(filter: Function | Object);

Filter `this` object.
This function can be transferred to an object to use as a method.
For example:
```js
SomeClass.prototype.filter = mixing.filter;
...
var obj = new SomeClass();
...
var result = obj.filter(function(field, value, target, source) {
    // source is obj, target is result
    ...
});
```

### .map(change: Function | Object);

Copy and change values of fields of `this` object.
This function can be transferred to an object to use as a method.
For example:
```js
SomeClass.prototype.map = mixing.map;
...
var obj = new SomeClass();
...
var result = obj.map(function(field, value, target, source) {
    // source is obj, target is result
    ...
});
```

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
