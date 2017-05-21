function logClass(target) {
    // save a reference to the original constructor
    var original = target;
    // a utility function to generate instances of a class
    function construct(constructor, args) {
        var c = function () {
            return constructor.apply(this, args);
        };
        c.prototype = constructor.prototype;
        return new c();
    }
    // the new constructor behaviour
    var f = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log("New: " + original.name);
        return construct(original, args);
    };
    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;
    // return new constructor (will override original)
    return f;
}
// @logClassWithArgs({ when : { name : "remo"} })
// class Person {
//   public name: string;
//
//   // ...
// }
//
// function logClassWithArgs(filter: Object) {
//     return (target: Object) => {
//         // implement class decorator here, the class decorator
//         // will have access to the decorator arguments (filter)
//         // because they are  stored in a closure
//     }
// }
//# sourceMappingURL=class_decorator.js.map