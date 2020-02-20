(function(root, factory) {
    if (root === undefined && window !== undefined) root = window;
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require, exports, module);
    }
    else if(typeof define === 'function' && define.amd) {
        define(['require', 'exports', 'module'], factory);
    }
    else {
        var req = function(id) {return root[id];},
            exp = root,
            mod = {exports: exp};
        root['mixing'] = factory(req, exp, mod);
    }
}(this, function(require, exports, module) {
/**
 * @module mixing 
 */

/*jshint latedef:nofunc*/

var defaultSettings;

if (! Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
}

function prepareFieldList(fieldList, value) {
    var map, nI, regexp, sType;
    if (Array.isArray(fieldList)) {
        if (fieldList.length > 0) {
            map = {};
            nI = fieldList.length;
            do {
                map[ fieldList[--nI] ] = value || null;
            } while(nI);
        }
    }
    else {
        sType = typeof fieldList;
        if (sType === "string" || sType === "symbol") {
            map = {};
            map[fieldList] = value || null;
        }
        else if (sType === "object") {
            if (fieldList instanceof RegExp) {
                regexp = fieldList;
            }
            else {
                map = fieldList;
            }
        }
    }
    return {map: map, regexp: regexp};
}

function copy(destination, source, propName, settings) {
    /*jshint laxbreak:true*/
    var propValue = source[propName],
        sPropString = propName.toString(),
        bFuncProp, change, otherNameMap, sType, value;

    function getParam() {
        return {
            field: propName,
            value: propValue,
            targetValue: destination[propName],
            target: destination,
            source: source
        };
    }

    if ((! settings.ownProperty || source.hasOwnProperty(propName))
            && (! settings.copyMap || (propName in settings.copyMap))
            && (! settings.copyRegExp || settings.copyRegExp.test(sPropString))
            && (! settings.exceptions || ! settings.exceptions[propName])
            && (! settings.exceptRegExp || ! settings.exceptRegExp.test(sPropString))
            && (! settings.filter || settings.filter.call(null, getParam()))
            /* jshint -W122 */
            && (! settings.filterRegExp || settings.filterRegExp.test(typeof propValue === "symbol" ? propValue.toString() : propValue))) {
            /* jshint +W122 */
        otherNameMap = settings.otherNameMap;
        if (otherNameMap && (propName in otherNameMap)) {
            propName = otherNameMap[propName];
        }
        sType = typeof propValue;
        // If recursive mode and field's value is an object
        if (settings.recursive && propValue && sType === "object" && (value = destination[propName]) && typeof value === "object"
                && (! Array.isArray(propValue) || settings.mixFromArray) && (! Array.isArray(value) || settings.mixToArray)) {
            mixing(value, propValue,
                    settings.mixFromArray
                        ? mixing({oneSource: true}, settings)
                        : settings);
        }
        else {
            bFuncProp = (sType === "function");
            if ((! bFuncProp || settings.copyFunc)
                    && (! (propName in destination)
                        || ((value = settings.overwrite)
                            && ( typeof value !== "function" || value(getParam()) )
                            && ( ! (value instanceof RegExp) || value.test(propName) ) ))) {
                if (settings.changeFunc) {
                    propValue = settings.changeFunc.call(null, getParam());
                }
                else if ((change = settings.change) && (propName in change)) {
                    propValue = change[propName];
                }
                if (bFuncProp && settings.funcToProto) {
                    destination.constructor.prototype[propName] = propValue;
                }
                else {
                    destination[propName] = propValue;
                }
            }
        }
    }
}

/**
 * Copy/add all fields and functions from source objects into the target object.
 * As a result the target object may be modified.
 *
 * @param {Object | Function} destination
 *      The target object into which fields and functions will be copied.
 * @param {Array | Object} source
 *      Array of source objects or just one object whose contents will be copied.
 *      If a source is a falsy value (e.g. `null` or `undefined`), the source will be skipped.
 * @param {Object} [settings]
 *      Operation settings. Fields are names of settings, their values are the corresponding values of settings.
 *      The following settings are being supported.
 *      <table>
 *          <tr>
 *              <th>Name</th><th>Type</th><th>Default value</th><th>Description</th>
 *          </tr>
 *          <tr>
 *              <td>`copyFunc`</td>
 *              <td>`Boolean`</td>
 *              <td>`true`</td>
 *              <td>Should functions be copied?</td>
 *          </tr>
 *          <tr>
 *              <td>`funcToProto`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Should functions be copied into `prototype` of the target object's `constructor`
 *                  (i.e. into `destination.constructor.prototype`)?
 *                  <br>
 *                  If `false` then functions will be copied directly into the target object.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`processSymbol`</td>
 *              <td>`Boolean`</td>
 *              <td>`true`</td>
 *              <td>Should symbol property keys (i.e. fields whose name is a symbol) be processed?</td>
 *          </tr>
 *          <tr>
 *              <td>`overwrite`</td>
 *              <td>`Boolean | Function | RegExp`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Specifies whether a field/function should be overwritten when it exists in the target object.
 *                  <br>
 *                  If `true` then any existent field will be overwritten in the target object.
 *                  <br>
 *                  Function or regular expression can be used to select fields that should be overwritten.
 *                  <br>
 *                  If a regular expression is passed, only those fields will be overwritten
 *                  whose names are matching the regular expression.
 *                  <br>
 *                  If specified function returns `true` for a field,
 *                  the field will be overwritten in the target object.
 *                  An object with contextual data is passed into the function (see details below).
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`recursive`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Should this function be called recursively when field's value of the target and source object is an object?
 *                  <br>
 *                  If `true` then object fields from the target and source objects will be mixed by using this function
 *                  with the same settings.
 *                  <br>
 *                  This option has no dependency with `overwrite` setting and has priority over it.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`mixFromArray`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Should contents of a field of the source object be copied when the field's value is an array?
 *                  <br>
 *                  Will be used only when `recursive` setting has `true` value.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`mixToArray`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Should contents of a field of the source object be copied into a field of the target object
 *                  when the latest field's value is an array?
 *                  <br>
 *                  Will be used only when `recursive` setting has `true` value.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`mixArray`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Sets default value for `mixFromArray` and `mixToArray` settings.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`oneSource`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>
 *                  Indicates that array that is passed as `source` parameter should be interpreted
 *                  directly as copied object instead of list of source objects.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`ownProperty`</td>
 *              <td>`Boolean`</td>
 *              <td>`false`</td>
 *              <td>Should only own properties of the source object be copied in the target object?</td>
 *          </tr>
 *          <tr>
 *              <td>`copy`</td>
 *              <td>`Array | Object | RegExp | String | Symbol`</td>
 *              <td>`""` (empty string)</td>
 *              <td>
 *                  Array, object, regular expression or string/symbol that defines names of fields/functions that should be copied.
 *                  <br>
 *                  If an object is passed then his fields determine copied elements.
 *                  If a regular expression is passed, then field names matching the regular expression will be copied.
 *                  If a string/symbol is passed then it is name of the only copied field.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`except`</td>
 *              <td>`Array | Object | RegExp | String | Symbol`</td>
 *              <td>`""` (empty string)</td>
 *              <td>
 *                  Array, object, regular expression or string/symbol that defines names of fields/functions that shouldn't be copied.
 *                  <br>
 *                  If an object is passed then his fields with true values determine non-copied elements.
 *                  If a regular expression is passed, then field names matching the regular expression will not be copied.
 *                  If a string/symbol is passed then it is name of the only non-copied field.
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`filter`</td>
 *              <td>`Function | RegExp`</td>
 *              <td>`null`</td>
 *              <td>
 *                  Function or regular expression that can be used to select elements that should be copied.
 *                  <br>
 *                  If regular expression is passed, only those fields will be copied whose values are matching regular expression.
 *                  <br>
 *                  If specified function returns `true` for a field,
 *                  the field will be copied in the target object.
 *                  <br>
 *                  An object with contextual data is passed into function (see details below).
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`otherName`</td>
 *              <td>`Object`</td>
 *              <td>`null`</td>
 *              <td>
 *                  Defines "renaming table" for copied elements.
 *                  <br>
 *                  Fields of the table are names from a source object, values are the corresponding names in the target object.
 *                  <br>
 *                  For example, the call
 *                  <br>
 *                  <code>
 *                  mixing({}, {field: 1, func: "no-func"}, {otherName: {"field": "prop", "func": "method"}})
 *                  </code>
 *                  <br>
 *                  will return the following object
 *                  <br>
 *                  `{prop: 1, method: "no-func"}`
 *              </td>
 *          </tr>
 *          <tr>
 *              <td>`change`</td>
 *              <td>`Function | Object`</td>
 *              <td>`null`</td>
 *              <td>
 *                  Function or object that gives ability to change values that should be copied.
 *                  <br>
 *                  If an object is passed then his fields determine new values for copied elements.
 *                  <br>
 *                  If a function is passed then value returned by the function for a field will be copied into the target object 
 *                  instead of original field's value.
 *                  <br>
 *                  An object with contextual data is passed into function (see details below).
 *              </td>
 *          </tr>
 *      </table>
 *      An object having the following fields is passed into `overwrite`, `filter` or `change` function:
 *      <ul>
 *          <li>`field` - field name
 *          <li>`value` - field value from the source object
 *          <li>`targetValue` - field value from the target object
 *          <li>`target` - reference to the target object
 *          <li>`source` - reference to the source object
 *      </ul>
 *      Default values of settings can be redefined by {@link module:mixing.setSettings setSettings} method.
 *      <br>
 *      `copy`, `except` and `filter` settings can be used together.
 *      In such situation a field will be copied only when the field satisfies to all settings
 *      (i.e. belongs to copied elements, not in exceptions and conforms to filter).
 * @return {Object}
 *      Modified target object.
 * @alias module:mixing
 */
function mixing(destination, source, settings) {
    /*jshint boss:true, laxbreak:true*/
    var destinationType = typeof destination;
    var sourceType = typeof source;
    if (destination && (destinationType === "object" || destinationType === "function")
            && source && (sourceType === "object" || sourceType === "function")) {
        var obj;
        // Prepare parameters
        if (typeof settings !== "object" || settings === null) {
            settings = defaultSettings || {};
        }
        else if (defaultSettings) {
            obj = defaultSettings;
            defaultSettings = null;
            settings = mixing({}, [settings, obj]);
            defaultSettings = obj;
        }
        if (! Array.isArray(source) || settings.oneSource) {
            source = [source];
        }
        // Prepare settings
        var getOwnPropertySymbols = Object.getOwnPropertySymbols,
            getPrototypeOf = Object.getPrototypeOf,
            options = {
                copyFunc: ("copyFunc" in settings ? settings.copyFunc : true),
                funcToProto: Boolean(settings.funcToProto),
                processSymbol: ("processSymbol" in settings ? settings.processSymbol : true)
                                    && typeof getOwnPropertySymbols === "function",
                mixFromArray: Boolean( ("mixFromArray" in settings) ? settings.mixFromArray : settings.mixArray ),
                mixToArray: Boolean( ("mixToArray" in settings) ? settings.mixToArray : settings.mixArray ),
                overwrite: settings.overwrite,
                ownProperty: Boolean(settings.ownProperty),
                recursive: Boolean(settings.recursive),
                otherNameMap: ("otherName" in settings ? settings.otherName : null),

                changeFunc: settings.changeFunc,
                copyMap: settings.copyMap,
                copyRegExp: settings.copyRegExp,
                exceptions: settings.exceptions,
                exceptRegExp: settings.exceptRegExp,
                filterRegExp: settings.filterRegExp
            },
            bOwnProperty = options.ownProperty,
            bProcessSymbol = options.processSymbol,
            change = settings.change,
            copyList = settings.copy,
            exceptList = settings.except,
            filter = settings.filter,
            nI, nK, nL, nQ, propName;
        
        if (copyList) {
            copyList = prepareFieldList(copyList);
            options.copyMap = copyList.map;
            options.copyRegExp = copyList.regexp;
        }
        if (exceptList) {
            exceptList = prepareFieldList(exceptList, true);
            options.exceptions = exceptList.map;
            options.exceptRegExp = exceptList.regexp;
        }
        if (filter) {
            options[typeof filter === "object" ? "filterRegExp" : "filter"] = filter;
        }
        if (change) {
            options[typeof change === "function" ? "changeFunc" : "change"] = change;
        }
        
        // Copy fields and functions according to settings
        for (nI = 0, nL = source.length; nI < nL; nI++) {
            if (obj = source[nI]) {
                for (propName in obj) {
                    copy(destination, obj, propName, options);
                }
                // Process symbol property keys
                if (bProcessSymbol) {
                    exceptList = {};
                    do {
                        copyList = getOwnPropertySymbols(obj);
                        for (nK = 0, nQ = copyList.length; nK < nQ; nK++) {
                            propName = copyList[nK];
                            if (! (propName in exceptList)) {
                                copy(destination, obj, propName, options);
                                exceptList[propName] = true;
                            }
                        }
                        obj = bOwnProperty
                                ? null
                                : getPrototypeOf(obj);
                    } while (obj);
                }
            }
        }
    }
    return destination;
}

/**
 * Copy values of all of the own properties from one or more source objects to the target object
 * (similar to `Object.assign`).
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * mixing(destination, Array.prototype.slice.call(arguments, 1), {overwrite: true, ownProperty: true});
 * </pre></code>
 * 
 * @param {Object | Function} destination
 *      The target object into which fields and functions will be copied.
 * @param {...Object} source
 *      An object whose contents will be copied.
 *      If a source is a falsy value (e.g. `null` or `undefined`), the source will be skipped.
 * @return {Object}
 *      Modified `target` object.
 */
mixing.assign = function(destination) {
    return mixing(destination, Array.prototype.slice.call(arguments, 1), {overwrite: true, ownProperty: true});
};

/**
 * Change values of fields of given object.
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * mixing(source, source, {change: change, overwrite: true, oneSource: true});
 * </pre></code>
 * 
 * @param {Array | Object} source
 *      An array or an object whose fields should be modified.
 * @param {Function | Object} change
 *      A function or an object that specifies the modification. See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Modified `source` object.
 */
mixing.change = function(source, change) {
    return mixing(source, source, {change: change, overwrite: true, oneSource: true});
};

/**
 * Make a copy of source object(s).
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * var copy = mixing({}, source, settings);
 * </pre></code>
 * 
 * @param {Array | Object} source
 *      Array of source objects or just one object whose contents will be copied.
 * @param {Object} [settings]
 *      Operation settings. See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Newly created object containing contents of source objects.
 */
mixing.copy = function(source, settings) {
    return mixing({}, source, settings);
};

/**
 * Copy fields from source object(s) into every object item of given array.
 * 
 * @param {Array} destinationList
 *      An array whose items should be modified.
 * @param {Array | Object} source
 *      Array of source objects or just one object whose contents will be copied.
 * @param {Object} [settings]
 *      Operation settings that will be applied to every copying. See {@link module:mixing mixing} for details.
 * @return {Array}
 *      Original `destinationList` with possibly modified object items.
 */
mixing.mixToItems = function(destinationList, source, settings) {
    for (var nI = 0, nL = destinationList.length; nI < nL; nI++) {
        destinationList[nI] = mixing(destinationList[nI], source, settings);
    }
    return destinationList;
};

/**
 * Make a copy of `this` object.
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * var copy = mixing({}, this, settings);
 * </pre></code>
 * It can be transferred to an object to use as a method.
 * 
 * @param {Object} [settings]
 *      Operation settings. See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Newly created object containing contents of `this` object.
 */
mixing.clone = function(settings) {
    return mixing({}, this, settings);
};

/**
 * Filter `this` object.
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * var result = mixing({}, this, {filter: filter});
 * </pre></code>
 * It can be transferred to an object to use as a method.
 * 
 * @param {Function | Object} filter
 *      Filter function to select fields or object that represents operation settings including filter function.
 *      See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Newly created object containing fields of `this` object for which filter function returns true.
 */
mixing.filter = function(filter) {
    return mixing({}, this, typeof filter === "function" ? {filter: filter} : filter);
};

/**
 * Copy and change values of fields of `this` object.
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * var result = mixing({}, this, {change: change});
 * </pre></code>
 * It can be transferred to an object to use as a method.
 * 
 * @param {Function | Object} change
 *      Function to change values of copied fields or object that represents operation settings including change function.
 *      See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Newly created object containing fields of `this` object with changed values.
 */
mixing.map = function(change) {
    return mixing({}, this, typeof change === "function" ? {change: change} : change);
};

/**
 * Copy/add all fields and functions from source objects into `this` object.
 * As a result `this` object may be modified.
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * mixing(this, source, settings);
 * </pre></code>
 * It can be transferred to an object to use as a method.
 * 
 * @param {Array | Object} source
 *      Array of source objects or just one object whose contents will be copied.
 * @param {Object} [settings]
 *      Operation settings. See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Modified `this` object.
 */
mixing.mix = function(source, settings) {
    return mixing(this, source, settings);
};

/**
 * Change values of fields of `this` object.
 * <br>
 * This function is a "wrap" for the following code:
 * <code><pre>
 * mixing.change(this, change);
 * </pre></code>
 * It can be transferred to an object to use as a method.
 * 
 * @param {Function | Object} change
 *      A function or an object that specifies the modification. See {@link module:mixing mixing} for details.
 * @return {Object}
 *      Modified `this` object.
 */
mixing.update = function(change) {
    return mixing.change(this, change);
};

/**
 * Return default settings that were set earlier.
 * 
 * @return {Object | undefined}
 *      Default settings that were set earlier or `undefined / null` if default settings were not set.
 */
mixing.getSettings = function() {
    return defaultSettings;
};

/**
 * Set (redefine, reset) default settings that should be used for subsequent {@link module:mixing mixing} calls.
 * 
 * @param {Object | undefined} [settings]
 *      Default settings that should be used for subsequent {@link module:mixing mixing} calls.
 *      Initial default values will be used for settings that are not specified in the passed object.
 *      Pass `undefined`, `null`, non-object or to call without parameter
 *      to reset default settings to initial values.
 * @alias module:mixing.setSettings
 */
mixing.setSettings = function(settings) {
    defaultSettings = typeof settings === "object" ? settings : null;
};

module.exports = mixing;

return mixing;
}));
