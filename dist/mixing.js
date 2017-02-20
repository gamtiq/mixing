
(function(root, factory) {
    if(typeof exports === 'object') {
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
        if ((! settings.ownProperty || source.hasOwnProperty(propName))
                && (! settings.copyMap || (propName in settings.copyMap))
                && (! settings.copyRegExp || settings.copyRegExp.test(sPropString))
                && (! settings.exceptions || ! settings.exceptions[propName])
                && (! settings.exceptRegExp || ! settings.exceptRegExp.test(sPropString))
                && (! settings.filter || settings.filter.call(null, {field: propName, value: propValue, target: destination, source: source}))
                && (! settings.filterRegExp || settings.filterRegExp.test(typeof propValue === "symbol" ? propValue.toString() : propValue))) {
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
                if ((settings.overwrite || ! (propName in destination))
                        && (! bFuncProp || settings.copyFunc)) {
                    if (settings.changeFunc) {
                        propValue = settings.changeFunc.call(null, {field: propName, value: propValue, target: destination, source: source});
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
     * @param {Object} destination
     *      The target object into which fields and functions will be copied.
     * @param {Array | Object} source
     *      Array of source objects or just one object whose contents will be copied.
     *      If a source is a falsy value (e.g. <code>null</code> or <code>undefined</code>), the source will be skipped.
     * @param {Object} [settings]
     *      Operation settings. Fields are names of settings, their values are the corresponding values of settings.
     *      The following settings are being supported.
     *      <table>
     *          <tr>
     *              <th>Name</th><th>Type</th><th>Default value</th><th>Description</th>
     *          </tr>
     *          <tr>
     *              <td><code>copyFunc</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>true</code></td>
     *              <td>Should functions be copied?</td>
     *          </tr>
     *          <tr>
     *              <td><code>funcToProto</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>
     *                  Should functions be copied into <code>prototype</code> of the target object's <code>constructor</code>
     *                  (i.e. into <code>destination.constructor.prototype</code>)?
     *                  <br>
     *                  If <code>false</code> then functions will be copied directly into the target object.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>processSymbol</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>true</code></td>
     *              <td>Should symbol property keys (i.e. fields whose name is a symbol) be processed?</td>
     *          </tr>
     *          <tr>
     *              <td><code>overwrite</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>Should a field/function be overwritten when it exists in the target object?</td>
     *          </tr>
     *          <tr>
     *              <td><code>recursive</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>
     *                  Should this function be called recursively when field's value of the target and source object is an object?
     *                  <br>
     *                  If <code>true</code> then object fields from the target and source objects will be mixed by using this function
     *                  with the same settings.
     *                  <br>
     *                  This option has no dependency with <code>overwrite</code> setting and has priority over it.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>mixFromArray</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>
     *                  Should contents of a field of the source object be copied when the field's value is an array?
     *                  <br>
     *                  Will be used only when <code>recursive</code> setting has <code>true</code> value.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>mixToArray</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>
     *                  Should contents of a field of the source object be copied into a field of the target object
     *                  when the latest field's value is an array?
     *                  <br>
     *                  Will be used only when <code>recursive</code> setting has <code>true</code> value.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>oneSource</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>
     *                  Indicates that array that is passed as <code>source</code> parameter should be interpreted
     *                  directly as copied object instead of list of source objects.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>ownProperty</code></td>
     *              <td><code>Boolean</code></td>
     *              <td><code>false</code></td>
     *              <td>Should only own properties of the source object be copied in the target object?</td>
     *          </tr>
     *          <tr>
     *              <td><code>copy</code></td>
     *              <td><code>Array | Object | RegExp | String | Symbol</code></td>
     *              <td><code>""</code> (empty string)</td>
     *              <td>
     *                  Array, object, regular expression or string/symbol that defines names of fields/functions that should be copied.
     *                  <br>
     *                  If an object is passed then his fields determine copied elements.
     *                  If a regular expression is passed, then field names matching the regular expression will be copied.
     *                  If a string/symbol is passed then it is name of the only copied field.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>except</code></td>
     *              <td><code>Array | Object | RegExp | String | Symbol</code></td>
     *              <td><code>""</code> (empty string)</td>
     *              <td>
     *                  Array, object, regular expression or string/symbol that defines names of fields/functions that shouldn't be copied.
     *                  <br>
     *                  If an object is passed then his fields with true values determine non-copied elements.
     *                  If a regular expression is passed, then field names matching the regular expression will not be copied.
     *                  If a string/symbol is passed then it is name of the only non-copied field.
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>filter</code></td>
     *              <td><code>Function | RegExp</code></td>
     *              <td><code>null</code></td>
     *              <td>
     *                  Function or regular expression that can be used to select elements that should be copied.
     *                  <br>
     *                  If regular expression is passed, only those fields will be copied whose values are matching regular expression.
     *                  <br>
     *                  If specified function returns <code>true</code> for a field,
     *                  the field will be copied in the target object.
     *                  <br>
     *                  An object having the following fields is passed into filter function:
     *                  <ul>
     *                  <li><code>field</code> - field name
     *                  <li><code>value</code> - field value
     *                  <li><code>target</code> - reference to the target object
     *                  <li><code>source</code> - reference to the source object
     *                  </ul>
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>otherName</code></td>
     *              <td><code>Object</code></td>
     *              <td><code>null</code></td>
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
     *                  <code>{prop: 1, method: "no-func"}</code>
     *              </td>
     *          </tr>
     *          <tr>
     *              <td><code>change</code></td>
     *              <td><code>Function | Object</code></td>
     *              <td><code>null</code></td>
     *              <td>
     *                  Function or object that gives ability to change values that should be copied.
     *                  <br>
     *                  If an object is passed then his fields determine new values for copied elements.
     *                  <br>
     *                  If a function is passed then value returned by the function for a field will be copied into the target object 
     *                  instead of original field's value.
     *                  <br>
     *                  An object having the following fields is passed into change function:
     *                  <ul>
     *                  <li><code>field</code> - field name
     *                  <li><code>value</code> - field value
     *                  <li><code>target</code> - reference to the target object
     *                  <li><code>source</code> - reference to the source object
     *                  </ul>
     *              </td>
     *          </tr>
     *      </table>
     *      <code>copy</code>, <code>except</code> and <code>filter</code> settings can be used together.
     *      In such situation a field will be copied only when the field satisfies to all settings
     *      (i.e. belongs to copied elements, not in exceptions and conforms to filter).
     * @return {Object}
     *      Modified target object.
     * @alias module:mixing
     */
    function mixing(destination, source, settings) {
        /*jshint boss:true, laxbreak:true*/
        if (typeof source === "object" && source !== null) {
            // Prepare parameters
            if (typeof settings !== "object" || settings === null) {
                settings = {};
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
                    mixFromArray: Boolean(settings.mixFromArray),
                    mixToArray: Boolean(settings.mixToArray),
                    overwrite: Boolean(settings.overwrite),
                    ownProperty: Boolean(settings.ownProperty),
                    recursive: Boolean(settings.recursive),
                    otherNameMap: ("otherName" in settings ? settings.otherName : null)
                },
                bOwnProperty = options.ownProperty,
                bProcessSymbol = options.processSymbol,
                change = settings.change,
                copyList = settings.copy,
                exceptList = settings.except,
                filter = settings.filter,
                nI, nK, nL, nQ, obj, propName;
            
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
     *      Modified <code>source</code> object.
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
     * Make a copy of <code>this</code> object.
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
     *      Newly created object containing contents of <code>this</code> object.
     */
    mixing.clone = function(settings) {
        return mixing({}, this, settings);
    };

    /**
     * Filter <code>this</code> object.
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
     *      Newly created object containing fields of <code>this</code> object for which filter function returns true.
     */
    mixing.filter = function(filter) {
        return mixing({}, this, typeof filter === "function" ? {filter: filter} : filter);
    };

    /**
     * Copy and change values of fields of <code>this</code> object.
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
     *      Newly created object containing fields of <code>this</code> object with changed values.
     */
    mixing.map = function(change) {
        return mixing({}, this, typeof change === "function" ? {change: change} : change);
    };

    /**
     * Copy/add all fields and functions from source objects into <code>this</code> object.
     * As a result <code>this</code> object may be modified.
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
     *      Modified <code>this</code> object.
     */
    mixing.mix = function(source, settings) {
        return mixing(this, source, settings);
    };

    /**
     * Change values of fields of <code>this</code> object.
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
     *      Modified <code>this</code> object.
     */
    mixing.update = function(change) {
        return mixing.change(this, change);
    };

    module.exports = mixing;

    return mixing;
}));
