// Tests for mixing component/module
describe("mixing", function() {
    
    function emptyFunc() {}
    
    function method1(a, b, c) {
        return a + b + c;
    }
    
    function method2(a, b) {
        return a > b;
    }
    
    var bSymbol = typeof Symbol === "function",
        str = "f1",
        num = 7,
        emptyObj = {},
        emptyArray = [],
        nullVal = null,
        sEmpty = "",
        undef = undefined,
        list = [str, num, emptyObj, emptyArray, nullVal, sEmpty, undef],
        obj = {a: str, b: num, c: emptyArray, d: nullVal, e: sEmpty, f: undef, g: list},
        couple = [list, obj],
        source = {a: list, b: obj, c: couple, d: {e: str, f: obj, g: couple, m1: method1}, met2: method2},
        expect, mixin, sym1, sym2, sym3;
    
    function Core() {
    }
    Core.prototype = obj;
    
    couple.a = sEmpty;
    couple.g = emptyObj;
    couple.met = method2;
    
    if (bSymbol) {
        sym1 = Symbol("symbol 1");
        sym2 = Symbol("symbol 2");
        sym3 = Symbol("symbol 3");
        source[sym1] = "symbol 1";
        source[sym3] = sym2;
    }
    
    // node
    if (typeof mixing === "undefined") {
        mixin = require("../index");
        expect = require("./lib/chai").expect;
    }
    // browser
    else {
        mixin = mixing;
        expect = chai.expect;
    }
    
    
    function addField(dest) {
        var bAdd = bSymbol,
            field, sType;
        for (var nI = 1, nL = arguments.length; nI < nL; nI += 2) {
            field = arguments[nI];
            sType = typeof field;
            if (bAdd || (sType !== "symbol" && sType !== "undefined")) {
                dest[field] = arguments[nI + 1];
            }
        }
        return dest;
    }
    
    function checkDestination(dest, source, settings, valueMap, exceptList) {
        var fieldList = Object.getOwnPropertyNames(valueMap).concat(bSymbol ? Object.getOwnPropertySymbols(valueMap) : []),
            field, nI, nL;
        mixin(dest, source, settings);
        for (nI = 0, nL = fieldList.length; nI < nL; nI++) {
            field = fieldList[nI];
            expect( field in dest )
                .equal(true);
            expect( dest[field] )
                .eql(valueMap[field]);
        }
        if (exceptList) {
            for (nI = 0, nL = exceptList.length; nI < nL; nI++) {
                expect( exceptList[nI] in dest )
                    .equal(false);
            }
        }
    }
    
    function incNumValue(data) {
        var value = data.value;
        return typeof value === "number"
                ? ++value
                : value;
    }
    
    
    describe("mixing()", function() {
        
        describe("mixing({}, {})", function() {
            it("should return empty object", function() {
                expect( mixin({}, {}) )
                    .eql({});
            });
        });
        
        describe("mixing(destination, {} | [] | [{}] | [{}, {}] | destination)", function() {
            it("should return unmodified destination object", function() {
                var dest = {a: 1, b: 2, c: {d: 4, e: {f: 5, g: "text"}}};
                expect( mixin(dest, {}) )
                    .eql(dest);
                expect( mixin(dest, []) )
                    .eql(dest);
                expect( mixin(dest, [{}]) )
                    .eql(dest);
                expect( mixin(dest, [{}, {}]) )
                    .eql(dest);
                expect( mixin(dest, dest) )
                    .eql(dest);
                expect( mixin(source, source) )
                    .eql(source);
            });
        });
        
        describe("mixing(destination, null | undefined | false | '' | 0 | [null, undefined, false, '', 0])", function() {
            it("should return unmodified destination object", function() {
                var dest = {a: obj, b: couple, c: source};
                expect( mixin(dest, null) )
                    .eql(dest);
                expect( mixin(dest, undef) )
                    .eql(dest);
                expect( mixin(dest, false) )
                    .eql(dest);
                expect( mixin(dest, "") )
                    .eql(dest);
                expect( mixin(dest, 0) )
                    .eql(dest);
                expect( mixin(dest, [null, 0]) )
                    .eql(dest);
                expect( mixin(dest, [false, '', null]) )
                    .eql(dest);
                expect( mixin(dest, [null, undef, false, '', 0]) )
                    .eql(dest);
            });
        });
        
        describe("mixing(<non-object value>, source)", function() {
            it("should return passed value", function() {
                function check(value, source, settings) {
                    expect( mixin(value, source, settings) )
                        .equal( value );
                }

                check(null, {a: 1, b: 2});
                check(false, true);
                check("test string", [couple, source]);
            });
        });
        
        describe("mixing(destination, source)", function() {
            it("should copy all fields from the source object into the destination object", function() {
                var dest = {a: str, b: num, f1: str, f2: num};
                
                expect( mixin({}, source) )
                    .eql(source);
                expect( mixin({a: 1, b: 2}, {c: 3, d: 4}) )
                    .eql({a: 1, b: 2, c: 3, d: 4});
                
                expect( mixin(dest, {c: list, d: obj, f3: method1, f4: source}) )
                    .eql({a: str, b: num, f1: str, f2: num, c: list, d: obj, f3: method1, f4: source});
                
                expect(dest)
                    .have.property("c", list);
                expect(dest)
                    .have.property("d", obj);
                expect(dest)
                    .have.property("f3", method1);
                expect(dest)
                    .have.property("f4", source);
            });
            
            it("should copy fields from the source object into the destination function", function() {
                function dest() {
                    console.log('test function');
                }

                dest.a = 1;
                
                expect( mixin(dest, {a: 2, b: "value", z: false}) )
                    .equal(dest);
                
                expect(dest)
                    .have.property("a", 1);
                expect(dest)
                    .have.property("b", "value");
                expect(dest)
                    .have.property("z", false);
            });
            
            it("should copy fields from the source function into the destination object", function() {
                function source() {
                    console.log('test function');
                }

                source.a = num;
                source.met = method1;
                
                var dest = {a: null, b: "test"};

                expect( mixin(dest, source) )
                    .eql( {a: null, b: "test", met: method1} );
            });
            
            it("should copy all fields from the source object that are absent in the destination object", function() {
                var dest = {a: list, "very long field name": couple, empty: sEmpty};
                
                expect( mixin({a: 1, b: 2}, {a: "a", b: emptyObj, c: 3, d: 4}) )
                    .eql({a: 1, b: 2, c: 3, d: 4});
                
                expect( mixin(dest, {m1: method1, empty: nullVal, a: source}) )
                    .eql({a: list, "very long field name": couple, empty: sEmpty, m1: method1});
                
                expect(dest)
                    .have.property("m1", method1);
                
                dest = {a: 1, d: null, met2: undef};
                dest[sym1] = "s1";
                dest[sym2] = "s2";
                
                checkDestination(dest, source, null,
                                    addField({a: 1, b: obj, c: couple, d: null, met2: undef},
                                                sym1, "s1",
                                                sym2, "s2",
                                                sym3, sym2));
            });
            
            it("should copy nothing", function() {
                var dest = {a: 1, b: 2};
                expect( mixin(obj, {a: "space", c: null, g: {}}) )
                    .eql(obj);
                expect( mixin({a: 1, b: 2}, {b: new Date()}) )
                    .eql(dest);
            });
        });
        
        describe("mixing(destination, [source1, source2, ...])", function() {
            it("should copy all fields from source objects into the destination object", function() {
                expect( mixin({}, [null, source, undef, source, 0, source, false, source, ""]) )
                    .eql(source);
                expect( mixin({a: 1, b: 2}, [{c: 3}, {d: 4}, {e: couple, f: source, g: list}]) )
                    .eql({a: 1, b: 2, c: 3, d: 4, e: couple, f: source, g: list});
                expect( mixin({"a b c": method1, "d e f": method2}, [{"g h i": list}]) )
                    .eql({"a b c": method1, "d e f": method2, "g h i": list});
                expect( mixin({a: 1, start: "now"}, [{c: 3}, null, {delta: source}, false, 0, {finish: "endless"}]) )
                    .eql({a: 1, start: "now", c: 3, delta: source, finish: "endless"});
                
                checkDestination({c: "tree", d: "four"},
                                    [
                                         addField({a: null}, sym1, undef),
                                         addField({a: "2"}, sym1, "s1"),
                                         addField({c: 7}, sym2, sym2)
                                     ],
                                    null,
                                    addField({c: "tree", d: "four", a: null},
                                                sym1, undef,
                                                sym2, sym2));
            });
        });
        
        describe("mixing(destination, source, {copyFunc: false}])", function() {
            var settings = {copyFunc: false};
            it("should copy all non-functional fields from the source object into the destination object", function() {
                var dest = {m1: method1, m2: method2, m3: "method3"};
                
                expect( mixin({}, source, settings) )
                    .eql({a: source.a, b: source.b, c: source.c, d: source.d});
                expect( mixin({}, dest, settings) )
                    .eql({m3: "method3"});
                expect( mixin(dest, {m1: method1, m2: method2, m3: emptyFunc, m4: function() {return this;}}, settings) )
                    .eql(dest);
                
                expect( mixin(dest, {gamma: obj, a: method1, b: method2, delta: couple, c: emptyFunc}, settings) )
                    .eql({m1: method1, m2: method2, m3: "method3", gamma: obj, delta: couple});
                
                expect(dest)
                    .have.property("gamma", obj);
                expect(dest)
                    .have.property("delta", couple);
            });
        });
        
        describe("mixing(destination, source, {funcToProto: true}])", function() {
            var settings = {funcToProto: true};
            it("should copy all non-functional fields from the source object into the destination object "
                    + "and all functional fields into destination's constructor prototype", function() {
                    
                function Klass() {
                    this.a = couple;
                    this.b = source;
                }
                Klass.prototype.m1 = method1;
                
                var dest = new Klass(),
                    proto = Klass.prototype;
                
                expect( mixin(dest, {a: str, b: num, m1: source, m2: method2, c: list, delta: couple, m3: emptyFunc}, settings) )
                    .eql({a: couple, b: source, m1: method1, m2: method2, c: list, delta: couple, m3: emptyFunc});
                
                expect(dest)
                    .have.property("c", list);
                expect(dest)
                    .have.property("delta", couple);
                expect(dest)
                    .have.property("m2", method2);
                expect(dest)
                    .have.property("m3", emptyFunc);
                
                expect(proto)
                    .have.property("m2", method2);
                expect(proto)
                    .have.property("m3", emptyFunc);
            });
        });
        
        if (bSymbol) {
            describe("mixing(destination, source, {processSymbol: false}])", function() {
                var settings = {processSymbol: false};
                it("should copy all property names (not symbol property keys) from the source object into the destination object", function() {
                    var dest = {a: 1},
                        result = {a: 1, b: source.b, c: source.c, d: source.d, met2: source.met2};
                    dest[sym1] = 0;
                    result[sym1] = dest[sym1];
                    
                    checkDestination({}, source, settings,
                                        {a: source.a, b: source.b, c: source.c, d: source.d, met2: source.met2},
                                        [sym1, sym2, sym3]);
        
                    checkDestination(dest, source, settings,
                                        result,
                                        [sym2, sym3]);
                });
            });
        }
        
        describe("mixing(destination, source, {overwrite: true}])", function() {
            var settings = {overwrite: true};
            it("should change field values in the destination object", function() {
                var dest = {a: 1, b: 2, c: 3};
                
                expect( mixin({a: 1, b: 2, z: 100}, {a: "a", b: emptyObj, c: 3, d: 4}, settings) )
                    .eql({a: "a", b: emptyObj, c: 3, d: 4, z: 100});
                
                expect( mixin(dest, {a: str, b: num, d: obj, m1: emptyFunc}, settings) )
                    .eql({a: str, b: num, c: 3, d: obj, m1: emptyFunc});
                
                expect(dest)
                    .have.property("a", str);
                expect(dest)
                    .have.property("b", num);
                expect(dest)
                    .have.property("c", 3);
                expect(dest)
                    .have.property("d", obj);
                expect(dest)
                    .have.property("m1", emptyFunc);
                
                checkDestination( addField({a: "one", c: undef}, sym3, "s3"),
                                    addField({a: null, b: 2}, sym3, sym1, sym2, "s2"),
                                    settings,
                                    addField({a: null, b: 2, c: undef}, sym3, sym1, sym2, "s2"));
            });
        });
        
        describe("mixing(destination, source, {recursive: true}])", function() {
            var settings = {recursive: true};
            it("should copy fields recursively", function() {
                var dest = {a: 1, b: {c: 3, o: {f1: str, f2: num, f3: obj}}, x: method1, y: {y3: str}};
                
                expect( mixin(dest, 
                                {a: list, b: {c: undef, d: 4, o: {f1: emptyArray, f3: nullVal, f7: emptyObj}}, 
                                    e: obj, y: {y1: num, y2: couple}}, 
                                settings) )
                    .eql({a: 1, b: {c: 3, d: 4, o: {f1: str, f2: num, f3: obj, f7: emptyObj}}, 
                            e: obj, x: method1, y: {y1: num, y2: couple, y3: str}});
                
                expect(dest)
                    .have.property("b")
                    .have.property("d", 4);
                expect(dest)
                    .have.property("b")
                    .have.property("o")
                    .have.property("f7", emptyObj);
                expect(dest)
                    .have.property("e", obj);
                expect(dest)
                    .have.property("y")
                    .have.property("y1", num);
                expect(dest)
                    .have.property("y");
                expect(dest)
                    .have.deep.property("y.y2", couple);
                
                checkDestination(addField({h: ""}, sym1, addField({u: 2}, sym2, "s2")),
                                    addField({h: "no", g: "yes"}, sym1, addField({k: 2}, sym2, "symbo", sym1, "s1")),
                                    settings,
                                    addField({h: "", g: "yes"},
                                                sym1, addField({u: 2, k: 2},
                                                                sym2, "s2",
                                                                sym1, "s1")));
            });
        });
        
        describe("mixing(destination, source, {recursive: true, mixFromArray: true}])", function() {
            var settings = {recursive: true, mixFromArray: true};
            it("should copy fields recursively and mix from array", function() {
                var destObj = {one: 1, two: 2},
                    dest = {a: destObj};
                
                expect( mixin(dest, 
                                {a: [1, 2, 3]}, 
                                settings) )
                    .eql({a: {one: 1, two: 2, 0: 1, 1: 2, 2: 3}});
                
                expect(destObj)
                    .have.property("0", 1);
                expect(destObj)
                    .have.property("1", 2);
                expect(destObj)
                    .have.property("2", 3);
            });
        });
        
        describe("mixing(destination, source, {recursive: true, mixToArray: true}])", function() {
            var settings = {recursive: true, mixToArray: true};
            it("should copy fields recursively and mix to array", function() {
                var destArray = [1, 2, 3],
                    dest = {a: destArray};
                
                expect( mixin(dest, 
                                {a: {one: 1, two: 2}}, 
                                settings) )
                    .eql({a: destArray});
                
                expect(destArray)
                    .have.property("one", 1);
                expect(destArray)
                    .have.property("two", 2);
            });
        });
        
        describe("mixing(destination, source, {recursive: true, mixFromArray: true, mixToArray: true}])", function() {
            var settings = {recursive: true, mixFromArray: true, mixToArray: true};
            it("should copy fields recursively and mix from and to array", function() {
                expect( mixin({a: [1, 2, 3, 4, 5]}, 
                                {a: [11, 22, 33]}, 
                                settings) )
                    .eql({a: [1, 2, 3, 4, 5]});
                
                expect( mixin({a: [1, 2, 3, 4, 5]}, 
                        {a: [11, 22, 33]}, 
                        {recursive: true, mixFromArray: true, mixToArray: true, overwrite: true}) )
                    .eql({a: [11, 22, 33, 4, 5]});
                
                expect( mixin({a: [1, 2, 3]}, 
                        {a: [11, 22, 33, 44, 55]}, 
                        settings) )
                    .eql({a: [1, 2, 3, 44, 55]});
                
                expect( mixin({a: [1, 2, 3]}, 
                        {a: [11, 22, 33, 44, 55]}, 
                        {recursive: true, mixFromArray: true, mixToArray: true, overwrite: true}) )
                    .eql({a: [11, 22, 33, 44, 55]});
            });
        });
        
        describe("mixing(destination, array, {oneSource: true}])", function() {
            var settings = {oneSource: true};
            it("should copy fields from array object", function() {
                var dest = {a: obj, met: undef, c: 3};
                
                expect( mixin({}, couple, settings) )
                    .eql({"0": list, "1": obj, a: couple.a, g: couple.g, met: couple.met});
                
                expect( mixin(dest, couple, settings) )
                    .eql({"0": list, "1": obj, a: obj, met: undef, c: 3, g: couple.g});
            
                expect(dest)
                    .have.property("1", obj);
                expect(dest)
                    .have.property("0", list);
                expect(dest)
                    .have.property("a", obj);
                expect(dest)
                    .have.property("c", 3);
    //            expect(dest)
    //                .have.property("met", undef);
                expect(dest)
                    .have.property("g", couple.g);
            });
        });
        
        describe("mixing(destination, source, {ownProperty: ...}])", function() {
            describe("mixing(destination, source, {ownProperty: true}])", function() {
                var settings = {ownProperty: true};
                
                it("should copy only own properties from source object", function() {
                    var src = new Core();
                    src.b = "beta";
                    src.e = "epsilon";
                    src.x = 707;
                    
                    expect( mixin({}, src, settings) )
                        .eql({b: "beta", e: "epsilon", x: 707});
                    
                    if (bSymbol) {
                        checkDestination(addField({inside: "out"}, sym3, "symbol", 1, "one"),
                                            addField(Object.create( addField({src: 789}, sym1, 1, sym2, 2) ),
                                                        sym1, "s1",
                                                        "a", 100,
                                                        "b", "light"),
                                            settings,
                                            addField({inside: "out", "1": "one", a: 100, b: "light"},
                                                        sym1, "s1",
                                                        sym3, "symbol"),
                                            [src, sym2]);
                    }
                });
                
                it("should copy nothing", function() {
                    expect( mixin({}, new Core(), settings) )
                        .eql({});
                });
            });
            
            describe("mixing(destination, source, {ownProperty: false}])", function() {
                var settings = {ownProperty: false};
                
                it("should copy all properties (including inherited) from source object", function() {
                    var src = new Core();
                    src.a = "alfa";
                    src.g = 8;
                    src.z = "final";
                    
                    expect( mixin({}, src, settings) )
                        .eql({a: "alfa", b: num, c: emptyArray, d: nullVal, e: sEmpty, f: undef, g: 8, z: "final"});
                });
            });
        });
        
        describe("mixing(destination, source, {copy: ...})", function() {
            
            describe("mixing(destination, source, {copy: 'name1'})", function() {
                it("should copy only specified field", function() {
                    expect( mixin({a: 1, d: "enigma"}, obj, {copy: "e"}) )
                        .eql({a: 1, d: "enigma", e: sEmpty});
                });
            });
            
            if (bSymbol) {
                describe("mixing(destination, source, {copy: someSymbol})", function() {
                    it("should copy only specified symbol field", function() {
                        checkDestination({a: 1, y: "net"},
                                            source,
                                            {copy: sym3},
                                            addField({a: 1, y: "net"}, sym3, sym2),
                                            ["b", "c", "d", "met2", sym1]);
                    });
                });
            }
            
            describe("mixing(destination, source, {copy: ['name1', someSymbol1, ...]})", function() {
                it("should copy only those fields from the source object that are mentioned in the array", function() {
                    expect( mixin({a: 1, b: 2}, {a: 4, c: 2, d: 1, z: -99}, {copy: ["a", "c", "z"]}) )
                        .eql({a: 1, b: 2, c: 2, z: -99});
                    
                    checkDestination({zero: "code"},
                                        source,
                                        {copy: ["b", sym1, "met2"]},
                                        addField({zero: "code", b: source.b, met2: source.met2},
                                                    sym1, source[sym1]),
                                        ["a", "c", "d", sym3]);
                });
            });
            
            describe("mixing(destination, source, {copy: {'name1': value1, someSymbol1: value2, ...}})", function() {
                it("should copy only those fields from the source object that are in the specified object", function() {
                    expect( mixin({beta: 2, delta: 4}, obj, {copy: {c: null, d: 1, f: undef}}) )
                        .eql({beta: 2, delta: 4, c: emptyArray, d: nullVal, f: undef});
                    
                    checkDestination({extra: "field", s: 7, d: 4},
                                        source,
                                        {copy: addField({a: true, d: null}, sym1, null)},
                                        addField({extra: "field", s: 7, d: 4, a: source.a},
                                                    sym1, source[sym1]),
                                        ["b", "c", "met2", sym3]);
                });
            });
            
            describe("mixing(destination, source, {copy: /regular expression/})", function() {
                it("should copy only those fields from the source object that match the regular expression", function() {
                    expect( mixin({f: 7, g: 6}, {a: 5, 2: "limited", u: 3, 777: 1, jk: 4, "4you": 83}, {copy: /^\d/}) )
                        .eql({f: 7, g: 6, 2: "limited", 777: 1, "4you": 83});
                    
                    checkDestination({omega: 3, b: 777},
                                        source,
                                        {copy: /bol/},
                                        addField({omega: 3, b: 777},
                                                    sym1, source[sym1],
                                                    sym3, source[sym3]),
                                        ["a", "c", "d", "met2"]);
                });
            });
        });
        
        describe("mixing(destination, source, {except: ...})", function() {
            
            describe("mixing(destination, source, {except: 'name1'})", function() {
                var settings = {except: "long name"};
                it("should copy all fields from the source object except one that is specified", function() {
                    var dest = {a: 1, z: 100};
                    
                    expect( mixin(dest, {list: list, "long name": "long name", couple: couple, obj: obj}, settings) )
                        .eql({a: 1, z: 100, list: list, couple: couple, obj: obj});
                
                    expect(dest)
                        .have.property("list", list);
                    expect(dest)
                        .have.property("couple", couple);
                    expect(dest)
                        .have.property("obj", obj);
                    expect(dest)
                        .not.have.property("long name");
                });
            });
            
            if (bSymbol) {
                describe("mixing(destination, source, {except: someSymbol})", function() {
                    it("should copy all fields from the source object except one that is specified", function() {
                        checkDestination({c: 3},
                                            source,
                                            {except: sym3},
                                            addField({c: 3, a: source.a, b: source.b, d: source.d, met2: source.met2},
                                                        sym1, source[sym1]),
                                            [sym3]);
                    });
                });
            }
            
            describe("mixing(destination, source, {except: ['name1', someSymbol1, ...]})", function() {
                var settings = {except: ["a", "c", "f"]};
                it("should copy all fields from the source object except those that are mentioned in the array", function() {
                    var dest = {b: null, beta: 3, d: couple};
                    
                    expect( mixin({}, {a: "alpha", c: null, d: 7}, {except: []}) )
                        .eql({a: "alpha", c: null, d: 7});
                
                    expect( mixin({}, {a: 4, b: 3, c: 2, d: 1}, settings) )
                        .eql({b: 3, d: 1});
                    
                    expect( mixin(dest, {m1: str, a: obj, m2: method1, f: list}, settings) )
                        .eql({b: null, beta: 3, d: couple, m1: str, m2: method1});
                
                    expect(dest)
                        .have.property("m1", str);
                    expect(dest)
                        .have.property("m2", method1);
                    expect(dest)
                        .not.have.property("a");
                    expect(dest)
                        .not.have.property("c");
                    expect(dest)
                        .not.have.property("f");
                    
                    checkDestination({c: 3},
                                        source,
                                        {except: ["a", "met2", sym1, sym3]},
                                        {c: 3, b: source.b, d: source.d},
                                        [sym1, sym3]);
                });
            });
            
            describe("mixing(destination, source, {except: {'name1': value1, someSymbol1: value2, ...}})", function() {
                var settings = {except: {beta: true, alpha: false, omega: "exclude"}};
                it("should copy all fields from the source object except those that are in the exception object", function() {
                    var dest = {a: null, beta: 3, dream: "win"};
                    
                    expect( mixin({}, {alpha: 1, beta: 2, gamma: 3, delta: 4, omega: 7}, settings) )
                        .eql({alpha: 1, gamma: 3, delta: 4});
                    
                    expect( mixin(dest, {star: "super", a: list, beta: 100, bet: couple, alpha: true, omega: null}, settings) )
                        .eql({a: null, beta: 3, dream: "win", star: "super", bet: couple, alpha: true});
                
                    expect(dest)
                        .have.property("a", null);
                    expect(dest)
                        .have.property("beta", 3);
                    expect(dest)
                        .have.property("star", "super");
                    expect(dest)
                        .have.property("bet", couple);
                    expect(dest)
                        .have.property("alpha", true);
                    expect(dest)
                        .not.have.property("omega");
                    
                    checkDestination({d: undef, e: 5, met2: null},
                                        source,
                                        {except: addField({a: 1, b: null}, sym3, true)},
                                        addField({d: undef, e: 5, met2: null, b: source.b, c: source.c},
                                                    sym1, source[sym1]),
                                        ["a", sym3]);
                });
            });
            
            describe("mixing(destination, source, {except: /regular expression/})", function() {
                it("should copy all fields from the source object except those that match the regular expression", function() {
                    var dest = {b: "eta"};
                    
                    expect( mixin(dest, obj, {except: /[c-f]/}) )
                        .eql({a: str, b: "eta", g: list});
                
                    dest = {b: 1, c: 4};
                    expect( mixin(dest, {b: 5, a4: -3, d: 9, a1: "", alfa: "rays"}, {except: /^a\d/}) )
                        .eql({b: 1, c: 4, d: 9, alfa: "rays"});
                    
                    checkDestination({a: 1, c: 3, e: 5},
                                        source,
                                        {except: /sym/},
                                        {a: 1, c: 3, e: 5, b: source.b, d: source.d, met2: source.met2},
                                        [sym1, sym3]);
                });
            });

            describe("mixing(destination, source, {except: ..., recursive: true})", function() {
                it("should copy recursively all fields from the source object except those that are specified", function() {
                    checkDestination({a: 1, b: {b: 2}, d: null},
                                        {a: false, b: {c: 2, copy: 'me', d: 3}, c: true, e: 'end', z: 100},
                                        {except: 'c', recursive: true},
                                        {a: 1, b: {b: 2, copy: 'me', d: 3}, d: null, e: 'end', z: 100});
                    
                    checkDestination({a: 1, b: {b: 2}, d: null},
                                        {a: false, b: {c: 2, c3: 3, copy: 'me', access: false, end: true, d: 3}, c: true, delta: 5, e: 'end', z: 100},
                                        {except: /^(c|d)/, recursive: true},
                                        {a: 1, b: {b: 2, access: false, end: true}, d: null, e: 'end', z: 100});
                    
                    checkDestination({a: 1, b: {b: 2, end: null}, d: null},
                                        {a: false, b: {c: 2, c3: 3, copy: 'me', access: false, end: true, d: 3}, c: true, d: 10, delta: 5, e: 'end', z: 100},
                                        {except: /^(c|d)/, recursive: true, overwrite: true},
                                        {a: false, b: {b: 2, access: false, end: true}, d: null, e: 'end', z: 100});
                });
            });
        });
        
        describe("mixing(destination, source, {filter: ...})", function() {
            function filter(data) {
                return ["a", "c", "z", "list", "obj"].indexOf(data.field) > -1;
            }
            
            describe("mixing(destination, source, {filter: someFunction})", function() {
                it("should copy all fields from the source object except those for which filter function returns false", function() {
                    var settings = {filter: filter};
                    
                    expect( mixin({}, {a: 1, list: couple, z: "end"}, settings) )
                        .eql({a: 1, z: "end", list: couple});
                    expect( mixin({}, {b: 2, couple: list, x: "yz"}, settings) )
                        .eql({});
                    expect( mixin({}, obj, settings) )
                        .eql({a: obj.a, c: obj.c});
                    
                    expect( mixin({sole: "field"}, {a: 1, z: obj, b: 2}, settings) )
                        .eql({sole: "field", a: 1, z: obj});
                    expect( mixin({sole: "field", c: "creative"}, {obj: obj, c: 3, delta: 5, some: "value", sole: "island"}, settings) )
                        .eql({sole: "field", c: "creative", obj: obj});
                });
            });
            
            describe("mixing(destination, source, {filter: /regular expression/})", function() {
                it("should copy those fields from the source object whose values are matching regular expression", function() {
                    expect( mixin({}, {a: "str", b: 7, c: null, d: obj, e: -1, f: []}, {filter: /\d/}) )
                        .eql({b: 7, e: -1});
                    expect( mixin({}, {b: 39, f: "do!", x: "yz", z: "end."}, {filter: /^[^?!.]+$/}) )
                        .eql({b: 39, x: "yz"});
                    expect( mixin({}, {a: obj, b: 832, f: "done", nega: -64, no: null, s: "5th"}, {filter: /^\D/}) )
                        .eql({a: obj, f: "done", nega: -64, no: null});
                    
                    checkDestination({field: "value", t: 9},
                                        source,
                                        {filter: /^Symbol\(/},
                                        addField({field: "value", t: 9}, sym3, sym2),
                                        ["a", "b", "c", "d", "met2", sym1]);
                });
            });
            
            describe("mixing(destination, source, {except: ..., filter: ...})", function() {
                it("should copy all fields from the source object except those that are specified or do not conform to filter", function() {
                    var settings = {except: ["a", "obj"], filter: filter};
                    
                    expect( mixin({}, {a: 1, list: couple, z: "end"}, settings) )
                        .eql({z: "end", list: couple});
                    expect( mixin({}, {b: 2, couple: list, x: "yz", obj: {}}, settings) )
                        .eql({});
                    expect( mixin({}, obj, settings) )
                        .eql({c: obj.c});
                    
                    expect( mixin({omega: "o", delta: "d"}, {a: 1, list: null, c: 3, delta: 4, obj: obj}, settings) )
                        .eql({omega: "o", delta: "d", list: null, c: 3});
                    
                    expect( mixin({}, 
                                    [{a: 1, b: 100}, null, {c: 3, d: new Date(), e: 4}, {f: "str", g: 50}, undefined, {h: 7}], 
                                    {
                                        except: ["a", "g"],
                                        filter: function(data) {
                                            var value = data.value;
                                            return typeof value === "number" && value < 10;
                                        }
                                    }) )
                        .eql({c: 3, e: 4, h: 7});
                    
                    expect( mixin({}, {a: 1, a2: 2, a3: "a3", b: 4, copy5: 5, d: "delta", e: "-123"}, {except: /\d/, filter: /\d/}) )
                        .eql({a: 1, b: 4, e: "-123"});
                    expect( mixin({}, {a: 1, a2: 2, a3: "a3", b: 4, copy5: 5, d: "delta", e: "-123"}, {except: /a/, filter: /\W/}) )
                        .eql({e: "-123"});
                });
            });
            
            describe("mixing(destination, source, {copy: ..., except: ..., filter: ...})", function() {
                it("should copy only those fields from the source object that conform to specified conditions", function() {
                    expect( mixin({a: 1}, 
                                    {a: "str", gamma: 7, c: null, delta: obj, e: -1, fall: "abc", omega: "3", astro: "naut"}, 
                                    {copy: /a/, except: /l/, filter: /\d/}) )
                        .eql({a: 1, gamma: 7, omega: "3"});
                });
            });
        });
        
        describe("mixing(destination, array, {otherName: {name1: 'name2', someSymbol: otherSymbol, ...}])", function() {
            var settings = {otherName: {a: "alpha", b: "beta", met1: "smeta"}};
            it("should copy fields under other names", function() {
                var dest = {a: obj, b: 2, c: emptyArray};
                
                expect( mixin({}, {field: 1, func: "no-func"}, {otherName: {"field": "prop", "func": "method"}}) )
                    .eql({prop: 1, method: "no-func"});
                
                expect( mixin(dest, {a: null, b: list, c: couple, met1: emptyFunc, met2: method2, d: num}, settings) )
                    .eql({a: obj, b: 2, c: emptyArray, alpha: null, beta: list, smeta: emptyFunc, met2: method2, d: num});
            
                expect(dest)
                    .have.property("a", obj);
                expect(dest)
                    .have.property("b", 2);
                expect(dest)
                    .have.property("c", emptyArray);
                expect(dest)
                    .have.property("alpha", null);
                expect(dest)
                    .have.property("beta", list);
                expect(dest)
                    .have.property("smeta", emptyFunc);
                expect(dest)
                    .have.property("met2", method2);
                expect(dest)
                    .have.property("d", num);
                
                checkDestination({d: 0},
                                    source,
                                    {otherName: addField({a: "x", met2: "f"}, sym3, sym2)},
                                    addField({d: 0, x: source.a, b: source.b, c: source.c, f: source.met2},
                                                sym1, source[sym1],
                                                sym2, source[sym3]),
                                    ["a", "met2", sym3]);
            });
            
            it("should copy fields under other names except those that are specified in the exceptions", function() {
                var dest = {alpha: "a", beta: "b", gamma: "g"};
                
                expect( mixin(dest, {a: 1, b: 2, c: 3, d: 4, e: 5}, 
                                {
                                    otherName: {a: "alpha", b: "beta", c: "gamma", d: "delta"}, 
                                    except: ["a", "c", "e"], 
                                    overwrite: true
                                    }) )
                    .eql({alpha: "a", beta: 2, gamma: "g", delta: 4});
            
                expect(dest)
                    .have.property("alpha", "a");
                expect(dest)
                    .have.property("beta", 2);
                expect(dest)
                    .have.property("gamma", "g");
                expect(dest)
                    .have.property("delta", 4);
                expect(dest)
                    .not.have.property("e");
                
                if (bSymbol) {
                    checkDestination({a: 3},
                                        source,
                                        {
                                            otherName: addField({d: "delta"}, sym1, "s", sym3, "myth"),
                                            except: ["b", "met2", sym3]
                                        },
                                        {a: 3, c: source.c, delta: source.d, s: source[sym1]},
                                        ["b", "d", "met2", sym1, sym3]);
                }
            });
        });
        
        describe("mixing(destination, source, {change: function...})", function() {
            function change(data) {
                var value = data.value,
                    sType = typeof value;
                if (sType === "number") {
                    value *= value;
                }
                else if (sType === "string") {
                    value += value;
                }
                return value;
            }
            
            function changeToStr(data) {
                // toString() call is necessary in Node 0.12.2 and earlier
                return typeof data.value === "symbol"
                        ? data.value.toString()
                        : String(data.value);
            }
            
            it("should copy changed values", function() {
                var settings = {change: change};
                
                expect( mixin({}, {}, settings) )
                    .eql({});
                expect( mixin({}, {a: -10, b: 1, c: 10, d: "d", e: "End", f: "finita "}, settings) )
                    .eql({a: 100, b: 1, c: 100, d: "dd", e: "EndEnd", f: "finita finita "});
                expect( mixin({}, {a: 2, list: couple, s: "str", bool: false, empty: sEmpty}, settings) )
                    .eql({a: 4, s: "strstr", list: couple, bool: false, empty: sEmpty});
                expect( mixin({}, {no: null, undef: undef, obj: obj, met: method1}, settings) )
                    .eql({no: null, undef: undef, obj: obj, met: method1});
                
                settings = {change: changeToStr};
                
                expect( mixin({}, {a: 1, b: null, c: 123, z: "z"}, settings) )
                    .eql({a: "1", b: "null", c: "123", z: "z"});
                expect( mixin({}, {list: [1, 2, 3, 4], obj: source, value: true, couple: couple}, settings) )
                    .eql({list: "1,2,3,4", obj: "[object Object]", value: "true",
                            couple: couple[0].toString() + "," + couple[1].toString()});
                expect( mixin({}, {a: 1, b: "b", c: false, d: {}, e: change, f: null, g: undef, h: []}, settings) )
                    .eql({a: "1", b: "b", c: "false", d: "[object Object]", e: change.toString(), 
                            f: "null", g: "undefined", h: ""});
                
                if (bSymbol) {
                    checkDestination({a: 1},
                                        source,
                                        settings,
                                        addField({a: 1, b: String(source.b), c: String(source.c),
                                                            d: String(source.d), met2: String(source.met2)},
                                                    sym1, String(source[sym1]),
                                                    sym3, source[sym3].toString()));
                }
            });
        });
        
        describe("mixing(destination, source, {change: {field1: value1, ...})", function() {
            it("should copy changed values", function() {
                expect( mixin({}, {a: -9, b: undef, c: 10, d: "dom", e: "End", f: "finish", g: "galileo"}, 
                                {change: {a: "", d: 0, f: null}}) )
                    .eql({a: "", b: undef, c: 10, d: 0, e: "End", f: null, g: "galileo"});
                expect( mixin({omega: "o", eta: 2.7}, {list: couple, s: "str", b: true, mix: mixin, omega: 3}, 
                                {change: {eta: "nol", list: list, b: 5, a: 7}}) )
                    .eql({omega: "o", eta: 2.7, list: list, s: "str", b: 5, mix: mixin});
                
                if (bSymbol) {
                    checkDestination({c: "++"},
                                        source,
                                        {
                                            copy: ["a", "b", sym3],
                                            change: addField({a: "a", b: "b"}, sym3, sym3)
                                        },
                                        addField({c: "++", a: "a", b: "b"}, sym3, sym3),
                                        ["d", "met2", sym1]);
                }
            });
        });
    });
    
    
    
    describe(".assign(destination, source1, source2, ...)", function() {
        var assign = mixin.assign;
        it("should copy own properties of source objects into destination", function() {
            var src1 = new Core(),
                src2 = {a: 2, b: 4, src2: true},
                src3 = {a: 3, d: 10, src3: false, x: 5};
            src1.e = 'e';
            src1.src1 = 0;

            expect( assign({}, src1) )
                .eql( {e: 'e', src1: 0} );
            expect( assign({a: 0, z: false}, src1, null, src2, undef, src3) )
                .eql( {a: 3, z: false, e: 'e', src1: 0, b: 4, src2: true, d: 10, src3: false, x: 5} );
        });
        it("should return unmodified destination", function() {
            expect( assign({test: true, data: 3}, 0, false, '', null, undef) )
                .eql( {test: true, data: 3} );
            expect( assign({a: 'start', b: 'end'}, new Core(), {}) )
                .eql( {a: 'start', b: 'end'} );
        });
    });
    
    
    
    describe(".change(source, change)", function() {
        var change = mixin.change;
        it("should return unchanged source value", function() {
            expect( change(null) )
                .eql(null);
            expect( change(undef) )
                .eql(undef);
            expect( change("") )
                .eql("");
            expect( change(true) )
                .eql(true);
        });
        it("should return modified source object/array", function() {
            function check(obj, update, expected) {
                var result = change(obj, update);
                expect( result )
                    .equal(obj);
                expect( result )
                    .eql(expected);
            }
            
            check( {a: 1, b: 2, c: 3},
                    {b: "two", a: null},
                    {a: null, b: "two", c: 3} );
            check( {a: 1, b: "2", c: 3, d: 100, e: null},
                    incNumValue,
                    {a: 2, b: "2", c: 4, d: 101, e: null} );
            
            check( [1, 2, 3, 4, 5],
                    {0: 0, 3: 100},
                    [0, 2, 3, 100, 5] );
            check( ["abc", 4, null, change, -1],
                    incNumValue,
                    ["abc", 5, null, change, 0] );
        });
    });
    
    
    
    describe(".copy(source, settings)", function() {
        var copy = mixin.copy;
        it("should return empty object", function() {
            expect( copy(null) )
                .eql({});
            expect( copy(undef) )
                .eql({});
            expect( copy([0, "", false, undef, null]) )
                .eql({});
        });
        it("should create copy of source object(s)", function() {
            expect( copy({a: 1}) )
                .eql({a: 1});
            expect( copy(obj) )
                .eql(obj);
            expect( copy(source) )
                .eql(source);
            
            expect( copy([obj, source]) )
                .eql({a: str, b: num, c: emptyArray, d: nullVal, e: sEmpty, f: undef, g: list, met2: method2});
            expect( copy([obj, null, source, {a: 1}, {f: obj, g: 0, h: "h"}], 
                            {
                                filter: function(data) {
                                    return typeof data.source[data.field] === "object";
                                }
                            }) )
                .eql({a: list, b: obj, c: emptyArray, d: nullVal, g: list, f: obj});
        });
    });
    
    
    
    describe(".mixToItems(list, source, settings)", function() {
        var mixToItems = mixin.mixToItems;
        it("should return non-modified array", function() {
            var list = [1, "moon", false, undef, null, -3, "end"];
            var original = list.slice(0);
            var result = mixToItems(list, {a: 1, '1': 100, g: list}, {overwrite: true});
            
            expect( result )
                .equal( list );
            expect( result )
                .eql( original );
        });

        it("should modify object items", function() {
            var obj1 = {a: 1, b: "second"};
            var obj2 = {b: num, c: method1}
            var list = ["start", obj1, 3, obj2, null];

            expect( mixToItems(list, [{a: 3}, {c: "cinema"}]) )
                .equal(list);
            expect( list[0] )
                .equal( "start" );
            expect( list[1] )
                .equal( obj1 );
            expect( list[2] )
                .equal( 3 );
            expect( list[3] )
                .equal( obj2 );
            expect( list[4] )
                .equal( null );

            expect( obj1 )
                .eql( {a: 1, b: "second", c: "cinema"} );
            expect( obj2 )
                .eql( {a: 3, b: num, c: method1} );
        });
    });
    
    
    
    describe(".clone(settings)", function() {
        var clone = mixin.clone;
        it("should create a copy of this object or object that has clone method", function() {
            var source = {
                a: "alfa",
                b: "beta",
                f: false,
                no: null,
                list: list,
                clone: clone
            };
            
            expect( clone.call(obj) )
                .eql(obj);
            expect( clone.call(source) )
                .eql(source);
            
            expect( source.clone() )
                .eql(source);
            expect( source.clone({except: ["a", "no", "clone"]}) )
                .eql({b: "beta", f: false, list: list});
            expect( source.clone({
                                    filter: function(data) {
                                        var sType = typeof data.source[data.field];
                                        return sType !== "object" && sType !== "function";
                                    }
                                }) )
                .eql({a: "alfa", b: "beta", f: false});
        });
    });
    
    
    
    describe(".filter(filter: Function | settings: Object)", function() {
        function filterObj(data) {
            return typeof data.value === "object";
        }
        
        function filterFunc(data) {
            return typeof data.value === "function";
        }
        
        var filter = mixin.filter;
        it("should filter this object or object that has filter method", function() {
            var source = {
                a: 0,
                b: "value",
                f: {
                    z: null,
                    omega: 2
                },
                list: list,
                filter: filter,
                m1: method1,
                m2: method2
            };
            
            expect( filter.call({a: 1, b: {}, c: "str", d: obj}, filterObj) )
                .eql({b: {}, d: obj});
            expect( filter.call(obj, filterObj) )
                .eql({c: emptyArray, d: nullVal, g: list});
            expect( filter.call(list, {filter: filterObj, oneSource: true}) )
                .eql({2: emptyObj, 3: emptyArray, 4: nullVal});
            expect( filter.call(obj, emptyFunc) )
                .eql({});
            
            expect( source.filter(filterObj) )
                .eql({f: source.f, list: list});
            expect( source.filter({filter: filterFunc}) )
                .eql({filter: filter, m1: method1, m2: method2});
        });
        
        it("should create a copy of this object", function() {
            function retTrue() {
                return true;
            }
            
            expect( filter.call(obj, {}) )
                .eql(obj);
            expect( filter.call(obj, retTrue) )
                .eql(obj);
            expect( filter.call(obj, {filter: retTrue}) )
                .eql(obj);
            expect( filter.call({a: obj, b: source, c: null}, {filter: filterObj}) )
                .eql({a: obj, b: source, c: null});
        });
    });
    
    
    
    describe(".map(change: Function | settings: Object)", function() {
        function sum(data) {
            var value = data.value,
                sType = typeof value;
            return sType === "number" || sType === "string" 
                        ? value + value 
                        : value;
        }
        
        function nullify(data) {
            var value = data.value;
            return typeof value === "object" ? null : value;
        }
        
        var map = mixin.map;
        it("should copy contents of this object or object that has map method and modify values of some fields", function() {
            var src = {
                a: "astra ",
                b: " naut",
                c: 2112,
                d: couple,
                e: obj,
                f: null,
                list: list,
                map: map,
                m1: method1,
                m2: method2
            };
            
            expect( map.call({a: 1, b: "b", c: 0}, sum) )
                .eql({a: 2, b: "bb", c: 0});
            expect( map.call(obj, nullify) )
                .eql({a: str, b: num, c: null, d: nullVal, e: sEmpty, f: undef, g: null});
            expect( map.call(source, {change: nullify}) )
                .eql({a: null, b: null, c: null, d: null, met2: method2});
            
            expect( src.map(sum) )
                .eql({a: "astra astra ", b: " naut naut", c: 4224, d: couple, e: obj, f: null,
                        list: list, map: map, m1: method1, m2: method2});
            expect( src.map(nullify) )
                .eql({a: "astra ", b: " naut", c: 2112, d: null, e: null, f: null,
                        list: null, map: map, m1: method1, m2: method2});
        });
        
        it("should create a copy of this object", function() {
            function retValue(data) {
                return data.value;
            }
            
            expect( map.call(obj, {}) )
                .eql(obj);
            expect( map.call(obj, retValue) )
                .eql(obj);
            expect( map.call(obj, {change: retValue}) )
                .eql(obj);
            expect( map.call({a: 1, b: 2, c: undef}, {change: retValue}) )
                .eql({a: 1, b: 2, c: undef});
        });
    });
    
    
    
    describe(".mix(source, settings)", function() {
        it("should copy fields into object that has mix method", function() {
            var dest = {
                a: 1,
                b: 2,
                mix: mixin.mix
            };
            
            expect( dest.mix({a: str, c: couple, obj: obj}, {overwrite: true}) )
                .eql(dest);
    
            expect(dest)
                .have.property("a", str);
            expect(dest)
                .have.property("b", 2);
            expect(dest)
                .have.property("c", couple);
            expect(dest)
                .have.property("obj", obj);
            expect(dest)
                .have.property("mix", mixin.mix);
        });
    });
    
    
    
    describe(".update(change)", function() {
        it("should modify fields into object that has update method", function() {
            var update = mixin.update,
                dest = {
                    a: 1,
                    b: "beta",
                    c: emptyFunc,
                    d: -8,
                    update: update
                };
            
            expect( dest.update(incNumValue) )
                .equal(dest);
            expect( dest )
                .eql({a: 2, b: "beta", c: emptyFunc, d: -7, update: update});
        });
    });
    
    
    
    describe(".getSettings()", function() {
        var getSettings = mixin.getSettings;
        var setSettings = mixin.setSettings;

        afterEach(function() {
            setSettings();
        });

        it("should return undefined", function() {
            expect( getSettings() )
                .equal( undef );
        });
        it("should return null", function() {
            setSettings({overwrite: false});
            setSettings({copyFunc: false});
            setSettings();

            expect( getSettings() )
                .equal( null );
        });
        it("should return object with last specified settings", function() {
            setSettings({overwrite: false});
            setSettings({copyFunc: false});

            expect( getSettings() )
                .eql( {copyFunc: false} );

            setSettings({processSymbol: false, ownProperty: true});

            expect( getSettings() )
                .eql( {processSymbol: false, ownProperty: true} );
        });
    });
    
    
    
    describe(".setSettings(settings)", function() {
        var setSettings = mixin.setSettings;

        afterEach(function() {
            setSettings();
        });

        it("should change default settings to specified values", function() {
            setSettings({overwrite: true});

            expect( mixin({a: 1}, [{a: 2, b: 2}, {a: 3, c: 3}]) )
                .eql( {a: 3, b: 2, c: 3} );

            setSettings({copyFunc: false, except: 'b'});

            expect( mixin({a: 1}, [{a: 2, b: 2, m: method1}, {a: 3, c: 3, m: method2}]) )
                .eql( {a: 1, c: 3} );
            expect( mixin({a: 1}, [{a: 2, b: 2, m: method1}, {a: 3, c: 3, m: method2}], {copyFunc: true, except: null}) )
                .eql( {a: 1, b: 2, c: 3, m: method1} );
        });

        it("should reset default settings to initial values", function() {
            setSettings({overwrite: true, copyFunc: false, except: 'b'});

            expect( mixin({a: 1}, [{a: 2, b: 2, m: method1}, {a: 3, c: 3, m: method2}]) )
                .eql( {a: 3, c: 3} );

            setSettings();

            expect( mixin({a: 1}, [{a: 2, b: 2, m: method1}, {a: 3, c: 3, m: method2}]) )
                .eql( {a: 1, b: 2, c: 3, m: method1} );
        });
    });
});
