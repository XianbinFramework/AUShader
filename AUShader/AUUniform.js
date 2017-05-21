var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AUUniform = (function (_super) {
    __extends(AUUniform, _super);
    function AUUniform(uniforms) {
        var _this = _super.call(this) || this;
        // binding object attributes to instance
        Object.keys(uniforms).forEach(function (key) {
            var value = uniforms[key];
            var type = _this.getTypeOfValue(value);
            if (type == "") {
                throw new TypeError("AUUniform constructor error : variable " + key + " is not valid type");
            }
            _this[key] = uniforms[key];
        });
        return _this;
    }
    ;
    return AUUniform;
}(AUBase));
//# sourceMappingURL=AUUniform.js.map