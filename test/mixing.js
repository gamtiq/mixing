// Tests for mixing component/module
describe("mixing", function() {
    
    function emptyFunc() {}
    
    function method1(a, b, c) {
        return a + b + c;
    }
    
    function method2(a, b) {
        return a > b;
    }
    
    var str = "f1",
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
        expect, mixin;
    
    couple.a = sEmpty;
    couple.g = emptyObj;
    couple.met = method2;
    
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
            
            it("should copy all fields from the source object that are absent in the destination object", function() {
                var dest = {a: list, "very long field name": couple, empty: sEmpty};
                
                expect( mixin({a: 1, b: 2}, {a: "a", b: emptyObj, c: 3, d: 4}) )
                    .eql({a: 1, b: 2, c: 3, d: 4});
                
                expect( mixin(dest, {m1: method1, empty: nullVal, a: source}) )
                    .eql({a: list, "very long field name": couple, empty: sEmpty, m1: method1});
                
                expect(dest)
                    .have.property("m1", method1);
            });
            
            it("should copy nothing", function() {
                var dest = {a: 1, b: 2};
                expect( mixin(obj, source) )
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
                    .have.deep.property("e", obj);
                expect(dest)
                    .have.property("y")
                    .have.property("y1", num);
                expect(dest)
                    .have.property("y")
                    .have.deep.property("y2", couple);
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
                    .have.deep.property("1", obj);
                expect(dest)
                    .have.deep.property("0", list);
                expect(dest)
                    .have.deep.property("a", obj);
                expect(dest)
                    .have.property("c", 3);
    //            expect(dest)
    //                .have.property("met", undef);
                expect(dest)
                    .have.property("g", couple.g);
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
            
            describe("mixing(destination, source, {except: ['name1', 'name2', ...]})", function() {
                var settings = {except: ["a", "c", "f"]};
                it("should copy all fields from the source object except those that are mentioned in the array", function() {
                    var dest = {b: null, beta: 3, d: couple};
                    
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
                });
            });
            
            describe("mixing(destination, source, {except: {'name1': value1, 'name2': value2, ...}})", function() {
                var settings = {except: {beta: true, alpha: false}};
                it("should copy all fields from the source object except those that are in the exception object", function() {
                    var dest = {a: null, beta: 3, dream: "win"};
                    
                    expect( mixin({}, {alpha: 1, beta: 2, gamma: 3, delta: 4}, settings) )
                        .eql({gamma: 3, delta: 4});
                    
                    expect( mixin(dest, {star: "super", a: list, beta: 100, bet: couple, alpha: true}, settings) )
                        .eql({a: null, beta: 3, dream: "win", star: "super", bet: couple});
                
                    expect(dest)
                        .have.property("a", null);
                    expect(dest)
                        .have.property("beta", 3);
                    expect(dest)
                        .have.property("star", "super");
                    expect(dest)
                        .have.property("bet", couple);
                    expect(dest)
                        .not.have.property("alpha");
                });
            });
        });
        
        describe("mixing(destination, source, {filter: ...})", function() {
            function filter(field, value, target, source) {
                return ["a", "c", "z", "list", "obj"].indexOf(field) > -1;
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
            
            describe("mixing(destination, source, {except: ..., filter: someFunction})", function() {
                it("should copy all fields from the source object except those that are specified or for which filter function returns false", function() {
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
                                        filter: function(field, value, target, source) {
                                            return typeof value === "number" && value < 10;
                                        }
                                    }) )
                        .eql({c: 3, e: 4, h: 7});
                });
            });
        });
        
        describe("mixing(destination, array, {otherName: {name1: 'name2', name3: 'name4', ...}])", function() {
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
            });
        });
        
        describe("mixing(destination, source, {change: ...})", function() {
            function change(field, value, target, source) {
                var sType = typeof value;
                if (sType === "number") {
                    value *= value;
                }
                else if (sType === "string") {
                    value += value;
                }
                return value;
            }
            
            function changeToStr(field, value, target, source) {
                return String(value);
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
            });
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
                                filter: function(field, value, target, source) {
                                    return typeof source[field] === "object";
                                }
                            }) )
                .eql({a: list, b: obj, c: emptyArray, d: nullVal, g: list, f: obj});
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
                                    filter: function(field, value, target, source) {
                                        var sType = typeof source[field];
                                        return sType !== "object" && sType !== "function";
                                    }
                                }) )
                .eql({a: "alfa", b: "beta", f: false});
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
});
