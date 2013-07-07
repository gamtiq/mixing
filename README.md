# mixing

Functions to mix objects

## Installation

### Node

    npm install mixing

### Component

Install component:

    npm install -g component

Then:

    component install gamtiq/mixing

## Usage

### Node, Component

```js

    var mixing = require("mixing");
    ...
    var copy = mixing({}, source);   // Make a shallow copy of source
    var result = mixing({a: 1, b: 2}, {c: 3, d: 4});   // result is {a: 1, b: 2, c: 3, d: 4}
    mixing({a: 1, b: 2}, {a: "a", b: {}, c: 3, d: 4});   // Returns {a: 1, b: 2, c: 3, d: 4}
    mixing({a: 1, b: 2, z: 100}, {a: "a", b: {}, c: 3, d: 4}, {overwrite: true});   // Returns {a: "a", b: {}, c: 3, d: 4, z: 100}
```

## API

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
```

## Licence

MIT
