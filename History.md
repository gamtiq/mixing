### 1.2.6 / 2020-08-14

* fix `.d.ts` file

### 1.2.5 / 2020-02-20

* a function or RegExp can be used as value for `overwrite` setting
* add `mixArray` setting

### 1.2.4 / 2019-01-26

* fix error when `except` option is not applied on recursive copying

### 1.2.3 / 2018-12-02

* add `assign` method
* add types declaration file

### 1.2.2 / 2018-05-09

* add `mixToItems` method
* add ability to redefine default values of settings (`setSettings` method).

### 1.2.1 / 2017-02-21

* remove `isarray-shim` component dependency
* remove Jam and SPM support

### 1.2.0 / 2015-12-31

* add ability to select non-copied fields via object value of `except` setting (_backward incompatible change_)

### 1.1.0 / 2015-06-28

* add ability to process symbol property keys (`processSymbol` setting)

### 1.0.0 / 2015-03-22

* change parameters for the functional settings `filter` and `change` (_backward incompatible change_)

### 0.1.4 / 2015-03-17

* add [jspm](https://jspm.io) support

### 0.1.3 / 2015-01-20

* an object can be used as value for `change` setting
* add `change` and `update` methods

### 0.1.2 / 2015-01-04

* migration to [Component](https://github.com/componentjs/component) 1.0

### 0.1.1 / 2014-11-16

* add `copy` setting to specify names of fields/functions that should be copied
* RegExp can be used as value for `except` and `filter` settings

### 0.1.0 / 2014-07-05

* add `ownProperty` setting to copy only own properties of object(s)
* add `filter` and `map` methods to process `this` object
* add data about SPM package

### 0.0.5 / 2014-06-14

* add `mixFromArray` and `mixToArray` settings to tune mixing of arrays

### 0.0.4 / 2014-05-01

* add `change` setting that allows modifying of copied values
* add `copy` and `clone` methods to make object's copy

### 0.0.3 / 2014-03-25

* add `filter` setting that allows selecting fields that should be copied
* skip a source if the source is a falsy value

### 0.0.2 / 2013-09-06

* add `Gruntfile`
* add UMD distribution `dist/mixing.js` and  `dist/mixing.min.js`
