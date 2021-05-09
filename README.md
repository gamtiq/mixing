# mixing <a name="start"></a>

Functions to mix, filter, change and copy/clone objects.
Supports processing of symbol property keys that are introduced in ECMAScript 2015.

`mixing` is like an improved version of `Object.assign` and is compatible with ECMAScript 3+.

### Features

* Overwrite all or only some fields, or do not change existent fields (specified by `overwrite` setting).
* Mix recursively objects and arrays (use `recursive` and `mixArray` settings).
* Copy only own or all fields of a source object (`ownProperty` setting).
* Selectively copy fields from a source object (`copy`, `except` and `filter` settings).
* Rename fields of a source object that are added into the target object (`otherName` setting).
* Change values that are copied into the target object (`change` setting).
* Several helpful "shortcut" functions that can be used standalone or as methods.

```js
const obj = {a: 1, b: {c: "", d: false}, e: [{f1: 1, f2: 2}, {f1: 0, f3: 9}], z: true};
...
mixing(
    obj,
    {a: 3, b: {c: 1, c2: "abc"}, e: [{f2: -3}, {f1: 7, f2: null}, {f1: 10}], x: "way"},
    {overwrite: true, recursive: true, mixArray: true}
);
// obj is {a: 3, b: {c: 1, d: false, c2: "abc"}, e: [{f1: 1, f2: -3}, {f1: 7, f3: 9, f2: null}, {f1: 10}], x: "way", z: true}
```

[![NPM version](https://badge.fury.io/js/mixing.png)](http://badge.fury.io/js/mixing)
[![Build Status](https://travis-ci.org/gamtiq/mixing.png)](https://travis-ci.org/gamtiq/mixing)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

* [Usage](#usage)
* [Examples](#examples)
* [API](#api)
* [Related projects](#related)

## Installation

### Node

    npm install mixing

### [Ringo](https://ringojs.org)

    ringo-admin install gamtiq/mixing

### [Bower](http://bower.io)

    bower install mixing

### AMD, script tag

Use `dist/mixing.js` or `dist/mixing.min.js` (minified version).

## Usage <a name="usage"></a> [&#x2191;](#start)

### Node, Ringo

```js
var mixing = require("mixing");
...
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

### Examples <a name="examples"></a> [&#x2191;](#start)

```js
var source = {a: 1, b: 2};
var copy = mixing.copy(source);   // Make a shallow copy of source
var result = mixing({a: 1, b: 2}, {c: 3, d: 4});   // result is {a: 1, b: 2, c: 3, d: 4}
mixing({a: 1, b: 2}, {a: "a", b: {}, c: 3, d: 4});   // Returns {a: 1, b: 2, c: 3, d: 4}
mixing(
    {a: 1, b: 2, z: 100},
    {a: "a", b: {}, c: 3, d: 4},
    {overwrite: true}
);   // Returns {a: "a", b: {}, c: 3, d: 4, z: 100}
// Overwrite only fields whose names are matching regular expression
mixing(
    {a: 1, b: 2, alfa: "omega", delta: "gamma", z: 100},
    {a: "a", b: {c: true}, d: 4, delta: 3, z: false},
    {overwrite: /^[a-c]$/}
);   // Returns {a: "a", alfa: "omega", b: {c: true}, d: 4, delta: "gamma", z: 100}
// Recursive mix
mixing(
    {a: 1, b: {c: "", d: false}, e: [{f1: 1, f2: 2}, {f1: 0, f3: 9}], z: true},
    {a: 3, b: {c: 1, c2: "abc"}, e: [{f2: -3}, {f1: 7, f2: null}, {f1: 10}], x: "way"},
    {overwrite: true, recursive: true, mixArray: true}
);   // Returns {a: 3, b: {c: 1, d: false, c2: "abc"}, e: [{f1: 1, f2: -3}, {f1: 7, f3: 9, f2: null}, {f1: 10}], x: "way", z: true}

mixing(
    {a: 1, b: 2, c: "", d: false},
    {a: -1, b: null, c: true, d: "empty"},
    {overwrite: true, except: {a: false, b: true, c: null, d: "yes"}}
);   // Returns {a: -1, b: 2, c: true, d: false}
mixing(
    {a: 1, b: 2},
    {a3: 3, b: null, c4: "e5", d_97: new Date(), c: 3, "e-2": "empty"},
    {except: /\d/}
);   // Returns {a: 1, b: 2, c: 3}
mixing.copy(
    {a: 1, a2: 2, a3: "a3", b: 4, copy5: 5, d: "delta", e: "-123"},
    {except: /a/, filter: /\W/}
);   // Returns {e: "-123"}
mixing(
    {x: 5},
    {a: 1, a2: "2man", a3: "a3", b: 4, copy5: 5, delta: "plus", e: 4},
    {copy: /a/, filter: /^\D/}
);   // Returns {x: 5, a3: "a3", delta: "plus"}
mixing.assign(
    {a: "start"},
    {a: 1, b: 0},
    {b: 2, c: 3, d: 4},
    null,
    {e: "end"}
);   // Returns {a: 1, b: 2, c: 3, d: 4, e: "end"}

// Change default settings
mixing.setSettings({overwrite: true, oneSource: true});
// Mix arrays
mixing([1, 2, 3], ["a", "b", "c", "d"]);   // Returns ["a", "b", "c", "d"]
mixing([3, 2, 1, 4, 5], [1, 2, 3]);   // Returns [1, 2, 3, 4, 5]
// Get redefined default settings
mixing.getSettings();   // Returns {overwrite: true, oneSource: true}
// Reset default settings to initial values
mixing.setSettings();

// Filter and change field values
mixing({}, 
       [{a: 1, b: 100}, null, {c: 3, d: new Date(), e: 4}, {f: "str", g: 50}, undefined, {h: 7}], 
       {
           except: ["a", "g"],
           filter: function(data) {
               var value = data.value;
               return typeof value === "number" && value < 10;
           },
           change: function(data) {
               var value = data.value;
               return value > 5 ? value * value : value;
           }
       });   // Returns {c: 3, e: 4, h: 49}

mixing.change(
    {a: 1, b: "abc", c: null, d: 4444, e: false},
    {b: 22, c: 333, e: 55555}
);   // Returns {a: 1, b: 22, c: 333, d:4444, e: 55555}

// Change items in array
mixing.mixToItems(
    [{a: 1, b: 2}, {b: 3}, 83, {}],
    {a: null, c: 9}
);   // Returns [{a: 1, b: 2, c: 9}, {a: null, b: 3, c: 9}, 83, {a: null, c: 9}]
mixing.mixToItems(
    [null, {a: 1, b: 2}, {b: 3, z: 0}, {}],
    {a: null, b: false},
    {overwrite: true}
);   // Returns [null, {a: null, b: false}, {a: null, b: false, z: 0}, {a: null, b: false}]

// Clone, filter, map, update
var obj = {
    a: 1,
    b: 2,
    clone: mixing.clone,
    filter: mixing.filter,
    map: mixing.map,
    update: mixing.update
};
obj[Symbol("field")] = Symbol("value");
var obj2 = obj.clone();   // obj2 is a shallow copy of obj (contains symbol property key)

function isNumericValue(data) {
    return typeof data.value === "number";
}

var obj3 = obj.filter(isNumericValue);   // {a: 1, b: 2}

var obj4 = obj.map({
    filter: isNumericValue,
    change: function(data) {
        return data.value + data.value;
    }
});   // {a: 2, b: 4}

obj.update(function(data) {
    var value = data.value;
    return typeof value === "number"
                ? ++value
                : value;
});   // obj is {a: 2, b: 3, clone: ...}
```

See additional examples in tests.

## API <a name="api"></a> [&#x2191;](#start)

See `doc` directory for details.

### mixing(destination: Object, source: Array | Object, [settings: Object]);

Copy/add all fields and functions from `source` object(s) into the `destination` object.
As a result the `destination` object may be modified.

Several settings are supported (see `doc/module-mixing.html` for details):

* `copyFunc`: `Boolean` - Should functions be copied?
* `funcToProto`: `Boolean` - Should functions be copied into `prototype` of the `destination` object's `constructor`?
* `processSymbol`: `Boolean` - Should symbol property keys be processed?
* `overwrite`: `Boolean | Function | RegExp` - Specifies whether a field/function should be overwritten when it exists in the target object.
* `recursive`: `Boolean` - Should this function be called recursively when field's value of the `destination` and `source` object is an object?
* `mixFromArray`: `Boolean` - Should in recursive mode contents of a field of the source object be copied when the field's value is an array?
* `mixToArray`: `Boolean` - Should in recursive mode contents of a field of the source object be copied into a field of the target object when the latest field's value is an array?
* `mixArray`: `Boolean` - Default value for `mixFromArray` and `mixToArray` settings.
* `oneSource`: `Boolean` - Should `source` array be interpreted directly as copied object instead of list of source objects?
* `ownProperty`: `Boolean` - Should only own properties of the source object be copied into the target object?
* `copy`: `Array | Object | RegExp | String | Symbol` - Array, object, regular expression or string/symbol that defines names of fields/functions that should be copied.
* `except`: `Array | Object | RegExp | String | Symbol` - Array, object, regular expression or string/symbol that defines names of fields/functions that shouldn't be copied.
* `filter`: `Function | RegExp` - Function or regular expression that can be used to select elements that should be copied.
* `otherName`: `Object` - Defines "renaming table" for copied elements.
* `change`: `Function | Object` - Function or object that gives ability to change values that should be copied.

### .assign(destination: Object, ...source: Object);

Copy values of all of the own properties from one or more source objects to the target object
(similar to `Object.assign`).

### .change(source: Array | Object, change: Function | Object);

Change values of fields of given object.

### .copy(source: Array | Object, [settings: Object]);

Make a copy of source object(s).

### .mixToItems(destinationList: Array, source: Array | Object, [settings: Object]);

Copy fields from source object(s) into every object item of given array.

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
var result = obj.filter(function(data) {
    // data.source is obj, data.target is result
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
var result = obj.map(function(data) {
    // data.source is obj, data.target is result
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

### .update(change: Function | Object);

Change values of fields of `this` object.
This function can be transferred to an object to use as a method.
For example:
```js
SomeClass.prototype.update = mixing.update;
...
var obj = new SomeClass();
...
obj.update({a: 2, b: ""});
```

### .getSettings();

Return default settings that were set earlier.

### .setSettings([settings: Object]);

Set (redefine, reset) default settings that should be used for subsequent `mixing` calls.

## Related projects <a name="related"></a> [&#x2191;](#start)

* [adam](https://github.com/gamtiq/adam)
* [basespace](https://github.com/gamtiq/basespace)
* [extend](https://github.com/gamtiq/extend)
* [teo](https://github.com/gamtiq/teo)

## Licence

MIT
